'use client'

import { useState } from 'react'
import type { CruiseFormData } from '@/app/actions/deals'

type ParsedDeal = CruiseFormData & { _id: string; _selected: boolean }

interface Props {
  onImport: (deals: CruiseFormData[]) => Promise<void>
  onBack: () => void
}

function formatDate(d: string | null) {
  if (!d) return null
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function DealsParser({ onImport, onBack }: Props) {
  const [content, setContent] = useState('')
  const [parsing, setParsing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [deals, setDeals] = useState<ParsedDeal[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleParse() {
    if (!content.trim()) return
    setParsing(true)
    setError(null)
    setDeals(null)

    try {
      const res = await fetch('/api/parse-deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      if (!data.deals.length) { setError('No consumer deals found in this email. It may be agent-only content.'); return }
      setDeals(data.deals.map((d: CruiseFormData, i: number) => ({ ...d, _id: String(i), _selected: true })))
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setParsing(false)
    }
  }

  function toggleSelect(id: string) {
    setDeals(prev => prev?.map(d => d._id === id ? { ...d, _selected: !d._selected } : d) ?? null)
  }

  function toggleAll() {
    const allSelected = deals?.every(d => d._selected)
    setDeals(prev => prev?.map(d => ({ ...d, _selected: !allSelected })) ?? null)
  }

  async function handleImport() {
    const selected = deals?.filter(d => d._selected) ?? []
    if (!selected.length) return
    setImporting(true)
    try {
      const clean = selected.map(({ _id: _1, _selected: _2, ...rest }) => rest as CruiseFormData)
      await onImport(clean)
    } finally {
      setImporting(false)
    }
  }

  const selectedCount = deals?.filter(d => d._selected).length ?? 0

  // Results view
  if (deals !== null) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setDeals(null)} className="text-white/40 hover:text-white transition text-sm">← Parse Another</button>
          <h2 className="text-xl font-display text-white">Found {deals.length} Deal{deals.length !== 1 ? 's' : ''}</h2>
        </div>

        <div className="flex items-center justify-between mb-4">
          <button onClick={toggleAll} className="text-xs text-white/40 hover:text-white transition">
            {deals.every(d => d._selected) ? 'Deselect all' : 'Select all'}
          </button>
          <div className="flex gap-3 items-center">
            <span className="text-white/30 text-xs">{selectedCount} of {deals.length} selected</span>
            <button onClick={handleImport} disabled={!selectedCount || importing}
              className="bg-gold text-navy font-semibold px-5 py-2 rounded-lg hover:bg-gold-hover transition disabled:opacity-50 text-sm">
              {importing ? 'Adding…' : `Add ${selectedCount} Deal${selectedCount !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {deals.map(deal => (
            <div key={deal._id}
              onClick={() => toggleSelect(deal._id)}
              className={`cursor-pointer rounded-xl border p-5 transition-all ${
                deal._selected
                  ? 'bg-gold/5 border-gold/30'
                  : 'bg-white/3 border-white/8 opacity-50'
              }`}>
              <div className="flex items-start gap-4">
                <div className={`mt-0.5 w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors ${
                  deal._selected ? 'bg-gold border-gold' : 'border-white/25'
                }`}>
                  {deal._selected && <span className="text-navy text-[0.6rem] font-bold">✓</span>}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-white font-medium text-sm">{deal.title || deal.ship || 'Untitled Deal'}</p>
                      <p className="text-white/40 text-xs mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        {deal.line && <span className="text-gold/70">{deal.line}</span>}
                        {deal.ship && <span>· {deal.ship}</span>}
                        {deal.date_from && <span>· {formatDate(deal.date_from)}{deal.date_to ? ` – ${formatDate(deal.date_to)}` : ''}</span>}
                        {deal.price && <span>· ${deal.price.toLocaleString()}/pp</span>}
                      </p>
                    </div>
                  </div>
                  {deal.description && (
                    <p className="text-white/50 text-xs mt-2 leading-relaxed line-clamp-3">{deal.description}</p>
                  )}
                  {deal.ports && (
                    <p className="text-white/30 text-xs mt-1.5">📍 {deal.ports}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedCount > 0 && (
          <div className="mt-6 flex justify-end">
            <button onClick={handleImport} disabled={!selectedCount || importing}
              className="bg-gold text-navy font-semibold px-6 py-2.5 rounded-lg hover:bg-gold-hover transition disabled:opacity-50 text-sm">
              {importing ? 'Adding deals…' : `Add ${selectedCount} Deal${selectedCount !== 1 ? 's' : ''} to My Deals`}
            </button>
          </div>
        )}
      </div>
    )
  }

  // Paste view
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="text-white/40 hover:text-white transition text-sm">← Back to My Deals</button>
        <h2 className="text-xl font-display text-white">Import from Email</h2>
      </div>

      <div className="max-w-2xl space-y-4">
        <div className="bg-gold/8 border border-gold/20 rounded-xl px-5 py-4 text-sm text-white/60 leading-relaxed">
          <p className="text-gold font-medium mb-1">How it works</p>
          Paste the full text of a cruise line promotional email. Claude will extract consumer-facing deals and automatically strip any agent-only content like bonus commissions, agent contests, and internal booking codes.
        </div>

        <div>
          <label className="block text-xs text-white/45 mb-1.5">Email Content</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={14}
            placeholder="Paste your cruise line email here…&#10;&#10;Works with Royal Caribbean, Celebrity, Princess, Holland America, Norwegian, Carnival, and more."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-gold/50 transition resize-none font-mono"
          />
          <p className="text-white/20 text-xs mt-1.5">{content.length.toLocaleString()} characters</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleParse}
            disabled={!content.trim() || parsing}
            className="bg-gold text-navy font-semibold px-6 py-2.5 rounded-lg hover:bg-gold-hover transition disabled:opacity-50 text-sm flex items-center gap-2">
            {parsing ? (
              <>
                <span className="animate-spin inline-block w-3 h-3 border-2 border-navy/30 border-t-navy rounded-full" />
                Parsing with AI…
              </>
            ) : (
              <>✦ Parse Deals</>
            )}
          </button>
          <button onClick={() => setContent('')} className="text-white/30 hover:text-white text-sm transition px-3">
            Clear
          </button>
        </div>
      </div>
    </div>
  )
}
