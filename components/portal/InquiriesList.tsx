'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle, Check, ChevronDown, Clock, Inbox } from 'lucide-react'

export type InquiryRow = {
  id: string
  created_at: string
  name: string
  email: string
  phone: string | null
  travelers: string | null
  destination: string | null
  travel_date: string | null
  budget: string | null
  message: string | null
  source: string
  email_status: 'pending' | 'sent' | 'failed'
  email_error: string | null
  recipient_email: string
  agent_name: string
}

type Filter = 'all' | 'sent' | 'failed'

const STATUS = {
  sent:    { icon: Check,         cls: 'text-green-400 bg-green-400/10', label: 'Delivered' },
  failed:  { icon: AlertTriangle, cls: 'text-red-400 bg-red-400/10',     label: 'Failed' },
  pending: { icon: Clock,         cls: 'text-white/50 bg-white/10',      label: 'Pending' },
} as const

function when(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}

export default function InquiriesList({
  inquiries,
  showAgent,
}: {
  inquiries: InquiryRow[]
  showAgent: boolean
}) {
  const [filter, setFilter] = useState<Filter>('all')
  const [open, setOpen] = useState<string | null>(null)

  const failedCount = useMemo(
    () => inquiries.filter(i => i.email_status === 'failed').length,
    [inquiries]
  )

  const shown = useMemo(
    () => (filter === 'all' ? inquiries : inquiries.filter(i => i.email_status === filter)),
    [inquiries, filter]
  )

  if (inquiries.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
          <Inbox size={20} className="text-white/30" />
        </div>
        <p className="text-white font-medium">No inquiries yet</p>
        <p className="text-white/40 text-sm mt-1">
          Submissions from the website contact forms will appear here.
        </p>
      </div>
    )
  }

  return (
    <>
      {failedCount > 0 && (
        <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle size={18} className="text-red-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-white font-medium text-sm">
              {failedCount} {failedCount === 1 ? 'notification' : 'notifications'} failed to send
            </p>
            <p className="text-white/55 text-sm mt-0.5">
              The lead details are safe below — only the email failed. Follow up directly.
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        {(['all', 'sent', 'failed'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-full transition-colors ${
              filter === f ? 'bg-gold text-navy' : 'bg-white/5 text-white/50 hover:text-white/80'
            }`}
          >
            {f === 'all' ? `All ${inquiries.length}` : f === 'sent' ? 'Delivered' : `Failed ${failedCount}`}
          </button>
        ))}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl divide-y divide-white/10 overflow-hidden">
        {shown.map(i => {
          const s = STATUS[i.email_status] ?? STATUS.pending
          const Icon = s.icon
          const isOpen = open === i.id
          return (
            <div key={i.id}>
              <button
                onClick={() => setOpen(isOpen ? null : i.id)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/[0.03] transition-colors"
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${s.cls}`}>
                  <Icon size={13} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-2">
                    <span className="text-white text-sm font-medium truncate">{i.name}</span>
                    {showAgent && (
                      <span className="text-[0.65rem] uppercase tracking-wider text-gold/70 shrink-0">
                        {i.agent_name}
                      </span>
                    )}
                  </span>
                  <span className="block text-white/40 text-xs truncate mt-0.5">
                    {i.destination || i.message || i.email}
                  </span>
                </span>

                <span className="text-white/30 text-xs shrink-0 hidden sm:block">{when(i.created_at)}</span>
                <ChevronDown
                  size={15}
                  className={`text-white/25 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 bg-black/15">
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    <Field label="Email" value={<a href={`mailto:${i.email}`} className="text-gold hover:underline">{i.email}</a>} />
                    <Field label="Phone" value={i.phone} />
                    <Field label="Travelers" value={i.travelers} />
                    <Field label="Destination" value={i.destination} />
                    <Field label="Travel dates" value={i.travel_date} />
                    <Field label="Budget" value={i.budget} />
                    <Field label="Submitted" value={when(i.created_at)} />
                    <Field label="Form" value={i.source === 'agent_page' ? 'Agent profile page' : 'Main intake form'} />
                    <Field label="Notification sent to" value={i.recipient_email} />
                    <Field label="Delivery" value={s.label} />
                  </dl>

                  {i.message && (
                    <div className="mt-4">
                      <p className="text-[0.65rem] uppercase tracking-wider text-white/35 mb-1.5">Message</p>
                      <p className="text-white/75 text-sm whitespace-pre-wrap leading-relaxed">{i.message}</p>
                    </div>
                  )}

                  {i.email_error && (
                    <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg px-3.5 py-2.5">
                      <p className="text-[0.65rem] uppercase tracking-wider text-red-400/80 mb-1">Delivery error</p>
                      <p className="text-white/60 text-xs font-mono break-all">{i.email_error}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null
  return (
    <div className="flex gap-3">
      <dt className="text-white/35 text-xs uppercase tracking-wider w-32 shrink-0 pt-0.5">{label}</dt>
      <dd className="text-white/75 min-w-0 break-words">{value}</dd>
    </div>
  )
}
