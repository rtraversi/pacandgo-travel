'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Highlight } from '@/lib/types'

export async function saveProfile(data: {
  photo_url: string | null
  tagline: string | null
  bio: string | null
  specialties: string[]
  highlights: Highlight[]
  blog_url: string | null
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const agentRes = await (supabase as any)
    .from('agents')
    .select('id, slug')
    .eq('user_id', user.id)
    .single()

  const agent = agentRes.data as { id: string; slug: string } | null
  if (!agent) throw new Error('Agent not found')

  const profileData = {
    photo_url: data.photo_url,
    tagline: data.tagline,
    bio: data.bio,
    specialties: data.specialties,
    highlights: data.highlights,
    blog_url: data.blog_url,
  }

  const existingRes = await (supabase as any)
    .from('agent_profiles')
    .select('id')
    .eq('agent_id', agent.id)
    .single()

  let error: { message: string } | null
  if (existingRes.data) {
    const res = await (supabase as any)
      .from('agent_profiles')
      .update(profileData)
      .eq('agent_id', agent.id)
    error = res.error
  } else {
    const res = await (supabase as any)
      .from('agent_profiles')
      .insert({ agent_id: agent.id, ...profileData })
    error = res.error
  }

  if (error) throw new Error(error.message)

  revalidatePath('/portal')
  revalidatePath('/portal/profile')
  revalidatePath(`/agent/${agent.slug}`)
}
