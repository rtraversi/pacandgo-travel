import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DealsPageClient from '@/components/portal/DealsPageClient'
import AgentPlusGate from '@/components/portal/AgentPlusGate'
import { saveDeal, deleteDeal, toggleDeal } from '@/app/actions/deals'
import type { Deal } from '@/lib/types'

export const metadata: Metadata = { title: 'Deals — Agent Portal' }

export default async function DealsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const agentRes = await (supabase as any).from('agents').select('id, tier').eq('user_id', user.id).single()
  const agent = agentRes.data as { id: string; tier: string } | null
  if (!agent) redirect('/login')

  if (agent.tier !== 'agent_plus') return <AgentPlusGate feature="Deals" />

  const { data } = await (supabase as any)
    .from('deals')
    .select('*')
    .eq('agent_id', agent.id)
    .order('created_at', { ascending: false })

  const deals = (data ?? []) as Deal[]

  return (
    <DealsPageClient
      deals={deals}
      onSave={saveDeal}
      onDelete={deleteDeal}
      onToggle={toggleDeal}
    />
  )
}
