import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Sessions live on the API (trimry_at / trimry_rt cookies). This local route
// only clears a legacy cookie from the pre-API era, if it is still around.
export async function POST() {
  const response = NextResponse.json({ ok: true })

  response.cookies.set({
    name: 'trimry_session',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })

  return response
}
