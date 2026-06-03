import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Agent Portal' }

export default function PortalPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gold mb-2">Agent Portal</h1>
      <p className="text-white/60">Full portal coming in Phase 3.</p>
    </div>
  )
}
