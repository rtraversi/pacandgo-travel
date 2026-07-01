import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ClientsManager from '@/components/portal/ClientsManager'
import AgentPlusGate from '@/components/portal/AgentPlusGate'
import { saveClient, deleteClient, linkHousehold, unlinkFromHousehold } from '@/app/actions/clients'
import type { Client } from '@/lib/types'

export const metadata: Metadata = { title: 'Clients — Agent Portal' }

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const agentRes = await (supabase as any).from('agents').select('id, tier').eq('user_id', user.id).single()
  const agent = agentRes.data as { id: string; tier: string } | null
  if (!agent) redirect('/login')

  if (agent.tier !== 'agent_plus') return <AgentPlusGate feature="Clients" />

  const { data } = await (supabase as any)
    .from('clients')
    .select('*')
    .eq('agent_id', agent.id)
    .order('full_name', { ascending: true })

  const clients = (data ?? []) as Client[]

  return (
    <div className="p-8 max-w-3xl">
      <ClientsManager
        clients={clients}
        onSave={saveClient}
        onDelete={deleteClient}
        onLinkHousehold={linkHousehold}
        onUnlinkHousehold={unlinkFromHousehold}
      />
    </div>
  )
}
