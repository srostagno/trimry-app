import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Breadcrumbs, LinkGrid, AlertsCta } from '@/components/seo/seo-blocks'
import { createPageMetadata } from '@/lib/seo'
import {
  countryHubPath,
  countryPhrase,
  langRoot,
  leagueDisplayName,
  leaguePagePath,
  seoCopy,
  teamDisplayName,
  teamPagePath,
  todayPagePath,
} from '@/lib/seo-copy'
import { findLeague, findTeam, resolveSeoContext } from '@/lib/seo-data'

export const revalidate = 3600

type Params = { params: { lang: string; country: string } }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { country } = await resolveSeoContext(params.country)
  if (!country || country.language !== params.lang) return {}
  const copy = seoCopy(country.language).hub
  const ctx = { country }

  return createPageMetadata({
    title: copy.metaTitle(ctx),
    description: copy.metaDescription(ctx),
    path: countryHubPath(country),
    locale: country.language,
  })
}

export default async function CountryHubPage({ params }: Params) {
  const { catalog, country } = await resolveSeoContext(params.country)
  if (!country || country.language !== params.lang) notFound()
  const lang = country.language
  const copy = seoCopy(lang)
  const ui = copy.ui(country)
  const ctx = { country }

  const teams = country.teams
    .map((slug) => findTeam(catalog, slug))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
  const leagues = country.leagues
    .map((slug) => findLeague(catalog, slug))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Breadcrumbs items={[{ href: langRoot(country), label: ui.home }, { href: countryHubPath(country), label: country.name }]} />
      <header>
        <p className="tr-eyebrow">
          {ui.schedules} · {country.name}
        </p>
        <h1 className="mt-2 text-3xl sm:text-5xl">{copy.hub.h1(ctx)}</h1>
        <p className="tr-copy mt-4 max-w-3xl text-lg">{copy.hub.intro(ctx)}</p>
        <Link href={todayPagePath(country)} className="tr-btn-secondary mt-5">
          {ui.todayLabel} {countryPhrase(country)} →
        </Link>
      </header>

      <LinkGrid
        title={ui.teams}
        links={teams.map((team) => ({ href: teamPagePath(country, team, 'time'), label: teamDisplayName(team, lang) }))}
      />
      <LinkGrid
        title={ui.leagues}
        links={leagues.map((league) => ({ href: leaguePagePath(country, league), label: leagueDisplayName(league, lang) }))}
      />

      <AlertsCta title={copy.hub.ctaTitle(ctx)} text={copy.hub.ctaText(ctx)} href="/activate" country={country} />
    </div>
  )
}
