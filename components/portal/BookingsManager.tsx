'use client'

import { useMemo, useState, useTransition } from 'react'
import type { Booking, BookingStatus, InsuranceStatus } from '@/lib/types'
import type { BookingFormData } from '@/app/actions/bookings'
import { TRIP_TYPES, TRIP_TYPE_CONFIG, tripTypeOf } from '@/lib/tripTypes'
import { addDays, formatISODate } from '@/lib/dates'
import { balanceDue, bookingLabel } from '@/lib/attention'

export type BookingClient = { id: string; full_name: string; email: string | null; household_id: string | null }
export type BookingQuote = {
  id: string; customer_name: string | null; client_id: string | null; additional_guest_ids: string[]
  line: string; ship: string; start_date: string | null; nights: number | null; price: number | null; guests: number
}

interface Props {
  bookings: Booking[]
  clients: BookingClient[]
  quotes: BookingQuote[]
  today: string
  onSave: (data: BookingFormData, id?: string) => Promise<{ id: string }>
  onDelete: (id: string) => Promise<void>
}

const STATUS_LABEL: Record<BookingStatus, string> = {
  hold: 'Courtesy hold', booked: 'Booked', paid_in_full: 'Paid in full', completed: 'Completed', cancelled: 'Cancelled',
}
const STATUS_TONE: Record<BookingStatus, string> = {
  hold: 'bg-amber-400/15 text-amber-200',
  booked: 'bg-sky-400/15 text-sky-200',
  paid_in_full: 'bg-emerald-400/15 text-emerald-200',
  completed: 'bg-white/10 text-white/50',
  cancelled: 'bg-red-500/10 text-red-300/70',
}
const INSURANCE_LABEL: Record<InsuranceStatus, string> = {
  unknown: 'Not recorded', offered: 'Offered, not bought', purchased: 'Purchased', declined: 'Declined',
}

const EMPTY: BookingFormData = {
  client_id: null, traveler_ids: [], quote_id: null, trip_type: 'cruise', supplier: null, product: null,
  title: null, confirmation_number: null, depart_date: null, return_date: null, status: 'booked',
  total_price: null, amount_paid: null, deposit_due: null, final_payment_due: null,
  insurance_status: 'unknown', commission_amount: null, commission_received: false, notes: null,
}

const inputCls = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-gold/50 transition'
const selectCls = 'w-full bg-navy border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gold/50 transition'
const labelCls = 'block text-xs text-white/45 mb-1.5'
const cardCls = 'bg-white/5 border border-white/10 rounded-xl p-6 max-w-2xl'
const sectionTitleCls = 'text-[0.65rem] font-bold tracking-[0.18em] uppercase text-white/45 mb-4'

type Filter = 'upcoming' | 'past' | 'cancelled' | 'all'

