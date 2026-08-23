import { createClient } from '@/lib/supabase/server'
import { AGENT_EMAILS } from '@/lib/emailjs'
import type { Agent, IntakeAgent } from '@/lib/types'

/**
 * Options for the intake form's "preferred agent" dropdown, read straight from
 * the `agents` table — so an agent created in the admin panel appears on the
 * public form with no code change.
 *
 * The email is resolved here, on the server: AGENT_EMAILS wins when an agent's
 * public inbox differs from the login email on their row, otherwise the row's
 * email is used, and anything left over falls back to the house inbox.
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
    email: AGENT_EMAILS[a.slug] || a.email || AGENT_EMAILS.any,
  }))
}
