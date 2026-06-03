'use client'

import { PDFDownloadLink } from '@react-pdf/renderer'
import QuotePDFDocument from './QuotePDFDocument'
import type { Quote, Agent, AgentProfile } from '@/lib/types'

interface Props {
  quote: Quote
  agent: Agent
  profile: AgentProfile | null
  className?: string
  label?: string
}

export default function QuotePDFDownloadBtn({ quote, agent, profile, className, label }: Props) {
  const logoUrl = typeof window !== 'undefined' ? window.location.origin + '/images/logo.png' : ''

  const fileName = [
    'PAC-GO-Quote',
    quote.line,
    quote.ship,
    quote.customer_name ?? 'Client',
  ]
    .join('-')
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
    + '.pdf'

  return (
    <PDFDownloadLink
      document={<QuotePDFDocument quote={quote} agent={agent} profile={profile} logoUrl={logoUrl} />}
      fileName={fileName}
      className={className}
    >
      {({ loading }) =>
        loading ? (
          <span className="flex items-center gap-1.5 opacity-60">
            <span className="animate-spin inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full" />
            Building…
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {label ?? 'Download PDF'}
          </span>
        )
      }
    </PDFDownloadLink>
  )
}
