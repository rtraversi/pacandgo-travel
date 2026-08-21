/**
 * URLs for agent blog articles.
 *
 * blog_posts has no slug column, so rather than migrating the table the URL
 * carries a readable title slug with the post's UUID on the end:
 *
 *   /agent/kristen/blog/five-reasons-to-cruise-alaska-<uuid>
 *
 * The UUID is what we actually look up; the title part is decoration for
 * readers and search engines, and may drift if the post is retitled.
 */

const UUID_SUFFIX = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '')
}

/** The URL segment for a post: readable title plus the id we look up. */
export function blogPostSlug(post: { id: string; title: string }): string {
  const titlePart = slugifyTitle(post.title)
  return titlePart ? `${titlePart}-${post.id}` : post.id
}

export function blogPostPath(agentSlug: string, post: { id: string; title: string }): string {
  return `/agent/${agentSlug}/blog/${blogPostSlug(post)}`
}

/** Pulls the post id back out of a URL segment. Null when there isn't one. */
export function parseBlogPostId(segment: string): string | null {
  const match = UUID_SUFFIX.exec(segment)
  return match ? match[1].toLowerCase() : null
}

/**
 * Where a blog card should point. Link posts go to the external article they
 * reference; posts with a body go to the page we render for them. Posts with
 * neither have nowhere to go — the caller renders them unlinked rather than
 * sending people to "#".
 */
export function blogCardHref(
  agentSlug: string,
  post: { id: string; title: string; url: string | null; body: string | null },
): { href: string; external: boolean } | null {
  if (post.url) return { href: post.url, external: true }
  if (post.body && post.body.trim()) return { href: blogPostPath(agentSlug, post), external: false }
  return null
}
