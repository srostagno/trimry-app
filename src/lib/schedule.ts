export const DEFAULT_TIME_ZONE = 'UTC'
export const DEFAULT_WEEKLY_DELIVERY_HOUR = 9

const TIME_ZONE_FALLBACKS = [
  'UTC',
  'America/Santiago',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/Madrid',
  'Europe/London',
  'Asia/Tokyo',
  'Australia/Sydney',
]

type ZonedParts = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

function getZonedParts(date: Date, timeZone: string): ZonedParts {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const mappedParts = formatter.formatToParts(date).reduce<Record<string, string>>(
    (accumulator, part) => {
      if (part.type !== 'literal') {
        accumulator[part.type] = part.value
      }

      return accumulator
    },
    {},
  )

  return {
    year: Number.parseInt(mappedParts.year ?? '', 10),
    month: Number.parseInt(mappedParts.month ?? '', 10),
    day: Number.parseInt(mappedParts.day ?? '', 10),
    hour: Number.parseInt(mappedParts.hour ?? '', 10),
    minute: Number.parseInt(mappedParts.minute ?? '', 10),
    second: Number.parseInt(mappedParts.second ?? '', 10),
  }
}

function getOffsetMilliseconds(date: Date, timeZone: string) {
  const zonedParts = getZonedParts(date, timeZone)
  const zonedTimestamp = Date.UTC(
    zonedParts.year,
    zonedParts.month - 1,
    zonedParts.day,
    zonedParts.hour,
    zonedParts.minute,
    zonedParts.second,
  )

  return zonedTimestamp - date.getTime()
}

function zonedTimeToUtc(parts: ZonedParts, timeZone: string) {
  const utcGuess = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  )

  const firstOffset = getOffsetMilliseconds(new Date(utcGuess), timeZone)
  let normalizedTimestamp = utcGuess - firstOffset
  const refinedOffset = getOffsetMilliseconds(new Date(normalizedTimestamp), timeZone)

  if (refinedOffset !== firstOffset) {
    normalizedTimestamp = utcGuess - refinedOffset
  }

  return new Date(normalizedTimestamp)
}

export function getSupportedTimeZones() {
  if (typeof Intl.supportedValuesOf === 'function') {
    try {
      return Intl.supportedValuesOf('timeZone')
    } catch {
      return TIME_ZONE_FALLBACKS
    }
  }

  return TIME_ZONE_FALLBACKS
}

export function normalizeTimeZone(input: string | null | undefined) {
  const candidate = input?.trim() || DEFAULT_TIME_ZONE

  try {
    Intl.DateTimeFormat('en-US', { timeZone: candidate }).format(new Date())
    return candidate
  } catch {
    return DEFAULT_TIME_ZONE
  }
}

export function detectBrowserTimeZone() {
  if (typeof window === 'undefined') {
    return DEFAULT_TIME_ZONE
  }

  return normalizeTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone)
}

export function formatDeliveryHourLabel(hour: number, locale?: string) {
  return new Intl.DateTimeFormat(locale ?? undefined, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(2025, 0, 6, hour, 0, 0)))
}

export function formatNextDelivery(dateIso: string, locale: string, timeZone: string) {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone,
    timeZoneName: 'short',
  }).format(new Date(dateIso))
}

export function nextWeeklyDeliveryAt(input: {
  referenceDate?: Date
  timeZone: string
  deliveryHourLocal: number
}) {
  const referenceDate = input.referenceDate ?? new Date()
  const timeZone = normalizeTimeZone(input.timeZone)
  const deliveryHourLocal =
    Number.isInteger(input.deliveryHourLocal) &&
    input.deliveryHourLocal >= 0 &&
    input.deliveryHourLocal <= 23
      ? input.deliveryHourLocal
      : DEFAULT_WEEKLY_DELIVERY_HOUR
  const zonedNow = getZonedParts(referenceDate, timeZone)
  const localDayOfWeek = new Date(
    Date.UTC(zonedNow.year, zonedNow.month - 1, zonedNow.day),
  ).getUTCDay()
  const currentMinutes = zonedNow.hour * 60 + zonedNow.minute
  const targetMinutes = deliveryHourLocal * 60
  let deltaDays = (8 - localDayOfWeek) % 7

  if (localDayOfWeek === 1 && currentMinutes < targetMinutes) {
    deltaDays = 0
  } else if (deltaDays === 0) {
    deltaDays = 7
  }

  const localDateCandidate = new Date(
    Date.UTC(zonedNow.year, zonedNow.month - 1, zonedNow.day + deltaDays),
  )

  return zonedTimeToUtc(
    {
      year: localDateCandidate.getUTCFullYear(),
      month: localDateCandidate.getUTCMonth() + 1,
      day: localDateCandidate.getUTCDate(),
      hour: deliveryHourLocal,
      minute: 0,
      second: 0,
    },
    timeZone,
  )
}

export function deriveDeliveryHourLocal(nextMessageAt: Date, timeZone?: string) {
  return getZonedParts(nextMessageAt, normalizeTimeZone(timeZone)).hour
}
