'use client'

import { useState, useTransition } from 'react'
import type { Client, ClientPreferences, ClientWish, LoyaltyEntry, WishStatus } from '@/lib/types'
import type { ClientFormData, WishFormData } from '@/app/actions/clients'
import type { ExtractedProfile, ExtractedWish } from '@/app/actions/clientExtract'

interface Props {
  clients: Client[]
  wishes: ClientWish[]
  onSave: (data: ClientFormData, id?: string) => Promise<{ id: string }>
  onDelete: (id: string) => Promise<void>
  onLinkHousehold: (clientId: string, memberIds: string[]) => Promise<{ householdId: string }>
  onUnlinkHousehold: (clientId: string) => Promise<void>
  onSaveWish: (clientId: string, data: WishFormData, id?: string) => Promise<{ id: string }>
  onDeleteWish: (id: string) => Promise<void>
  onExtract: (text: string) => Promise<ExtractedProfile>
}

const EMPTY: ClientFormData = {
  full_name: '', preferred_name: null, email: null, phone: null, address: null,
  dob: null, anniversary: null, citizenship: null, passport_expiry: null,
  emergency_contact_name: null, emergency_contact_phone: null,
  loyalty: [], preferences: {}, tags: [], notes: null,
}

const EMPTY_WISH: WishFormData = {
  destination: '', trip_type: null, timeframe: null, budget: null, notes: null, status: 'open',
}

const TRIP_TYPES = [
  'Ocean cruise', 'River cruise', 'Expedition cruise', 'Escorted tour', 'Resort / all-inclusive',
  'Theme park', 'Rail journey', 'Custom itinerary', 'Other',
]

const LOYALTY_PROGRAMS = [
  'Royal Caribbean Crown & Anchor', "Celebrity Captain's Club", 'Carnival VIFP', 'Norwegian Latitudes',
  'Princess Captain Circle', 'Holland America Mariner', 'MSC Voyagers Club', 'Disney Castaway Club',
  'Viking', 'Delta SkyMiles', 'American AAdvantage', 'United MileagePlus', 'Marriott Bonvoy', 'Hilton Honors',
]

const PREF_FIELDS: { key: keyof ClientPreferences; label: string; placeholder: string }[] = [
  { key: 'cabin', label: 'Cabin', placeholder: 'Balcony, midship, low deck' },
  { key: 'dining', label: 'Dining', placeholder: 'Early seating, table for two' },
  { key: 'dietary', label: 'Dietary', placeholder: 'Gluten-free, nut allergy' },
  { key: 'accessibility', label: 'Accessibility', placeholder: 'Uses a cane, needs step-free access' },
  { key: 'travel_style', label: 'Travel style', placeholder: 'Active excursions, avoids crowds' },
]

const inputCls = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-gold/50 transition'
const labelCls = 'block text-xs text-white/45 mb-1.5'
const cardCls = 'bg-white/5 border border-white/10 rounded-xl p-6 max-w-2xl'
const sectionTitleCls = 'text-[0.65rem] font-bold tracking-[0.18em] uppercase text-white/45 mb-4'

/** Days from today until an ISO date (negative if past). */
function daysUntil(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number)
  const target = Date.UTC(y, m - 1, d)
  const now = new Date()
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((target - today) / 86_400_000)
}

function passportStatus(iso: string | null): { label: string; tone: 'red' | 'amber' } | null {
  if (!iso) return null
  const days = daysUntil(iso)
  if (days < 0) return { label: 'Passport expired', tone: 'red' }
  if (days < 183) return { label: 'Passport expires within 6 months', tone: 'amber' }
  return null
}

function toForm(c: Client): ClientFormData {
  return {
    full_name: c.full_name, preferred_name: c.preferred_name, email: c.email, phone: c.phone,
    address: c.address, dob: c.dob, anniversary: c.anniversary, citizenship: c.citizenship,
    passport_expiry: c.passport_expiry, emergency_contact_name: c.emergency_contact_name,
    emergency_contact_phone: c.emergency_contact_phone, loyalty: c.loyalty ?? [],
    preferences: c.preferences ?? {}, tags: c.tags ?? [], notes: c.notes,
  }
}

