import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function getApiBaseUrl() {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()
  const defaultBaseUrl =
    process.env.NODE_ENV === 'production'
      ? 'https://api.trimry.com/api/v1'
      : 'http://localhost:4000/api/v1'

  return (configuredBaseUrl || defaultBaseUrl).replace(/\/+$/, '')
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')?.trim()

  if (!token) {
    return new NextResponse('Missing unsubscribe token.', {
      status: 400,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'no-store',
      },
    })
  }

  try {
    const upstream = await fetch(
      `${getApiBaseUrl()}/subscription/email-unsubscribe?token=${encodeURIComponent(
        token,
      )}`,
      {
        method: 'GET',
        cache: 'no-store',
        headers: {
          Accept: 'text/html',
        },
      },
    )
    const body = await upstream.text()

    return new NextResponse(body, {
      status: upstream.status,
      headers: {
        'content-type':
          upstream.headers.get('content-type') ?? 'text/html; charset=utf-8',
        'cache-control': 'no-store',
      },
    })
  } catch {
    return new NextResponse('Unable to process unsubscribe request.', {
      status: 502,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'no-store',
      },
    })
  }
}

