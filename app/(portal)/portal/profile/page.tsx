import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileEditor from '@/components/portal/ProfileEditor'
import type { Agent, AgentProfile } from '@/lib/types'

export const metadata: Metadata = { title: 'Profile — Agent Portal' }

type AgentRow = Agent & { agent_profiles: AgentProfile | null }

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('agents')
    .select('*, agent_profiles(*)')
    .eq('user_id', user.id)
    .single()

  const agent = data as AgentRow | null
  if (!agent) redirect('/login')

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <p className="text-[0.65rem] font-bold tracking-[0.22em] uppercase text-gold mb-2">Agent Portal</p>
        <h1 className="text-3xl font-display text-white">Your Profile</h1>
        <p className="text-white/45 text-sm mt-2">
          This content appears on your public page at{' '}
          <span className="text-white/60">{agent.slug}.pacandgotravel.com</span>
        </p>
      </div>

      <ProfileEditor
        agentName={agent.full_name}
        agentSlug={agent.slug}
        profile={agent.agent_profiles}
      />
    </div>
  )
}
