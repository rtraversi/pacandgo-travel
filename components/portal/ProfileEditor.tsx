'use client'

import { useState, useTransition } from 'react'
import { saveProfile } from '@/app/actions/profile'
import type { AgentProfile, Highlight } from '@/lib/types'

const CLOUD = 'dh811jlgd'
const PRESET = 'pacandgo-gallery'

interface Props {
  agentName: string
  agentSlug: string
  profile: AgentProfile | null
}

export default function ProfileEditor({ agentName, agentSlug, profile }: Props) {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [photoUrl, setPhotoUrl] = useState(profile?.photo_url ?? '')
  const [tagline, setTagline] = useState(profile?.tagline ?? '')
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [blogUrl, setBlogUrl] = useState(profile?.blog_url ?? '')
  const [specialties, setSpecialties] = useState<string[]>(profile?.specialties ?? [])
  const [specInput, setSpecInput] = useState('')
  const [highlights, setHighlights] = useState<Highlight[]>(profile?.highlights ?? [])

  const [uploading, setUploading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('upload_preset', PRESET)
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, {
      method: 'POST',
      body: fd,
    })
    const json = await res.json()
    if (json.secure_url) setPhotoUrl(json.secure_url)
    setUploading(false)
  }

  async function generateHighlights() {
    if (!bio.trim()) return
    setAiLoading(true)
    setAiError(null)
    const res = await fetch('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bio, agentName }),
    })
    const json = await res.json()
    if (json.highlights) {
      setHighlights(json.highlights)
    } else {
      setAiError('AI generation failed — try again.')
    }
    setAiLoading(false)
  }

  function addSpec(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter' && e.key !== ',') return
    e.preventDefault()
    const val = specInput.trim().replace(/,$/, '')
    if (val && !specialties.includes(val)) setSpecialties(s => [...s, val])
    setSpecInput('')
  }

  function updateHighlight(i: number, field: keyof Highlight, value: string) {
    setHighlights(hs => hs.map((h, idx) => idx === i ? { ...h, [field]: value } : h))
  }

  function removeHighlight(i: number) {
    setHighlights(hs => hs.filter((_, idx) => idx !== i))
  }

  function handleSave() {
    setSaved(false)
    setSaveError(null)
    startTransition(async () => {
      try {
        await saveProfile({
          photo_url: photoUrl || null,
          tagline: tagline || null,
          bio: bio || null,
          specialties,
          highlights,
          blog_url: blogUrl || null,
        })
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : 'Save failed')
      }
    })
  }

  const initials = agentName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="space-y-6">

      {/* Photo + Identity */}
      <section className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-[0.65rem] font-bold tracking-[0.18em] uppercase text-white/45 mb-5">Photo & Identity</h2>
        <div className="flex gap-6 items-start">
          <div className="shrink-0 text-center">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-white/10 border border-white/15">
              {photoUrl ? (
                <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gold text-2xl font-bold">
                  {initials}
                </div>
              )}
            </div>
            <label className="mt-2.5 block">
              <span className={`text-xs cursor-pointer transition ${uploading ? 'text-white/30' : 'text-gold hover:text-gold-hover'}`}>
                {uploading ? 'Uploading…' : 'Change photo'}
              </span>
              <input type="file" accept="image/*" onChange={handlePhoto} disabled={uploading} className="hidden" />
            </label>
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <label className="block text-xs text-white/45 mb-1.5">Tagline</label>
              <input
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                placeholder="e.g. Your Caribbean Cruise Specialist"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-gold/50 transition"
              />
            </div>
            <div>
              <label className="block text-xs text-white/45 mb-1.5">Blog / External URL <span className="text-white/25">(optional)</span></label>
              <input
                value={blogUrl}
                onChange={e => setBlogUrl(e.target.value)}
                placeholder="https://…"
                type="url"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-gold/50 transition"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Bio */}
      <section className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-[0.65rem] font-bold tracking-[0.18em] uppercase text-white/45 mb-5">Bio</h2>
        <textarea
          value={bio}
          onChange={e => setBio(e.target.value)}
          rows={8}
          placeholder="Tell clients about your travel experience, specialties, and what makes you the right agent for them…"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-gold/50 transition leading-relaxed resize-none"
        />
        <p className="text-white/25 text-xs mt-2">
          Your public page at <span className="text-white/40">rob.pacandgotravel.com</span> shows this bio.
        </p>
      </section>

      {/* Specialties */}
      <section className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-[0.65rem] font-bold tracking-[0.18em] uppercase text-white/45 mb-5">Specialties</h2>
        {specialties.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {specialties.map(s => (
              <span key={s} className="flex items-center gap-1.5 bg-white/10 border border-white/15 text-white text-xs px-3 py-1.5 rounded-full">
                {s}
                <button
                  onClick={() => setSpecialties(sp => sp.filter(x => x !== s))}
                  className="text-white/35 hover:text-white transition leading-none"
                  aria-label={`Remove ${s}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <input
          value={specInput}
          onChange={e => setSpecInput(e.target.value)}
          onKeyDown={addSpec}
          placeholder="Type a specialty and press Enter…"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-gold/50 transition"
        />
        <p className="text-white/25 text-xs mt-2">e.g. Caribbean Cruises · All-Inclusive Resorts · Honeymoon Packages</p>
      </section>

      {/* AI Highlights */}
      <section className="bg-white/5 border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-[0.65rem] font-bold tracking-[0.18em] uppercase text-white/45">Credential Highlights</h2>
            <p className="text-white/30 text-xs mt-1">Shown as feature cards on your public page.</p>
          </div>
          <button
            onClick={generateHighlights}
            disabled={!bio.trim() || aiLoading}
            className="text-xs flex items-center gap-2 bg-gold/12 text-gold border border-gold/30 px-4 py-2 rounded-lg hover:bg-gold/20 transition disabled:opacity-35 disabled:cursor-not-allowed"
          >
            {aiLoading ? (
              <><span className="animate-pulse">✦</span> Generating…</>
            ) : (
              <><span>✦</span> Generate with AI</>
            )}
          </button>
        </div>

        {aiError && <p className="text-red-400 text-xs mb-4">{aiError}</p>}

        {highlights.length === 0 && (
          <div className="border border-dashed border-white/15 rounded-xl py-8 text-center text-white/25 text-sm mb-4">
            No highlights yet — add a bio and click "Generate with AI", or add one manually.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {highlights.map((h, i) => (
            <div key={i} className="bg-white/[0.04] border border-white/10 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center gap-2">
                <input
                  value={h.icon}
                  onChange={e => updateHighlight(i, 'icon', e.target.value)}
                  className="w-11 bg-white/5 border border-white/10 rounded-lg px-1 py-1.5 text-center text-xl focus:outline-none focus:border-gold/50 transition"
                  maxLength={2}
                />
                <input
                  value={h.title}
                  onChange={e => updateHighlight(i, 'title', e.target.value)}
                  placeholder="Title"
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-gold/50 transition"
                />
                <button
                  onClick={() => removeHighlight(i)}
                  className="text-white/20 hover:text-white/60 transition text-lg leading-none"
                  aria-label="Remove highlight"
                >
                  ×
                </button>
              </div>
              <textarea
                value={h.text}
                onChange={e => updateHighlight(i, 'text', e.target.value)}
                rows={2}
                placeholder="Brief description…"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/70 text-xs leading-relaxed resize-none focus:outline-none focus:border-gold/50 transition"
              />
            </div>
          ))}
        </div>

        {highlights.length < 4 && (
          <button
            onClick={() => setHighlights(hs => [...hs, { icon: '⭐', title: '', text: '' }])}
            className="mt-3 text-xs text-white/30 hover:text-white/60 transition"
          >
            + Add highlight
          </button>
        )}
      </section>

      {/* Save */}
      <div className="flex items-center gap-4 pt-2">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="bg-gold text-navy font-semibold px-8 py-2.5 rounded-lg hover:bg-gold-hover transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isPending ? 'Saving…' : 'Save Profile'}
        </button>
        {saved && <p className="text-green-400 text-sm">Saved ✓</p>}
        {saveError && <p className="text-red-400 text-sm">{saveError}</p>}
      </div>

    </div>
  )
}
