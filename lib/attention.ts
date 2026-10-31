import type { Booking, Client } from '@/lib/types'
import { addDays, addMonths, daysBetween, formatISODate, nextAnniversary } from '@/lib/dates'

/** How far ahead each check looks. */
export const WINDOWS = {
  paymentDays: 30,
  holdDays: 7,
  departureDays: 60,
  celebrationDays: 30,
  reviewDaysAfterReturn: 14,
  passportMonthsAfterReturn: 6,
}

export type AttentionTone = 'red' | 'amber' | 'neutral'

export type AttentionItem = {
  key: string
  tone: AttentionTone
  title: string
  detail: string
  /** ISO date the item is about; used for sorting. */
  date: string
  bookingId?: string
  clientId?: string
}

export type AttentionGroup = {
  id: 'payments' | 'departures' | 'passports' | 'insurance' | 'celebrations' | 'reviews'
  label: string
  items: AttentionItem[]
}

type ClientLite = Pick<Client, 'id' | 'full_name' | 'preferred_name' | 'passport_expiry' | 'dob' | 'anniversary'>

const LIVE: Booking['status'][] = ['hold', 'booked', 'paid_in_full']

export function bookingLabel(b: Pick<Booking, 'title' | 'supplier' | 'product'>): string {
  return b.title || [b.supplier, b.product].filter(Boolean).join(' · ') || 'Untitled booking'
}

export function balanceDue(b: Pick<Booking, 'total_price' | 'amount_paid'>): number | null {
  if (b.total_price == null) return null
  return Math.max(0, Math.round((b.total_price - (b.amount_paid ?? 0)) * 100) / 100)
}

