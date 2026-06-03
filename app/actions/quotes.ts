'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { QuoteAIData } from '@/lib/types'

export type QuoteFormData = {
  customer_name: string | null
  customer_email: string | null
  line: string
  ship: string
  start_date: string | null
  nights: number | null
  room_category: string | null
  price: number | null
  guests: number
  notes: string | null
  ai_data: QuoteAIData
}

async function getAgentId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const res = await (supabase as any).from('agents').select('id').eq('user_id', user.id).single()
  if (!res.data) throw new Error('Agent not found')
  return res.data.id as string
}

export async function saveQuote(data: QuoteFormData, id?: string): Promise<{ id: string }> {
  const supabase = await createClient()
  const agentId = await getAgentId(supabase)

  if (id) {
    const res = await (supabase as any).from('quotes').update(data).eq('id', id).eq('agent_id', agentId)
    if (res.error) throw new Error(res.error.message)
    revalidatePath('/portal/quotes')
    return { id }
  } else {
    const res = await (supabase as any)
      .from('quotes')
      .insert({ ...data, agent_id: agentId })
      .select('id')
      .single()
    if (res.error) throw new Error(res.error.message)
    revalidatePath('/portal/quotes')
    return { id: res.data.id }
  }
}

export async function deleteQuote(id: string) {
  const supabase = await createClient()
  const agentId = await getAgentId(supabase)
  const { error } = await (supabase as any).from('quotes').delete().eq('id', id).eq('agent_id', agentId)
  if (error) throw new Error(error.message)
  revalidatePath('/portal/quotes')
}
