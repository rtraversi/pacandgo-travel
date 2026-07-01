'use client'

import { useState, useTransition } from 'react'
import type { Client } from '@/lib/types'
import type { ClientFormData } from '@/app/actions/clients'

interface Props {
  clients: Client[]
  onSave: (data: ClientFormData, id?: string) => Promise<{ id: string }>
  onDelete: (id: string) => Promise<void>
  onLinkHousehold: (clientId: string, memberIds: string[]) => Promise<{ householdId: string }>
  onUnlinkHousehold: (clientId: string) => Promise<void>
}

const EMPTY: ClientFormData = {
  full_name: '', email: null, phone: null, address: null, dob: null, loyalty_number: null, notes: null,
}

const inputCls = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-gold/50 transition'
const labelCls = 'block text-xs text-white/45 mb-1.5'

export default function ClientsManager({ clients, onSave, onDelete, onLinkHousehold, onUnlinkHousehold }: Props) {
  const [view, setView] = useState<'list' | 'form'>('list')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ClientFormData>(EMPTY)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const editing = editingId ? clients.find(c => c.id === editingId) ?? null : null

  function openNew() {
    setEditingId(null)
    setForm(EMPTY)
    setError(null)
    setView('form')
  }

  function openEdit(client: Client) {
    setEditingId(client.id)
    setForm({
      full_name: client.full_name, email: client.email, phone: client.phone,
      address: client.address, dob: client.dob, loyalty_number: client.loyalty_number, notes: client.notes,
    })
    setError(null)
    setView('form')
  }

  function set(field: keyof ClientFormData, value: string | null) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function handleSave() {
    if (!form.full_name.trim()) { setError('Name is required.'); return }
    setError(null)
    startTransition(async () => {
      try {
        const result = await onSave(form, editingId ?? undefined)
        setEditingId(result.id)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Save failed')
      }
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this client?')) return
    startTransition(async () => {
      await onDelete(id)
      if (editingId === id) setView('list')
    })
  }

  function toggleFamilyMember(memberId: string, checked: boolean) {
    if (!editing) return
    startTransition(async () => {
      if (checked) {
        await onLinkHousehold(editing.id, [memberId])
      } else {
        await onUnlinkHousehold(memberId)
      }
    })
  }

  if (view === 'form') {
    const otherClients = editing ? clients.filter(c => c.id !== editing.id) : []

    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setView('list')} className="text-white/40 hover:text-white transition text-sm">← Back</button>
          <h2 className="text-xl font-display text-white">{editing ? 'Edit Client' : 'New Client'}</h2>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4 max-w-2xl">
          <div>
            <label className={labelCls}>Full Name <span className="text-white/25">*</span></label>
            <input value={form.full_name} onChange={e => set('full_name', e.target.value)}
              placeholder="Jane Smith" className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Email</label>
              <input value={form.email ?? ''} onChange={e => set('email', e.target.value || null)}
                type="email" placeholder="jane@example.com" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input value={form.phone ?? ''} onChange={e => set('phone', e.target.value || null)}
                type="tel" placeholder="+1 (555) 000-0000" className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Date of Birth</label>
              <input value={form.dob ?? ''} onChange={e => set('dob', e.target.value || null)}
                placeholder="MM/DD/YYYY" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Loyalty / Crown &amp; Anchor #</label>
              <input value={form.loyalty_number ?? ''} onChange={e => set('loyalty_number', e.target.value || null)}
                placeholder="Member number" className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Address</label>
            <input value={form.address ?? ''} onChange={e => set('address', e.target.value || null)}
              placeholder="123 Main St, City, State, ZIP" className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Notes</label>
            <textarea value={form.notes ?? ''} onChange={e => set('notes', e.target.value || null)}
              rows={3} placeholder="Preferences, special requests…" className={`${inputCls} resize-none`} />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={isPending}
              className="bg-gold text-navy font-semibold px-6 py-2.5 rounded-lg hover:bg-gold-hover transition disabled:opacity-50 text-sm">
              {isPending ? 'Saving…' : 'Save Client'}
            </button>
            <button onClick={() => setView('list')} className="text-white/50 hover:text-white text-sm transition px-4">
              Cancel
            </button>
          </div>
        </div>

        {editing && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mt-4 max-w-2xl">
            <h3 className="text-[0.65rem] font-bold tracking-[0.18em] uppercase text-white/45 mb-1">Linked Family Members</h3>
            <p className="text-white/30 text-xs mb-4">
              Link returning clients traveling together. When building a quote for one, you&apos;ll be able to choose which linked members to add.
            </p>

            {otherClients.length === 0 ? (
              <p className="text-white/30 text-sm">No other clients yet — add more clients to link family members.</p>
            ) : (
              <div className="space-y-1.5">
                {otherClients.map(c => {
                  const checked = editing.household_id !== null && c.household_id === editing.household_id
                  return (
                    <label key={c.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition">
                      <input type="checkbox" checked={checked} disabled={isPending}
                        onChange={e => toggleFamilyMember(c.id, e.target.checked)}
                        className="w-4 h-4 rounded accent-gold" />
                      <span className="text-white text-sm">{c.full_name}</span>
                      {c.email && <span className="text-white/30 text-xs">{c.email}</span>}
                    </label>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display text-white">Clients</h1>
          <p className="text-white/40 text-sm mt-1">{clients.length} total</p>
        </div>
        <button onClick={openNew}
          className="bg-gold text-navy font-semibold px-5 py-2 rounded-lg hover:bg-gold-hover transition text-sm">
          + Add Client
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="border border-dashed border-white/15 rounded-xl py-16 text-center">
          <p className="text-white/30 text-sm">No clients yet.</p>
          <button onClick={openNew} className="mt-3 text-gold text-sm hover:underline">Add your first client</button>
        </div>
      ) : (
        <div className="space-y-2">
          {clients.map(client => {
            const familyCount = client.household_id
              ? clients.filter(c => c.household_id === client.household_id && c.id !== client.id).length
              : 0
            return (
              <div key={client.id} className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{client.full_name}</p>
                  <p className="text-white/40 text-xs mt-0.5">
                    {[client.email, client.phone].filter(Boolean).join(' · ')}
                    {familyCount > 0 ? ` · ${familyCount} linked family member${familyCount > 1 ? 's' : ''}` : ''}
                  </p>
                </div>
                <button onClick={() => openEdit(client)} className="text-white/40 hover:text-white transition text-xs shrink-0">Edit</button>
                <button onClick={() => handleDelete(client.id)} className="text-white/25 hover:text-red-400 transition text-xs shrink-0">Delete</button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
