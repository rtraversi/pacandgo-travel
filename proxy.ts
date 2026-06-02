import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const MAIN_DOMAIN = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'pacandgotravel.com'

function getAgentSlug(hostname: string): string | null {
  // Production: rob.pacandgotravel.com
  if (hostname.endsWith(`.${MAIN_DOMAIN}`)) {
    const sub = hostname.slice(0, -(MAIN_DOMAIN.length + 1))
    if (sub && sub !== 'www') return sub
  }
  // Local dev: rob.localhost or rob.localhost:3000
  if (hostname.includes('.localhost')) {
    const sub = hostname.split('.localhost')[0]
    if (sub && sub !== 'www') return sub
  }
  return null
}

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  })

  // Refresh Supabase auth session on every request
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Subdomain → agent profile rewrite
  const hostname = request.headers.get('host') || ''
  const slug = getAgentSlug(hostname)

  if (slug) {
    const url = request.nextUrl.clone()
    if (!url.pathname.startsWith('/agent/')) {
      url.pathname = `/agent/${slug}${url.pathname === '/' ? '' : url.pathname}`
      return NextResponse.rewrite(url)
    }
  }

  // Protect portal routes
  if (request.nextUrl.pathname.startsWith('/portal')) {
    if (!user) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