function money(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

function inDays(today: string, date: string): string {
  const n = daysBetween(today, date)
  if (n === 0) return 'today'
  if (n === 1) return 'tomorrow'
  if (n === -1) return 'yesterday'
  return n > 0 ? `in ${n} days` : `${-n} days ago`
}

export function buildAttention(bookings: Booking[], clients: ClientLite[], today: string): AttentionGroup[] {
  const byId = new Map(clients.map(c => [c.id, c]))
  const nameOf = (id: string | null) => (id ? byId.get(id)?.full_name : undefined) ?? 'No client linked'
  const live = bookings.filter(b => LIVE.includes(b.status))

  // ── Payments: final payments overdue or coming up, and holds about to lapse ──
  const payments: AttentionItem[] = []
  for (const b of live) {
    if (b.status === 'hold' && b.deposit_due && b.deposit_due <= addDays(today, WINDOWS.holdDays)) {
      payments.push({
        key: `hold-${b.id}`,
        tone: b.deposit_due < today ? 'red' : 'amber',
        title: `${nameOf(b.client_id)}: hold ${b.deposit_due < today ? 'lapsed' : 'lapses'} ${inDays(today, b.deposit_due)}`,
        detail: `${bookingLabel(b)}. Deposit needed to keep it.`,
        date: b.deposit_due,
        bookingId: b.id,
      })
    }
    if (b.status === 'paid_in_full' || !b.final_payment_due) continue
    const balance = balanceDue(b)
    if (balance === 0) continue
    if (b.final_payment_due > addDays(today, WINDOWS.paymentDays)) continue
    const overdue = b.final_payment_due < today
    payments.push({
      key: `pay-${b.id}`,
      tone: overdue ? 'red' : daysBetween(today, b.final_payment_due) <= 7 ? 'amber' : 'neutral',
      title: `${nameOf(b.client_id)}: final payment ${overdue ? 'overdue' : 'due'} ${inDays(today, b.final_payment_due)}`,
      detail: `${bookingLabel(b)}${balance != null ? `. Balance ${money(balance)}` : '. Balance not entered'}.`,
      date: b.final_payment_due,
      bookingId: b.id,
    })
  }

  // ── Departures in the next N days ──
  const departures: AttentionItem[] = live
    .filter(b => b.depart_date && b.depart_date >= today && b.depart_date <= addDays(today, WINDOWS.departureDays))
    .map(b => ({
      key: `dep-${b.id}`,
      tone: daysBetween(today, b.depart_date!) <= 7 ? 'amber' : 'neutral',
      title: `${nameOf(b.client_id)} departs ${inDays(today, b.depart_date!)}`,
      detail: bookingLabel(b) + (b.confirmation_number ? ` · Conf. ${b.confirmation_number}` : ''),
      date: b.depart_date!,
      bookingId: b.id,
    }))

  // ── Passports: everyone on an upcoming trip needs one valid 6 months past return ──
  const passports: AttentionItem[] = []
  const missingNoted = new Set<string>()
  // Earliest trips first, so a missing expiry is reported against the next departure.
  const upcomingByDepart = [...live].sort((a, b) => (a.depart_date ?? '').localeCompare(b.depart_date ?? ''))
  for (const b of upcomingByDepart) {
    if (!b.depart_date || b.depart_date < today) continue
    const mustBeValidUntil = addMonths(b.return_date ?? b.depart_date, WINDOWS.passportMonthsAfterReturn)
    const travelerIds = Array.from(new Set([b.client_id, ...(b.traveler_ids ?? [])].filter((id): id is string => !!id)))
    for (const id of travelerIds) {
      const c = byId.get(id)
      if (!c) continue
      if (!c.passport_expiry) {
        if (missingNoted.has(id)) continue
        missingNoted.add(id)
        passports.push({
          key: `pp-${b.id}-${id}`,
          tone: 'neutral',
          title: `${c.full_name}: no passport expiry on file`,
          detail: `Travelling on ${bookingLabel(b)}. Add it to their profile if this trip needs a passport.`,
          date: b.depart_date,
          bookingId: b.id,
          clientId: id,
        })
      } else if (c.passport_expiry < mustBeValidUntil) {
        const expiresBeforeTrip = c.passport_expiry < (b.return_date ?? b.depart_date)
        passports.push({
          key: `pp-${b.id}-${id}`,
          tone: 'red',
          title: `${c.full_name}: passport ${expiresBeforeTrip ? 'expires before the trip ends' : 'expires within 6 months of return'}`,
          detail: `Expires ${formatISODate(c.passport_expiry)}. Needed for ${bookingLabel(b)}, departing ${formatISODate(b.depart_date)}.`,
          date: b.depart_date,
          bookingId: b.id,
          clientId: id,
        })
      }
    }
  }

  // ── Insurance: upcoming trips with no decision recorded ──
  const insurance: AttentionItem[] = live
    .filter(b => b.depart_date && b.depart_date >= today && (b.insurance_status === 'unknown' || b.insurance_status === 'offered'))
    .map(b => ({
      key: `ins-${b.id}`,
      tone: 'neutral',
      title: `${nameOf(b.client_id)}: ${b.insurance_status === 'offered' ? 'insurance offered, not bought yet' : 'no insurance on file'}`,
      detail: `${bookingLabel(b)}, departing ${formatISODate(b.depart_date)}.`,
      date: b.depart_date!,
      bookingId: b.id,
    }))

  // ── Birthdays and anniversaries ──
  const celebrations: AttentionItem[] = []
  const horizon = addDays(today, WINDOWS.celebrationDays)
  for (const c of clients) {
    for (const [kind, iso] of [['birthday', c.dob], ['anniversary', c.anniversary]] as const) {
      if (!iso) continue
      const next = nextAnniversary(iso, today)
      if (next.date > horizon) continue
      const who = c.preferred_name || c.full_name
      celebrations.push({
        key: `cel-${kind}-${c.id}`,
        tone: 'neutral',
        title: kind === 'birthday'
          ? `${who}'s birthday ${inDays(today, next.date)}`
          : `${who}'s anniversary ${inDays(today, next.date)}`,
        detail: kind === 'birthday' ? `Turning ${next.years}.` : `${next.years} years.`,
        date: next.date,
        clientId: c.id,
      })
    }
  }

  // ── Just back: ask for a review ──
  const reviews: AttentionItem[] = bookings
    .filter(b => b.status !== 'cancelled' && b.return_date
      && b.return_date < today && b.return_date >= addDays(today, -WINDOWS.reviewDaysAfterReturn))
    .map(b => ({
      key: `rev-${b.id}`,
      tone: 'neutral',
      title: `${nameOf(b.client_id)} got back ${inDays(today, b.return_date!)}`,
      detail: `${bookingLabel(b)}. A good time to check in and ask for a review.`,
      date: b.return_date!,
      bookingId: b.id,
    }))

  const byDate = (a: AttentionItem, b: AttentionItem) => a.date.localeCompare(b.date)
  return [
    { id: 'payments' as const, label: 'Payments', items: payments.sort(byDate) },
    { id: 'departures' as const, label: 'Departing soon', items: departures.sort(byDate) },
    { id: 'passports' as const, label: 'Passports', items: passports.sort((a, b) => (a.tone === b.tone ? byDate(a, b) : a.tone === 'red' ? -1 : 1)) },
    { id: 'insurance' as const, label: 'Insurance', items: insurance.sort(byDate) },
    { id: 'celebrations' as const, label: 'Birthdays & anniversaries', items: celebrations.sort(byDate) },
    { id: 'reviews' as const, label: 'Just back', items: reviews.sort(byDate) },
  ].filter(g => g.items.length > 0)
}
