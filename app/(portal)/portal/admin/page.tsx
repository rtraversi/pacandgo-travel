import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminPanel from '@/components/portal/AdminPanel'
import type { Agent, AgentProfile } from '@/lib/types'

export const metadata = { title: 'Admin — Agent Management' }

const ADMIN_USER_ID = '552d2159-35e8-440f-b1f5-cd649ff16885'

export type AdminAgent = Agent & { agent_profiles: AgentProfile | null }

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== ADMIN_USER_ID) redirect('/portal')

  const admin = createAdminClient()
  const { data } = await admin
    .from('agents')
    .select('*, agent_profiles(*)')
    .order('tier', { ascending: false })
    .order('full_name')

  const agents = (data || []) as AdminAgent[]

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <p className="text-[0.7rem] font-bold tracking-[0.2em] uppercase text-gold mb-1">Admin</p>
        <h1 className="text-2xl text-white font-bold">Agent Management</h1>
        <p className="text-white/40 text-sm mt-1">Manage tiers, logins, and agent records.</p>
      </div>
      <AdminPanel agents={agents} />
    </div>
  )
}
