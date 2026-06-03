'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { CruiseFormData } from './deals'

async function getAgentId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const res = await (supabase as any).from('agents').select('id').eq('user_id', user.id).single()
  if (!res.data) throw new Error('Agent not found')
  return res.data.id as string
}

export async function saveTrip(data: CruiseFormData, id?: string) {
  const supabase = await createClient()
  const agentId = await getAgentId(supabase)

  let error
  if (id) {
    const res = await (supabase as any).from('trips').update(data).eq('id', id).eq('agent_id', agentId)
    error = res.error
  } else {
    const res = await (supabase as any).from('trips').insert({ ...data, agent_id: agentId })
    error = res.error
  }
  if (error) throw new Error(error.message)
  revalidatePath('/portal/trips')
}

export async function deleteTrip(id: string) {
  const supabase = await createClient()
  const agentId = await getAgentId(supabase)
  const { error } = await (supabase as any).from('trips').delete().eq('id', id).eq('agent_id', agentId)
  if (error) throw new Error(error.message)
  revalidatePath('/portal/trips')
}

export async function toggleTrip(id: string, active: boolean) {
  const supabase = await createClient()
  const agentId = await getAgentId(supabase)
  const { error } = await (supabase as any).from('trips').update({ active }).eq('id', id).eq('agent_id', agentId)
  if (error) throw new Error(error.message)
  revalidatePath('/portal/trips')
}
