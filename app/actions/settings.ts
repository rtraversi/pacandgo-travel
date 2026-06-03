'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type VisibilityData = {
  show_deals: boolean
  show_trips: boolean
  show_blog: boolean
  show_reviews: boolean
  show_gallery: boolean
}

async function getAgentId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const res = await (supabase as any).from('agents').select('id').eq('user_id', user.id).single()
  if (!res.data) throw new Error('Agent not found')
  return res.data.id as string
}

export async function saveVisibility(data: VisibilityData) {
  const supabase = await createClient()
  const agentId = await getAgentId(supabase)
  const { error } = await (supabase as any)
    .from('agent_profiles').update(data).eq('agent_id', agentId)
  if (error) throw new Error(error.message)
  revalidatePath('/portal/settings')
}

export async function changePassword(password: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })
  if (error) throw new Error(error.message)
}
