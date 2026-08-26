import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import AgentPlusGate from '@/components/portal/AgentPlusGate'
import InquiriesList, { type InquiryRow } from '@/components/portal/InquiriesList'
import type { Inquiry } from '@/lib/types'

export const metadata: Metadata = { title: 'Inquiries — Agent Portal' }

const ADMIN_USER_ID = '552d2159-35e8-440f-b1f5-cd649ff16885'

export default async function InquiriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const agentRes = await (supabase as any).from('agents').select('id, tier').eq('user_id', user.id).single()
  const agent = agentRes.data as { id: string; tier: string } | null
  if (!agent) redirect('/login')

  if (agent.tier !== 'agent_plus') return <AgentPlusGate feature="Inquiries" />

  const isAdmin = user.id === ADMIN_USER_ID

  // Admins see every agent's inquiries, so they read through the service-role
  // client; everyone else is scoped to their own rows by RLS anyway, but we
  // filter explicitly so the intent is visible here rather than only in policy.
  type Row = Inquiry & { agents: { full_name: string } | null }

  const { data } = isAdmin
    ? await createAdminClient()
        .from('inquiries')
        .select('*, agents(full_name)')
        .order('created_at', { ascending: false })
        .limit(500)
    : await supabase
        .from('inquiries')
        .select('*, agents(full_name)')
        .eq('agent_id', agent.id)
        .order('created_at', { ascending: false })
        .limit(500)

  const inquiries = ((data ?? []) as Row[]).map((r): InquiryRow => ({
    id: r.id,
    created_at: r.created_at,
    name: r.name,
    email: r.email,
    phone: r.phone,
    travelers: r.travelers,
    destination: r.destination,
    travel_date: r.travel_date,
    budget: r.budget,
    message: r.message,
    source: r.source,
    email_status: r.email_status,
    email_error: r.email_error,
    recipient_email: r.recipient_email,
    agent_name: r.agents?.full_name ?? (r.agent_slug === 'any' ? 'No preference' : r.agent_slug),
  }))

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <p className="text-[0.65rem] font-bold tracking-[0.22em] uppercase text-gold mb-2">
          {isAdmin ? 'All agents' : 'Your leads'}
        </p>
        <h1 className="text-4xl font-display text-white">Inquiries</h1>
        <p className="text-white/45 text-sm mt-2">
          Every submission from the website contact forms, with whether the notification email actually reached its inbox.
        </p>
      </div>

      <InquiriesList inquiries={inquiries} showAgent={isAdmin} />
    </div>
  )
}
