'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type GalleryFormData = {
  image_url: string
  caption: string | null
  alt_text: string | null
  category: string | null
  media_type: 'photo' | 'video'
  order_index: number
  active: boolean
}

async function getAgentId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const res = await (supabase as any).from('agents').select('id').eq('user_id', user.id).single()
  if (!res.data) throw new Error('Agent not found')
  return res.data.id as string
}

export async function saveGalleryItem(data: GalleryFormData, id?: string) {
  const supabase = await createClient()
  const agentId = await getAgentId(supabase)

  let error
  if (id) {
    const res = await (supabase as any).from('gallery').update(data).eq('id', id).eq('agent_id', agentId)
    error = res.error
  } else {
    const res = await (supabase as any).from('gallery').insert({ ...data, agent_id: agentId })
    error = res.error
  }
  if (error) throw new Error(error.message)
  revalidatePath('/portal/gallery')
}

export async function deleteGalleryItem(id: string) {
  const supabase = await createClient()
  const agentId = await getAgentId(supabase)
  const { error } = await (supabase as any).from('gallery').delete().eq('id', id).eq('agent_id', agentId)
  if (error) throw new Error(error.message)
  revalidatePath('/portal/gallery')
}

export async function toggleGalleryItem(id: string, active: boolean) {
  const supabase = await createClient()
  const agentId = await getAgentId(supabase)
  const { error } = await (supabase as any).from('gallery').update({ active }).eq('id', id).eq('agent_id', agentId)
  if (error) throw new Error(error.message)
  revalidatePath('/portal/gallery')
}

export async function saveGalleryOrder(items: { id: string; order_index: number }[]) {
  const supabase = await createClient()
  const agentId = await getAgentId(supabase)
  for (const { id, order_index } of items) {
    await (supabase as any).from('gallery').update({ order_index }).eq('id', id).eq('agent_id', agentId)
  }
  revalidatePath('/portal/gallery')
}
