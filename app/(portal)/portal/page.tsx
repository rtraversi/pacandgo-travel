import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Agent, AgentProfile } from '@/lib/types'

export const metadata: Metadata = { title: 'Dashboard — Agent Portal' }

type AgentRow = Agent & { agent_profiles: AgentProfile | null }

export default async function PortalDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('agents')
    .select('*, agent_profiles(*)')
    .eq('user_id', user.id)
    .single()

  const agent = data as AgentRow | null
  if (!agent) redirect('/login')

  const profile = agent.agent_profiles
  const profileComplete = !!(profile?.bio && profile?.photo_url && profile?.tagline)
  const isPlus = agent.tier === 'agent_plus'

  // Agent+ stat counts
  let stats: { label: string; value: number; href: string; alert: boolean }[] = []
  if (isPlus) {
    const [dealsRes, tripsRes, reviewsRes, galleryRes] = await Promise.all([
      supabase.from('deals').select('id', { count: 'exact', head: true }).eq('agent_id', agent.id).eq('active', true),
      supabase.from('trips').select('id', { count: 'exact', head: true }).eq('agent_id', agent.id).eq('active', true),
      supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('agent_id', agent.id).eq('status', 'pending'),
      supabase.from('gallery').select('id', { count: 'exact', head: true }).eq('agent_id', agent.id).eq('active', true),
    ])
    stats = [
      { label: 'Active Deals', value: dealsRes.count ?? 0, href: '/portal/deals', alert: false },
      { label: 'Active Trips', value: tripsRes.count ?? 0, href: '/portal/trips', alert: false },
      { label: 'Pending Reviews', value: reviewsRes.count ?? 0, href: '/portal/reviews', alert: (reviewsRes.count ?? 0) > 0 },
      { label: 'Gallery Photos', value: galleryRes.count ?? 0, href: '/portal/gallery', alert: false },
    ]
  }

  // Profile completeness for basic agents
  const completionItems = [
    { label: 'Profile photo', done: !!profile?.photo_url },
    { label: 'Tagline', done: !!profile?.tagline },
    { label: 'Bio', done: !!profile?.bio },
    { label: 'Specialties', done: (profile?.specialties?.length ?? 0) > 0 },
  ]
  const completionPct = Math.round((completionItems.filter(i => i.done).length / completionItems.length) * 100)

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <p className="text-[0.65rem] font-bold tracking-[0.22em] uppercase text-gold mb-2">Welcome back</p>
        <h1 className="text-4xl font-display text-white">{agent.full_name}</h1>
        {isPlus && (
          <span className="inline-block mt-3 text-[0.65rem] font-bold uppercase tracking-widest bg-gold/15 text-gold px-3 py-1 rounded">
            Agent+
          </span>
        )}
      </div>

      {/* Profile incomplete nudge */}
      {!profileComplete && (
        <div className="bg-gold/10 border border-gold/25 rounded-xl p-4 mb-8 flex items-start gap-4">
          <span className="text-gold text-lg mt-0.5">✦</span>
          <div>
            <p className="text-white font-medium text-sm">Complete your profile</p>
            <p className="text-white/55 text-sm mt-0.5">
              {!profile?.photo_url && 'Add a photo. '}
              {!profile?.tagline && 'Write a tagline. '}
              {!profile?.bio && 'Add your bio. '}
              Clients see this on your public page.
            </p>
            <Link href="/portal/profile" className="text-gold text-sm hover:underline mt-2 inline-block">
              Go to Profile →
            </Link>
          </div>
        </div>
      )}

      {/* Agent+ stat grid */}
      {isPlus && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map(({ label, value, href, alert }) => (
            <Link
              key={label}
              href={href}
              className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/[0.08] hover:border-white/20 transition-colors group"
            >
              <p className={`text-4xl font-display transition-colors ${alert ? 'text-gold' : 'text-white group-hover:text-gold'}`}>
                {value}
              </p>
              <p className="text-white/45 text-xs mt-1.5">{label}</p>
              {alert && <p className="text-gold/70 text-[0.65rem] mt-1">Needs attention</p>}
            </Link>
          ))}
        </div>
      )}

      {/* Basic agent: profile card + public page link */}
      {!isPlus && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <p className="text-xs font-bold tracking-widest uppercase text-white/30 mb-4">Profile Completion</p>
            <div className="flex items-end gap-3 mb-4">
              <p className="text-5xl font-display text-white">{completionPct}%</p>
            </div>
            <div className="space-y-2 mb-5">
              {completionItems.map(item => (
                <div key={item.label} className="flex items-center gap-2 text-xs">
                  <span className={item.done ? 'text-gold' : 'text-white/20'}>
                    {item.done ? '✓' : '○'}
                  </span>
                  <span className={item.done ? 'text-white/60' : 'text-white/25'}>{item.label}</span>
                </div>
              ))}
            </div>
            <Link href="/portal/profile"
              className="text-xs text-gold hover:underline">
              Edit Profile →
            </Link>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-white/30 mb-4">Your Public Page</p>
              <p className="text-white/45 text-sm leading-relaxed">
                Your profile is live at <span className="text-gold font-medium">pacandgotravel.com/{agent.slug}</span>. Share it with clients to let them contact you directly.
              </p>
            </div>
            <a
              href={`https://pacandgotravel.com/${agent.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-block text-xs bg-gold/10 text-gold border border-gold/25 px-4 py-2 rounded-lg hover:bg-gold/20 transition w-fit">
              View Public Page ↗
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
