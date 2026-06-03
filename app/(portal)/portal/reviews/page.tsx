import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ReviewsManager from '@/components/portal/ReviewsManager'
import AgentPlusGate from '@/components/portal/AgentPlusGate'
import { approveReview, denyReview } from '@/app/actions/reviews'
import type { Review } from '@/lib/types'

export const metadata: Metadata = { title: 'Reviews — Agent Portal' }

export default async function ReviewsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const agentRes = await (supabase as any).from('agents').select('id, tier').eq('user_id', user.id).single()
  const agent = agentRes.data as { id: string; tier: string } | null
  if (!agent) redirect('/login')

  if (agent.tier !== 'agent_plus') return <AgentPlusGate feature="Reviews" />

  const { data } = await (supabase as any)
    .from('reviews')
    .select('*')
    .eq('agent_id', agent.id)
    .order('created_at', { ascending: false })

  const reviews = (data ?? []) as Review[]

  return (
    <div className="p-8 max-w-3xl">
      <ReviewsManager
        reviews={reviews}
        onApprove={approveReview}
        onDeny={denyReview}
      />
    </div>
  )
}
