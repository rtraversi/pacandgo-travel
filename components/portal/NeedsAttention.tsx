import Link from 'next/link'
import type { AttentionGroup, AttentionTone } from '@/lib/attention'

const DOT: Record<AttentionTone, string> = {
  red: 'bg-red-400',
  amber: 'bg-amber-300',
  neutral: 'bg-white/30',
}

const MAX_PER_GROUP = 5

export default function NeedsAttention({ groups, hasBookings }: { groups: AttentionGroup[]; hasBookings: boolean }) {
  if (groups.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-10">
        <p className="text-[0.65rem] font-bold tracking-[0.18em] uppercase text-white/45 mb-2">Needs attention</p>
        {hasBookings ? (
          <p className="text-white/55 text-sm">Nothing due in the next few weeks. Payments, departures, passports and insurance all look fine.</p>
        ) : (
          <p className="text-white/55 text-sm">
            Add your clients&apos; reservations on the <Link href="/portal/bookings" className="text-gold hover:underline">Bookings</Link> page
            and this panel will track payment due dates, departures, passports and insurance for you.
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-10">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[0.65rem] font-bold tracking-[0.18em] uppercase text-white/45">Needs attention</p>
        <Link href="/portal/bookings" className="text-gold text-xs hover:underline">All bookings →</Link>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
        {groups.map(g => (
          <div key={g.id}>
            <p className="text-white text-sm font-medium mb-2">
              {g.label} <span className="text-white/35 font-normal">({g.items.length})</span>
            </p>
            <ul className="space-y-2.5">
              {g.items.slice(0, MAX_PER_GROUP).map(item => (
                <li key={item.key}>
                  <Link href={item.bookingId ? '/portal/bookings' : '/portal/clients'} className="flex gap-2.5 group">
                    <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${DOT[item.tone]}`} />
                    <span className="min-w-0">
                      <span className={`block text-sm group-hover:text-gold transition-colors ${item.tone === 'red' ? 'text-red-200' : 'text-white/85'}`}>
                        {item.title}
                      </span>
                      <span className="block text-xs text-white/40">{item.detail}</span>
                    </span>
                  </Link>
                </li>
              ))}
              {g.items.length > MAX_PER_GROUP && (
                <li className="text-xs text-white/35 pl-4">+{g.items.length - MAX_PER_GROUP} more</li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
