import 'server-only'

import { API_BASE_URL } from '@/lib/api-client'
import type { SportKey, UpcomingFeed } from '@/lib/sports'

// Server-side data access for the programmatic SEO pages. Everything is
// cache-first on the API side (wait=false) and revalidated by Next, so pages
// render instantly even when a schedule is being refreshed in the background.

export type SeoCountry = {
  code: string
  name: string
  timeZone: string
  demonym: string
  leagues: string[]
  teams: string[]
}

export type SeoTeam = {
  slug: string
  name: string
  shortName?: string
  sport: SportKey
  leagueSlug: string
  national?: boolean
}

export type SeoLeague = {
  slug: string
  name: string
  sport: SportKey
  country: string
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
    locale: 'es',
    timeZone: query.timeZone,
    days: String(query.days ?? 14),
    wait: 'false',
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
