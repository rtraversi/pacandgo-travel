export const CRUISE_LINES = [
  'AIDA Cruises',
  'AmaWaterways',
  'American Cruise Lines',
  'Avalon Waterways',
  'Azamara',
  'Carnival Cruise Line',
  'Celebrity Cruises',
  'Costa Cruises',
  'Crystal Cruises',
  'Cunard',
  'Disney Cruise Line',
  'Emerald Cruises',
  'Explora Journeys',
  'Hapag-Lloyd Cruises',
  'Holland America Line',
  'Hurtigruten Expeditions',
  'Lindblad Expeditions',
  'Marella Cruises',
  'MSC Cruises',
  'Norwegian Cruise Line',
  'Oceania Cruises',
  'P&O Cruises',
  'Paul Gauguin Cruises',
  'Ponant',
  'Princess Cruises',
  'Regent Seven Seas Cruises',
  'Royal Caribbean International',
  'Scenic Cruises',
  'Seabourn',
  'Silversea Cruises',
  'Star Clippers',
  'Tauck River Cruises',
  'TUI Cruises',
  'UnCruise Adventures',
  'Uniworld Boutique River Cruises',
  'Viking Ocean Cruises',
  'Viking River Cruises',
  'Virgin Voyages',
  'Windstar Cruises',
]

export function agentProfileUrl(slug: string, tier?: string): string {
  const domain = process.env.NEXT_PUBLIC_MAIN_DOMAIN
  if (!domain || process.env.NODE_ENV === 'development') {
    return `/agent/${slug}`
  }
  if (tier === 'agent_plus') {
    return `https://${slug}.${domain}`
  }
  return `/agent/${slug}`
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

export function formatPrice(price: number | null): string {
  if (price == null) return ''
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)
}

export function initials(name: string): string {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}
