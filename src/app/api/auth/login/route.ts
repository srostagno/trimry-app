import { NextResponse } from 'next/server'

import { findUserByEmail } from '@/lib/data'
import { verifyPassword } from '@/lib/security'
import { setSessionCookie } from '@/lib/session'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string
      password?: string
    }

    const email = body.email?.toLowerCase().trim() ?? ''
    const password = body.password ?? ''

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required.' },
        { status: 400 },
      )
    }

    const user = await findUserByEmail(email)

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { message: 'Invalid email or password.' },
        { status: 401 },
      )
    }

    await setSessionCookie({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      locale: user.locale,
    })

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        locale: user.locale,
        timeZone: user.timeZone,
      },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: 'Unable to sign in right now.' },
      { status: 500 },
    )
  }
}
