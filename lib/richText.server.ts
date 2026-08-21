import sanitizeHtml from 'sanitize-html'
import { RICH_TEXT_ALLOWED_TAGS, isBlankHtml, isLikelyHtml, plainTextToHtml } from './richText'

/**
 * Bios and blog bodies are rendered with dangerouslySetInnerHTML on the public
 * marketing site, so anything an agent can type must be scrubbed before it is
 * stored. Sanitizing on write is the real boundary; richTextToSafeHtml
 * sanitizes again on read so rows written before this existed are covered too.
 */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: RICH_TEXT_ALLOWED_TAGS,
  allowedAttributes: { a: ['href', 'target', 'rel'] },
  // Blocks javascript: and data: URLs in links.
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesAppliedToAttributes: ['href'],
  transformTags: {
    // Agents paste marketing links; make them safe and open off-site.
    a: sanitizeHtml.simpleTransform('a', { target: '_blank', rel: 'noopener noreferrer' }),
    // The editor emits <b>/<i>; store the semantic equivalents.
    b: 'strong',
    i: 'em',
  },
}

/** Sanitizes editor output for storage. Returns null when nothing was written. */
export function sanitizeRichText(value: string | null | undefined): string | null {
  if (!value) return null
  const clean = sanitizeHtml(value, OPTIONS)
  return isBlankHtml(clean) ? null : clean
}

/** Sanitized, render-ready HTML for stored text, legacy plain text included. */
export function richTextToSafeHtml(stored: string | null | undefined): string | null {
  if (!stored) return null
  const html = isLikelyHtml(stored) ? stored : plainTextToHtml(stored)
  return sanitizeRichText(html)
}
