'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ClientFormData = {
  full_name: string
  email: string | null
  phone: string | null
  address: string | null
  dob: string | null
  loyalty_number: string | null
  notes: string | null
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

export async function saveClient(data: ClientFormData, id?: string): Promise<{ id: string }> {
  const supabase = await createClient()
  const agentId = await getAgentId(supabase)

  if (id) {
    const res = await (supabase as any).from('clients').update(data).eq('id', id).eq('agent_id', agentId)
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
