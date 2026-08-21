import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { richTextToSafeHtml } from '@/lib/richText.server'
import { parseBlogPostId } from '@/lib/blog'
import { formatDate } from '@/lib/utils'
import type { Agent, BlogPost } from '@/lib/types'

interface Props { params: Promise<{ slug: string; postSlug: string }> }

/** Loads the post only if it belongs to this agent and is published. */
async function loadPost(slug: string, postSlug: string) {
  const postId = parseBlogPostId(postSlug)
  if (!postId) return null

  const supabase = await createClient()
  const agentRes = await supabase.from('agents').select('id, slug, full_name').eq('slug', slug).single()
  const agent = agentRes.data as Pick<Agent, 'id' | 'slug' | 'full_name'> | null
  if (!agent) return null

  const postRes = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', postId)
    .eq('agent_id', agent.id)
    .eq('active', true)
    .maybeSingle()

  const post = postRes.data as BlogPost | null
  if (!post) return null

  return { agent, post }
}

export async function generateMetadata({ params }: Props) {
  const { slug, postSlug } = await params
  const found = await loadPost(slug, postSlug)
  if (!found) return { title: 'Post Not Found' }
  return {
    title: `${found.post.title} | ${found.agent.full_name}`,
    description: found.post.description || undefined,
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug, postSlug } = await params
  const found = await loadPost(slug, postSlug)
  if (!found) notFound()

  const { agent, post } = found
  const bodyHtml = richTextToSafeHtml(post.body)
  // A post with no body is a link post; it has no page of its own to show.
  if (!bodyHtml) notFound()

  return (
    <article className="bg-white">
      <header className="bg-navy px-[5%] pt-28 pb-14">
        <div className="max-w-3xl mx-auto">
          <Link
            href={`/agent/${agent.slug}`}
            className="text-gold text-xs font-bold tracking-[0.18em] uppercase no-underline hover:text-gold-hover transition-colors"
          >
            ← {agent.full_name}
          </Link>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="bg-gold/15 text-gold text-[0.65rem] font-bold uppercase tracking-wider px-2.5 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <h1 className="text-white text-[clamp(1.9rem,4vw,3rem)] leading-tight mt-4">{post.title}</h1>
          {post.publish_date && (
            <p className="text-white/45 text-sm mt-4">{formatDate(post.publish_date)}</p>
          )}
        </div>
      </header>

      <div className="px-[5%] py-16">
        <div className="max-w-3xl mx-auto">
          {post.description && (
            <p className="text-gray-500 text-lg leading-relaxed mb-8 pb-8 border-b border-light">
              {post.description}
            </p>
          )}
          {/* Sanitized on save and again on read — see richText.server.ts */}
          <div className="rich-text" dangerouslySetInnerHTML={{ __html: bodyHtml }} />

          <div className="mt-14 pt-8 border-t border-light">
            <Link
              href={`/agent/${agent.slug}`}
              className="text-ocean text-sm font-medium no-underline hover:text-gold transition-colors"
            >
              ← Back to {agent.full_name}&apos;s page
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
