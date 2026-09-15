import { NextResponse, type NextRequest } from 'next/server'

const LANGUAGES = ['es', 'en', 'pt'] as const
const DEFAULT_LANGUAGE = 'es'
export const LANGUAGE_HEADER = 'x-trimry-lang'
export const GEO_COOKIE = 'tr-geo'
const GEO_COOKIE_MAX_AGE = 24 * 60 * 60

// The browser talks to api.trimry.com directly, so the API never sees the
// Vercel edge headers. Stash the country the edge resolved from the visitor's
// IP in a readable cookie; registration sends it along and the API stores it,
// which beats guessing the country from the browser language.
function withGeoCookie(request: NextRequest, response: NextResponse) {
  const country = request.headers.get('x-vercel-ip-country')?.trim().toUpperCase() ?? ''

  if (/^[A-Z]{2}$/.test(country) && country !== 'XX' && request.cookies.get(GEO_COOKIE)?.value !== country) {
    response.cookies.set(GEO_COOKIE, country, {
      path: '/',
      maxAge: GEO_COOKIE_MAX_AGE,
      sameSite: 'lax',
      httpOnly: false,
    })
  }

  return response
}

// Public, indexable content lives under /es, /en and /pt. The bare root and the
// old /legal/* URLs redirect permanently to the Spanish version (x-default).
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = `/${DEFAULT_LANGUAGE}`
    return withGeoCookie(request, NextResponse.redirect(url, 308))
  }

  if (pathname.startsWith('/legal/')) {
    const url = request.nextUrl.clone()
    url.pathname = `/${DEFAULT_LANGUAGE}${pathname}`
    return withGeoCookie(request, NextResponse.redirect(url, 308))
  }

  const [, first] = pathname.split('/')
  const language = LANGUAGES.find((entry) => entry === first)

  if (!language) {
    return withGeoCookie(request, NextResponse.next())
  }

  const headers = new Headers(request.headers)
  headers.set(LANGUAGE_HEADER, language)

  return withGeoCookie(request, NextResponse.next({ request: { headers } }))
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|brand|favicon.ico|icon.png|apple-icon.png|manifest.webmanifest|robots.txt|sitemap.xml|opengraph-image|twitter-image).*)'],
}
