import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import QuoteBuilder from '@/components/portal/QuoteBuilder'
import AgentPlusGate from '@/components/portal/AgentPlusGate'
import type { Agent, AgentProfile, Quote, Client } from '@/lib/types'

export const metadata: Metadata = { title: 'Quote Builder — Agent Portal' }

export default async function QuotesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const agentRes = await (supabase as any)
    .from('agents')
    .select('*, agent_profiles(*)')
    .eq('user_id', user.id)
    .single()

  const row = agentRes.data as (Agent & { agent_profiles: AgentProfile | null }) | null
  if (!row) redirect('/login')

  if (row.tier !== 'agent_plus') return <AgentPlusGate feature="Quote Builder" />

  const agent: Agent = {
    id: row.id,
    user_id: row.user_id,
    slug: row.slug,
    full_name: row.full_name,
    email: row.email,
    tier: row.tier,
    created_at: row.created_at,
  }
  const profile: AgentProfile | null = row.agent_profiles ?? null

  const [quotesRes, clientsRes] = await Promise.all([
    (supabase as any).from('quotes').select('*').eq('agent_id', agent.id).order('created_at', { ascending: false }),
    (supabase as any).from('clients').select('*').eq('agent_id', agent.id).order('full_name', { ascending: true }),
  ])

  const quotes = (quotesRes.data ?? []) as Quote[]
  const clients = (clientsRes.data ?? []) as Client[]

  return <QuoteBuilder quotes={quotes} agent={agent} profile={profile} clients={clients} />
}
