/**
 * Helpers for calendar dates stored as ISO strings (YYYY-MM-DD).
 * They avoid `new Date('YYYY-MM-DD')`, which parses as UTC midnight and shows the
 * previous day in US time zones.
 */

/** "Today" for due-date checks. The server runs in UTC; agents are in the US. */
export const AGENCY_TIME_ZONE = 'America/New_York'

export function todayISO(timeZone = AGENCY_TIME_ZONE): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
}

function toUTC(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

function fromUTC(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10)
}

export function addDays(iso: string, days: number): string {
  return fromUTC(toUTC(iso) + days * 86_400_000)
}

export function addMonths(iso: string, months: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const target = new Date(Date.UTC(y, m - 1 + months, 1))
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate()
  target.setUTCDate(Math.min(d, lastDay))
  return fromUTC(target.getTime())
}

/** Whole days from `from` to `to` (negative when `to` is earlier). */
export function daysBetween(from: string, to: string): number {
  return Math.round((toUTC(to) - toUTC(from)) / 86_400_000)
}

/** Next yearly occurrence of a birthday/anniversary on or after `today`, and how many years it marks. */
export function nextAnniversary(iso: string, today: string): { date: string; years: number } {
  const [y, m, d] = iso.split('-').map(Number)
  const [ty] = today.split('-').map(Number)
  const make = (year: number) => {
    // Feb 29 falls back to Feb 28 in non-leap years.
    const lastDay = new Date(Date.UTC(year, m, 0)).getUTCDate()
    return fromUTC(Date.UTC(year, m - 1, Math.min(d, lastDay)))
  }
  let date = make(ty)
  if (date < today) date = make(ty + 1)
  return { date, years: Number(date.slice(0, 4)) - y }
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** "Mar 3, 2027", or "Mar 3" when `withYear` is false. */
export function formatISODate(iso: string | null, withYear = true): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  return withYear ? `${MONTHS[m - 1]} ${d}, ${y}` : `${MONTHS[m - 1]} ${d}`
}
