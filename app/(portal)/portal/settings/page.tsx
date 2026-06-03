import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SettingsManager from '@/components/portal/SettingsManager'
import { saveVisibility, changePassword } from '@/app/actions/settings'
import type { AgentProfile } from '@/lib/types'

export const metadata: Metadata = { title: 'Settings — Agent Portal' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const agentRes = await (supabase as any).from('agents').select('id').eq('user_id', user.id).single()
  const agent = agentRes.data as { id: string } | null
  if (!agent) redirect('/login')

  const profileRes = await (supabase as any)
    .from('agent_profiles')
    .select('*')
    .eq('agent_id', agent.id)
    .single()

  const profile = profileRes.data as AgentProfile | null

  return (
    <div className="p-8">
      <SettingsManager
        profile={profile}
        onSaveVisibility={saveVisibility}
        onChangePassword={changePassword}
      />
    </div>
  )
}
