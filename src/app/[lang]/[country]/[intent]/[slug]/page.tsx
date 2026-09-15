import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { LeaguePage, leaguePageMetadata } from '@/components/seo/league-page'
import { MatchPage, matchPageMetadata } from '@/components/seo/match-page'
import { TeamPage, teamPageMetadata } from '@/components/seo/team-page'
import { intentFromSlug } from '@/lib/seo-copy'
import { FEED_REVALIDATE_SECONDS, resolveSeoContext } from '@/lib/seo-data'

export const revalidate = FEED_REVALIDATE_SECONDS

type Params = { params: { lang: string; country: string; intent: string; slug: string } }

// /es/cl/a-que-hora-juega/colo-colo, /es/cl/proximo-partido/colo-colo,
// /es/cl/calendario/primera-division-de-chile, /es/cl/partido/<fixture>
// and their Portuguese and English twins.
async function resolve(params: Params['params']) {
  const { country } = await resolveSeoContext(params.country)
  if (!country || country.language !== params.lang) return null
  const intent = intentFromSlug(country.language, params.intent)
  if (intent !== 'time' && intent !== 'next' && intent !== 'calendar' && intent !== 'match') return null
  return { country, intent }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const resolved = await resolve(params)
  if (!resolved) return {}
  const { country, intent } = resolved
  if (intent === 'calendar') return leaguePageMetadata(country.code, params.slug)
  if (intent === 'match') return matchPageMetadata(country.code, params.slug)
  return teamPageMetadata(country.code, params.slug, intent)
}

export default async function Page({ params }: Params) {
  const resolved = await resolve(params)
  if (!resolved) notFound()
  const { country, intent } = resolved
  if (intent === 'calendar') {
    return <LeaguePage countryCode={country.code} leagueSlug={params.slug} />
  }

  if (intent === 'match') {
    return <MatchPage countryCode={country.code} slug={params.slug} />
  }

  return <TeamPage countryCode={country.code} teamSlug={params.slug} intent={intent} />
}
