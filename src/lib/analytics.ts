export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || 'G-2JFX4TVBCP'
export const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || '3053148311487167'

type AnalyticsPrimitive = string | number | boolean | null | undefined
type AnalyticsValue =
  | AnalyticsPrimitive
  | AnalyticsValue[]
  | { [key: string]: AnalyticsValue }
type AnalyticsParams = Record<string, AnalyticsValue>
type SanitizedAnalyticsValue =
  | string
  | number
  | SanitizedAnalyticsValue[]
  | { [key: string]: SanitizedAnalyticsValue }
type MetaEventParam = AnalyticsPrimitive | Array<string | number>
type MetaEventParams = Record<string, MetaEventParam>
type MetaStandardEventName =
  | 'PageView'
  | 'Lead'
  | 'Contact'
  | 'CompleteRegistration'
  | 'InitiateCheckout'
  | 'Subscribe'

declare global {
  type FbqFunction = {
    (...args: unknown[]): void
    callMethod?: (...args: unknown[]) => void
    queue?: unknown[]
    loaded?: boolean
    version?: string
  }

  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
    fbq?: FbqFunction
    _fbq?: FbqFunction
    __trimryGaQueue?: unknown[][]
    __trimryGaReady?: boolean
  }
}

function sanitizeAnalyticsValue(
  value: AnalyticsValue,
): SanitizedAnalyticsValue | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined
  }

  if (typeof value === 'boolean') {
    return String(value)
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return value
  }

  if (Array.isArray(value)) {
    const cleanValues = value
      .map((entry) => sanitizeAnalyticsValue(entry))
      .filter((entry): entry is SanitizedAnalyticsValue => entry !== undefined)

    return cleanValues.length > 0 ? cleanValues : undefined
  }

  const result: Record<string, SanitizedAnalyticsValue> = {}

  for (const [key, nestedValue] of Object.entries(value)) {
    const cleanValue = sanitizeAnalyticsValue(nestedValue)

    if (cleanValue !== undefined) {
      result[key] = cleanValue
    }
  }

  return Object.keys(result).length > 0 ? result : undefined
}

function sanitizeAnalyticsParams(params: AnalyticsParams) {
  const result: Record<string, SanitizedAnalyticsValue> = {}

  for (const [key, value] of Object.entries(params)) {
    const cleanValue = sanitizeAnalyticsValue(value)

    if (cleanValue !== undefined) {
      result[key] = cleanValue
    }
  }

  return result
}

function sanitizeMetaEventParams(params: MetaEventParams) {
  const result: Record<string, string | number | Array<string | number>> = {}

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') {
      continue
    }

    if (Array.isArray(value)) {
      const cleanValues = value.filter(
        (entry): entry is string | number =>
          typeof entry === 'string' || typeof entry === 'number',
      )

      if (cleanValues.length > 0) {
        result[key] = cleanValues
      }

      continue
    }

    result[key] = typeof value === 'boolean' ? String(value) : value
  }

  return result
}

function dispatchAnalytics(...args: unknown[]) {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID) {
    return false
  }

  if (typeof window.gtag === 'function') {
    window.gtag(...args)
    return true
  }

  return false
}

export function trackEvent(eventName: string, params: AnalyticsParams = {}) {
  return dispatchAnalytics('event', eventName, sanitizeAnalyticsParams(params))
}

function dispatchMetaPixel(
  method: 'track' | 'trackCustom',
  eventName: string,
  params: MetaEventParams = {},
) {
  if (typeof window === 'undefined' || !META_PIXEL_ID) {
    return false
  }

  if (typeof window.fbq === 'function') {
    window.fbq(method, eventName, sanitizeMetaEventParams(params))
    return true
  }

  return false
}

export function trackMetaStandardEvent(
  eventName: MetaStandardEventName,
  params: MetaEventParams = {},
) {
  return dispatchMetaPixel('track', eventName, params)
}

export function trackMetaCustomEvent(
  eventName: string,
  params: MetaEventParams = {},
) {
  return dispatchMetaPixel('trackCustom', eventName, params)
}

export function trackPageView(pagePath: string) {
  if (typeof window === 'undefined') {
    return
  }

  return trackEvent('page_view', {
    page_path: pagePath,
    page_location: window.location.href,
    page_title: document.title,
    language: document.documentElement.lang,
  })
}

export function trackMetaPageView() {
  if (typeof window === 'undefined' || !META_PIXEL_ID) {
    return false
  }

  if (typeof window.fbq === 'function') {
    window.fbq('track', 'PageView')
    return true
  }

  return false
}

export function setAnalyticsUserProperties(properties: AnalyticsParams) {
  return dispatchAnalytics(
    'set',
    'user_properties',
    sanitizeAnalyticsParams(properties),
  )
}

export function markGoogleAnalyticsReady() {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return false
  }

  window.__trimryGaReady = true

  const queuedCommands = window.__trimryGaQueue ?? []
  window.__trimryGaQueue = []

  for (const command of queuedCommands) {
    window.gtag(...command)
  }

  return true
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

  if (trackEvent(eventName, params)) {
    window.sessionStorage.setItem(storageKey, '1')
  }
}

export function trackMetaStandardEventOnce(
  sessionKey: string,
  eventName: MetaStandardEventName,
  params: MetaEventParams = {},
) {
  if (typeof window === 'undefined') {
    return
  }

  const storageKey = `trimry-meta:${sessionKey}`

  if (window.sessionStorage.getItem(storageKey)) {
    return
  }

  if (trackMetaStandardEvent(eventName, params)) {
    window.sessionStorage.setItem(storageKey, '1')
  }
}
