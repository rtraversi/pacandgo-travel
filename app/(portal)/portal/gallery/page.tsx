import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import GalleryManager from '@/components/portal/GalleryManager'
import AgentPlusGate from '@/components/portal/AgentPlusGate'
import { saveGalleryItem, deleteGalleryItem, toggleGalleryItem, saveGalleryOrder } from '@/app/actions/gallery'
import type { GalleryItem } from '@/lib/types'

export const metadata: Metadata = { title: 'Gallery — Agent Portal' }

export default async function GalleryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const agentRes = await (supabase as any).from('agents').select('id, tier').eq('user_id', user.id).single()
  const agent = agentRes.data as { id: string; tier: string } | null
  if (!agent) redirect('/login')

  if (agent.tier !== 'agent_plus') return <AgentPlusGate feature="Gallery" />

  const { data } = await (supabase as any)
    .from('gallery')
    .select('*')
    .eq('agent_id', agent.id)
    .order('order_index', { ascending: true })

  const items = (data ?? []) as GalleryItem[]

  return (
    <div className="p-8 max-w-4xl">
      <GalleryManager
        items={items}
        onSave={saveGalleryItem}
        onDelete={deleteGalleryItem}
        onToggle={toggleGalleryItem}
        onReorder={saveGalleryOrder}
      />
    </div>
  )
}
