import { NextResponse } from 'next/server'

import { createAgendaImage } from '@/lib/agenda-image'
import { MAX_SHARE_DAYS, packAgendaDays, type ShareDay } from '@/lib/agenda-share'

// Rendered on the edge like the social images. The client posts the agenda it
// already has on screen, so this route needs no session and never touches the
// API: it only lays out and caps what it is given.
export const runtime = 'edge'

const MAX_TEXT = 90

type Payload = {
  heading?: unknown
  subheading?: unknown
  footer?: unknown
  moreLabel?: unknown
  days?: unknown
}

function text(value: unknown, max = MAX_TEXT) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, max) : ''
}

function optionalText(value: unknown, max = MAX_TEXT) {
  const cleaned = text(value, max)
  return cleaned.length > 0 ? cleaned : null
}

export async function POST(request: Request) {
  let payload: Payload

  try {
    payload = (await request.json()) as Payload
  } catch {
    return NextResponse.json({ message: 'Invalid payload.' }, { status: 400 })
  }

  const heading = text(payload.heading, 60)

  if (!heading) {
    return NextResponse.json({ message: 'A heading is required.' }, { status: 400 })
  }

  const parsedDays: ShareDay[] = []

  for (const rawDay of Array.isArray(payload.days) ? payload.days.slice(0, MAX_SHARE_DAYS) : []) {
    const day = rawDay as { label?: unknown; events?: unknown }
    const label = text(day.label, 48)
    const events = (Array.isArray(day.events) ? day.events : [])
      .map((rawEvent) => {
        const event = rawEvent as {
          time?: unknown
          title?: unknown
          league?: unknown
          sport?: unknown
          emoji?: unknown
        }
        return {
          time: optionalText(event.time, 12),
          title: text(event.title, 54),
          league: optionalText(event.league, 40),
          sport: optionalText(event.sport, 24),
          emoji: optionalText(event.emoji, 8),
        }
      })
      .filter((event) => event.title.length > 0)

    if (!label || events.length === 0) continue

    parsedDays.push({ label, events })
  }

  // Same packing the client used to compute the "+N more" label.
  const { days } = packAgendaDays(parsedDays)

  if (days.length === 0) {
    return NextResponse.json({ message: 'No events to render.' }, { status: 400 })
  }

  return createAgendaImage({
    heading,
    subheading: text(payload.subheading, 80),
    footer: text(payload.footer, 60),
    moreLabel: optionalText(payload.moreLabel, 60),
    days,
  })
}
