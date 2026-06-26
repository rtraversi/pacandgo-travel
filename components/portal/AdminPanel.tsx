'use client'

import { useState, useTransition } from 'react'
import { setAgentTier, linkUserToAgent, createLoginForAgent, addAgent, removeAgentLogin } from '@/app/actions/admin'
import type { AdminAgent } from '@/app/(portal)/portal/admin/page'
import { UserCheck, UserX, ShieldPlus, ShieldMinus, Plus, X, KeyRound, Link } from 'lucide-react'

type Props = { agents: AdminAgent[] }

type RowAction = { type: 'create-login' | 'link-user' } | null

export default function AdminPanel({ agents: initial }: Props) {
  const [agents, setAgents] = useState(initial)
  const [rowAction, setRowAction] = useState<Record<string, RowAction>>({})
  const [addingAgent, setAddingAgent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const clearError = () => setError(null)

  function handleToggleTier(agent: AdminAgent) {
    const newTier = agent.tier === 'agent_plus' ? 'agent' : 'agent_plus'
    startTransition(async () => {
      try {
        await setAgentTier(agent.id, newTier)
        setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, tier: newTier } : a))
      } catch (e: any) { setError(e.message) }
    })
  }

  function handleLinkUser(agent: AdminAgent, userId: string) {
    startTransition(async () => {
      try {
        await linkUserToAgent(agent.id, userId)
        setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, user_id: userId } : a))
        setRowAction(prev => ({ ...prev, [agent.id]: null }))
      } catch (e: any) { setError(e.message) }
    })
  }

  function handleCreateLogin(agent: AdminAgent, password: string) {
    startTransition(async () => {
      try {
        const { userId } = await createLoginForAgent(agent.id, agent.email, password)
        setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, user_id: userId } : a))
        setRowAction(prev => ({ ...prev, [agent.id]: null }))
      } catch (e: any) { setError(e.message) }
    })
  }

  function handleRemoveLogin(agent: AdminAgent) {
    if (!confirm(`Remove login access for ${agent.full_name}?`)) return
    startTransition(async () => {
      try {
        await removeAgentLogin(agent.id)
        setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, user_id: null } : a))
      } catch (e: any) { setError(e.message) }
    })
  }

  function handleAddAgent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const full_name = fd.get('full_name') as string
    const email = fd.get('email') as string
    const slug = fd.get('slug') as string
    const tier = fd.get('tier') as 'agent' | 'agent_plus'
    startTransition(async () => {
      try {
        await addAgent({ full_name, email, slug, tier })
        form.reset()
        setAddingAgent(false)
        // Server revalidates — hard refresh to show new row
        window.location.reload()
      } catch (e: any) { setError(e.message) }
    })
  }

  const profileComplete = (a: AdminAgent) => {
    const p = a.agent_profiles
    return { photo: !!p?.photo_url, bio: !!p?.bio, tagline: !!p?.tagline }
  }

  return (
    <div>
      {error && (
        <div className="mb-4 flex items-center justify-between bg-red-900/40 border border-red-500/40 text-red-300 text-sm px-4 py-3 rounded-lg">
          {error}
          <button onClick={clearError}><X size={14} /></button>
        </div>
      )}

      {/* Stats bar */}
      <div className="flex gap-6 mb-6">
        {[
          { label: 'Total Agents', value: agents.length },
          { label: 'Agent+', value: agents.filter(a => a.tier === 'agent_plus').length },
          { label: 'With Login', value: agents.filter(a => a.user_id).length },
          { label: 'No Login', value: agents.filter(a => !a.user_id).length },
        ].map(stat => (
          <div key={stat.label} className="bg-white/5 border border-white/10 rounded-lg px-5 py-3">
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-white/40 text-xs mt-0.5">{stat.label}</p>
          </div>
        ))}
        <div className="ml-auto flex items-center">
          <button
            onClick={() => setAddingAgent(v => !v)}
            className="flex items-center gap-2 bg-gold text-navy text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg hover:bg-gold-hover transition-colors"
          >
            <Plus size={14} />
            Add Agent
          </button>
        </div>
      </div>

      {/* Add agent form */}
      {addingAgent && (
        <form onSubmit={handleAddAgent} className="mb-6 bg-white/5 border border-white/15 rounded-xl p-6">
          <h3 className="text-white font-semibold text-sm mb-4">New Agent</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/50 text-xs mb-1">Full Name</label>
              <input name="full_name" required className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gold" />
            </div>
            <div>
              <label className="block text-white/50 text-xs mb-1">Email</label>
              <input name="email" type="email" required className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gold" />
            </div>
            <div>
              <label className="block text-white/50 text-xs mb-1">Slug (URL key)</label>
              <input name="slug" required placeholder="e.g. sarah" className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gold" />
            </div>
            <div>
              <label className="block text-white/50 text-xs mb-1">Tier</label>
              <select name="tier" className="w-full bg-navy border border-white/15 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gold">
                <option value="agent">Agent</option>
                <option value="agent_plus">Agent+</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" disabled={isPending} className="bg-gold text-navy text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg hover:bg-gold-hover transition-colors disabled:opacity-50">
              {isPending ? 'Saving…' : 'Create Agent'}
            </button>
            <button type="button" onClick={() => setAddingAgent(false)} className="text-white/40 text-xs hover:text-white transition-colors px-2">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Agent table */}
      <div className="bg-white/3 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-white/35 text-[0.65rem] uppercase tracking-wider">
              <th className="text-left px-5 py-3">Agent</th>
              <th className="text-left px-4 py-3">Tier</th>
              <th className="text-left px-4 py-3">Login</th>
              <th className="text-left px-4 py-3">Profile</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {agents.map(agent => {
              const pc = profileComplete(agent)
              const action = rowAction[agent.id] || null
              return (
                <>
                  <tr key={agent.id} className="hover:bg-white/3 transition-colors">
                    {/* Name */}
                    <td className="px-5 py-3.5">
                      <p className="text-white font-medium">{agent.full_name}</p>
                      <p className="text-white/30 text-xs mt-0.5">/{agent.slug} · {agent.email}</p>
                    </td>

                    {/* Tier */}
                    <td className="px-4 py-3.5">
                      <span className={`inline-block text-[0.65rem] font-bold uppercase tracking-wider px-2.5 py-1 rounded ${
                        agent.tier === 'agent_plus'
                          ? 'bg-gold/20 text-gold'
                          : 'bg-white/10 text-white/50'
                      }`}>
                        {agent.tier === 'agent_plus' ? 'Agent+' : 'Agent'}
                      </span>
                    </td>

                    {/* Login */}
                    <td className="px-4 py-3.5">
                      {agent.user_id ? (
                        <span className="flex items-center gap-1.5 text-green-400 text-xs">
                          <UserCheck size={13} />
                          Linked
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-white/30 text-xs">
                          <UserX size={13} />
                          No login
                        </span>
                      )}
                    </td>

                    {/* Profile completeness */}
                    <td className="px-4 py-3.5">
                      <div className="flex gap-2">
                        {[
                          { key: 'photo', label: 'Photo', done: pc.photo },
                          { key: 'tagline', label: 'Tag', done: pc.tagline },
                          { key: 'bio', label: 'Bio', done: pc.bio },
                        ].map(({ key, label, done }) => (
                          <span key={key} className={`text-[0.6rem] px-1.5 py-0.5 rounded ${done ? 'bg-green-900/50 text-green-400' : 'bg-white/5 text-white/25'}`}>
                            {label}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2 justify-end">
                        {/* Toggle tier */}
                        <button
                          onClick={() => handleToggleTier(agent)}
                          disabled={isPending}
                          title={agent.tier === 'agent_plus' ? 'Downgrade to Agent' : 'Upgrade to Agent+'}
                          className="p-1.5 rounded text-white/40 hover:text-gold hover:bg-gold/10 transition-colors disabled:opacity-30"
                        >
                          {agent.tier === 'agent_plus' ? <ShieldMinus size={14} /> : <ShieldPlus size={14} />}
                        </button>

                        {/* Create / link login */}
                        {!agent.user_id ? (
                          <>
                            <button
                              onClick={() => setRowAction(prev => ({ ...prev, [agent.id]: prev[agent.id]?.type === 'create-login' ? null : { type: 'create-login' } }))}
                              title="Create login"
                              className="p-1.5 rounded text-white/40 hover:text-ocean hover:bg-ocean/10 transition-colors"
                            >
                              <KeyRound size={14} />
                            </button>
                            <button
                              onClick={() => setRowAction(prev => ({ ...prev, [agent.id]: prev[agent.id]?.type === 'link-user' ? null : { type: 'link-user' } }))}
                              title="Link existing user ID"
                              className="p-1.5 rounded text-white/40 hover:text-white/70 hover:bg-white/10 transition-colors"
                            >
                              <Link size={14} />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleRemoveLogin(agent)}
                            disabled={isPending}
                            title="Remove login"
                            className="p-1.5 rounded text-white/20 hover:text-red-400 hover:bg-red-900/20 transition-colors disabled:opacity-30"
                          >
                            <UserX size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Inline action row */}
                  {action && (
                    <tr key={`${agent.id}-action`} className="bg-navy/50">
                      <td colSpan={5} className="px-5 py-3">
                        {action.type === 'create-login' && (
                          <CreateLoginForm
                            agent={agent}
                            onSubmit={(pw) => handleCreateLogin(agent, pw)}
                            onCancel={() => setRowAction(prev => ({ ...prev, [agent.id]: null }))}
                            isPending={isPending}
                          />
                        )}
                        {action.type === 'link-user' && (
                          <LinkUserForm
                            onSubmit={(uid) => handleLinkUser(agent, uid)}
                            onCancel={() => setRowAction(prev => ({ ...prev, [agent.id]: null }))}
                            isPending={isPending}
                          />
                        )}
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function CreateLoginForm({ agent, onSubmit, onCancel, isPending }: {
  agent: AdminAgent
  onSubmit: (password: string) => void
  onCancel: () => void
  isPending: boolean
}) {
  const [pw, setPw] = useState('')
  return (
    <div className="flex items-center gap-3">
      <KeyRound size={13} className="text-ocean shrink-0" />
      <span className="text-white/50 text-xs shrink-0">Create login for <span className="text-white">{agent.email}</span> with password:</span>
      <input
        value={pw}
        onChange={e => setPw(e.target.value)}
        placeholder="Temp password"
        className="bg-white/10 border border-white/15 rounded px-2.5 py-1.5 text-white text-xs w-44 focus:outline-none focus:border-gold"
      />
      <button
        onClick={() => onSubmit(pw)}
        disabled={isPending || pw.length < 8}
        className="bg-ocean/80 text-white text-xs font-semibold px-3 py-1.5 rounded hover:bg-ocean transition-colors disabled:opacity-40"
      >
        {isPending ? 'Creating…' : 'Create'}
      </button>
      <button onClick={onCancel} className="text-white/30 text-xs hover:text-white transition-colors">Cancel</button>
    </div>
  )
}

function LinkUserForm({ onSubmit, onCancel, isPending }: {
  onSubmit: (userId: string) => void
  onCancel: () => void
  isPending: boolean
}) {
  const [uid, setUid] = useState('')
  return (
    <div className="flex items-center gap-3">
      <Link size={13} className="text-white/50 shrink-0" />
      <span className="text-white/50 text-xs shrink-0">Supabase user ID:</span>
      <input
        value={uid}
        onChange={e => setUid(e.target.value)}
        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
        className="bg-white/10 border border-white/15 rounded px-2.5 py-1.5 text-white text-xs w-80 font-mono focus:outline-none focus:border-gold"
      />
      <button
        onClick={() => onSubmit(uid)}
        disabled={isPending || uid.length < 32}
        className="bg-white/15 text-white text-xs font-semibold px-3 py-1.5 rounded hover:bg-white/20 transition-colors disabled:opacity-40"
      >
        {isPending ? 'Linking…' : 'Link'}
      </button>
      <button onClick={onCancel} className="text-white/30 text-xs hover:text-white transition-colors">Cancel</button>
    </div>
  )
}
