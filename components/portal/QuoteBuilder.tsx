'use client'

import { useState, useTransition } from 'react'
import dynamic from 'next/dynamic'
import { Trash2, ChevronLeft, Plus, X, Sparkles } from 'lucide-react'
import { saveQuote, deleteQuote } from '@/app/actions/quotes'
import type { QuoteFormData } from '@/app/actions/quotes'
import type { Quote, Agent, AgentProfile, QuoteAIData, ItineraryDay, PortDetail } from '@/lib/types'

const PDFDownloadBtn = dynamic(() => import('./QuotePDFDownloadBtn'), { ssr: false })

const ROOM_CATEGORIES = ['Interior', 'Ocean View', 'Balcony', 'Suite']

interface Props {
  quotes: Quote[]
  agent: Agent
  profile: AgentProfile | null
}

type View = 'list' | 'form'

function emptyAI(): QuoteAIData {
  return { ship_description: '', itinerary: [], highlights: [], included: [], ports_detail: [] }
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch { return dateStr }
}

const inputCls = 'w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-gold/50 transition'
const labelCls = 'block text-xs text-white/45 mb-1.5'

export default function QuoteBuilder({ quotes: initial, agent, profile }: Props) {
  const [quotes, setQuotes] = useState<Quote[]>(initial)
  const [view, setView] = useState<View>('list')
  const [editId, setEditId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Form fields
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [line, setLine] = useState('')
  const [ship, setShip] = useState('')
  const [startDate, setStartDate] = useState('')
  const [nights, setNights] = useState('')
  const [roomCategory, setRoomCategory] = useState('Balcony')
  const [price, setPrice] = useState('')
  const [guests, setGuests] = useState('2')
  const [notes, setNotes] = useState('')

  // AI data
  const [aiData, setAiData] = useState<QuoteAIData>(emptyAI())
  const [researching, setResearching] = useState(false)
  const [researchError, setResearchError] = useState('')
  const [researched, setResearched] = useState(false)

  // Save state
  const [saveError, setSaveError] = useState('')
  const [savedFlash, setSavedFlash] = useState(false)

  // Delete confirm
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function openNew() {
    setEditId(null)
    setCustomerName('')
    setCustomerEmail('')
    setLine('')
    setShip('')
    setStartDate('')
    setNights('')
    setRoomCategory('Balcony')
    setPrice('')
    setGuests('2')
    setNotes('')
    setAiData(emptyAI())
    setResearched(false)
    setResearchError('')
    setSaveError('')
    setView('form')
  }

  function openEdit(q: Quote) {
    setEditId(q.id)
    setCustomerName(q.customer_name ?? '')
    setCustomerEmail(q.customer_email ?? '')
    setLine(q.line)
    setShip(q.ship)
    setStartDate(q.start_date ?? '')
    setNights(q.nights ? String(q.nights) : '')
    setRoomCategory(q.room_category ?? 'Balcony')
    setPrice(q.price ? String(q.price) : '')
    setGuests(String(q.guests ?? 2))
    setNotes(q.notes ?? '')
    setAiData(q.ai_data ?? emptyAI())
    setResearched(!!q.ai_data?.ship_description)
    setResearchError('')
    setSaveError('')
    setView('form')
  }

  function goList() {
    setView('list')
    setEditId(null)
  }

  async function handleResearch() {
    if (!line.trim() || !ship.trim()) {
      setResearchError('Enter cruise line and ship name first.')
      return
    }
    setResearching(true)
    setResearchError('')
    try {
      const res = await fetch('/api/quotes/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ line, ship, start_date: startDate, nights, room_category: roomCategory }),
      })
      const json = await res.json()
      if (json.error) { setResearchError(json.error); return }
      setAiData({
        ship_description: json.ship_description ?? '',
        itinerary: json.itinerary ?? [],
        highlights: json.highlights ?? [],
        included: json.included ?? [],
        ports_detail: json.ports_detail ?? [],
      })
      setResearched(true)
    } catch {
      setResearchError('Research failed — try again.')
    } finally {
      setResearching(false)
    }
  }

  function handleSave() {
    if (!line.trim() || !ship.trim()) { setSaveError('Cruise line and ship are required.'); return }
    setSaveError('')
    startTransition(async () => {
      try {
        const data: QuoteFormData = {
          customer_name: customerName || null,
          customer_email: customerEmail || null,
          line: line.trim(),
          ship: ship.trim(),
          start_date: startDate || null,
          nights: nights ? parseInt(nights) : null,
          room_category: roomCategory || null,
          price: price ? parseFloat(price) : null,
          guests: guests ? parseInt(guests) : 2,
          notes: notes || null,
          ai_data: aiData,
        }
        const result = await saveQuote(data, editId ?? undefined)
        setEditId(result.id)
        setSavedFlash(true)
        setTimeout(() => setSavedFlash(false), 3000)
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : 'Save failed')
      }
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteQuote(id)
        setQuotes(qs => qs.filter(q => q.id !== id))
        setDeletingId(null)
        if (editId === id) goList()
      } catch (err) {
        console.error(err)
      }
    })
  }

  // AI data helpers
  function setShipDesc(v: string) { setAiData(d => ({ ...d, ship_description: v })) }

  function setItineraryDay(i: number, field: keyof ItineraryDay, v: string | number) {
    setAiData(d => ({
      ...d,
      itinerary: (d.itinerary ?? []).map((day, idx) => idx === i ? { ...day, [field]: v } : day),
    }))
  }

  function setHighlight(i: number, v: string) {
    setAiData(d => ({ ...d, highlights: (d.highlights ?? []).map((h, idx) => idx === i ? v : h) }))
  }
  function addHighlight() { setAiData(d => ({ ...d, highlights: [...(d.highlights ?? []), ''] })) }
  function removeHighlight(i: number) { setAiData(d => ({ ...d, highlights: (d.highlights ?? []).filter((_, idx) => idx !== i) })) }

  function setIncluded(i: number, v: string) {
    setAiData(d => ({ ...d, included: (d.included ?? []).map((item, idx) => idx === i ? v : item) }))
  }
  function addIncluded() { setAiData(d => ({ ...d, included: [...(d.included ?? []), ''] })) }
  function removeIncluded(i: number) { setAiData(d => ({ ...d, included: (d.included ?? []).filter((_, idx) => idx !== i) })) }

  function setPortDetail(i: number, field: keyof PortDetail, v: string | string[]) {
    setAiData(d => ({
      ...d,
      ports_detail: (d.ports_detail ?? []).map((p, idx) => idx === i ? { ...p, [field]: v } : p),
    }))
  }
  function setPortHighlight(pi: number, hi: number, v: string) {
    setAiData(d => ({
      ...d,
      ports_detail: (d.ports_detail ?? []).map((p, idx) =>
        idx === pi ? { ...p, highlights: p.highlights.map((h, hIdx) => hIdx === hi ? v : h) } : p
      ),
    }))
  }

  // Build quote object from form state for PDF
  const pdfQuote: Quote = {
    id: editId ?? 'preview',
    agent_id: agent.id,
    customer_name: customerName || null,
    customer_email: customerEmail || null,
    line,
    ship,
    start_date: startDate || null,
    nights: nights ? parseInt(nights) : null,
    room_category: roomCategory || null,
    price: price ? parseFloat(price) : null,
    guests: guests ? parseInt(guests) : 2,
    ai_data: aiData,
    pdf_url: null,
    notes: notes || null,
    created_at: new Date().toISOString(),
  }

  const canDownloadPDF = !!(line && ship && (aiData.ship_description || (aiData.itinerary?.length ?? 0) > 0))

  // ─── List View ────────────────────────────────────────────────────────────
  if (view === 'list') {
    return (
      <div className="p-8 max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-display text-white">Quote Builder</h1>
            <p className="text-white/35 text-sm mt-1">AI-researched cruise quotes with branded PDF download</p>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 bg-gold hover:bg-gold-hover text-navy font-semibold text-sm px-4 py-2 rounded-lg transition"
          >
            <Plus size={15} />
            New Quote
          </button>
        </div>

        {quotes.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
            <div className="text-4xl mb-4">📄</div>
            <p className="text-white/50 text-sm">No quotes yet. Create your first quote to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-[0.65rem] font-bold tracking-[0.18em] uppercase text-white/35 mb-4">
              Saved Quotes ({quotes.length})
            </p>
            {quotes.map(q => (
              <div key={q.id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-base truncate">
                      {q.customer_name ?? 'No customer name'}
                    </p>
                    {q.customer_email && (
                      <p className="text-white/35 text-xs mt-0.5">{q.customer_email}</p>
                    )}
                    <p className="text-gold text-sm mt-2 font-medium">
                      {q.line} — {q.ship}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-1.5 text-white/40 text-xs">
                      {q.start_date && <span>{formatDate(q.start_date)}</span>}
                      {q.nights && <span>{q.nights} nights</span>}
                      {q.room_category && <span>{q.room_category}</span>}
                      {q.guests && <span>{q.guests} guests</span>}
                      {q.price && <span>${(q.price * (q.guests ?? 2)).toLocaleString()} est.</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <PDFDownloadBtn
                      quote={q}
                      agent={agent}
                      profile={profile}
                      label="PDF"
                      className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-medium px-3 py-1.5 rounded-lg transition cursor-pointer"
                    />
                    <button
                      onClick={() => openEdit(q)}
                      className="text-xs font-medium text-white/50 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 transition"
                    >
                      Edit
                    </button>
                    {deletingId === q.id ? (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleDelete(q.id)}
                          disabled={isPending}
                          className="text-xs font-medium text-red-400 hover:text-red-300 px-2 py-1 rounded transition"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="text-xs text-white/30 hover:text-white/60 px-2 py-1 rounded transition"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeletingId(q.id)}
                        className="text-white/20 hover:text-red-400 transition p-1.5"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ─── Form View ────────────────────────────────────────────────────────────
  return (
    <div className="p-8 max-w-3xl">

      {/* Back nav */}
      <button onClick={goList} className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm transition mb-6">
        <ChevronLeft size={16} />
        Quotes
      </button>

      <h1 className="text-2xl font-display text-white mb-6">
        {editId ? 'Edit Quote' : 'New Quote'}
      </h1>

      {/* ─── Customer Info ─────────────────────────────── */}
      <section className="bg-white/5 border border-white/10 rounded-xl p-6 mb-4">
        <h2 className="text-[0.65rem] font-bold tracking-[0.18em] uppercase text-white/45 mb-5">Customer</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Name</label>
            <input value={customerName} onChange={e => setCustomerName(e.target.value)}
              placeholder="Jane Smith" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input value={customerEmail} onChange={e => setCustomerEmail(e.target.value)}
              placeholder="jane@example.com" type="email" className={inputCls} />
          </div>
        </div>
      </section>

      {/* ─── Cruise Details ─────────────────────────────── */}
      <section className="bg-white/5 border border-white/10 rounded-xl p-6 mb-4">
        <h2 className="text-[0.65rem] font-bold tracking-[0.18em] uppercase text-white/45 mb-5">Cruise Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Cruise Line <span className="text-white/25">*</span></label>
            <input value={line} onChange={e => setLine(e.target.value)}
              placeholder="Royal Caribbean" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Ship Name <span className="text-white/25">*</span></label>
            <input value={ship} onChange={e => setShip(e.target.value)}
              placeholder="Wonder of the Seas" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Departure Date</label>
            <input value={startDate} onChange={e => setStartDate(e.target.value)}
              type="date" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Nights</label>
            <input value={nights} onChange={e => setNights(e.target.value)}
              type="number" min="1" placeholder="7" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Room Category</label>
            <select value={roomCategory} onChange={e => setRoomCategory(e.target.value)}
              className={inputCls}>
              {ROOM_CATEGORIES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Per Person ($)</label>
              <input value={price} onChange={e => setPrice(e.target.value)}
                type="number" min="0" placeholder="1299" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Guests</label>
              <input value={guests} onChange={e => setGuests(e.target.value)}
                type="number" min="1" placeholder="2" className={inputCls} />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className={labelCls}>Notes <span className="text-white/25">(optional)</span></label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Pricing notes, booking deadlines, special requests…"
            rows={3}
            className={`${inputCls} resize-none`}
          />
        </div>
      </section>

      {/* ─── AI Research ─────────────────────────────────── */}
      <section className="bg-white/5 border border-white/10 rounded-xl p-6 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[0.65rem] font-bold tracking-[0.18em] uppercase text-white/45">
            AI Research {researched && <span className="text-gold ml-1">✓</span>}
          </h2>
          {researched && (
            <button onClick={handleResearch} disabled={researching}
              className="text-xs text-white/40 hover:text-white transition">
              Re-research
            </button>
          )}
        </div>

        {!researched && (
          <p className="text-white/30 text-xs mb-4">
            Fill in the cruise line and ship above, then let Claude research ship details, itinerary, and port highlights.
          </p>
        )}

        <button
          onClick={handleResearch}
          disabled={researching || !line.trim() || !ship.trim()}
          className="flex items-center gap-2 bg-navy border border-gold/30 hover:border-gold/60 text-gold text-sm font-medium px-5 py-2.5 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {researching ? (
            <>
              <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-gold/30 border-t-gold rounded-full" />
              Researching…
            </>
          ) : (
            <>
              <Sparkles size={14} />
              {researched ? 'Re-research with AI' : 'Research with AI'}
            </>
          )}
        </button>

        {researchError && (
          <p className="text-red-400 text-xs mt-3">{researchError}</p>
        )}

        {/* AI Data — editable */}
        {researched && (
          <div className="mt-6 space-y-6 border-t border-white/10 pt-6">

            {/* Ship Description */}
            <div>
              <label className="text-xs text-white/45 font-bold tracking-wide uppercase mb-2 block">
                Ship Description
              </label>
              <textarea
                value={aiData.ship_description ?? ''}
                onChange={e => setShipDesc(e.target.value)}
                rows={5}
                className={`${inputCls} resize-none`}
              />
            </div>

            {/* Itinerary */}
            {(aiData.itinerary?.length ?? 0) > 0 && (
              <div>
                <label className="text-xs text-white/45 font-bold tracking-wide uppercase mb-3 block">
                  Itinerary ({aiData.itinerary!.length} days)
                </label>
                <div className="space-y-2">
                  {aiData.itinerary!.map((day, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="shrink-0 w-9 h-9 bg-navy border border-white/10 rounded-lg flex flex-col items-center justify-center mt-0.5">
                        <span className="text-gold text-xs font-bold leading-none">{day.day}</span>
                        <span className="text-white/30 text-[9px] leading-none">DAY</span>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <input
                          value={day.port}
                          onChange={e => setItineraryDay(i, 'port', e.target.value)}
                          placeholder="Port, Country"
                          className={`${inputCls} py-1.5 text-xs`}
                        />
                        <textarea
                          value={day.description}
                          onChange={e => setItineraryDay(i, 'description', e.target.value)}
                          rows={2}
                          className={`${inputCls} resize-none text-xs py-1.5`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Highlights + Included (side by side) */}
            <div className="grid grid-cols-2 gap-6">

              {/* Highlights */}
              <div>
                <label className="text-xs text-white/45 font-bold tracking-wide uppercase mb-3 block">
                  Highlights
                </label>
                <div className="space-y-2">
                  {(aiData.highlights ?? []).map((h, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        value={h}
                        onChange={e => setHighlight(i, e.target.value)}
                        className={`${inputCls} flex-1 py-1.5 text-xs`}
                      />
                      <button onClick={() => removeHighlight(i)} className="text-white/20 hover:text-red-400 transition shrink-0">
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={addHighlight}
                  className="mt-2 text-xs text-white/35 hover:text-gold transition flex items-center gap-1">
                  <Plus size={12} /> Add
                </button>
              </div>

              {/* What's Included */}
              <div>
                <label className="text-xs text-white/45 font-bold tracking-wide uppercase mb-3 block">
                  What's Included
                </label>
                <div className="space-y-2">
                  {(aiData.included ?? []).map((item, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        value={item}
                        onChange={e => setIncluded(i, e.target.value)}
                        className={`${inputCls} flex-1 py-1.5 text-xs`}
                      />
                      <button onClick={() => removeIncluded(i)} className="text-white/20 hover:text-red-400 transition shrink-0">
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={addIncluded}
                  className="mt-2 text-xs text-white/35 hover:text-gold transition flex items-center gap-1">
                  <Plus size={12} /> Add
                </button>
              </div>
            </div>

            {/* Port Details */}
            {(aiData.ports_detail?.length ?? 0) > 0 && (
              <div>
                <label className="text-xs text-white/45 font-bold tracking-wide uppercase mb-3 block">
                  Port Highlights
                </label>
                <div className="space-y-4">
                  {aiData.ports_detail!.map((port, pi) => (
                    <div key={pi} className="bg-white/3 border border-white/8 rounded-lg p-4 space-y-2">
                      <input
                        value={port.port}
                        onChange={e => setPortDetail(pi, 'port', e.target.value)}
                        className={`${inputCls} font-medium`}
                      />
                      <textarea
                        value={port.description}
                        onChange={e => setPortDetail(pi, 'description', e.target.value)}
                        rows={2}
                        className={`${inputCls} resize-none text-sm`}
                      />
                      <div className="space-y-1.5 pl-2">
                        {port.highlights.map((h, hi) => (
                          <input
                            key={hi}
                            value={h}
                            onChange={e => setPortHighlight(pi, hi, e.target.value)}
                            placeholder={`Highlight ${hi + 1}`}
                            className={`${inputCls} py-1.5 text-xs`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </section>

      {/* ─── Actions ────────────────────────────────────── */}
      {saveError && (
        <p className="text-red-400 text-sm mb-3">{saveError}</p>
      )}

      {savedFlash && (
        <p className="text-green-400 text-sm mb-3 flex items-center gap-1.5">
          <span>✓</span> Quote saved successfully.
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="bg-gold hover:bg-gold-hover text-navy font-semibold text-sm px-6 py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isPending ? (
            <>
              <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-navy/30 border-t-navy rounded-full" />
              Saving…
            </>
          ) : (
            editId ? 'Update Quote' : 'Save Quote'
          )}
        </button>

        {canDownloadPDF && (
          <PDFDownloadBtn
            quote={pdfQuote}
            agent={agent}
            profile={profile}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/25 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition cursor-pointer"
          />
        )}

        {editId && (
          <button
            onClick={() => setDeletingId(editId)}
            className="ml-auto text-white/20 hover:text-red-400 transition p-2"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Delete confirm (from form view) */}
      {deletingId && view === 'form' && (
        <div className="mt-3 flex items-center gap-3 p-3 bg-red-950/20 border border-red-500/20 rounded-lg">
          <p className="text-sm text-white/60 flex-1">Delete this quote?</p>
          <button onClick={() => handleDelete(deletingId)} disabled={isPending}
            className="text-sm text-red-400 hover:text-red-300 font-medium transition">
            Delete
          </button>
          <button onClick={() => setDeletingId(null)}
            className="text-sm text-white/30 hover:text-white/60 transition">
            Cancel
          </button>
        </div>
      )}

    </div>
  )
}
