import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PortalSidebar from '@/components/portal/PortalSidebar'
import type { Agent, AgentProfile } from '@/lib/types'

type AgentRow = Agent & { agent_profiles: AgentProfile | null }

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data } = await supabase
    .from('agents')
    .select('*, agent_profiles(*)')
    .eq('user_id', user.id)
    .single()

  const agent = data as AgentRow | null

  if (!agent) {
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-navy-dark text-white">
      <PortalSidebar agent={agent} />
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  )
}
