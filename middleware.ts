import { NextRequest, NextResponse } from 'next/server'

const MAIN_DOMAIN = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'pacandgotravel.com'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const host = hostname.split(':')[0]

  const isMainDomain = host === MAIN_DOMAIN || host === `www.${MAIN_DOMAIN}`
  const isNetlifyDomain = host.endsWith('.netlify.app')
  const isLocalhost = host === 'localhost' || host.endsWith('.localhost')

  if (isMainDomain || isNetlifyDomain || isLocalhost) {
    return NextResponse.next()
  }

  // Extract subdomain — e.g. "rob" from "rob.pacandgotravel.com"
  const subdomain = host.replace(`.${MAIN_DOMAIN}`, '')

  if (subdomain && subdomain !== host) {
    const url = request.nextUrl.clone()
    url.pathname = `/agent/${subdomain}`
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