/** Fill only what's empty, so the AI never overwrites what the agent typed. Returns the merged form and how many fields changed. */
function mergeExtracted(form: ClientFormData, x: ExtractedProfile): { next: ClientFormData; changed: number } {
  let changed = 0
  const next: ClientFormData = { ...form, preferences: { ...form.preferences }, loyalty: [...form.loyalty], tags: [...form.tags] }

  const scalar = [
    'full_name', 'preferred_name', 'email', 'phone', 'address', 'dob', 'anniversary',
    'citizenship', 'passport_expiry', 'emergency_contact_name', 'emergency_contact_phone',
  ] as const
  for (const key of scalar) {
    const incoming = x[key]
    if (incoming && !next[key]) { next[key] = incoming; changed++ }
  }

  for (const { key } of PREF_FIELDS) {
    const incoming = x.preferences?.[key]
    if (incoming && !next.preferences[key]) { next.preferences[key] = incoming; changed++ }
  }

  for (const l of x.loyalty) {
    const exists = next.loyalty.some(e =>
      e.program.toLowerCase() === l.program.toLowerCase() || e.number === l.number)
    if (!exists) { next.loyalty.push(l); changed++ }
  }

  for (const t of x.tags) {
    if (!next.tags.some(e => e.toLowerCase() === t.toLowerCase())) { next.tags.push(t); changed++ }
  }

  if (x.notes) {
    next.notes = next.notes ? `${next.notes}\n\n${x.notes}` : x.notes
    changed++
  }

  return { next, changed }
}

