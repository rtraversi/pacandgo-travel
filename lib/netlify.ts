/**
 * Registers agent subdomains (kristen.pacandgotravel.com) as Netlify domain
 * aliases. Netlify has no "add one alias" endpoint — you PATCH the site with
 * the full domain_aliases array — and it rejects wildcards (`*.domain`) with a
 * 422, so every agent needs its own entry. Doing it here keeps the admin panel
 * the single place an agent gets created.
 *
 * Every failure is returned, never thrown: a missing token or a Netlify outage
 * must not cost you the agent record you just created.
 */

const NETLIFY_API = 'https://api.netlify.com/api/v1'
const TIMEOUT_MS = 10_000

// DNS label rules: lowercase alphanumerics and inner hyphens, max 63 chars.
const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/
const RESERVED_SLUGS = new Set(['www', 'portal', 'admin', 'api', 'mail', 'app', 'dev', 'staging'])

export type SubdomainResult =
  | { ok: true; host: string; status: 'created' | 'already-existed' }
  | { ok: false; host: string | null; reason: string }

export function normalizeSlug(raw: string): string {
  return raw.trim().toLowerCase()
}

/** Returns an error message, or null when the slug is usable as a subdomain. */
export function validateSlug(slug: string): string | null {
  if (!slug) return 'Slug is required.'
  if (!SLUG_RE.test(slug)) {
    return 'Slug must be lowercase letters, numbers and hyphens only — no spaces or dots — and cannot start or end with a hyphen.'
  }
  if (RESERVED_SLUGS.has(slug)) return `"${slug}" is reserved and cannot be used as an agent slug.`
  return null
}

async function netlifyFetch(path: string, token: string, init?: RequestInit) {
  const res = await fetch(`${NETLIFY_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!res.ok) {
    throw new Error(`Netlify API ${init?.method || 'GET'} ${path} failed: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

export async function registerAgentSubdomain(slug: string): Promise<SubdomainResult> {
  const token = process.env.NETLIFY_AUTH_TOKEN
  const siteId = process.env.NETLIFY_SITE_ID || process.env.SITE_ID
  const domain = process.env.NEXT_PUBLIC_MAIN_DOMAIN

  if (!domain) return { ok: false, host: null, reason: 'NEXT_PUBLIC_MAIN_DOMAIN is not set.' }
  const host = `${slug}.${domain}`

  const slugError = validateSlug(slug)
  if (slugError) return { ok: false, host, reason: slugError }

  if (!token || !siteId) {
    return {
      ok: false,
      host,
      reason: 'NETLIFY_AUTH_TOKEN / NETLIFY_SITE_ID are not set, so the subdomain was not registered.',
    }
  }

  try {
    const site = await netlifyFetch(`/sites/${siteId}`, token)
    const aliases: string[] = site.domain_aliases || []
    if (aliases.includes(host)) return { ok: true, host, status: 'already-existed' }

    // Read-modify-write on the whole array: two admins adding agents at the
    // same moment could drop one alias. Fine for a single-admin panel.
    await netlifyFetch(`/sites/${siteId}`, token, {
      method: 'PATCH',
      body: JSON.stringify({ domain_aliases: [...aliases, host] }),
    })
    return { ok: true, host, status: 'created' }
  } catch (e) {
    return { ok: false, host, reason: e instanceof Error ? e.message : String(e) }
  }
}
