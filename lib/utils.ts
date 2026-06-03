export function agentProfileUrl(slug: string): string {
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
