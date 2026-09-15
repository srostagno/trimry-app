import { apiFetch, readApiError } from '@/lib/api-client'
import { readAttribution } from '@/lib/attribution'
import type { LanguageCode } from '@/lib/i18n'
import type { SportsPreferences } from '@/lib/sports'

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Country the Vercel edge resolved from the visitor's IP, parked in a cookie by
// the middleware because the browser calls the API directly.
function readGeoCountry() {
  const match = document.cookie.match(/(?:^|;\s*)tr-geo=([A-Za-z]{2})(?:;|$)/)

  return match?.[1]?.toUpperCase() ?? null
}

export function collectRegistrationClientMetadata(timeZone: string) {
  if (typeof window === 'undefined') {
    return { timeZone }
  }

  return {
    geoCountry: readGeoCountry(),
    browserLocale: navigator.language || null,
    browserLanguages: Array.from(navigator.languages ?? []).slice(0, 12),
    timeZone,
    timeZoneOffsetMinutes: new Date().getTimezoneOffset(),
    platform: navigator.platform || null,
    referrer: document.referrer || null,
    landingUrl: window.location.href,
    screen: {
      width: window.screen?.width ?? null,
      height: window.screen?.height ?? null,
      pixelRatio: window.devicePixelRatio ?? null,
    },
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
  }
}

// Passive bot signals: a hidden field a person never sees, and how long the
// form was on screen. No captcha, no extra step.
export const HONEYPOT_FIELD = 'contactReference'

export function useFormTimer() {
  return Date.now()
}

export type RegisterAccountInput = {
  firstName: string
  lastName?: string
  email: string
  password?: string
  language: LanguageCode
  timeZone: string
  sportsPreferences?: SportsPreferences | null
  honeypot?: string
  formOpenedAt?: number
}

export async function registerAccount(input: RegisterAccountInput, fallbackMessage: string) {
  const response = await apiFetch(
    '/auth/register',
    {
      method: 'POST',
      body: JSON.stringify({
        firstName: input.firstName.trim(),
        ...(input.lastName?.trim() ? { lastName: input.lastName.trim() } : {}),
        email: input.email.trim().toLowerCase(),
        ...(input.password ? { password: input.password } : {}),
        locale: input.language,
        timeZone: input.timeZone,
        ...(input.sportsPreferences ? { sportsPreferences: input.sportsPreferences } : {}),
        ...(input.honeypot ? { [HONEYPOT_FIELD]: input.honeypot } : {}),
        ...(input.formOpenedAt
          ? { formElapsedMs: Math.max(0, Date.now() - input.formOpenedAt) }
          : {}),
        clientMetadata: collectRegistrationClientMetadata(input.timeZone),
        attribution: readAttribution(),
      }),
    },
    { retryUnauthorized: false },
  )

  if (!response.ok) {
    throw new Error(await readApiError(response, fallbackMessage))
  }

  return (await response.json()) as {
    user?: { id?: string; locale?: string }
  }
}
