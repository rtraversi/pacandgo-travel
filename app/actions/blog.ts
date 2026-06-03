'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type BlogFormData = {
  title: string
  body: string | null
  url: string | null
  description: string | null
  tags: string[]
  publish_date: string | null
  active: boolean
}

async function getAgentId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const res = await (supabase as any).from('agents').select('id').eq('user_id', user.id).single()
  if (!res.data) throw new Error('Agent not found')
  return res.data.id as string
}

export async function saveBlogPost(data: BlogFormData, id?: string) {
  const supabase = await createClient()
  const agentId = await getAgentId(supabase)

  let error
  if (id) {
    const res = await (supabase as any).from('blog_posts').update(data).eq('id', id).eq('agent_id', agentId)
    error = res.error
  } else {
    const res = await (supabase as any).from('blog_posts').insert({ ...data, agent_id: agentId })
    error = res.error
  }
  if (error) throw new Error(error.message)
  revalidatePath('/portal/blog')
}

export async function deleteBlogPost(id: string) {
  const supabase = await createClient()
  const agentId = await getAgentId(supabase)
  const { error } = await (supabase as any).from('blog_posts').delete().eq('id', id).eq('agent_id', agentId)
  if (error) throw new Error(error.message)
  revalidatePath('/portal/blog')
}

export async function toggleBlogPost(id: string, active: boolean) {
  const supabase = await createClient()
  const agentId = await getAgentId(supabase)
  const { error } = await (supabase as any).from('blog_posts').update({ active }).eq('id', id).eq('agent_id', agentId)
  if (error) throw new Error(error.message)
  revalidatePath('/portal/blog')
}
