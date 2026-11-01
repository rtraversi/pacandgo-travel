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
  return `https://${slug}.${domain}`
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

/**
 * Hero backgrounds render through next/image, which throws on hosts not listed
 * in next.config.ts. Only accept our own Cloudinary uploads so a bad URL can't
 * take an agent's page down. Returns null for anything else.
 */
export function cleanHeroUrl(url: string | null | undefined): string | null {
  const v = (url ?? '').trim()
  return /^https:\/\/res\.cloudinary\.com\//.test(v) ? v : null
}

/**
 * Asks Cloudinary for a copy of an uploaded image no wider than `width`, as a
 * compressed JPG. Agent photos are often multi-MB PNGs straight off a phone;
 * this turns a 2.8 MB original into ~120 KB at 800px or ~4 KB at avatar size.
 *
 * Replaces any sizing this helper added earlier, so it's safe to call on a
 * URL that was already sized at upload. Non-Cloudinary URLs pass through.
 */
export function cloudinarySized(url: string, width: number): string {
  const m = url.match(/^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(c_limit,w_\d+,q_auto,f_jpg\/)?(.+)$/)
  if (!m) return url
  return `${m[1]}c_limit,w_${width},q_auto,f_jpg/${m[3]}`
}
