// How much of an agenda fits on the share card.
//
// The card is a fixed 1080x1350, so the event list has a fixed height budget.
// Packing lives here, used by the button that builds the payload and by the
// route that renders it, so the "+N more" count always matches what the image
// actually shows.

export type ShareEvent = {
  time: string | null
  title: string
  league: string | null
  sport: string | null
  // The sport's emoji as the API sends it, so the card, the digests and the
  // dashboard all show the same icon for a sport.
  emoji: string | null
}

export type ShareDay = {
  label: string
  events: ShareEvent[]
}

// Measured on the rendered 1080x1350 card: the list area is ~840px, a day
// heading with its margins costs ~68, and an event row, now tall enough to hold
// the sport's emoji, costs ~101 with its border and margin. The budget sits a
// hair above the measurements so the arithmetic matches what fits, and the card
// keeps a little slack for a long club name that wraps.
const CONTENT_BUDGET = 845
const DAY_COST = 68
const EVENT_COST = 101
export const MAX_SHARE_DAYS = 4

export function packAgendaDays(days: ShareDay[]) {
  let budget = CONTENT_BUDGET
  let shown = 0
  const packed: ShareDay[] = []

  for (const day of days.slice(0, MAX_SHARE_DAYS)) {
    if (budget < DAY_COST + EVENT_COST || day.events.length === 0) {
      break
    }

    budget -= DAY_COST
    const events: ShareEvent[] = []

    for (const event of day.events) {
      if (budget < EVENT_COST) break
      budget -= EVENT_COST
      events.push(event)
    }

    if (events.length === 0) {
      break
    }

    shown += events.length
    packed.push({ label: day.label, events })
  }

  return { days: packed, shownCount: shown }
}
