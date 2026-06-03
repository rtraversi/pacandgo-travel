'use client'

import { useState, useTransition } from 'react'
import type { BlogFormData } from '@/app/actions/blog'
import type { BlogPost } from '@/lib/types'

interface Props {
  posts: BlogPost[]
  onSave: (data: BlogFormData, id?: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onToggle: (id: string, active: boolean) => Promise<void>
}

const EMPTY: BlogFormData = {
  title: '', body: null, url: null, description: null,
  tags: [], publish_date: null, active: true,
}

function formatDate(d: string | null) {
  if (!d) return ''
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function BlogManager({ posts, onSave, onDelete, onToggle }: Props) {
  const [view, setView] = useState<'list' | 'form'>('list')
  const [editing, setEditing] = useState<BlogPost | null>(null)
  const [form, setForm] = useState<BlogFormData>(EMPTY)
  const [postType, setPostType] = useState<'article' | 'link'>('article')
  const [tagInput, setTagInput] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function openNew() {
    setEditing(null)
    setForm(EMPTY)
    setPostType('article')
    setTagInput('')
    setError(null)
    setView('form')
  }

  function openEdit(post: BlogPost) {
    setEditing(post)
    setForm({
      title: post.title,
      body: post.body,
      url: post.url,
      description: post.description,
      tags: post.tags,
      publish_date: post.publish_date,
      active: post.active,
    })
    setPostType(post.url ? 'link' : 'article')
    setTagInput('')
    setError(null)
    setView('form')
  }

  function set<K extends keyof BlogFormData>(field: K, value: BlogFormData[K]) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function addTag() {
    const t = tagInput.trim()
    if (!t || form.tags.includes(t)) return
    set('tags', [...form.tags, t])
    setTagInput('')
  }

  function removeTag(t: string) {
    set('tags', form.tags.filter(x => x !== t))
  }

  function handleSave() {
    if (!form.title.trim()) { setError('Title is required'); return }
    setError(null)
    const data: BlogFormData = {
      ...form,
      body: postType === 'article' ? form.body : null,
      url: postType === 'link' ? form.url : null,
    }
    startTransition(async () => {
      try {
        await onSave(data, editing?.id)
        setView('list')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Save failed')
      }
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this post?')) return
    startTransition(async () => { await onDelete(id) })
  }

  function handleToggle(id: string, current: boolean) {
    startTransition(async () => { await onToggle(id, !current) })
  }

  const INPUT = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-gold/50 transition'

  if (view === 'form') {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setView('list')} className="text-white/40 hover:text-white transition text-sm">← Back</button>
          <h2 className="text-xl font-display text-white">{editing ? 'Edit Post' : 'New Post'}</h2>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4 max-w-2xl">
          <div>
            <label className="block text-xs text-white/45 mb-1.5">Title</label>
            <input value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="Post title…" className={INPUT} />
          </div>

          <div>
            <label className="block text-xs text-white/45 mb-2">Type</label>
            <div className="flex gap-2">
              {(['article', 'link'] as const).map(t => (
                <button key={t} onClick={() => setPostType(t)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${
                    postType === t ? 'bg-gold text-navy' : 'bg-white/5 text-white/50 hover:text-white border border-white/10'
                  }`}>
                  {t === 'article' ? 'Write Article' : 'External Link'}
                </button>
              ))}
            </div>
          </div>

          {postType === 'article' ? (
            <div>
              <label className="block text-xs text-white/45 mb-1.5">Content</label>
              <textarea value={form.body ?? ''} onChange={e => set('body', e.target.value)}
                rows={8} placeholder="Write your article…"
                className={INPUT + ' resize-none'} />
            </div>
          ) : (
            <div>
              <label className="block text-xs text-white/45 mb-1.5">External URL</label>
              <input value={form.url ?? ''} onChange={e => set('url', e.target.value)}
                placeholder="https://…" className={INPUT} />
            </div>
          )}

          <div>
            <label className="block text-xs text-white/45 mb-1.5">Short Description</label>
            <textarea value={form.description ?? ''} onChange={e => set('description', e.target.value)}
              rows={2} placeholder="Brief summary shown in listings…"
              className={INPUT + ' resize-none'} />
          </div>

          <div>
            <label className="block text-xs text-white/45 mb-1.5">Tags</label>
            <div className="flex gap-2">
              <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                placeholder="Add tag…" className={INPUT} />
              <button onClick={addTag}
                className="shrink-0 px-3 py-2 text-xs bg-white/5 border border-white/10 text-white/60 hover:text-white rounded-lg transition">
                Add
              </button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.tags.map(t => (
                  <span key={t} className="flex items-center gap-1 bg-gold/12 text-gold text-xs px-2.5 py-1 rounded-full">
                    {t}
                    <button onClick={() => removeTag(t)} className="text-gold/50 hover:text-gold ml-0.5">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs text-white/45 mb-1.5">Publish Date</label>
            <input type="date" value={form.publish_date ?? ''} onChange={e => set('publish_date', e.target.value || null)}
              className={INPUT} />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => set('active', !form.active)}
              className={`w-10 h-5 rounded-full transition-colors relative ${form.active ? 'bg-gold' : 'bg-white/15'}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${form.active ? 'left-5' : 'left-0.5'}`} />
            </div>
            <span className="text-sm text-white/70">{form.active ? 'Published' : 'Draft'}</span>
          </label>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={isPending}
              className="bg-gold text-navy font-semibold px-6 py-2.5 rounded-lg hover:bg-gold-hover transition disabled:opacity-50 text-sm">
              {isPending ? 'Saving…' : 'Save Post'}
            </button>
            <button onClick={() => setView('list')} className="text-white/50 hover:text-white text-sm transition px-4">
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
          <h1 className="text-3xl font-display text-white">Blog</h1>
          <p className="text-white/40 text-sm mt-1">{posts.length} posts</p>
        </div>
        <button onClick={openNew}
          className="bg-gold text-navy font-semibold px-5 py-2 rounded-lg hover:bg-gold-hover transition text-sm">
          + New Post
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="border border-dashed border-white/15 rounded-xl py-16 text-center">
          <p className="text-white/30 text-sm">No posts yet.</p>
          <button onClick={openNew} className="mt-3 text-gold text-sm hover:underline">Write your first post</button>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map(post => (
            <div key={post.id} className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{post.title}</p>
                <p className="text-white/40 text-xs mt-0.5 flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-[0.6rem] font-medium ${post.url ? 'bg-blue-500/15 text-blue-400' : 'bg-white/10 text-white/40'}`}>
                    {post.url ? 'Link' : 'Article'}
                  </span>
                  {post.publish_date && formatDate(post.publish_date)}
                  {post.tags.length > 0 && `· ${post.tags.slice(0, 3).join(', ')}`}
                </p>
              </div>
              <button onClick={() => handleToggle(post.id, post.active)}
                className={`shrink-0 w-9 h-5 rounded-full transition-colors relative ${post.active ? 'bg-gold' : 'bg-white/15'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${post.active ? 'left-4' : 'left-0.5'}`} />
              </button>
              <button onClick={() => openEdit(post)} className="text-white/40 hover:text-white transition text-xs shrink-0">Edit</button>
              <button onClick={() => handleDelete(post.id)} className="text-white/25 hover:text-red-400 transition text-xs shrink-0">Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
