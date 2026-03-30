import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const DEFAULT_CONTENT_TYPE = 'application/json; charset=utf-8'

function getApiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()

  if (!baseUrl) {
    return null
  }

  return baseUrl.replace(/\/+$/, '')
}

export async function proxyBillingPost(
  apiPath: '/billing/checkout-session' | '/billing/portal-session',
) {
  const baseUrl = getApiBaseUrl()

  if (!baseUrl) {
    return NextResponse.json(
      { message: 'API base URL is not configured.' },
      { status: 500 },
    )
  }

  const cookieStore = await cookies()
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ')

  try {
    const upstream = await fetch(`${baseUrl}${apiPath}`, {
      method: 'POST',
      cache: 'no-store',
      headers: cookieHeader.length > 0
        ? {
            Cookie: cookieHeader,
            Accept: 'application/json',
          }
        : {
            Accept: 'application/json',
          },
    })

    const body = await upstream.text()

    return new NextResponse(body, {
      status: upstream.status,
      headers: {
        'content-type': upstream.headers.get('content-type') ?? DEFAULT_CONTENT_TYPE,
        'cache-control': 'no-store',
      },
    })
  } catch {
    return NextResponse.json(
      { message: 'Unable to reach billing API.' },
      { status: 502 },
    )
  }
}
