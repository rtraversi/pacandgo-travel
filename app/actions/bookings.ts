'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isTripType, type TripType } from '@/lib/tripTypes'
import type { BookingStatus, InsuranceStatus } from '@/lib/types'

export type BookingFormData = {
  client_id: string | null
  traveler_ids: string[]
  quote_id: string | null
  trip_type: TripType
  supplier: string | null
  product: string | null
  title: string | null
  confirmation_number: string | null
  depart_date: string | null
  return_date: string | null
  status: BookingStatus
  total_price: number | null
  amount_paid: number | null
  deposit_due: string | null
  final_payment_due: string | null
  insurance_status: InsuranceStatus
  commission_amount: number | null
  commission_received: boolean
  notes: string | null
}

const STATUSES: BookingStatus[] = ['hold', 'booked', 'paid_in_full', 'completed', 'cancelled']
const INSURANCE: InsuranceStatus[] = ['unknown', 'offered', 'purchased', 'declined']
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function text(v: unknown): string | null {
  if (typeof v !== 'string') return null
  const t = v.trim()
  return t ? t : null
}
function date(v: unknown): string | null {
  const t = text(v)
  return t && ISO_DATE.test(t) ? t : null
}
function money(v: unknown): number | null {
  const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() ? Number(v.replace(/[$,]/g, '')) : NaN
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null
}
function uuid(v: unknown): string | null {
  return typeof v === 'string' && UUID.test(v) ? v : null
}

async function getAgentId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const res = await (supabase as any).from('agents').select('id').eq('user_id', user.id).single()
  if (!res.data) throw new Error('Agent not found')
  return res.data.id as string
}

/** Server actions are public endpoints: rebuild the payload from known fields only. */
function cleanBooking(d: BookingFormData) {
  const depart = date(d.depart_date)
  const ret = date(d.return_date)
  if (depart && ret && ret < depart) throw new Error('The return date is before the departure date.')
  const clientId = uuid(d.client_id)
  const travelers = Array.from(new Set((Array.isArray(d.traveler_ids) ? d.traveler_ids : [])
    .map(uuid).filter((id): id is string => !!id && id !== clientId)))
  return {
    client_id: clientId,
    traveler_ids: travelers,
    quote_id: uuid(d.quote_id),
    trip_type: isTripType(d.trip_type) ? d.trip_type : 'cruise',
    supplier: text(d.supplier),
    product: text(d.product),
    title: text(d.title),
    confirmation_number: text(d.confirmation_number),
    depart_date: depart,
    return_date: ret,
    status: STATUSES.includes(d.status) ? d.status : 'booked',
    total_price: money(d.total_price),
    amount_paid: money(d.amount_paid) ?? 0,
    deposit_due: date(d.deposit_due),
    final_payment_due: date(d.final_payment_due),
    insurance_status: INSURANCE.includes(d.insurance_status) ? d.insurance_status : 'unknown',
    commission_amount: money(d.commission_amount),
    commission_received: d.commission_received === true,
    notes: text(d.notes),
  }
}

function revalidateBookingPaths() {
  revalidatePath('/portal/bookings')
  revalidatePath('/portal')
}

export async function saveBooking(input: BookingFormData, id?: string): Promise<{ id: string }> {
  const supabase = await createClient()
  const agentId = await getAgentId(supabase)
  const data = cleanBooking(input)
  if (!data.client_id && !data.title && !data.supplier) {
    throw new Error('Pick a client or give the booking a name.')
  }

  // Travellers must be this agent's clients too (RLS checks the lead client only).
  const ids = [data.client_id, ...data.traveler_ids].filter((x): x is string => !!x)
  if (ids.length) {
    const own = await (supabase as any).from('clients').select('id').eq('agent_id', agentId).in('id', ids)
    if (own.error) throw new Error(own.error.message)
    if ((own.data ?? []).length !== ids.length) throw new Error('One of the travellers was not found.')
  }

  if (id) {
    const res = await (supabase as any)
      .from('bookings')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('agent_id', agentId)
    if (res.error) throw new Error(res.error.message)
    revalidateBookingPaths()
    return { id }
  }

  const res = await (supabase as any)
    .from('bookings')
    .insert({ ...data, agent_id: agentId })
    .select('id')
    .single()
  if (res.error) throw new Error(res.error.message)
  revalidateBookingPaths()
  return { id: res.data.id }
}

export async function deleteBooking(id: string) {
  const supabase = await createClient()
  const agentId = await getAgentId(supabase)
  const { error } = await (supabase as any).from('bookings').delete().eq('id', id).eq('agent_id', agentId)
  if (error) throw new Error(error.message)
  revalidateBookingPaths()
}
