import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import ProfileEditor from '@/components/portal/ProfileEditor'
import type { Agent, AgentProfile } from '@/lib/types'

export const metadata = { title: 'Admin — Edit Profile' }

const ADMIN_USER_ID = '552d2159-35e8-440f-b1f5-cd649ff16885'

type AgentRow = Agent & { agent_profiles: AgentProfile | null }

interface Props { params: Promise<{ agentId: string }> }

export default async function AdminAgentProfilePage({ params }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== ADMIN_USER_ID) redirect('/portal')

  const { agentId } = await params
  const admin = createAdminClient()
  const { data } = await admin
    .from('agents')
    .select('*, agent_profiles(*)')
    .eq('id', agentId)
    .maybeSingle()

  const agent = data as AgentRow | null
  if (!agent) notFound()

  return (
    <div className="p-8 max-w-3xl">
      <Link
        href="/portal/admin"
        className="inline-flex items-center gap-1.5 text-white/40 text-xs hover:text-white transition-colors no-underline mb-6"
      >
        <ArrowLeft size={13} />
        Back to Agent Management
      </Link>

      <div className="mb-8">
        <p className="text-[0.65rem] font-bold tracking-[0.22em] uppercase text-gold mb-2">Admin · Editing on behalf of</p>
        <h1 className="text-3xl font-display text-white">{agent.full_name}</h1>
        <p className="text-white/45 text-sm mt-2">
          This content appears on the public page at{' '}
          <span className="text-white/60">{agent.slug}.pacandgotravel.com</span>
        </p>
      </div>

      <ProfileEditor
        agentId={agent.id}
        agentName={agent.full_name}
        agentSlug={agent.slug}
        profile={agent.agent_profiles}
      />
    </div>
  )
}
