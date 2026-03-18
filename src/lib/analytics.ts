export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || 'G-2JFX4TVBCP'

type AnalyticsPrimitive = string | number | boolean | null | undefined
type AnalyticsParams = Record<string, AnalyticsPrimitive>

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

function sanitizeAnalyticsParams(params: AnalyticsParams) {
  const result: Record<string, string | number> = {}

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') {
      continue
    }

    result[key] = typeof value === 'boolean' ? String(value) : value
  }

  return result
}

function dispatchAnalytics(...args: unknown[]) {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID) {
    return
  }

  window.dataLayer = window.dataLayer || []

  if (typeof window.gtag === 'function') {
    window.gtag(...args)
    return
  }

  window.dataLayer.push(args)
}

export function trackEvent(eventName: string, params: AnalyticsParams = {}) {
  dispatchAnalytics('event', eventName, sanitizeAnalyticsParams(params))
}

export function trackPageView(pagePath: string) {
  if (typeof window === 'undefined') {
    return
  }

  trackEvent('page_view', {
    page_path: pagePath,
    page_location: window.location.href,
    page_title: document.title,
    language: document.documentElement.lang,
  })
}

export function setAnalyticsUserProperties(properties: AnalyticsParams) {
  dispatchAnalytics(
    'set',
    'user_properties',
    sanitizeAnalyticsParams(properties),
  )
}

export function trackEventOnce(
  sessionKey: string,
  eventName: string,
  params: AnalyticsParams = {},
) {
  if (typeof window === 'undefined') {
    return
  }

  const storageKey = `trimry-ga:${sessionKey}`

  if (window.sessionStorage.getItem(storageKey)) {
    return
  }

  window.sessionStorage.setItem(storageKey, '1')
  trackEvent(eventName, params)
}
