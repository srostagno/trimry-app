import { apiFetch, readApiError } from '@/lib/api-client'
import type { LanguageCode } from '@/lib/i18n'
import type { SportsPreferences } from '@/lib/sports'

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function collectRegistrationClientMetadata(timeZone: string) {
  if (typeof window === 'undefined') {
    return { timeZone }
  }

  return {
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

export type RegisterAccountInput = {
  firstName: string
  lastName?: string
  email: string
  password?: string
  language: LanguageCode
  timeZone: string
  sportsPreferences?: SportsPreferences | null
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
        clientMetadata: collectRegistrationClientMetadata(input.timeZone),
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