function usd(n: number | null): string {
  if (n == null) return ''
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

function toForm(b: Booking): BookingFormData {
  return {
    client_id: b.client_id, traveler_ids: b.traveler_ids ?? [], quote_id: b.quote_id, trip_type: tripTypeOf(b),
    supplier: b.supplier, product: b.product, title: b.title, confirmation_number: b.confirmation_number,
    depart_date: b.depart_date, return_date: b.return_date, status: b.status, total_price: b.total_price,
    amount_paid: b.amount_paid, deposit_due: b.deposit_due, final_payment_due: b.final_payment_due,
    insurance_status: b.insurance_status, commission_amount: b.commission_amount,
    commission_received: b.commission_received, notes: b.notes,
  }
}

export default function BookingsManager({ bookings, clients, quotes, today, onSave, onDelete }: Props) {
  const [view, setView] = useState<'list' | 'form'>('list')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<BookingFormData>(EMPTY)
  const [filter, setFilter] = useState<Filter>('upcoming')
  const [error, setError] = useState<string | null>(null)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const clientById = useMemo(() => new Map(clients.map(c => [c.id, c])), [clients])
  const sortedClients = useMemo(() => [...clients].sort((a, b) => a.full_name.localeCompare(b.full_name)), [clients])

  function set<K extends keyof BookingFormData>(field: K, value: BookingFormData[K]) {
    setForm(f => ({ ...f, [field]: value }))
    setSavedMessage(null)
  }

  function openNew() {
    setEditingId(null); setForm(EMPTY); setError(null); setSavedMessage(null); setView('form')
  }
  function openEdit(b: Booking) {
    setEditingId(b.id); setForm(toForm(b)); setError(null); setSavedMessage(null); setView('form')
  }

  function fillFromQuote(quoteId: string) {
    const q = quotes.find(x => x.id === quoteId)
    if (!q) { set('quote_id', null); return }
    const ret = q.start_date && q.nights ? addDays(q.start_date, q.nights) : null
    setForm(f => ({
      ...f,
      quote_id: q.id,
      client_id: q.client_id ?? f.client_id,
      traveler_ids: q.additional_guest_ids?.length ? q.additional_guest_ids : f.traveler_ids,
      trip_type: 'cruise',
      supplier: q.line || f.supplier,
      product: q.ship || f.product,
      depart_date: q.start_date ?? f.depart_date,
      return_date: ret ?? f.return_date,
      total_price: q.price != null ? Math.round(q.price * (q.guests || 1) * 100) / 100 : f.total_price,
    }))
    setSavedMessage(null)
  }

  function toggleTraveler(id: string, checked: boolean) {
    set('traveler_ids', checked ? [...form.traveler_ids, id] : form.traveler_ids.filter(t => t !== id))
  }

  function handleSave() {
    setError(null)
    startTransition(async () => {
      try {
        const result = await onSave(form, editingId ?? undefined)
        setEditingId(result.id)
        setSavedMessage('Saved.')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Save failed')
      }
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this booking? This cannot be undone. To keep a record, set its status to Cancelled instead.')) return
    startTransition(async () => {
      await onDelete(id)
      if (editingId === id) setView('list')
    })
  }

  if (view === 'form') {
    const cfg = TRIP_TYPE_CONFIG[form.trip_type]
    const lead = form.client_id ? clientById.get(form.client_id) : undefined
    const household = lead?.household_id
      ? clients.filter(c => c.household_id === lead.household_id && c.id !== lead.id)
      : []
    const householdIds = new Set(household.map(c => c.id))
    const others = form.traveler_ids
      .filter(id => !householdIds.has(id))
      .map(id => clientById.get(id))
      .filter((c): c is BookingClient => !!c)
    const addable = sortedClients.filter(c => c.id !== form.client_id && !form.traveler_ids.includes(c.id) && !householdIds.has(c.id))
    const balance = balanceDue({ total_price: form.total_price, amount_paid: form.amount_paid ?? 0 })

    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setView('list')} className="text-white/40 hover:text-white transition text-sm">← Back</button>
          <h2 className="text-xl font-display text-white">{editingId ? 'Edit Booking' : 'New Booking'}</h2>
        </div>

        {!editingId && quotes.length > 0 && (
          <div className="border border-gold/25 bg-gold/[0.04] rounded-xl p-5 mb-4 max-w-2xl">
            <label className={labelCls}>Start from a quote (optional)</label>
            <select value={form.quote_id ?? ''} onChange={e => fillFromQuote(e.target.value)} className={selectCls}>
              <option value="">Choose a quote…</option>
              {quotes.map(q => (
                <option key={q.id} value={q.id}>
                  {[q.customer_name, `${q.line} ${q.ship}`, q.start_date ? formatISODate(q.start_date) : null].filter(Boolean).join(' · ')}
                </option>
              ))}
            </select>
            <p className="text-white/35 text-xs mt-2">Fills in the client, guests, ship, dates and total (price × guests). Check them before saving.</p>
          </div>
        )}

        {/* Who */}
        <div className={`${cardCls} space-y-4`}>
          <h3 className={sectionTitleCls}>Who&apos;s Travelling</h3>
          <div>
            <label className={labelCls}>Lead Client</label>
            <select value={form.client_id ?? ''} onChange={e => setForm(f => ({
              ...f, client_id: e.target.value || null, traveler_ids: f.traveler_ids.filter(t => t !== e.target.value),
            }))} className={selectCls}>
              <option value="">Choose a client…</option>
              {sortedClients.map(c => <option key={c.id} value={c.id}>{c.full_name}{c.email ? ` (${c.email})` : ''}</option>)}
            </select>
            {clients.length === 0 && <p className="text-white/35 text-xs mt-2">Add the client on the Clients page first.</p>}
          </div>

          {household.length > 0 && (
            <div>
              <label className={labelCls}>Family members travelling</label>
              <div className="space-y-1">
                {household.map(c => (
                  <label key={c.id} className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer">
                    <input type="checkbox" checked={form.traveler_ids.includes(c.id)} onChange={e => toggleTraveler(c.id, e.target.checked)}
                      className="w-4 h-4 rounded accent-gold" />
                    <span className="text-white text-sm">{c.full_name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className={labelCls}>Other travellers</label>
            {others.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {others.map(c => (
                  <span key={c.id} className="inline-flex items-center gap-1 bg-white/10 text-white/80 text-xs rounded-full px-2.5 py-1">
                    {c.full_name}
                    <button onClick={() => toggleTraveler(c.id, false)} className="hover:text-red-300" aria-label={`Remove ${c.full_name}`}>✕</button>
                  </span>
                ))}
              </div>
            )}
            <select value="" onChange={e => e.target.value && toggleTraveler(e.target.value, true)} className={selectCls} disabled={addable.length === 0}>
              <option value="">{addable.length ? 'Add a traveller…' : 'No other clients to add'}</option>
              {addable.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
            </select>
            <p className="text-white/30 text-xs mt-1.5">Everyone listed is checked for passport problems on the dashboard.</p>
          </div>
        </div>

        {/* Trip */}
        <div className={`${cardCls} space-y-4 mt-4`}>
          <h3 className={sectionTitleCls}>Trip</h3>
          <div className="flex flex-wrap gap-2">
            {TRIP_TYPES.map(t => (
              <button key={t} type="button" onClick={() => set('trip_type', t)}
                className={`px-3 py-1.5 rounded-full text-xs border transition ${
                  form.trip_type === t ? 'bg-gold text-navy border-gold font-semibold' : 'border-white/15 text-white/60 hover:border-white/35'
                }`}>
                {TRIP_TYPE_CONFIG[t].label}
              </button>
            ))}
          </div>
          <datalist id={`booking-suppliers-${form.trip_type}`}>
            {cfg.suggestions.map(s => <option key={s} value={s} />)}
          </datalist>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>{cfg.supplier}</label>
              <input list={`booking-suppliers-${form.trip_type}`} value={form.supplier ?? ''} onChange={e => set('supplier', e.target.value || null)}
                placeholder={cfg.supplierPlaceholder} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{cfg.product}</label>
              <input value={form.product ?? ''} onChange={e => set('product', e.target.value || null)}
                placeholder={cfg.productPlaceholder} className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Name (optional)</label>
              <input value={form.title ?? ''} onChange={e => set('title', e.target.value || null)}
                placeholder="Smith family Alaska cruise" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Confirmation #</label>
              <input value={form.confirmation_number ?? ''} onChange={e => set('confirmation_number', e.target.value || null)}
                placeholder="Supplier booking number" className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Departs</label>
              <input type="date" value={form.depart_date ?? ''} onChange={e => set('depart_date', e.target.value || null)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Returns</label>
              <input type="date" value={form.return_date ?? ''} min={form.depart_date ?? undefined}
                onChange={e => set('return_date', e.target.value || null)} className={inputCls} />
            </div>
          </div>
        </div>

        {/* Money */}
        <div className={`${cardCls} space-y-4 mt-4`}>
          <h3 className={sectionTitleCls}>Status &amp; Payments</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value as BookingStatus)} className={selectCls}>
                {(Object.keys(STATUS_LABEL) as BookingStatus[]).map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Travel Insurance</label>
              <select value={form.insurance_status} onChange={e => set('insurance_status', e.target.value as InsuranceStatus)} className={selectCls}>
                {(Object.keys(INSURANCE_LABEL) as InsuranceStatus[]).map(s => <option key={s} value={s}>{INSURANCE_LABEL[s]}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Total ($)</label>
              <input type="number" min="0" step="0.01" value={form.total_price ?? ''}
                onChange={e => set('total_price', e.target.value ? Number(e.target.value) : null)} placeholder="4200" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Paid so far ($)</label>
              <input type="number" min="0" step="0.01" value={form.amount_paid ?? ''}
                onChange={e => set('amount_paid', e.target.value ? Number(e.target.value) : null)} placeholder="500" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Balance</label>
              <p className="py-2 text-sm text-white">{balance == null ? <span className="text-white/30">Enter a total</span> : usd(balance)}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>{form.status === 'hold' ? 'Hold expires (deposit due)' : 'Deposit due'}</label>
              <input type="date" value={form.deposit_due ?? ''} onChange={e => set('deposit_due', e.target.value || null)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Final payment due</label>
              <input type="date" value={form.final_payment_due ?? ''} onChange={e => set('final_payment_due', e.target.value || null)} className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
              <label className={labelCls}>Commission ($)</label>
              <input type="number" min="0" step="0.01" value={form.commission_amount ?? ''}
                onChange={e => set('commission_amount', e.target.value ? Number(e.target.value) : null)} placeholder="Expected commission" className={inputCls} />
            </div>
            <label className="flex items-center gap-3 py-2 cursor-pointer">
              <input type="checkbox" checked={form.commission_received} onChange={e => set('commission_received', e.target.checked)}
                className="w-4 h-4 rounded accent-gold" />
              <span className="text-sm text-white/70">Commission received</span>
            </label>
          </div>
          <div>
            <label className={labelCls}>Notes</label>
            <textarea value={form.notes ?? ''} onChange={e => set('notes', e.target.value || null)} rows={3}
              placeholder="Dining time, special requests, payment arrangements…" className={`${inputCls} resize-y`} />
          </div>
        </div>

        <div className="max-w-2xl mt-4">
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          <div className="flex items-center gap-3">
            <button onClick={handleSave} disabled={isPending}
              className="bg-gold text-navy font-semibold px-6 py-2.5 rounded-lg hover:bg-gold-hover transition disabled:opacity-50 text-sm">
              {isPending ? 'Saving…' : 'Save Booking'}
            </button>
            <button onClick={() => setView('list')} className="text-white/50 hover:text-white text-sm transition px-4">Back to list</button>
            {savedMessage && <span className="text-emerald-400 text-sm">{savedMessage}</span>}
            {editingId && (
              <button onClick={() => handleDelete(editingId)} className="ml-auto text-white/30 hover:text-red-400 text-xs">Delete booking</button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const isPast = (b: Booking) => b.status === 'completed' || (!!b.return_date && b.return_date < today) || (!b.return_date && !!b.depart_date && b.depart_date < today)
  const visible = bookings
    .filter(b => {
      if (filter === 'all') return true
      if (filter === 'cancelled') return b.status === 'cancelled'
      if (b.status === 'cancelled') return false
      return filter === 'past' ? isPast(b) : !isPast(b)
    })
    .sort((a, b) => {
      const ad = a.depart_date ?? '9999', bd = b.depart_date ?? '9999'
      return filter === 'past' ? bd.localeCompare(ad) : ad.localeCompare(bd)
    })
  const counts = {
    upcoming: bookings.filter(b => b.status !== 'cancelled' && !isPast(b)).length,
    past: bookings.filter(b => b.status !== 'cancelled' && isPast(b)).length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    all: bookings.length,
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display text-white">Bookings</h1>
          <p className="text-white/40 text-sm mt-1">Your clients&apos; reservations. Payment dates and passports show up on your dashboard.</p>
        </div>
        <button onClick={openNew} className="bg-gold text-navy font-semibold px-5 py-2 rounded-lg hover:bg-gold-hover transition text-sm shrink-0">
          + Add Booking
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {(['upcoming', 'past', 'cancelled', 'all'] as Filter[]).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs border transition ${
              filter === f ? 'bg-gold/15 text-gold border-gold/40' : 'border-white/15 text-white/50 hover:text-white'
            }`}>
            {f[0].toUpperCase() + f.slice(1)} ({counts[f]})
          </button>
        ))}
      </div>

      {bookings.length === 0 ? (
        <div className="border border-dashed border-white/15 rounded-xl py-16 text-center">
          <p className="text-white/30 text-sm">No bookings yet.</p>
          <button onClick={openNew} className="mt-3 text-gold text-sm hover:underline">Add your first booking</button>
        </div>
      ) : visible.length === 0 ? (
        <p className="text-white/30 text-sm">Nothing here.</p>
      ) : (
        <div className="space-y-2">
          {visible.map(b => {
            const client = b.client_id ? clientById.get(b.client_id) : undefined
            const extra = (b.traveler_ids ?? []).length
            const balance = balanceDue(b)
            const type = tripTypeOf(b)
            return (
              <button key={b.id} onClick={() => openEdit(b)}
                className="w-full text-left bg-white/5 border border-white/10 rounded-xl px-5 py-4 flex items-center gap-4 hover:bg-white/[0.08] transition">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">
                    {client?.full_name ?? 'No client linked'}
                    {extra > 0 && <span className="text-white/40 font-normal"> +{extra}</span>}
                  </p>
                  <p className="text-white/45 text-xs mt-0.5 truncate">
                    {[type !== 'cruise' ? TRIP_TYPE_CONFIG[type].label : null, bookingLabel(b)].filter(Boolean).join(' · ')}
                  </p>
                  <p className="text-white/35 text-xs mt-0.5">
                    {b.depart_date ? formatISODate(b.depart_date) : 'No dates yet'}
                    {b.return_date ? ` to ${formatISODate(b.return_date)}` : ''}
                    {b.final_payment_due && b.status !== 'paid_in_full' && balance !== 0 ? ` · Final payment ${formatISODate(b.final_payment_due)}` : ''}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className={`text-[0.65rem] rounded-full px-2 py-0.5 ${STATUS_TONE[b.status]}`}>{STATUS_LABEL[b.status]}</span>
                  {balance != null && balance > 0 && b.status !== 'cancelled' && (
                    <span className="text-white/60 text-xs">{usd(balance)} due</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
