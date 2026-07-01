'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import type { Agent, AgentProfile } from '@/lib/types'
import {
  LayoutDashboard, User, Tag, Plane, BookOpen,
  Star, Images, Settings, FileText, LogOut, Compass, ShieldCheck, Users,
} from 'lucide-react'

const ADMIN_USER_ID = '552d2159-35e8-440f-b1f5-cd649ff16885'

type Props = {
  agent: Agent & { agent_profiles: AgentProfile | null }
}

const BASIC_NAV = [
  { label: 'Dashboard', href: '/portal', icon: LayoutDashboard },
  { label: 'Profile', href: '/portal/profile', icon: User },
  { label: 'Settings', href: '/portal/settings', icon: Settings },
]

const PLUS_NAV = [
  { label: 'Dashboard', href: '/portal', icon: LayoutDashboard },
  { label: 'Profile', href: '/portal/profile', icon: User },
  { label: 'Deals', href: '/portal/deals', icon: Tag },
  { label: 'Trips', href: '/portal/trips', icon: Plane },
  { label: 'Blog', href: '/portal/blog', icon: BookOpen },
  { label: 'Reviews', href: '/portal/reviews', icon: Star },
  { label: 'Gallery', href: '/portal/gallery', icon: Images },
  { label: 'Resources', href: '/portal/resources', icon: Compass },
  { label: 'Settings', href: '/portal/settings', icon: Settings },
]

export default function PortalSidebar({ agent }: Props) {
  const pathname = usePathname()
  const isPlus = agent.tier === 'agent_plus'
  const NAV = isPlus ? PLUS_NAV : BASIC_NAV

  return (
    <aside className="w-56 shrink-0 bg-navy-dark border-r border-white/10 flex flex-col min-h-screen sticky top-0 h-screen overflow-y-auto">
      {/* Brand */}
      <div className="px-5 py-4 border-b border-white/10">
        <p className="text-[0.65rem] font-bold tracking-[0.22em] uppercase text-gold">PAC and GO</p>
        <p className="text-white/35 text-[0.65rem] mt-0.5">Agent Portal</p>
      </div>

      {/* Agent chip */}
      <div className="px-5 py-3.5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          {agent.agent_profiles?.photo_url ? (
            <img
              src={agent.agent_profiles.photo_url}
              alt={agent.full_name}
              className="w-7 h-7 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-gold/20 flex items-center justify-center text-gold text-[0.6rem] font-bold shrink-0">
              {agent.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-white text-xs font-medium truncate">{agent.full_name}</p>
            <p className="text-white/35 text-[0.65rem]">{isPlus ? 'Agent+' : 'Agent'}</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2.5 py-3 space-y-0.5">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = href === '/portal' ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${
                active
                  ? 'bg-gold/15 text-gold font-medium'
                  : 'text-white/55 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={14} strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          )
        })}

        {isPlus && (
          <Link
            href="/portal/clients"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${
              pathname.startsWith('/portal/clients')
                ? 'bg-gold/15 text-gold font-medium'
                : 'text-white/55 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users size={14} strokeWidth={pathname.startsWith('/portal/clients') ? 2.5 : 2} />
            Clients
          </Link>
        )}

        {isPlus && (
          <Link
            href="/portal/quotes"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${
              pathname.startsWith('/portal/quotes')
                ? 'bg-gold/15 text-gold font-medium'
                : 'text-white/55 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText size={14} strokeWidth={pathname.startsWith('/portal/quotes') ? 2.5 : 2} />
            Quote Builder
            <span className="ml-auto text-[0.55rem] bg-gold/25 text-gold px-1.5 py-0.5 rounded font-bold tracking-wide">A+</span>
          </Link>
        )}

        {agent.user_id === ADMIN_USER_ID && (
          <Link
            href="/portal/admin"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${
              pathname.startsWith('/portal/admin')
                ? 'bg-gold/15 text-gold font-medium'
                : 'text-white/55 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldCheck size={14} strokeWidth={pathname.startsWith('/portal/admin') ? 2.5 : 2} />
            Admin
          </Link>
        )}
      </nav>

      {/* Sign out */}
      <div className="px-2.5 pb-4 pt-3 border-t border-white/10">
        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-white/45 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  )
}
