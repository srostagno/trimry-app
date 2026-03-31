export type AnalyticsConsentState = 'unknown' | 'granted' | 'denied'

export const ANALYTICS_CONSENT_COOKIE = 'trimry_analytics_consent'
const ANALYTICS_CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 365

function parseAnalyticsConsentValue(value: string | null | undefined): AnalyticsConsentState {
  if (value === 'granted' || value === 'denied') {
    return value
  }

  return 'unknown'
}

export function readAnalyticsConsentFromDocument(): AnalyticsConsentState {
  if (typeof document === 'undefined') {
    return 'unknown'
  }

  const cookieEntries = document.cookie.split(';').map((entry) => entry.trim())
  const match = cookieEntries.find((entry) =>
    entry.startsWith(`${ANALYTICS_CONSENT_COOKIE}=`),
  )

  if (!match) {
    return 'unknown'
  }

  const value = decodeURIComponent(match.slice(ANALYTICS_CONSENT_COOKIE.length + 1))
  return parseAnalyticsConsentValue(value)
}

export function hasGrantedAnalyticsConsent() {
  return readAnalyticsConsentFromDocument() === 'granted'
}

export function setAnalyticsConsentInDocument(value: Exclude<AnalyticsConsentState, 'unknown'>) {
  if (typeof document === 'undefined') {
    return
  }

  document.cookie = `${ANALYTICS_CONSENT_COOKIE}=${encodeURIComponent(
    value,
  )}; path=/; max-age=${ANALYTICS_CONSENT_MAX_AGE_SECONDS}; samesite=lax`
}
