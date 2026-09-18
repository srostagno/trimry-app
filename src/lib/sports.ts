import { apiFetch, readApiError } from '@/lib/api-client'
import type { LanguageCode } from '@/lib/i18n'

export type SportKey =
  | 'soccer'
  | 'basketball'
  | 'american_football'
  | 'baseball'
  | 'ice_hockey'
  | 'tennis'
  | 'motorsport'
  | 'fighting'
  | 'rugby'
  | 'golf'
  | 'cycling'
  | 'cricket'

export type DigestFrequency = 'daily' | 'weekly'

export type LeaguePreference = {
  id: string
  name: string
  sport: SportKey
}

export type TeamPreference = {
  id: string
  name: string
  sport: SportKey
  leagueId: string | null
  leagueName: string | null
  badge: string | null
}

export type SportsPreferences = {
  sports: SportKey[]
  leagues: LeaguePreference[]
  teams: TeamPreference[]
  lookaheadDays: number
  frequency: DigestFrequency
}

export type SerializedSportsPreferences = SportsPreferences & {
  updatedAt: string
}

export type CatalogSport = {
  key: SportKey
  label: string
  emoji: string
  featuredLeagues: Array<{ id: string; name: string; country: string }>
}

export type LeagueSearchResult = {
  id: string
  name: string
  country: string | null
  featured: boolean
}

export type TeamSearchResult = {
  id: string
  name: string
  shortName: string | null
  sport: SportKey | null
  sportLabel: string
  leagueId: string | null
  leagueName: string | null
  country: string | null
  badge: string | null
}

export type FeedEvent = {
  id: string
  sport: SportKey
  sportLabel: string
  sportEmoji: string
  leagueId: string | null
  leagueName: string
  name: string
  homeTeamId: string | null
  homeTeamName: string | null
  awayTeamId: string | null
  awayTeamName: string | null
  startsAt: string
  // A multi-day event (a golf or tennis tournament, a stage race) reports the
  // last day it runs; single-day fixtures leave these null.
  endsAt: string | null
  startLocalDateKey: string
  endLocalDateKey: string | null
  endLocalDateLabel: string | null
  multiDay: boolean
  inProgress: boolean
  timeKnown: boolean
  localDateKey: string
  localTime: string | null
  localDateLabel: string
  localTimeLabel: string | null
  venue: string | null
  city: string | null
  country: string | null
  round: string | null
  status: 'scheduled' | 'live' | 'finished' | 'postponed' | 'canceled'
  thumb: string | null
  matchReasons: Array<'team' | 'league' | 'sport'>
  matchedTeamNames: string[]
  score: number
}

export type FeedDay = {
  dateKey: string
  label: string
  isToday: boolean
  events: FeedEvent[]
}

export type UpcomingFeed = {
  cacheState?: 'ready' | 'warming'
  generatedAt: string
  timeZone: string
  locale: string
  fromDateKey: string
  toDateKey: string
  lookaheadDays: number
  totalEvents: number
  days: FeedDay[]
  highlights: FeedEvent[]
}

export type MemberUpcomingFeed = UpcomingFeed & {
  hasPreferences: boolean
  refresh: { fetched: number; skipped: number; failed: number } | null
}

export const SPORT_KEYS: SportKey[] = [
  'soccer',
  'basketball',
  'american_football',
  'baseball',
  'ice_hockey',
  'tennis',
  'motorsport',
  'fighting',
  'rugby',
  'golf',
  'cycling',
  'cricket',
]

export const DEFAULT_LOOKAHEAD_DAYS = 7
export const MAX_LOOKAHEAD_DAYS = 14

export function emptyPreferences(): SportsPreferences {
  return {
    sports: [],
    leagues: [],
    teams: [],
    lookaheadDays: DEFAULT_LOOKAHEAD_DAYS,
    frequency: 'daily',
  }
}

export function hasAnyPreferences(preferences: SportsPreferences | null | undefined) {
  return Boolean(
    preferences &&
      (preferences.sports.length > 0 ||
        preferences.leagues.length > 0 ||
        preferences.teams.length > 0),
  )
}

export function preferencesFromSerialized(
  serialized: SerializedSportsPreferences | null | undefined,
): SportsPreferences {
  if (!serialized) {
    return emptyPreferences()
  }

  return {
    sports: [...serialized.sports],
    leagues: serialized.leagues.map((league) => ({ ...league })),
    teams: serialized.teams.map((team) => ({ ...team })),
    lookaheadDays: serialized.lookaheadDays,
    frequency: serialized.frequency,
  }
}

const PREFERENCES_DRAFT_KEY = 'trimry:sports-preferences-draft'

