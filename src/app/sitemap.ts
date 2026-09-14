import type { MetadataRoute } from 'next'

import { LANGUAGE_OPTIONS } from '@/lib/i18n'
import { IS_INDEXING_ALLOWED, absoluteUrl } from '@/lib/seo'
import { countryHubPath, leaguePagePath, teamPagePath, todayPagePath } from '@/lib/seo-copy'
import { fetchSeoCatalog, findLeague, findTeam } from '@/lib/seo-data'
import { LANDING_SPORTS, landingPath } from '@/lib/sport-landing'

export const revalidate = 3600

const LEGAL_PATHS = ['/legal/terms', '/legal/privacy', '/legal/disclaimer', '/legal/data-deletion']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!IS_INDEXING_ALLOWED) {
    return []
  }

  const now = new Date()
  const entries: MetadataRoute.Sitemap = []

  for (const option of LANGUAGE_OPTIONS) {
    entries.push({ url: absoluteUrl(`/${option.code}`), lastModified: now, changeFrequency: 'daily', priority: 1 })

    for (const path of LEGAL_PATHS) {
      entries.push({
        url: absoluteUrl(`/${option.code}${path}`),
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.2,
      })
    }

    for (const sport of LANDING_SPORTS) {
      entries.push({
        url: absoluteUrl(landingPath(option.code, sport)),
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.9,
      })
    }
  }

  try {
    const catalog = await fetchSeoCatalog()

    for (const country of catalog.countries) {
      entries.push({ url: absoluteUrl(countryHubPath(country)), lastModified: now, changeFrequency: 'daily', priority: 0.8 })
      entries.push({ url: absoluteUrl(todayPagePath(country)), lastModified: now, changeFrequency: 'hourly', priority: 0.8 })

      for (const slug of country.leagues) {
        const league = findLeague(catalog, slug)
        if (league) {
          entries.push({ url: absoluteUrl(leaguePagePath(country, league)), lastModified: now, changeFrequency: 'daily', priority: 0.7 })
        }
      }

      for (const slug of country.teams) {
        const team = findTeam(catalog, slug)
        if (team) {
          entries.push({ url: absoluteUrl(teamPagePath(country, team, 'time')), lastModified: now, changeFrequency: 'daily', priority: 0.9 })
          entries.push({ url: absoluteUrl(teamPagePath(country, team, 'next')), lastModified: now, changeFrequency: 'daily', priority: 0.7 })
        }
      }
    }
  } catch {
    // Catalog unavailable: ship the static entries only.
  }

  return entries
}
