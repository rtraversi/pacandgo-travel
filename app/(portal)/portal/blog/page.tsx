import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BlogManager from '@/components/portal/BlogManager'
import AgentPlusGate from '@/components/portal/AgentPlusGate'
import { saveBlogPost, deleteBlogPost, toggleBlogPost } from '@/app/actions/blog'
import type { BlogPost } from '@/lib/types'

export const metadata: Metadata = { title: 'Blog — Agent Portal' }

export default async function BlogPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const agentRes = await (supabase as any).from('agents').select('id, tier').eq('user_id', user.id).single()
  const agent = agentRes.data as { id: string; tier: string } | null
  if (!agent) redirect('/login')

  if (agent.tier !== 'agent_plus') return <AgentPlusGate feature="Blog" />

  const { data } = await (supabase as any)
    .from('blog_posts')
    .select('*')
    .eq('agent_id', agent.id)
    .order('created_at', { ascending: false })

  const posts = (data ?? []) as BlogPost[]

  return (
    <div className="p-8 max-w-3xl">
      <BlogManager
        posts={posts}
        onSave={saveBlogPost}
        onDelete={deleteBlogPost}
        onToggle={toggleBlogPost}
      />
    </div>
  )
}