export function loadPreferencesDraft(): SportsPreferences | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.localStorage.getItem(PREFERENCES_DRAFT_KEY)

    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as Partial<SportsPreferences>

    return {
      sports: Array.isArray(parsed.sports) ? parsed.sports.filter((sport) => SPORT_KEYS.includes(sport)) : [],
      leagues: Array.isArray(parsed.leagues) ? parsed.leagues : [],
      teams: Array.isArray(parsed.teams) ? parsed.teams : [],
      lookaheadDays:
        typeof parsed.lookaheadDays === 'number' ? parsed.lookaheadDays : DEFAULT_LOOKAHEAD_DAYS,
      frequency: parsed.frequency === 'weekly' ? 'weekly' : 'daily',
    }
  } catch {
    return null
  }
}

export function savePreferencesDraft(preferences: SportsPreferences | null) {
  if (typeof window === 'undefined') {
    return
  }

  if (!preferences) {
    window.localStorage.removeItem(PREFERENCES_DRAFT_KEY)
    return
  }

  window.localStorage.setItem(PREFERENCES_DRAFT_KEY, JSON.stringify(preferences))
}

export async function fetchSportsCatalog(language: LanguageCode) {
  const response = await apiFetch(
    `/sports/catalog?locale=${encodeURIComponent(language)}`,
    { cache: 'no-store' },
    { retryUnauthorized: false },
  )

  if (!response.ok) {
    throw new Error(await readApiError(response, 'Unable to load the sports catalog.'))
  }

  return (await response.json()) as { sports: CatalogSport[] }
}

export async function fetchLeaguesForSport(sport: SportKey, query?: string) {
  const params = new URLSearchParams({ sport })

  if (query?.trim()) {
    params.set('q', query.trim())
  }

  const response = await apiFetch(
    `/sports/leagues?${params.toString()}`,
    { cache: 'no-store' },
    { retryUnauthorized: false },
  )

  if (!response.ok) {
    throw new Error(await readApiError(response, 'Unable to load leagues.'))
  }

  return (await response.json()) as { sport: SportKey; leagues: LeagueSearchResult[] }
}

export async function searchTeams(
  query: string,
  sport?: SportKey | null,
  language?: LanguageCode,
) {
  const params = new URLSearchParams({ q: query })

  if (sport) {
    params.set('sport', sport)
  }

  if (language) {
    params.set('locale', language)
  }

  const response = await apiFetch(
    `/sports/teams/search?${params.toString()}`,
    { cache: 'no-store' },
    { retryUnauthorized: false },
  )

  if (!response.ok) {
    throw new Error(await readApiError(response, 'Unable to search teams.'))
  }

  return (await response.json()) as { teams: TeamSearchResult[] }
}

export async function fetchEventsPreview(input: {
  sport?: SportKey
  leagueId?: string
  leagueName?: string
  teamId?: string
  teamName?: string
  days?: number
  language: LanguageCode
  timeZone?: string
}) {
  const params = new URLSearchParams({ locale: input.language })

  if (input.sport) {
    params.set('sport', input.sport)
  }

  if (input.leagueId) {
    params.set('leagueId', input.leagueId)
  }

  if (input.leagueName) {
    params.set('leagueName', input.leagueName)
  }

  if (input.teamId) {
    params.set('teamId', input.teamId)
  }

  if (input.teamName) {
    params.set('teamName', input.teamName)
  }

  if (input.days) {
    params.set('days', String(input.days))
  }

  if (input.timeZone) {
    params.set('timeZone', input.timeZone)
  }

  const response = await apiFetch(
    `/sports/events/preview?${params.toString()}`,
    { cache: 'no-store' },
    { retryUnauthorized: false },
  )

  if (!response.ok) {
    throw new Error(await readApiError(response, 'Unable to load events preview.'))
  }

  return (await response.json()) as UpcomingFeed
}

export async function fetchMemberUpcomingEvents(input: {
  days?: number
  language: LanguageCode
  refresh?: boolean
}) {
  const params = new URLSearchParams({ locale: input.language })

  if (input.days) {
    params.set('days', String(input.days))
  }

  if (input.refresh === false) {
    params.set('refresh', 'false')
  }

  const response = await apiFetch(`/me/upcoming-events?${params.toString()}`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(await readApiError(response, 'Unable to load your agenda.'))
  }

  return (await response.json()) as MemberUpcomingFeed
}

export async function saveSportsPreferences(preferences: SportsPreferences) {
  const response = await apiFetch('/users/me/sports-preferences', {
    method: 'PUT',
    body: JSON.stringify(preferences),
  })

  if (!response.ok) {
    throw new Error(await readApiError(response, 'Unable to save your preferences.'))
  }

  return (await response.json()) as {
    sportsPreferences: SerializedSportsPreferences
  }
}
