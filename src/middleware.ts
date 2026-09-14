import { NextResponse, type NextRequest } from 'next/server'

const LANGUAGES = ['es', 'en', 'pt'] as const
const DEFAULT_LANGUAGE = 'es'
export const LANGUAGE_HEADER = 'x-trimry-lang'

// Public, indexable content lives under /es, /en and /pt. The bare root and the
// old /legal/* URLs redirect permanently to the Spanish version (x-default).
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = `/${DEFAULT_LANGUAGE}`
    return NextResponse.redirect(url, 308)
  }

  if (pathname.startsWith('/legal/')) {
    const url = request.nextUrl.clone()
    url.pathname = `/${DEFAULT_LANGUAGE}${pathname}`
    return NextResponse.redirect(url, 308)
  }

  const [, first] = pathname.split('/')
  const language = LANGUAGES.find((entry) => entry === first)

  if (!language) {
    return NextResponse.next()
  }

  const headers = new Headers(request.headers)
  headers.set(LANGUAGE_HEADER, language)

  return NextResponse.next({ request: { headers } })
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|brand|favicon.ico|icon.png|apple-icon.png|manifest.webmanifest|robots.txt|sitemap.xml|opengraph-image|twitter-image).*)'],
}
