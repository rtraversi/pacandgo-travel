'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { cleanCruiseForm } from '@/lib/cruiseForm'
import type { TripType } from '@/lib/tripTypes'

export type CruiseFormData = {
  /** Optional so AI-parsed deals (always cruises) can omit it; saved as 'cruise' then. */
  trip_type?: TripType
  title: string | null
  description: string | null
  line: string | null
  ship: string | null
  date_from: string | null
  date_to: string | null
  ports: string | null
  price: number | null
  spots: number | null
  active: boolean
}

async function getAgentId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const res = await (supabase as any).from('agents').select('id').eq('user_id', user.id).single()
  if (!res.data) throw new Error('Agent not found')
  return res.data.id as string
}

export async function saveDeal(input: CruiseFormData, id?: string) {
  const supabase = await createClient()
  const agentId = await getAgentId(supabase)
  const data = cleanCruiseForm(input)

  let error
  if (id) {
    const res = await (supabase as any).from('deals').update(data).eq('id', id).eq('agent_id', agentId)
    error = res.error
  } else {
    const res = await (supabase as any).from('deals').insert({ ...data, agent_id: agentId })
    error = res.error
  }
  if (error) throw new Error(error.message)
  revalidatePath('/portal/deals')
}

export async function deleteDeal(id: string) {
  const supabase = await createClient()
  const agentId = await getAgentId(supabase)
  const { error } = await (supabase as any).from('deals').delete().eq('id', id).eq('agent_id', agentId)
  if (error) throw new Error(error.message)
  revalidatePath('/portal/deals')
}

export async function toggleDeal(id: string, active: boolean) {
  const supabase = await createClient()
  const agentId = await getAgentId(supabase)
  const { error } = await (supabase as any).from('deals').update({ active }).eq('id', id).eq('agent_id', agentId)
  if (error) throw new Error(error.message)
  revalidatePath('/portal/deals')
}
