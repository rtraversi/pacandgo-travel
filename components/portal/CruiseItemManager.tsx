'use client'

import { useState, useTransition } from 'react'
import { formatDate, formatPrice, CRUISE_LINES } from '@/lib/utils'
import type { CruiseFormData } from '@/app/actions/deals'

type CruiseItem = {
  id: string
  title: string | null
  description: string | null
  line: string | null
  ship: string | null
  date_from: string | null
  date_to: string | null
  ports: string | null
  price: number | null
  spots: number | null
  active: boolean
}

interface Props {
  label: string
  items: CruiseItem[]
  onSave: (data: CruiseFormData, id?: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onToggle: (id: string, active: boolean) => Promise<void>
}

const EMPTY: CruiseFormData = {
  title: null, description: null, line: null, ship: null,
  date_from: null, date_to: null, ports: null, price: null, spots: null, active: true,
}

export default function CruiseItemManager({ label, items, onSave, onDelete, onToggle }: Props) {
  const [view, setView] = useState<'list' | 'form'>('list')
  const [editing, setEditing] = useState<CruiseItem | null>(null)
  const [form, setForm] = useState<CruiseFormData>(EMPTY)
  const [isPending, startTransition] = useTransition()
  const [aiLoading, setAiLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  function openNew() {
    setEditing(null)
    setForm(EMPTY)
    setError(null)
    setView('form')
  }

  function openEdit(item: CruiseItem) {
    setEditing(item)
    setForm({
      title: item.title, description: item.description, line: item.line,
      ship: item.ship, date_from: item.date_from, date_to: item.date_to,
      ports: item.ports, price: item.price, spots: item.spots, active: item.active,
    })
    setError(null)
    setView('form')
  }

  function set(field: keyof CruiseFormData, value: string | number | boolean | null) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleEnrich() {
    if (!form.line && !form.ship) return
    setAiLoading(true)
    const res = await fetch('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'enrich', line: form.line, ship: form.ship, ports: form.ports, dateFrom: form.date_from }),
    })
    const data = await res.json()
    if (data.title) setForm(f => ({ ...f, title: data.title, description: data.description }))
    setAiLoading(false)
  }

  function handleSave() {
    setError(null)
    startTransition(async () => {
      try {
        await onSave(form, editing?.id)
        setView('list')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Save failed')
      }
    })
  }

  function handleDelete(id: string) {
    if (!confirm(`Delete this ${label.toLowerCase()}?`)) return
    startTransition(async () => {
      await onDelete(id)
    })
  }

  function handleToggle(id: string, current: boolean) {
    startTransition(async () => {
      await onToggle(id, !current)
    })
  }

  function toggleSelected(id: string, checked: boolean) {
    setSelected(s => {
      const next = new Set(s)
      if (checked) next.add(id); else next.delete(id)
      return next
    })
  }

  function toggleSelectAll(checked: boolean) {
    setSelected(checked ? new Set(items.map(i => i.id)) : new Set())
  }

  function handleBulkDelete() {
    if (selected.size === 0) return
    if (!confirm(`Delete ${selected.size} selected ${label.toLowerCase()}${selected.size > 1 ? 's' : ''}?`)) return
    startTransition(async () => {
      for (const id of selected) await onDelete(id)
      setSelected(new Set())
    })
  }

  if (view === 'form') {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setView('list')} className="text-white/40 hover:text-white transition text-sm">← Back</button>
          <h2 className="text-xl font-display text-white">{editing ? `Edit ${label}` : `New ${label}`}</h2>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4 max-w-2xl">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/45 mb-1.5">Cruise Line</label>
              <select value={form.line ?? ''} onChange={e => set('line', e.target.value || null)}
                className="w-full bg-navy border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gold/50 transition">
                <option value="">Select a cruise line…</option>
                {CRUISE_LINES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/45 mb-1.5">Ship</label>
              <input value={form.ship ?? ''} onChange={e => set('ship', e.target.value)}
                placeholder="e.g. Wonder of the Seas"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-gold/50 transition" />
            </div>
          </div>

          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs text-white/45 mb-1.5">Title</label>
              <input value={form.title ?? ''} onChange={e => set('title', e.target.value)}
                placeholder="Deal title…"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-gold/50 transition" />
            </div>
            <button onClick={handleEnrich} disabled={aiLoading || (!form.line && !form.ship)}
              className="shrink-0 text-xs flex items-center gap-1.5 bg-gold/12 text-gold border border-gold/30 px-3 py-2 rounded-lg hover:bg-gold/20 transition disabled:opacity-35 disabled:cursor-not-allowed">
              {aiLoading ? '✦ …' : '✦ AI'}
            </button>
          </div>

          <div>
            <label className="block text-xs text-white/45 mb-1.5">Description</label>
            <textarea value={form.description ?? ''} onChange={e => set('description', e.target.value)}
              rows={4} placeholder="Describe this offer…"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-gold/50 transition resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/45 mb-1.5">Departure Date</label>
              <input type="date" value={form.date_from ?? ''} onChange={e => set('date_from', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gold/50 transition" />
            </div>
            <div>
              <label className="block text-xs text-white/45 mb-1.5">Return Date</label>
              <input type="date" value={form.date_to ?? ''} onChange={e => set('date_to', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gold/50 transition" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-white/45 mb-1.5">Ports of Call</label>
            <input value={form.ports ?? ''} onChange={e => set('ports', e.target.value)}
              placeholder="e.g. Nassau, Cozumel, Grand Cayman"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-gold/50 transition" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/45 mb-1.5">Price per Person ($)</label>
              <input type="number" value={form.price ?? ''} onChange={e => set('price', e.target.value ? Number(e.target.value) : null)}
                placeholder="1499"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-gold/50 transition" />
            </div>
            <div>
              <label className="block text-xs text-white/45 mb-1.5">Spots Available</label>
              <input type="number" value={form.spots ?? ''} onChange={e => set('spots', e.target.value ? Number(e.target.value) : null)}
                placeholder="20"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-gold/50 transition" />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => set('active', !form.active)}
              className={`w-10 h-5 rounded-full transition-colors relative ${form.active ? 'bg-gold' : 'bg-white/15'}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${form.active ? 'left-5' : 'left-0.5'}`} />
            </div>
            <span className="text-sm text-white/70">{form.active ? 'Visible on public page' : 'Hidden from public page'}</span>
          </label>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={isPending}
              className="bg-gold text-navy font-semibold px-6 py-2.5 rounded-lg hover:bg-gold-hover transition disabled:opacity-50 text-sm">
              {isPending ? 'Saving…' : `Save ${label}`}
            </button>
            <button onClick={() => setView('list')} className="text-white/50 hover:text-white text-sm transition px-4">
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  const allSelected = items.length > 0 && selected.size === items.length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display text-white">{label}s</h1>
          <p className="text-white/40 text-sm mt-1">{items.length} total</p>
        </div>
        <div className="flex items-center gap-3">
          {selected.size > 0 && (
            <button onClick={handleBulkDelete} disabled={isPending}
              className="text-red-400 hover:text-red-300 border border-red-400/30 hover:border-red-400/50 px-4 py-2 rounded-lg transition text-sm disabled:opacity-50">
              Delete Selected ({selected.size})
            </button>
          )}
          <button onClick={openNew}
            className="bg-gold text-navy font-semibold px-5 py-2 rounded-lg hover:bg-gold-hover transition text-sm">
            + Add {label}
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="border border-dashed border-white/15 rounded-xl py-16 text-center">
          <p className="text-white/30 text-sm">No {label.toLowerCase()}s yet.</p>
          <button onClick={openNew} className="mt-3 text-gold text-sm hover:underline">Add your first {label.toLowerCase()}</button>
        </div>
      ) : (
        <div className="space-y-2">
          <label className="flex items-center gap-3 px-5 py-1.5 cursor-pointer">
            <input type="checkbox" checked={allSelected} onChange={e => toggleSelectAll(e.target.checked)}
              className="w-4 h-4 rounded accent-gold" />
            <span className="text-white/40 text-xs">Select all</span>
          </label>
          {items.map(item => (
            <div key={item.id} className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 flex items-center gap-4">
              <input type="checkbox" checked={selected.has(item.id)} onChange={e => toggleSelected(item.id, e.target.checked)}
                className="w-4 h-4 rounded accent-gold shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{item.title || item.ship || '—'}</p>
                <p className="text-white/40 text-xs mt-0.5">
                  {[item.line, item.ship].filter(Boolean).join(' · ')}
                  {item.date_from ? ` · ${formatDate(item.date_from)}` : ''}
                </p>
              </div>
              {item.price && (
                <p className="text-white/60 text-sm shrink-0">{formatPrice(item.price)}<span className="text-white/30">/pp</span></p>
              )}
              <button onClick={() => handleToggle(item.id, item.active)}
                className={`shrink-0 w-9 h-5 rounded-full transition-colors relative ${item.active ? 'bg-gold' : 'bg-white/15'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${item.active ? 'left-4' : 'left-0.5'}`} />
              </button>
              <button onClick={() => openEdit(item)} className="text-white/40 hover:text-white transition text-xs shrink-0">Edit</button>
              <button onClick={() => handleDelete(item.id)} className="text-white/25 hover:text-red-400 transition text-xs shrink-0">Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
