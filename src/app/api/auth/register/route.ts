import { NextResponse } from 'next/server'

import { createUser, findUserByEmail } from '@/lib/data'
import { hashPassword, validatePasswordStrength } from '@/lib/security'
import { setSessionCookie } from '@/lib/session'

export const dynamic = 'force-dynamic'

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string
      email?: string
      password?: string
      locale?: string
      timeZone?: string
    }

    const name = body.name?.trim() ?? ''
    const email = body.email?.toLowerCase().trim() ?? ''
    const password = body.password ?? ''
    const locale = body.locale?.trim() || 'en'
    const timeZone = body.timeZone?.trim() || 'UTC'

    if (name.length < 2) {
      return NextResponse.json(
        { message: 'Name must contain at least 2 characters.' },
        { status: 400 },
      )
    }

    if (!validEmail(email)) {
      return NextResponse.json(
        { message: 'Please enter a valid email address.' },
        { status: 400 },
      )
    }

    const passwordCheck = validatePasswordStrength(password)

    if (!passwordCheck.valid) {
      return NextResponse.json(
        { message: passwordCheck.reason },
        { status: 400 },
      )
    }

    const existingUser = await findUserByEmail(email)

    if (existingUser) {
      return NextResponse.json(
        { message: 'An account with that email already exists.' },
        { status: 409 },
      )
    }

    const passwordHash = hashPassword(password)
    const createdUser = await createUser({
      name,
      email,
      passwordHash,
      locale,
      timeZone,
    })

    await setSessionCookie({
      userId: createdUser._id.toString(),
      email: createdUser.email,
      name: createdUser.name,
      locale: createdUser.locale,
    })

    return NextResponse.json({
      user: {
        id: createdUser._id.toString(),
        name: createdUser.name,
        email: createdUser.email,
        locale: createdUser.locale,
        timeZone: createdUser.timeZone,
      },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: 'Registration failed. Please try again.' },
      { status: 500 },
    )
  }
}
