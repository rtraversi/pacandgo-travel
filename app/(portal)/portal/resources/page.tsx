import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AgentPlusGate from '@/components/portal/AgentPlusGate'

export const metadata: Metadata = { title: 'Resources — Agent Portal' }

const COMING_SOON = [
  { icon: '🗺️', label: 'Shore Excursions', desc: 'Project Expedition, Viator, Klook — curated affiliate links your clients can book directly' },
  { icon: '✈️', label: 'Flights & Hotels', desc: 'Expedia affiliate links for pre/post-cruise travel planning' },
  { icon: '🚗', label: 'Port Transfers', desc: 'Welcome Pickups & Kiwitaxi widgets for airport and port transfers' },
  { icon: '📱', label: 'International eSIMs', desc: 'Airalo & GigSky — stay connected at every port without roaming charges' },
  { icon: '🔒', label: 'Travel Security', desc: 'NordVPN — secure browsing on cruise ship Wi-Fi and hotel networks' },
  { icon: '🛡️', label: 'Travel Insurance', desc: 'Travel Insured International — protect every dollar of your clients\' investment' },
]

export default async function ResourcesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const agentRes = await (supabase as any).from('agents').select('id, tier').eq('user_id', user.id).single()
  const agent = agentRes.data as { id: string; tier: string } | null
  if (!agent) redirect('/login')

  if (agent.tier !== 'agent_plus') return <AgentPlusGate feature="Resources" />

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <p className="text-[0.65rem] font-bold tracking-[0.22em] uppercase text-gold mb-2">Agent+ Feature</p>
        <h1 className="text-3xl font-display text-white">Resources</h1>
        <p className="text-white/40 text-sm mt-1">Affiliate tools and booking links to share with your clients.</p>
      </div>

      <div className="bg-gold/8 border border-gold/20 rounded-2xl p-8 mb-8 text-center">
        <p className="text-4xl mb-4">🧰</p>
        <h2 className="text-xl font-display text-white mb-2">Coming Soon</h2>
        <p className="text-white/45 text-sm leading-relaxed max-w-md mx-auto">
          The Resources section is under construction. Soon you'll be able to add your own affiliate links for shore excursions, transfers, eSIMs, insurance, and more — all branded and ready to share with clients.
        </p>
      </div>

      <h2 className="text-xs font-bold tracking-widest uppercase text-white/30 mb-4">What's Coming</h2>
      <div className="grid grid-cols-2 gap-3">
        {COMING_SOON.map(item => (
          <div key={item.label} className="bg-white/5 border border-white/10 rounded-xl px-4 py-4">
            <p className="text-sm font-medium text-white flex items-center gap-2 mb-1">
              <span>{item.icon}</span> {item.label}
            </p>
            <p className="text-white/35 text-xs leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