export default function ClientsManager({
  clients, wishes, onSave, onDelete, onLinkHousehold, onUnlinkHousehold, onSaveWish, onDeleteWish, onExtract,
}: Props) {
  const [view, setView] = useState<'list' | 'form'>('list')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ClientFormData>(EMPTY)
  const [tagDraft, setTagDraft] = useState('')
  const [pendingWishes, setPendingWishes] = useState<ExtractedWish[]>([])
  const [wishDraft, setWishDraft] = useState<WishFormData>(EMPTY_WISH)
  const [aiText, setAiText] = useState('')
  const [aiOpen, setAiOpen] = useState(false)
  const [aiMessage, setAiMessage] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [isPending, startTransition] = useTransition()
  const [isExtracting, startExtract] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)

  const editing = editingId ? clients.find(c => c.id === editingId) ?? null : null
  const clientWishes = editingId ? wishes.filter(w => w.client_id === editingId) : []

  function resetFormState(next: ClientFormData, id: string | null) {
    setEditingId(id)
    setForm(next)
    setTagDraft('')
    setPendingWishes([])
    setWishDraft(EMPTY_WISH)
    setAiText('')
    setAiOpen(false)
    setAiMessage(null)
    setError(null)
    setSavedMessage(null)
    setView('form')
  }

  function openNew() { resetFormState(EMPTY, null) }
  function openEdit(client: Client) { resetFormState(toForm(client), client.id) }

  function set<K extends keyof ClientFormData>(field: K, value: ClientFormData[K]) {
    setForm(f => ({ ...f, [field]: value }))
    setSavedMessage(null)
  }

  function setPref(key: keyof ClientPreferences, value: string) {
    setForm(f => ({ ...f, preferences: { ...f.preferences, [key]: value || null } }))
    setSavedMessage(null)
  }

  function setLoyalty(i: number, patch: Partial<LoyaltyEntry>) {
    setForm(f => ({ ...f, loyalty: f.loyalty.map((l, idx) => idx === i ? { ...l, ...patch } : l) }))
    setSavedMessage(null)
  }

  function addTag() {
    const t = tagDraft.trim().replace(/,$/, '')
    if (t && !form.tags.some(e => e.toLowerCase() === t.toLowerCase())) set('tags', [...form.tags, t])
    setTagDraft('')
  }

  function handleExtract() {
    if (!aiText.trim()) return
    setAiMessage(null)
    startExtract(async () => {
      try {
        const extracted = await onExtract(aiText)
        const { next, changed } = mergeExtracted(form, extracted)
        setForm(next)
        const newWishes = extracted.wishes.filter(w =>
          !clientWishes.some(e => e.destination.toLowerCase() === w.destination.toLowerCase()) &&
          !pendingWishes.some(e => e.destination.toLowerCase() === w.destination.toLowerCase()))
        setPendingWishes(p => [...p, ...newWishes])
        const total = changed + newWishes.length
        setAiMessage(total === 0
          ? 'Nothing new found. Fields you already filled in are never overwritten.'
          : `Filled in ${total} item${total === 1 ? '' : 's'}. Check them, then Save Client.`)
        if (total > 0) { setAiText(''); setSavedMessage(null) }
      } catch (e) {
        setAiMessage(e instanceof Error ? e.message : 'Something went wrong reading that text.')
      }
    })
  }

  function handleSave() {
    if (!form.full_name.trim()) { setError('Name is required.'); return }
    setError(null)
    startTransition(async () => {
      try {
        const payload = { ...form, loyalty: form.loyalty.filter(l => l.program.trim() && l.number.trim()) }
        const result = await onSave(payload, editingId ?? undefined)
        setEditingId(result.id)
        for (const w of pendingWishes) {
          await onSaveWish(result.id, { ...w, status: 'open' })
        }
        setPendingWishes([])
        setSavedMessage('Saved.')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Save failed')
      }
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this client? Their wishlist is deleted too.')) return
    startTransition(async () => {
      await onDelete(id)
      if (editingId === id) setView('list')
    })
  }

  function toggleFamilyMember(memberId: string, checked: boolean) {
    if (!editing) return
    startTransition(async () => {
      if (checked) await onLinkHousehold(editing.id, [memberId])
      else await onUnlinkHousehold(memberId)
    })
  }

  function addWish() {
    if (!wishDraft.destination.trim()) return
    if (!editingId) {
      setPendingWishes(p => [...p, { ...wishDraft }])
      setWishDraft(EMPTY_WISH)
      return
    }
    const clientId = editingId
    startTransition(async () => {
      try {
        await onSaveWish(clientId, wishDraft)
        setWishDraft(EMPTY_WISH)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not add wish')
      }
    })
  }

  function setWishStatus(w: ClientWish, status: WishStatus) {
    startTransition(async () => {
      await onSaveWish(w.client_id, {
        destination: w.destination, trip_type: w.trip_type, timeframe: w.timeframe,
        budget: w.budget, notes: w.notes, status,
      }, w.id)
    })
  }

  function removeWish(id: string) {
    startTransition(async () => { await onDeleteWish(id) })
  }

  if (view === 'form') {
    const otherClients = editing ? clients.filter(c => c.id !== editing.id) : []
    const passport = passportStatus(form.passport_expiry)

    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setView('list')} className="text-white/40 hover:text-white transition text-sm">← Back</button>
          <h2 className="text-xl font-display text-white">{editing ? editing.full_name : 'New Client'}</h2>
        </div>

        {/* AI fill */}
        <div className="border border-gold/25 bg-gold/[0.04] rounded-xl p-5 mb-4 max-w-2xl">
          {!aiOpen ? (
            <button onClick={() => setAiOpen(true)} className="text-gold text-sm hover:underline">
              ✨ Fill in from an email or notes
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-white/60 text-xs">
                Paste an email thread, call notes or a booking confirmation about this client. The AI fills in only the empty fields, so nothing you typed gets replaced. Passport numbers are never saved.
              </p>
              <textarea value={aiText} onChange={e => setAiText(e.target.value)} rows={6}
                placeholder="Paste text here…" className={`${inputCls} resize-y`} />
              <div className="flex items-center gap-3">
                <button onClick={handleExtract} disabled={isExtracting || !aiText.trim()}
                  className="bg-gold text-navy font-semibold px-4 py-2 rounded-lg hover:bg-gold-hover transition disabled:opacity-50 text-sm">
                  {isExtracting ? 'Reading…' : 'Fill in fields'}
                </button>
                <button onClick={() => { setAiOpen(false); setAiMessage(null) }} className="text-white/40 hover:text-white text-sm transition">
                  Close
                </button>
              </div>
            </div>
          )}
          {aiMessage && <p className="text-white/70 text-sm mt-3">{aiMessage}</p>}
        </div>

        {/* Contact */}
        <div className={`${cardCls} space-y-4`}>
          <h3 className={sectionTitleCls}>Contact</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Full Name <span className="text-white/25">*</span></label>
              <input value={form.full_name} onChange={e => set('full_name', e.target.value)}
                placeholder="Jane Smith" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Preferred Name</label>
              <input value={form.preferred_name ?? ''} onChange={e => set('preferred_name', e.target.value || null)}
                placeholder="Janie" className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div>
            <label className={labelCls}>Address</label>
            <input value={form.address ?? ''} onChange={e => set('address', e.target.value || null)}
              placeholder="123 Main St, City, State, ZIP" className={inputCls} />
          </div>
        </div>

        {/* Dates & documents */}
        <div className={`${cardCls} space-y-4 mt-4`}>
          <h3 className={sectionTitleCls}>Dates &amp; Documents</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Date of Birth</label>
              <input type="date" value={form.dob ?? ''} onChange={e => set('dob', e.target.value || null)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Anniversary</label>
              <input type="date" value={form.anniversary ?? ''} onChange={e => set('anniversary', e.target.value || null)} className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Citizenship</label>
              <input value={form.citizenship ?? ''} onChange={e => set('citizenship', e.target.value || null)}
                placeholder="United States" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Passport Expiry</label>
              <input type="date" value={form.passport_expiry ?? ''} onChange={e => set('passport_expiry', e.target.value || null)} className={inputCls} />
              {passport && (
                <p className={`text-xs mt-1.5 ${passport.tone === 'red' ? 'text-red-400' : 'text-amber-300'}`}>{passport.label}</p>
              )}
            </div>
          </div>
          <p className="text-white/30 text-xs">Store the expiry date only. Don&apos;t put passport numbers anywhere in the profile.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Emergency Contact</label>
              <input value={form.emergency_contact_name ?? ''} onChange={e => set('emergency_contact_name', e.target.value || null)}
                placeholder="Name and relationship" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Emergency Phone</label>
              <input value={form.emergency_contact_phone ?? ''} onChange={e => set('emergency_contact_phone', e.target.value || null)}
                type="tel" placeholder="+1 (555) 000-0000" className={inputCls} />
            </div>
          </div>
        </div>

        {/* Loyalty */}
        <div className={`${cardCls} mt-4`}>
          <h3 className={sectionTitleCls}>Loyalty Programs</h3>
          <datalist id="loyalty-programs">
            {LOYALTY_PROGRAMS.map(p => <option key={p} value={p} />)}
          </datalist>
          <div className="space-y-2">
            {form.loyalty.map((l, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_6rem_auto] gap-2 items-center">
                <input list="loyalty-programs" value={l.program} onChange={e => setLoyalty(i, { program: e.target.value })}
                  placeholder="Program" className={inputCls} />
                <input value={l.number} onChange={e => setLoyalty(i, { number: e.target.value })}
                  placeholder="Member #" className={inputCls} />
                <input value={l.tier ?? ''} onChange={e => setLoyalty(i, { tier: e.target.value || null })}
                  placeholder="Tier" className={inputCls} />
                <button onClick={() => set('loyalty', form.loyalty.filter((_, idx) => idx !== i))}
                  className="text-white/30 hover:text-red-400 text-xs px-1" aria-label="Remove program">✕</button>
              </div>
            ))}
          </div>
          <button onClick={() => set('loyalty', [...form.loyalty, { program: '', number: '', tier: null }])}
            className="text-gold text-sm hover:underline mt-3">+ Add program</button>
        </div>

        {/* Preferences */}
        <div className={`${cardCls} mt-4`}>
          <h3 className={sectionTitleCls}>Preferences</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PREF_FIELDS.map(p => (
              <div key={p.key}>
                <label className={labelCls}>{p.label}</label>
                <input value={form.preferences[p.key] ?? ''} onChange={e => setPref(p.key, e.target.value)}
                  placeholder={p.placeholder} className={inputCls} />
              </div>
            ))}
          </div>
          <div className="mt-4">
            <label className={labelCls}>Tags</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.tags.map(t => (
                <span key={t} className="inline-flex items-center gap-1 bg-gold/15 text-gold text-xs rounded-full px-2.5 py-1">
                  {t}
                  <button onClick={() => set('tags', form.tags.filter(e => e !== t))} className="hover:text-white" aria-label={`Remove ${t}`}>✕</button>
                </span>
              ))}
            </div>
            <input value={tagDraft} onChange={e => setTagDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag() } }}
              onBlur={addTag}
              placeholder="VIP, repeat cruiser, group leader… (Enter to add)" className={inputCls} />
          </div>
          <div className="mt-4">
            <label className={labelCls}>Notes</label>
            <textarea value={form.notes ?? ''} onChange={e => set('notes', e.target.value || null)}
              rows={3} placeholder="Anything else worth remembering" className={`${inputCls} resize-y`} />
          </div>
        </div>

        {/* Wishlist */}
        <div className={`${cardCls} mt-4`}>
          <h3 className={sectionTitleCls}>Wishlist</h3>
          <p className="text-white/30 text-xs -mt-2 mb-4">
            Trips this client wants to take some day. Later, new supplier offers will be matched against this list.
          </p>

          {(clientWishes.length > 0 || pendingWishes.length > 0) && (
            <div className="space-y-2 mb-4">
              {clientWishes.map(w => (
                <div key={w.id} className="flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2">
                  <div className={`flex-1 min-w-0 ${w.status !== 'open' ? 'opacity-50' : ''}`}>
                    <p className="text-white text-sm">{w.destination}{w.trip_type ? <span className="text-white/40"> · {w.trip_type}</span> : null}</p>
                    <p className="text-white/40 text-xs">{[w.timeframe, w.budget, w.notes].filter(Boolean).join(' · ')}</p>
                  </div>
                  <select value={w.status} onChange={e => setWishStatus(w, e.target.value as WishStatus)} disabled={isPending}
                    className="bg-white/5 border border-white/10 rounded-md text-white/70 text-xs px-2 py-1">
                    <option value="open">Open</option>
                    <option value="booked">Booked</option>
                    <option value="dropped">Dropped</option>
                  </select>
                  <button onClick={() => removeWish(w.id)} className="text-white/30 hover:text-red-400 text-xs" aria-label="Delete wish">✕</button>
                </div>
              ))}
              {pendingWishes.map((w, i) => (
                <div key={`p${i}`} className="flex items-center gap-3 border border-dashed border-gold/30 rounded-lg px-3 py-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm">{w.destination}{w.trip_type ? <span className="text-white/40"> · {w.trip_type}</span> : null}</p>
                    <p className="text-white/40 text-xs">{[w.timeframe, w.budget, w.notes].filter(Boolean).join(' · ')}</p>
                  </div>
                  <span className="text-gold/70 text-[0.65rem]">saved with client</span>
                  <button onClick={() => setPendingWishes(p => p.filter((_, idx) => idx !== i))}
                    className="text-white/30 hover:text-red-400 text-xs" aria-label="Remove wish">✕</button>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input value={wishDraft.destination} onChange={e => setWishDraft(d => ({ ...d, destination: e.target.value }))}
              placeholder="Destination (e.g. Alaska)" className={inputCls} />
            <select value={wishDraft.trip_type ?? ''} onChange={e => setWishDraft(d => ({ ...d, trip_type: e.target.value || null }))}
              className={inputCls}>
              <option value="">Trip type…</option>
              {TRIP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input value={wishDraft.timeframe ?? ''} onChange={e => setWishDraft(d => ({ ...d, timeframe: e.target.value || null }))}
              placeholder="When (e.g. summer 2027)" className={inputCls} />
            <input value={wishDraft.budget ?? ''} onChange={e => setWishDraft(d => ({ ...d, budget: e.target.value || null }))}
              placeholder="Budget (e.g. $6–8k for two)" className={inputCls} />
          </div>
          <input value={wishDraft.notes ?? ''} onChange={e => setWishDraft(d => ({ ...d, notes: e.target.value || null }))}
            placeholder="Notes (e.g. wants a glacier day, celebrating 40th)" className={`${inputCls} mt-2`} />
          <button onClick={addWish} disabled={isPending || !wishDraft.destination.trim()}
            className="text-gold text-sm hover:underline mt-3 disabled:opacity-40 disabled:no-underline">+ Add to wishlist</button>
        </div>

        {/* Save bar */}
        <div className="max-w-2xl mt-4">
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          <div className="flex items-center gap-3">
            <button onClick={handleSave} disabled={isPending}
              className="bg-gold text-navy font-semibold px-6 py-2.5 rounded-lg hover:bg-gold-hover transition disabled:opacity-50 text-sm">
              {isPending ? 'Saving…' : 'Save Client'}
            </button>
            <button onClick={() => setView('list')} className="text-white/50 hover:text-white text-sm transition px-4">
              Back to list
            </button>
            {savedMessage && <span className="text-emerald-400 text-sm">{savedMessage}</span>}
          </div>
        </div>

        {editing && (
          <div className={`${cardCls} mt-4`}>
            <h3 className="text-[0.65rem] font-bold tracking-[0.18em] uppercase text-white/45 mb-1">Linked Family Members</h3>
            <p className="text-white/30 text-xs mb-4">
              Link returning clients traveling together. When building a quote for one, you&apos;ll be able to choose which linked members to add.
            </p>

            {otherClients.length === 0 ? (
              <p className="text-white/30 text-sm">No other clients yet. Add more clients to link family members.</p>
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

  const q = search.trim().toLowerCase()
  const visible = q
    ? clients.filter(c =>
        [c.full_name, c.preferred_name, c.email, ...(c.tags ?? [])].some(v => v?.toLowerCase().includes(q)))
    : clients

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

      {clients.length > 5 && (
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email or tag" className={`${inputCls} mb-4`} />
      )}

      {clients.length === 0 ? (
        <div className="border border-dashed border-white/15 rounded-xl py-16 text-center">
          <p className="text-white/30 text-sm">No clients yet.</p>
          <button onClick={openNew} className="mt-3 text-gold text-sm hover:underline">Add your first client</button>
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map(client => {
            const familyCount = client.household_id
              ? clients.filter(c => c.household_id === client.household_id && c.id !== client.id).length
              : 0
            const openWishes = wishes.filter(w => w.client_id === client.id && w.status === 'open').length
            const passport = passportStatus(client.passport_expiry)
            return (
              <div key={client.id} className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 flex items-center gap-4">
                <button onClick={() => openEdit(client)} className="flex-1 min-w-0 text-left">
                  <p className="text-white font-medium text-sm truncate">
                    {client.full_name}
                    {client.preferred_name && <span className="text-white/40 font-normal"> ({client.preferred_name})</span>}
                  </p>
                  <p className="text-white/40 text-xs mt-0.5">
                    {[
                      client.email,
                      client.phone,
                      familyCount > 0 ? `${familyCount} linked family member${familyCount > 1 ? 's' : ''}` : null,
                      openWishes > 0 ? `${openWishes} wish${openWishes > 1 ? 'es' : ''}` : null,
                    ].filter(Boolean).join(' · ')}
                  </p>
                  {(passport || (client.tags?.length ?? 0) > 0) && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {passport && (
                        <span className={`text-[0.65rem] rounded-full px-2 py-0.5 ${passport.tone === 'red' ? 'bg-red-500/15 text-red-300' : 'bg-amber-400/15 text-amber-200'}`}>
                          {passport.label}
                        </span>
                      )}
                      {client.tags?.map(t => (
                        <span key={t} className="text-[0.65rem] bg-white/10 text-white/60 rounded-full px-2 py-0.5">{t}</span>
                      ))}
                    </div>
                  )}
                </button>
                <button onClick={() => openEdit(client)} className="text-white/40 hover:text-white transition text-xs shrink-0">Edit</button>
                <button onClick={() => handleDelete(client.id)} className="text-white/25 hover:text-red-400 transition text-xs shrink-0">Delete</button>
              </div>
            )
          })}
          {visible.length === 0 && <p className="text-white/30 text-sm">No clients match “{search}”.</p>}
        </div>
      )}
    </div>
  )
}
