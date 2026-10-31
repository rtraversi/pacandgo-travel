'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ClientPreferences, LoyaltyEntry, WishStatus } from '@/lib/types'

export type ClientFormData = {
  full_name: string
  preferred_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  dob: string | null
  anniversary: string | null
  citizenship: string | null
  passport_expiry: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  loyalty: LoyaltyEntry[]
  preferences: ClientPreferences
  tags: string[]
  notes: string | null
}

export type WishFormData = {
  destination: string
  trip_type: string | null
  timeframe: string | null
  budget: string | null
  notes: string | null
  status: WishStatus
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const PREF_KEYS: (keyof ClientPreferences)[] = ['cabin', 'dining', 'accessibility', 'dietary', 'travel_style']
const WISH_STATUSES: WishStatus[] = ['open', 'booked', 'dropped']

function text(v: unknown): string | null {
  if (typeof v !== 'string') return null
  const t = v.trim()
  return t ? t : null
}

function isoDate(v: unknown): string | null {
  const t = text(v)
  return t && ISO_DATE.test(t) ? t : null
}

/** Server actions are public endpoints, so rebuild the payload from known fields only. */
function cleanClient(data: ClientFormData) {
  const fullName = text(data.full_name)
  if (!fullName) throw new Error('Name is required.')

  const loyalty = (Array.isArray(data.loyalty) ? data.loyalty : [])
    .map(l => ({ program: text(l?.program), number: text(l?.number), tier: text(l?.tier) }))
    .filter((l): l is { program: string; number: string; tier: string | null } => !!l.program && !!l.number)

  const preferences: ClientPreferences = {}
  for (const key of PREF_KEYS) {
    const v = text(data.preferences?.[key])
    if (v) preferences[key] = v
  }

  const tags = Array.from(new Set(
    (Array.isArray(data.tags) ? data.tags : []).map(t => text(t)).filter((t): t is string => !!t)
  ))

  return {
    full_name: fullName,
    preferred_name: text(data.preferred_name),
    email: text(data.email),
    phone: text(data.phone),
    address: text(data.address),
    dob: isoDate(data.dob),
    anniversary: isoDate(data.anniversary),
    citizenship: text(data.citizenship),
    passport_expiry: isoDate(data.passport_expiry),
    emergency_contact_name: text(data.emergency_contact_name),
    emergency_contact_phone: text(data.emergency_contact_phone),
    loyalty,
    preferences,
    tags,
    notes: text(data.notes),
  }
}

function cleanWish(data: WishFormData) {
  const destination = text(data.destination)
  if (!destination) throw new Error('Destination is required.')
  return {
    destination,
    trip_type: text(data.trip_type),
    timeframe: text(data.timeframe),
    budget: text(data.budget),
    notes: text(data.notes),
    status: WISH_STATUSES.includes(data.status) ? data.status : 'open',
  }
}

async function getAgentId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const res = await (supabase as any).from('agents').select('id').eq('user_id', user.id).single()
  if (!res.data) throw new Error('Agent not found')
  return res.data.id as string
}

function revalidateClientPaths() {
  revalidatePath('/portal/clients')
  revalidatePath('/portal/quotes')
}

export async function saveClient(input: ClientFormData, id?: string): Promise<{ id: string }> {
  const supabase = await createClient()
  const agentId = await getAgentId(supabase)
  const data = cleanClient(input)

  if (id) {
    const res = await (supabase as any)
      .from('clients')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('agent_id', agentId)
    if (res.error) throw new Error(res.error.message)
    revalidateClientPaths()
    return { id }
  } else {
    const res = await (supabase as any)
      .from('clients')
      .insert({ ...data, agent_id: agentId })
      .select('id')
      .single()
    if (res.error) throw new Error(res.error.message)
    revalidateClientPaths()
    return { id: res.data.id }
  }
}

export async function deleteClient(id: string) {
  const supabase = await createClient()
  const agentId = await getAgentId(supabase)
  const { error } = await (supabase as any).from('clients').delete().eq('id', id).eq('agent_id', agentId)
  if (error) throw new Error(error.message)
  revalidateClientPaths()
}

export async function linkHousehold(clientId: string, memberIds: string[]): Promise<{ householdId: string }> {
  const supabase = await createClient()
  const agentId = await getAgentId(supabase)

  const seedIds = Array.from(new Set([clientId, ...memberIds]))
  const res = await (supabase as any)
    .from('clients')
    .select('id, household_id')
    .eq('agent_id', agentId)
    .in('id', seedIds)
  if (res.error) throw new Error(res.error.message)
  const rows = res.data as { id: string; household_id: string | null }[]
  if (rows.length !== seedIds.length) throw new Error('One or more clients not found')

  const existingGroups = Array.from(new Set(rows.map(r => r.household_id).filter((h): h is string => h !== null)))

  const target = existingGroups.length === 1 ? existingGroups[0] : crypto.randomUUID()

  const seedUpdate = await (supabase as any)
    .from('clients')
    .update({ household_id: target })
    .eq('agent_id', agentId)
    .in('id', seedIds)
  if (seedUpdate.error) throw new Error(seedUpdate.error.message)

  if (existingGroups.length > 1) {
    const mergeUpdate = await (supabase as any)
      .from('clients')
      .update({ household_id: target })
      .eq('agent_id', agentId)
      .in('household_id', existingGroups)
    if (mergeUpdate.error) throw new Error(mergeUpdate.error.message)
  }

  revalidateClientPaths()
  return { householdId: target }
}

export async function unlinkFromHousehold(clientId: string) {
  const supabase = await createClient()
  const agentId = await getAgentId(supabase)
  const { error } = await (supabase as any)
    .from('clients')
    .update({ household_id: null })
    .eq('id', clientId)
    .eq('agent_id', agentId)
  if (error) throw new Error(error.message)
  revalidateClientPaths()
}

export async function saveWish(clientId: string, input: WishFormData, id?: string): Promise<{ id: string }> {
  const supabase = await createClient()
  const agentId = await getAgentId(supabase)
  const data = cleanWish(input)

  if (id) {
    const res = await (supabase as any)
      .from('client_wishes')
      .update(data)
      .eq('id', id)
      .eq('agent_id', agentId)
    if (res.error) throw new Error(res.error.message)
    revalidateClientPaths()
    return { id }
  }

  // RLS also checks this, but a clear error beats a policy violation message.
  const owner = await (supabase as any)
    .from('clients').select('id').eq('id', clientId).eq('agent_id', agentId).maybeSingle()
  if (!owner.data) throw new Error('Client not found')

  const res = await (supabase as any)
    .from('client_wishes')
    .insert({ ...data, client_id: clientId, agent_id: agentId })
    .select('id')
    .single()
  if (res.error) throw new Error(res.error.message)
  revalidateClientPaths()
  return { id: res.data.id }
}

export async function deleteWish(id: string) {
  const supabase = await createClient()
  const agentId = await getAgentId(supabase)
  const { error } = await (supabase as any).from('client_wishes').delete().eq('id', id).eq('agent_id', agentId)
  if (error) throw new Error(error.message)
  revalidateClientPaths()
}
