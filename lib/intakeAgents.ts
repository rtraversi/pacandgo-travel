import { createClient } from '@/lib/supabase/server'
import type { Agent, IntakeAgent } from '@/lib/types'

/**
 * Options for the intake form's "preferred agent" dropdown, read straight from
 * the `agents` table — so an agent created in the admin panel appears on the
 * public form with no code change.
 *
 * Only the slug and display name are returned. The recipient address is resolved
 * from the slug server-side in submitInquiry(), which keeps every agent's inbox
 * out of the public page source.
 */
export async function getIntakeAgents(): Promise<IntakeAgent[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('agents')
    .select('*')
    .order('full_name', { ascending: true })

  return ((data || []) as Agent[]).map(a => ({
    slug: a.slug,
    label: a.full_name,
  }))
}
