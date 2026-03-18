import { jwtVerify, SignJWT } from 'jose'
import { cookies } from 'next/headers'

const SESSION_COOKIE_NAME = 'trimry_session'
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30

type SessionPayload = {
  userId: string
  email: string
  name: string
  locale: string
}

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET

  if (!secret || secret.length < 32) {
    throw new Error(
      'Missing SESSION_SECRET or value is too short (minimum 32 characters).',
    )
  }

  return new TextEncoder().encode(secret)
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSessionSecret())
}

export async function verifySessionToken(token: string) {
  try {
    const verified = await jwtVerify(token, getSessionSecret())
    return verified.payload as SessionPayload
  } catch {
    return null
  }
}

export async function setSessionCookie(payload: SessionPayload) {
  const token = await createSessionToken(payload)

  cookies().set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION_SECONDS,
  })
}

export function clearSessionCookie() {
  cookies().set({
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}

export async function getSession() {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value

  if (!token) {
    return null
  }

  return verifySessionToken(token)
}
