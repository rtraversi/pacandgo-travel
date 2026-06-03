'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { GalleryFormData } from '@/app/actions/gallery'
import type { GalleryItem } from '@/lib/types'

const CLOUD = 'dh811jlgd'
const PRESET = 'pacandgo-gallery'

const CATEGORIES = ['Ships', 'Ports', 'Destinations', 'Food & Dining', 'Activities', 'Behind the Scenes', 'Other']

interface Props {
  items: GalleryItem[]
  onSave: (data: GalleryFormData, id?: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onToggle: (id: string, active: boolean) => Promise<void>
  onReorder: (items: { id: string; order_index: number }[]) => Promise<void>
}

type FormState = Omit<GalleryFormData, 'order_index'>

const EMPTY_FORM: FormState = {
  image_url: '', caption: null, alt_text: null, category: null, media_type: 'photo', active: true,
}

export default function GalleryManager({ items: initialItems, onSave, onDelete, onToggle, onReorder }: Props) {
  const router = useRouter()
  const [items, setItems] = useState(initialItems)
  const [view, setView] = useState<'grid' | 'form'>('grid')

  useEffect(() => { setItems(initialItems) }, [initialItems])
  const [editing, setEditing] = useState<GalleryItem | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [uploading, setUploading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function openNew() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setError(null)
    setView('form')
  }

  function openEdit(item: GalleryItem) {
    setEditing(item)
    setForm({
      image_url: item.image_url,
      caption: item.caption,
      alt_text: item.alt_text,
      category: item.category,
      media_type: item.media_type,
      active: item.active,
    })
    setError(null)
    setView('form')
  }

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('upload_preset', PRESET)
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, { method: 'POST', body: fd })
    const json = await res.json()
    if (json.secure_url) set('image_url', json.secure_url)
    setUploading(false)
  }

  function handleSave() {
    if (!form.image_url) { setError('Upload an image first'); return }
    setError(null)
    const nextIndex = editing ? editing.order_index : (items.length > 0 ? Math.max(...items.map(i => i.order_index)) + 1 : 0)
    const data: GalleryFormData = { ...form, order_index: nextIndex }
    startTransition(async () => {
      try {
        await onSave(data, editing?.id)
        setView('grid')
        router.refresh()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Save failed')
      }
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this photo?')) return
    startTransition(async () => {
      await onDelete(id)
      setItems(prev => prev.filter(i => i.id !== id))
    })
  }

  function handleToggle(id: string, current: boolean) {
    startTransition(async () => {
      await onToggle(id, !current)
      setItems(prev => prev.map(i => i.id === id ? { ...i, active: !current } : i))
    })
  }

  function moveItem(index: number, dir: -1 | 1) {
    const next = [...items]
    const swap = index + dir
    if (swap < 0 || swap >= next.length) return
    ;[next[index], next[swap]] = [next[swap], next[index]]
    const reindexed = next.map((item, i) => ({ ...item, order_index: i }))
    setItems(reindexed)
    startTransition(async () => {
      await onReorder(reindexed.map(i => ({ id: i.id, order_index: i.order_index })))
    })
  }

  const INPUT = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-gold/50 transition'

  if (view === 'form') {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setView('grid')} className="text-white/40 hover:text-white transition text-sm">← Back</button>
          <h2 className="text-xl font-display text-white">{editing ? 'Edit Photo' : 'Upload Photo'}</h2>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4 max-w-xl">
          <div>
            <label className="block text-xs text-white/45 mb-1.5">Image</label>
            {form.image_url ? (
              <div className="relative">
                <img src={form.image_url} alt="" className="w-full max-h-56 object-cover rounded-lg" />
                <button onClick={() => fileRef.current?.click()}
                  className="absolute bottom-2 right-2 text-xs bg-black/60 text-white px-3 py-1.5 rounded-lg hover:bg-black/80 transition">
                  Change
                </button>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                className="w-full border-2 border-dashed border-white/15 rounded-xl py-12 text-center hover:border-gold/30 transition group">
                <p className="text-white/30 text-sm group-hover:text-white/50 transition">
                  {uploading ? 'Uploading…' : 'Click to upload photo'}
                </p>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </div>

          <div>
            <label className="block text-xs text-white/45 mb-1.5">Caption</label>
            <input value={form.caption ?? ''} onChange={e => set('caption', e.target.value || null)}
              placeholder="Optional caption…" className={INPUT} />
          </div>

          <div>
            <label className="block text-xs text-white/45 mb-1.5">Alt Text</label>
            <input value={form.alt_text ?? ''} onChange={e => set('alt_text', e.target.value || null)}
              placeholder="Describe the image for accessibility…" className={INPUT} />
          </div>

          <div>
            <label className="block text-xs text-white/45 mb-1.5">Category</label>
            <input
              value={form.category ?? ''}
              onChange={e => set('category', e.target.value || null)}
              list="gallery-categories"
              placeholder="Select or type a category…"
              className={INPUT}
            />
            <datalist id="gallery-categories">
              {CATEGORIES.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => set('active', !form.active)}
              className={`w-10 h-5 rounded-full transition-colors relative ${form.active ? 'bg-gold' : 'bg-white/15'}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${form.active ? 'left-5' : 'left-0.5'}`} />
            </div>
            <span className="text-sm text-white/70">{form.active ? 'Visible on gallery' : 'Hidden'}</span>
          </label>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={isPending || uploading}
              className="bg-gold text-navy font-semibold px-6 py-2.5 rounded-lg hover:bg-gold-hover transition disabled:opacity-50 text-sm">
              {isPending ? 'Saving…' : 'Save Photo'}
            </button>
            <button onClick={() => setView('grid')} className="text-white/50 hover:text-white text-sm transition px-4">
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display text-white">Gallery</h1>
          <p className="text-white/40 text-sm mt-1">{items.length} photos</p>
        </div>
        <button onClick={openNew}
          className="bg-gold text-navy font-semibold px-5 py-2 rounded-lg hover:bg-gold-hover transition text-sm">
          + Upload Photo
        </button>
      </div>

      {items.length === 0 ? (
        <div className="border border-dashed border-white/15 rounded-xl py-16 text-center">
          <p className="text-white/30 text-sm">No photos yet.</p>
          <button onClick={openNew} className="mt-3 text-gold text-sm hover:underline">Upload your first photo</button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {items.map((item, index) => (
            <div key={item.id} className={`relative group rounded-xl overflow-hidden border ${item.active ? 'border-white/10' : 'border-white/5 opacity-50'}`}>
              <img src={item.image_url} alt={item.alt_text ?? ''} className="w-full aspect-square object-cover" />

              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                <div className="flex justify-between">
                  <button onClick={() => handleToggle(item.id, item.active)}
                    className={`text-[0.6rem] font-bold tracking-wider px-2 py-1 rounded ${item.active ? 'bg-gold/20 text-gold' : 'bg-white/10 text-white/50'}`}>
                    {item.active ? 'ON' : 'OFF'}
                  </button>
                  <button onClick={() => handleDelete(item.id)}
                    className="text-[0.6rem] text-red-400 bg-red-500/10 px-2 py-1 rounded hover:bg-red-500/20 transition">
                    Delete
                  </button>
                </div>

                <div className="space-y-2">
                  {item.caption && <p className="text-white text-xs leading-tight line-clamp-2">{item.caption}</p>}
                  {item.category && <p className="text-gold/70 text-[0.6rem]">{item.category}</p>}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      <button onClick={() => moveItem(index, -1)} disabled={index === 0 || isPending}
                        className="w-6 h-6 flex items-center justify-center bg-white/10 text-white rounded hover:bg-white/20 transition disabled:opacity-30 text-xs">
                        ↑
                      </button>
                      <button onClick={() => moveItem(index, 1)} disabled={index === items.length - 1 || isPending}
                        className="w-6 h-6 flex items-center justify-center bg-white/10 text-white rounded hover:bg-white/20 transition disabled:opacity-30 text-xs">
                        ↓
                      </button>
                    </div>
                    <button onClick={() => openEdit(item)}
                      className="text-xs text-white/70 hover:text-white transition">
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
