import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CruiseItemManager from '@/components/portal/CruiseItemManager'
import AgentPlusGate from '@/components/portal/AgentPlusGate'
import { saveTrip, deleteTrip, toggleTrip } from '@/app/actions/trips'
import type { Trip } from '@/lib/types'

export const metadata: Metadata = { title: 'Trips — Agent Portal' }

export default async function TripsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const agentRes = await (supabase as any).from('agents').select('id, tier').eq('user_id', user.id).single()
  const agent = agentRes.data as { id: string; tier: string } | null
  if (!agent) redirect('/login')

  if (agent.tier !== 'agent_plus') return <AgentPlusGate feature="Trips" />

  const { data } = await (supabase as any)
    .from('trips')
    .select('*')
    .eq('agent_id', agent.id)
    .order('date_from', { ascending: true })

  const trips = (data ?? []) as Trip[]

  return (
    <div className="p-8 max-w-3xl">
      <CruiseItemManager
        label="Trip"
        items={trips}
        onSave={saveTrip}
        onDelete={deleteTrip}
        onToggle={toggleTrip}
      />
    </div>
  )
}
