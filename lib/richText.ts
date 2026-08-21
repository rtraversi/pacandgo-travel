/**
 * Shared helpers for agent bios, which are stored as HTML since the portal
 * switched to a rich-text editor.
 *
 * Everything here is dependency-free so it can run in client components too.
 * Sanitizing lives in richText.server.ts — it needs a Node library and must
 * only ever run on the server, where it is a real trust boundary.
 */

/** Tags the bio editor can produce. Kept in sync with the sanitizer. */
export const BIO_ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 's', 'a',
  'ul', 'ol', 'li', 'blockquote', 'h3', 'h4',
]

/**
 * Bios written before the rich-text editor are plain text with newlines.
 * Rather than migrating the table, we detect and convert them on read.
 */
export function isLikelyHtml(value: string): boolean {
  return /<(p|br|strong|em|u|s|a|ul|ol|li|blockquote|h[1-6])\b[^>]*>/i.test(value)
}

/** Turns legacy newline-separated text into the paragraph markup we now store. */
export function plainTextToHtml(value: string): string {
  return value
    .split(/\n+/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => `<p>${escapeHtml(line)}</p>`)
    .join('')
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * True when the editor produced markup with no actual words — TipTap leaves
 * behind "<p></p>" when you clear it, which would otherwise count as a filled-in
 * bio on the profile-completion checklist.
 */
export function isBlankHtml(value: string | null | undefined): boolean {
  if (!value) return true
  const text = value
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .trim()
  return text.length === 0
}
