/**
 * Manual display order for the agent grid, by slug.
 *
 * The `agents` table has no ordering column, so placement that isn't
 * alphabetical lives here. Agents are grouped by tier first (Agent+ above
 * Agent) and then by whether they have a photo; this list only controls the
 * order *within* one of those groups.
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

type SortableAgent = {
  slug: string
  tier: string
  full_name: string
  agent_profiles?: { photo_url: string | null } | null
}

/** True when the grid will render a real photo rather than initials. */
function hasPhoto(agent: SortableAgent): boolean {
  return !!agent.agent_profiles?.photo_url
}

/**
 * Sorts Agent+ first, then agents with a photo ahead of agents still showing
 * initials, then by the manual order above, then alphabetically.
 *
 * The photo grouping keeps the top of the grid looking finished: an agent who
 * uploads a photo moves up on the next render, with no code change.
 */
export function sortAgentsForDisplay<T extends SortableAgent>(agents: T[]): T[] {
  return [...agents].sort((a, b) => {
    if (a.tier !== b.tier) return a.tier === 'agent_plus' ? -1 : 1
    if (hasPhoto(a) !== hasPhoto(b)) return hasPhoto(a) ? -1 : 1
    const diff = rank(a.slug) - rank(b.slug)
    if (diff !== 0) return diff
    return a.full_name.localeCompare(b.full_name)
  })
}
