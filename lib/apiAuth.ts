import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * For API routes that spend money (Claude calls): only signed-in agents may use them.
 * Returns a 401/403 response to send back, or null when the caller is allowed.
 */
export async function rejectUnlessAgent(): Promise<NextResponse | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 })

  const { data: agent } = await supabase.from('agents').select('id').eq('user_id', user.id).maybeSingle()
  if (!agent) return NextResponse.json({ error: 'Agents only.' }, { status: 403 })

  return null
}
