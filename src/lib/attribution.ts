// First-touch attribution.
//
// The landing URL recorded at registration is the page holding the form, which
// for the guided flow is /activate: the ad click that brought the visitor in is
// already gone by then. So the entry point is captured on the first page view
// and kept in a cookie until the account is created.

const FIRST_TOUCH_COOKIE = 'tr-attr'
const LAST_TOUCH_COOKIE = 'tr-attr-last'
const COOKIE_MAX_AGE = 90 * 24 * 60 * 60
const MAX_VALUE = 120

export type AttributionTouch = {
  source: string | null
  medium: string | null
  campaign: string | null
  content: string | null
  term: string | null
  campaignId: string | null
  clickId: string | null
  clickIdType: string | null
  referrer: string | null
  landingPath: string | null
  at: string
}

export type Attribution = {
  firstTouch: AttributionTouch | null
  lastTouch: AttributionTouch | null
}

const CLICK_IDS: Array<{ param: string; type: string; source: string; medium: string }> = [
  { param: 'fbclid', type: 'fbclid', source: 'meta', medium: 'paid' },
  { param: 'gclid', type: 'gclid', source: 'google', medium: 'cpc' },
  { param: 'gbraid', type: 'gbraid', source: 'google', medium: 'cpc' },
  { param: 'wbraid', type: 'wbraid', source: 'google', medium: 'cpc' },
  { param: 'ttclid', type: 'ttclid', source: 'tiktok', medium: 'paid' },
  { param: 'msclkid', type: 'msclkid', source: 'bing', medium: 'cpc' },
  { param: 'twclid', type: 'twclid', source: 'x', medium: 'paid' },
]

const SEARCH_HOSTS = ['google.', 'bing.com', 'duckduckgo.com', 'search.yahoo.', 'ecosia.org', 'brave.com']
const SOCIAL_HOSTS: Array<{ match: string; source: string }> = [
  { match: 'facebook.com', source: 'facebook' },
  { match: 'instagram.com', source: 'instagram' },
  { match: 'tiktok.com', source: 'tiktok' },
  { match: 'twitter.com', source: 'x' },
  { match: 'x.com', source: 'x' },
  { match: 'linkedin.com', source: 'linkedin' },
  { match: 'reddit.com', source: 'reddit' },
  { match: 'youtube.com', source: 'youtube' },
  { match: 'whatsapp.com', source: 'whatsapp' },
  { match: 't.co', source: 'x' },
]

function clean(value: string | null | undefined) {
  const trimmed = value?.trim() ?? ''
  return trimmed ? trimmed.slice(0, MAX_VALUE) : null
}

function readCookie(name: string) {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  if (!match?.[1]) return null

  try {
    return JSON.parse(decodeURIComponent(match[1])) as AttributionTouch
  } catch {
    return null
  }
}

function writeCookie(name: string, touch: AttributionTouch) {
  document.cookie = `${name}=${encodeURIComponent(JSON.stringify(touch))};path=/;max-age=${COOKIE_MAX_AGE};samesite=lax`
}

function hostOf(url: string | null) {
  if (!url) return null
  try {
    return new URL(url).host.toLowerCase().replace(/^www\./, '')
  } catch {
    return null
  }
}

// Build a touch from the current URL and referrer, or null when this page view
// carries no attribution signal at all (internal navigation).
export function readCurrentTouch(): AttributionTouch | null {
  if (typeof window === 'undefined') return null

  const params = new URLSearchParams(window.location.search)
  const referrer = clean(document.referrer)
  const referrerHost = hostOf(referrer)
  const selfHost = window.location.host.toLowerCase().replace(/^www\./, '')
  const utmSource = clean(params.get('utm_source'))
  const clickIdEntry = CLICK_IDS.find((entry) => params.get(entry.param))

  // Internal click with no campaign markers: not a new touch.
  if (!utmSource && !clickIdEntry && (!referrerHost || referrerHost === selfHost)) {
    return null
  }

  let source = utmSource
  let medium = clean(params.get('utm_medium'))

  if (!source && clickIdEntry) {
    source = clickIdEntry.source
    medium = medium ?? clickIdEntry.medium
  }

  if (!source && referrerHost) {
    const social = SOCIAL_HOSTS.find((entry) => referrerHost.includes(entry.match))

    if (social) {
      source = social.source
      medium = medium ?? 'social'
    } else if (SEARCH_HOSTS.some((host) => referrerHost.includes(host))) {
      source = referrerHost.split('.')[0] ?? referrerHost
      medium = medium ?? 'organic'
    } else {
      source = referrerHost
      medium = medium ?? 'referral'
    }
  }

  if (!source) {
    source = 'direct'
    medium = medium ?? 'none'
  }

  return {
    source,
    medium,
    campaign: clean(params.get('utm_campaign')),
    content: clean(params.get('utm_content')),
    term: clean(params.get('utm_term')),
    campaignId: clean(params.get('utm_id')),
    clickId: clickIdEntry ? clean(params.get(clickIdEntry.param)) : null,
    clickIdType: clickIdEntry?.type ?? null,
    referrer,
    landingPath: clean(window.location.pathname),
    at: new Date().toISOString(),
  }
}

// Call on every page view. First touch is written once and never overwritten;
// last touch always reflects the most recent campaign entry.
export function captureAttribution() {
  const touch = readCurrentTouch()

  if (!touch) return

  if (!readCookie(FIRST_TOUCH_COOKIE)) {
    writeCookie(FIRST_TOUCH_COOKIE, touch)
  }

  writeCookie(LAST_TOUCH_COOKIE, touch)
}

export function readAttribution(): Attribution {
  return {
    firstTouch: readCookie(FIRST_TOUCH_COOKIE),
    lastTouch: readCookie(LAST_TOUCH_COOKIE),
  }
}
