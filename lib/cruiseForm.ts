import { isTripType } from '@/lib/tripTypes'
import type { CruiseFormData } from '@/app/actions/deals'

function text(v: unknown): string | null {
  if (typeof v !== 'string') return null
  const t = v.trim()
  return t ? t : null
}

function num(v: unknown): number | null {
  const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() ? Number(v) : NaN
  return Number.isFinite(n) ? n : null
}

/** Server actions are public endpoints: rebuild deal/trip payloads from known fields only. */
export function cleanCruiseForm(data: CruiseFormData) {
  return {
    trip_type: isTripType(data.trip_type) ? data.trip_type : 'cruise',
    title: text(data.title),
    description: text(data.description),
    line: text(data.line),
    ship: text(data.ship),
    date_from: text(data.date_from),
    date_to: text(data.date_to),
    ports: text(data.ports),
    price: num(data.price),
    spots: num(data.spots),
    active: data.active !== false,
  }
}
