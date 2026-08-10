/**
 * Manual display order for the agent grid, by slug.
 *
 * The `agents` table has no ordering column, so placement that isn't
 * alphabetical lives here. Agents are still grouped by tier first (Agent+
 * above Agent); this list only controls the order *within* a tier.
 *
 * Any agent not listed here sorts after the listed ones, alphabetically by
 * full name — so new agents appear automatically and only need adding here
 * if they want a specific spot.
 */
export const AGENT_DISPLAY_ORDER: string[] = [
  'alan',
  'aniska',
  'beth',
  'dawn',
  'teal',
  'denise',
  'jane',
  'joel',
  'larry',
  'norma',
  'rochelle',
  'rosemary',
  'sue',
]

const UNRANKED = Number.MAX_SAFE_INTEGER

function rank(slug: string): number {
  const i = AGENT_DISPLAY_ORDER.indexOf(slug)
  return i === -1 ? UNRANKED : i
}

/** Sorts Agent+ first, then by the manual order above, then alphabetically. */
export function sortAgentsForDisplay<T extends { slug: string; tier: string; full_name: string }>(
  agents: T[]
): T[] {
  return [...agents].sort((a, b) => {
    if (a.tier !== b.tier) return a.tier === 'agent_plus' ? -1 : 1
    const diff = rank(a.slug) - rank(b.slug)
    if (diff !== 0) return diff
    return a.full_name.localeCompare(b.full_name)
  })
}
