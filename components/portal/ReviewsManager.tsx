'use client'

import { useTransition } from 'react'
import type { Review } from '@/lib/types'

interface Props {
  reviews: Review[]
  onApprove: (id: string) => Promise<void>
  onDeny: (id: string) => Promise<void>
}

function Stars({ n }: { n: number | null }) {
  if (!n) return null
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} className={`w-3 h-3 ${i < n ? 'text-gold' : 'text-white/15'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  )
}

function ReviewCard({ review, isPending, onApprove, onDeny }: {
  review: Review
  isPending: boolean
  onApprove?: () => void
  onDeny?: () => void
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-white font-medium text-sm">{review.client_name}</p>
            <Stars n={review.stars} />
            {review.trip_type && (
              <span className="text-white/30 text-xs">· {review.trip_type}</span>
            )}
          </div>
          <p className="text-white/60 text-sm leading-relaxed">{review.review_text}</p>
          <p className="text-white/25 text-xs mt-2">
            {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {onApprove && onDeny && (
          <div className="flex gap-2 shrink-0">
            <button onClick={onApprove} disabled={isPending}
              className="px-3 py-1.5 text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 rounded-lg hover:bg-emerald-500/25 transition disabled:opacity-50">
              Approve
            </button>
            <button onClick={onDeny} disabled={isPending}
              className="px-3 py-1.5 text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition disabled:opacity-50">
              Deny
            </button>
          </div>
        )}

        {review.status === 'approved' && (
          <span className="shrink-0 text-[0.6rem] font-bold tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded">
            APPROVED
          </span>
        )}
      </div>
    </div>
  )
}

export default function ReviewsManager({ reviews, onApprove, onDeny }: Props) {
  const [isPending, startTransition] = useTransition()

  const pending = reviews.filter(r => r.status === 'pending')
  const approved = reviews.filter(r => r.status === 'approved')

  function handle(fn: (id: string) => Promise<void>, id: string) {
    startTransition(async () => { await fn(id) })
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-white">Reviews</h1>
          <p className="text-white/40 text-sm mt-1">{approved.length} approved · {pending.length} pending</p>
        </div>
      </div>

      {pending.length > 0 && (
        <section>
          <h2 className="text-xs font-bold tracking-widest uppercase text-gold mb-3">Pending Approval</h2>
          <div className="space-y-3">
            {pending.map(r => (
              <ReviewCard key={r.id} review={r} isPending={isPending}
                onApprove={() => handle(onApprove, r.id)}
                onDeny={() => handle(onDeny, r.id)} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xs font-bold tracking-widest uppercase text-white/30 mb-3">Approved Reviews</h2>
        {approved.length === 0 ? (
          <div className="border border-dashed border-white/10 rounded-xl py-12 text-center">
            <p className="text-white/25 text-sm">No approved reviews yet.</p>
            {pending.length === 0 && (
              <p className="text-white/20 text-xs mt-1">Reviews are submitted by clients on your public page.</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {approved.map(r => (
              <ReviewCard key={r.id} review={r} isPending={isPending} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
