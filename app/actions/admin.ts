'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { registerAgentSubdomain, normalizeSlug, validateSlug, type SubdomainResult } from '@/lib/netlify'
import { sanitizeBioHtml } from '@/lib/richText.server'
import type { AgentTier, Highlight } from '@/lib/types'

const ADMIN_USER_ID = '552d2159-35e8-440f-b1f5-cd649ff16885'

async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== ADMIN_USER_ID) throw new Error('Unauthorized')
}

export async function setAgentTier(agentId: string, tier: AgentTier) {
  await assertAdmin()
  const admin = createAdminClient()
  const { error } = await admin.from('agents').update({ tier }).eq('id', agentId)
  if (error) throw new Error(error.message)
  revalidatePath('/portal/admin')
}

export async function linkUserToAgent(agentId: string, userId: string) {
  await assertAdmin()
  const admin = createAdminClient()
  const { error } = await admin.from('agents').update({ user_id: userId }).eq('id', agentId)
  if (error) throw new Error(error.message)
  revalidatePath('/portal/admin')
}

export async function createLoginForAgent(agentId: string, email: string, password: string) {
  await assertAdmin()
  const admin = createAdminClient()

  const { data: userData, error: userError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (userError) throw new Error(userError.message)

  const { error: linkError } = await admin
    .from('agents')
    .update({ user_id: userData.user.id })
    .eq('id', agentId)
  if (linkError) throw new Error(linkError.message)

  revalidatePath('/portal/admin')
  return { userId: userData.user.id }
}

export async function addAgent(data: {
  full_name: string
  email: string
  slug: string
  tier: AgentTier
}): Promise<{ agentId: string; subdomain: SubdomainResult }> {
  await assertAdmin()
  const admin = createAdminClient()

  // Validate before inserting: a slug with a space or capital letter can never
  // become a working subdomain, and fixing it after the fact means editing the
  // row by hand in Supabase.
  const slug = normalizeSlug(data.slug)
  const slugError = validateSlug(slug)
  if (slugError) throw new Error(slugError)

  const { data: agent, error } = await admin
    .from('agents')
    .insert({ full_name: data.full_name, email: data.email, slug, tier: data.tier })
    .select('id')
    .single()
  if (error) throw new Error(error.message)

  await admin.from('agent_profiles').insert({ agent_id: agent.id })

  // Fails soft — the agent exists either way; the panel surfaces a warning so
  // the alias can be added by hand.
  const subdomain = await registerAgentSubdomain(slug)

  revalidatePath('/portal/admin')
  return { agentId: agent.id as string, subdomain }
}

export async function saveAgentProfile(agentId: string, data: {
  photo_url: string | null
  tagline: string | null
  bio: string | null
  specialties: string[]
  highlights: Highlight[]
  blog_url: string | null
}) {
  await assertAdmin()
  const admin = createAdminClient()

  const agentRes = await admin.from('agents').select('slug').eq('id', agentId).single()
  const agent = agentRes.data as { slug: string } | null
  if (!agent) throw new Error('Agent not found')

  const existingRes = await admin
    .from('agent_profiles')
    .select('id')
    .eq('agent_id', agentId)
    .maybeSingle()

  // Same scrub as the agent-facing save — this path writes the same column.
  const payload = { ...data, bio: sanitizeBioHtml(data.bio) }

  const { error } = existingRes.data
    ? await admin.from('agent_profiles').update(payload).eq('agent_id', agentId)
    : await admin.from('agent_profiles').insert({ agent_id: agentId, ...payload })
  if (error) throw new Error(error.message)

  revalidatePath('/portal/admin')
  revalidatePath(`/portal/admin/${agentId}`)
  revalidatePath(`/agent/${agent.slug}`)
}

export async function removeAgentLogin(agentId: string) {
  await assertAdmin()
  const admin = createAdminClient()
  const { error } = await admin.from('agents').update({ user_id: null }).eq('id', agentId)
  if (error) throw new Error(error.message)
  revalidatePath('/portal/admin')
}
