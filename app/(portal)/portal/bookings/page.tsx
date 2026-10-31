import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BookingsManager, { type BookingClient, type BookingQuote } from '@/components/portal/BookingsManager'
import AgentPlusGate from '@/components/portal/AgentPlusGate'
import { saveBooking, deleteBooking } from '@/app/actions/bookings'
import { todayISO } from '@/lib/dates'
import type { Booking } from '@/lib/types'

export const metadata: Metadata = { title: 'Bookings — Agent Portal' }

export default async function BookingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const agentRes = await (supabase as any).from('agents').select('id, tier').eq('user_id', user.id).single()
  const agent = agentRes.data as { id: string; tier: string } | null
  if (!agent) redirect('/login')

  if (agent.tier !== 'agent_plus') return <AgentPlusGate feature="Bookings" />

  const [bookingsRes, clientsRes, quotesRes] = await Promise.all([
    (supabase as any).from('bookings').select('*').eq('agent_id', agent.id).order('depart_date', { ascending: true }),
    (supabase as any).from('clients').select('id, full_name, email, household_id').eq('agent_id', agent.id),
    (supabase as any)
      .from('quotes')
      .select('id, customer_name, client_id, additional_guest_ids, line, ship, start_date, nights, price, guests')
      .eq('agent_id', agent.id)
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  return (
    <div className="p-8 max-w-3xl">
      <BookingsManager
        bookings={(bookingsRes.data ?? []) as Booking[]}
        clients={(clientsRes.data ?? []) as BookingClient[]}
        quotes={(quotesRes.data ?? []) as BookingQuote[]}
        today={todayISO()}
        onSave={saveBooking}
        onDelete={deleteBooking}
      />
    </div>
  )
}
