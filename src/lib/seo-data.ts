import 'server-only'

import { API_BASE_URL } from '@/lib/api-client'
import type { SportKey, UpcomingFeed } from '@/lib/sports'

// Server-side data access for the programmatic SEO pages. Everything is
// cache-first on the API side (wait=false) and revalidated by Next, so pages
// render instantly even when a schedule is being refreshed in the background.

export type SeoLanguage = 'es' | 'pt' | 'en'

export type SeoCountry = {
  code: string
  name: string
  language: SeoLanguage
  priority: number
  timeZone: string
  demonym: string
  leagues: string[]
  teams: string[]
}

export type SeoTeam = {
  slug: string
  name: string
  shortName?: string
  ptName?: string
  enName?: string
  sport: SportKey
  leagueSlug: string
  national?: boolean
}

export type SeoLeague = {
  slug: string
  name: string
  ptName?: string
  sport: SportKey
  country: string
  countryCode?: string
}

export type SeoMatch = {
  slug: string
  providerId: string
  sport: SportKey
  leagueId: string | null
  leagueName: string
  homeTeamId: string
  homeTeamName: string
  awayTeamId: string
  awayTeamName: string
  startsAt: string
  timeKnown: boolean
  dateKey: string
  venue: string | null
  round: string | null
  countryTeamSlugs: string[]
}

export type SeoCatalog = {
  countries: SeoCountry[]
  teams: SeoTeam[]
  leagues: SeoLeague[]
}

const CATALOG_REVALIDATE_SECONDS = 3600
export const FEED_REVALIDATE_SECONDS = 1800

export async function fetchSeoCatalog(): Promise<SeoCatalog> {
  const response = await fetch(`${API_BASE_URL}/sports/seo/catalog`, {
    next: { revalidate: CATALOG_REVALIDATE_SECONDS },
  })

  if (!response.ok) {
    throw new Error('Unable to load the SEO catalog.')
  }

  return (await response.json()) as SeoCatalog
}

// Cached fixtures of one market, one entry per match. Shared by the per-match
// pages and the sitemap; Next dedupes the call within a render.
export async function fetchSeoMatches(countryCode: string): Promise<SeoMatch[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/sports/seo/matches?country=${encodeURIComponent(countryCode)}&days=14`,
      { next: { revalidate: FEED_REVALIDATE_SECONDS } },
    )

    if (!response.ok) {
      return []
    }

    const payload = (await response.json()) as { matches?: SeoMatch[] }
    return payload.matches ?? []
  } catch {
    return []
  }
}

export async function resolveSeoContext(countryCode: string) {
  const catalog = await fetchSeoCatalog()
  const country = catalog.countries.find((entry) => entry.code === countryCode.toLowerCase()) ?? null

  return { catalog, country }
}

export function findTeam(catalog: SeoCatalog, slug: string) {
  return catalog.teams.find((entry) => entry.slug === slug) ?? null
}

export function findLeague(catalog: SeoCatalog, slug: string) {
  return catalog.leagues.find((entry) => entry.slug === slug) ?? null
}

type FeedQuery = {
  locale: SeoLanguage
  sport?: SportKey
  teamId?: string
  teamName?: string
  leagueId?: string
  leagueName?: string
  timeZone: string
  days?: number
}

export async function fetchSeoFeed(query: FeedQuery): Promise<UpcomingFeed | null> {
  const params = new URLSearchParams({
    locale: query.locale,
    timeZone: query.timeZone,
    days: String(query.days ?? 14),
    wait: 'false',
    // SEO pages never trigger provider fetches; the sync cron keeps them warm.
    refresh: 'false',
  })

  if (query.sport) params.set('sport', query.sport)
  if (query.teamId) params.set('teamId', query.teamId)
  if (query.teamName) params.set('teamName', query.teamName)
  if (query.leagueId) params.set('leagueId', query.leagueId)
  if (query.leagueName) params.set('leagueName', query.leagueName)

  try {
    const response = await fetch(`${API_BASE_URL}/sports/events/preview?${params.toString()}`, {
      next: { revalidate: FEED_REVALIDATE_SECONDS },
    })

    if (!response.ok) {
      return null
    }

    return (await response.json()) as UpcomingFeed
  } catch {
    return null
  }
}
