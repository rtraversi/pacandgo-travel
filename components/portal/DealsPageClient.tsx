'use client'

import { useState, useTransition } from 'react'
import CruiseItemManager from '@/components/portal/CruiseItemManager'
import DealsParser from '@/components/portal/DealsParser'
import type { CruiseFormData } from '@/app/actions/deals'
import type { Deal } from '@/lib/types'

interface Props {
  deals: Deal[]
  onSave: (data: CruiseFormData, id?: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onToggle: (id: string, active: boolean) => Promise<void>
}

export default function DealsPageClient({ deals, onSave, onDelete, onToggle }: Props) {
  const [tab, setTab] = useState<'deals' | 'import'>('deals')
  const [isPending, startTransition] = useTransition()

  async function handleImport(parsed: CruiseFormData[]) {
    startTransition(async () => {
      for (const deal of parsed) {
        await onSave(deal)
      }
      setTab('deals')
    })
  }

  return (
    <div className="p-8 max-w-3xl">
      {/* Tab bar */}
      <div className="flex gap-1 mb-8 bg-white/5 border border-white/10 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab('deals')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
            tab === 'deals' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'
          }`}>
          My Deals
        </button>
        <button
          onClick={() => setTab('import')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
            tab === 'import' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'
          }`}>
          ✦ Import from Email
        </button>
      </div>

      {isPending && (
        <div className="mb-4 text-sm text-gold/70 flex items-center gap-2">
          <span className="animate-spin inline-block w-3 h-3 border-2 border-gold/30 border-t-gold rounded-full" />
          Saving deals…
        </div>
      )}

      {tab === 'deals' ? (
        <CruiseItemManager
          label="Deal"
          items={deals}
          onSave={onSave}
          onDelete={onDelete}
          onToggle={onToggle}
        />
      ) : (
        <DealsParser
          onImport={handleImport}
          onBack={() => setTab('deals')}
        />
      )}
    </div>
  )
}
