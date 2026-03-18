import { cookies } from 'next/headers'

import { API_BASE_URL } from '@/lib/api-client'

export type AuthViewer = {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  locale: string
  timeZone: string
  admin: boolean
}

type MeResponse = {
  user?: AuthViewer
}

const ACCESS_TOKEN_COOKIE = 'trimry_at'
const REFRESH_TOKEN_COOKIE = 'trimry_rt'

export async function getAuthenticatedViewer() {
  const cookieStore = await cookies()
  const hasApiSession =
    cookieStore.has(ACCESS_TOKEN_COOKIE) || cookieStore.has(REFRESH_TOKEN_COOKIE)

  if (!hasApiSession) {
    return null
  }

  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ')

  try {
    const response = await fetch(`${API_BASE_URL}/me`, {
      headers: {
        Cookie: cookieHeader,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      return null
    }

    const payload = (await response.json()) as MeResponse
    return payload.user ?? null
  } catch {
    return null
  }
}
