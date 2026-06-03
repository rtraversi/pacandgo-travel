'use client'

import { useState, useTransition } from 'react'
import type { VisibilityData } from '@/app/actions/settings'
import type { AgentProfile } from '@/lib/types'

interface Props {
  profile: AgentProfile | null
  onSaveVisibility: (data: VisibilityData) => Promise<void>
  onChangePassword: (password: string) => Promise<void>
}

const SECTIONS: { key: keyof VisibilityData; label: string; desc: string }[] = [
  { key: 'show_deals', label: 'Deals', desc: 'Show your featured cruise deals' },
  { key: 'show_trips', label: 'Trips', desc: 'Show your group trip packages' },
  { key: 'show_blog', label: 'Blog', desc: 'Show your articles and posts' },
  { key: 'show_reviews', label: 'Reviews', desc: 'Show approved client reviews' },
  { key: 'show_gallery', label: 'Gallery', desc: 'Show your photo gallery' },
]

export default function SettingsManager({ profile, onSaveVisibility, onChangePassword }: Props) {
  const [isPending, startTransition] = useTransition()
  const [visSaved, setVisSaved] = useState(false)
  const [visError, setVisError] = useState<string | null>(null)

  const [vis, setVis] = useState<VisibilityData>({
    show_deals: profile?.show_deals ?? true,
    show_trips: profile?.show_trips ?? true,
    show_blog: profile?.show_blog ?? true,
    show_reviews: profile?.show_reviews ?? true,
    show_gallery: profile?.show_gallery ?? true,
  })

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [pwSaved, setPwSaved] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwPending, startPwTransition] = useTransition()

  function toggleVis(key: keyof VisibilityData) {
    setVis(v => ({ ...v, [key]: !v[key] }))
    setVisSaved(false)
  }

  function handleSaveVisibility() {
    setVisError(null)
    setVisSaved(false)
    startTransition(async () => {
      try {
        await onSaveVisibility(vis)
        setVisSaved(true)
      } catch (e) {
        setVisError(e instanceof Error ? e.message : 'Save failed')
      }
    })
  }

  function handleChangePassword() {
    setPwError(null)
    setPwSaved(false)
    if (password.length < 8) { setPwError('Password must be at least 8 characters'); return }
    if (password !== confirm) { setPwError('Passwords do not match'); return }
    startPwTransition(async () => {
      try {
        await onChangePassword(password)
        setPwSaved(true)
        setPassword('')
        setConfirm('')
      } catch (e) {
        setPwError(e instanceof Error ? e.message : 'Failed to update password')
      }
    })
  }

  const INPUT = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-gold/50 transition'

  return (
    <div className="max-w-xl space-y-10">
      <div>
        <h1 className="text-3xl font-display text-white mb-1">Settings</h1>
        <p className="text-white/40 text-sm">Manage your public page and account.</p>
      </div>

      {/* Visibility */}
      <section className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-5">
        <div>
          <h2 className="text-base font-semibold text-white">Public Page Sections</h2>
          <p className="text-white/35 text-xs mt-0.5">Control which sections appear on your public profile.</p>
        </div>

        <div className="space-y-3">
          {SECTIONS.map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white font-medium">{label}</p>
                <p className="text-white/35 text-xs">{desc}</p>
              </div>
              <button onClick={() => toggleVis(key)}
                className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${vis[key] ? 'bg-gold' : 'bg-white/15'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${vis[key] ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </div>

        {visError && <p className="text-red-400 text-sm">{visError}</p>}
        {visSaved && <p className="text-emerald-400 text-sm">Visibility saved.</p>}

        <button onClick={handleSaveVisibility} disabled={isPending}
          className="bg-gold text-navy font-semibold px-6 py-2.5 rounded-lg hover:bg-gold-hover transition disabled:opacity-50 text-sm">
          {isPending ? 'Saving…' : 'Save Visibility'}
        </button>
      </section>

      {/* Password */}
      <section className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-white">Change Password</h2>
          <p className="text-white/35 text-xs mt-0.5">Update your portal login password.</p>
        </div>

        <div>
          <label className="block text-xs text-white/45 mb-1.5">New Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Min 8 characters" className={INPUT} />
        </div>

        <div>
          <label className="block text-xs text-white/45 mb-1.5">Confirm Password</label>
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
            placeholder="Repeat password" className={INPUT} />
        </div>

        {pwError && <p className="text-red-400 text-sm">{pwError}</p>}
        {pwSaved && <p className="text-emerald-400 text-sm">Password updated successfully.</p>}

        <button onClick={handleChangePassword} disabled={pwPending || !password}
          className="bg-gold text-navy font-semibold px-6 py-2.5 rounded-lg hover:bg-gold-hover transition disabled:opacity-50 text-sm">
          {pwPending ? 'Updating…' : 'Update Password'}
        </button>
      </section>
    </div>
  )
}
