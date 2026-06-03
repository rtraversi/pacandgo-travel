import { Lock } from 'lucide-react'

const FEATURES = [
  { icon: '🏷️', label: 'Deals Manager', desc: 'Post featured cruise deals + AI email parser' },
  { icon: '✈️', label: 'Group Trips', desc: 'Manage hosted group trip packages' },
  { icon: '✍️', label: 'Blog', desc: 'Publish articles or link to external posts' },
  { icon: '⭐', label: 'Reviews', desc: 'Collect and approve client testimonials' },
  { icon: '🖼️', label: 'Photo Gallery', desc: 'Showcase your travel photography' },
  { icon: '📄', label: 'Quote Builder', desc: 'AI-researched branded PDF quotes for clients' },
]

export default function AgentPlusGate({ feature }: { feature?: string }) {
  return (
    <div className="p-8 max-w-2xl">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
        <div className="w-12 h-12 rounded-full bg-gold/15 flex items-center justify-center mx-auto mb-5">
          <Lock size={20} className="text-gold" />
        </div>

        <p className="text-[0.65rem] font-bold tracking-[0.2em] uppercase text-gold mb-2">Agent+ Feature</p>
        <h2 className="text-2xl font-display text-white mb-3">
          {feature ? `${feature} is part of Agent+` : 'Upgrade to Agent+'}
        </h2>
        <p className="text-white/45 text-sm leading-relaxed max-w-sm mx-auto">
          Agent+ gives you a full content platform to market your services, collect reviews, and close more bookings.
        </p>

        <div className="grid grid-cols-2 gap-3 mt-8 text-left">
          {FEATURES.map(f => (
            <div key={f.label} className="bg-white/5 rounded-xl px-4 py-3">
              <p className="text-sm font-medium text-white flex items-center gap-2">
                <span>{f.icon}</span> {f.label}
              </p>
              <p className="text-white/35 text-xs mt-0.5">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-white/40 text-sm">
            Interested in upgrading? Reach out to{' '}
            <a href="mailto:pacandgorob@gmail.com" className="text-gold hover:underline">
              pacandgorob@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
