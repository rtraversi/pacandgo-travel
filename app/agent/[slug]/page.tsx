import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Agent, AgentProfile } from '@/lib/types'

type AgentRow = Agent & { agent_profiles: AgentProfile | null }

interface Props {
  params: Promise<{ slug: string }>
}

export default async function AgentProfilePage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('agents')
    .select('*, agent_profiles(*)')
    .eq('slug', slug)
    .single()

  const agent = data as AgentRow | null
  if (!agent) notFound()

  return (
    <main className="min-h-screen bg-[#0a1628] p-8">
      <div className="text-white">
        <h1 className="text-2xl font-bold">{agent.full_name}</h1>
        <p className="text-[#c9a84c]">{agent.tier === 'agent_plus' ? 'Agent+' : 'Agent'}</p>
        <p className="text-gray-400 mt-4">Full profile coming — Phase 2</p>
      </div>
    </main>
  )
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('agents').select('full_name').eq('slug', slug).single()
  const agent = data as Pick<Agent, 'full_name'> | null
  return {
    title: agent ? `${agent.full_name} | PAC and GO Travel` : 'Agent | PAC and GO Travel',
  }
}
