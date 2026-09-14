import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Breadcrumbs, LinkGrid, AlertsCta } from '@/components/seo/seo-blocks'
import { createPageMetadata } from '@/lib/seo'
import { countryHubPath, countryPhrase, leaguePagePath, teamDisplayName, teamPagePath, todayPagePath } from '@/lib/seo-copy'
import { findLeague, findTeam, resolveSeoContext } from '@/lib/seo-data'

export const revalidate = 3600

type Params = { params: { lang: string; country: string } }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  if (params.lang !== 'es') return {}
  const { country } = await resolveSeoContext(params.country)
  if (!country) return {}

  return createPageMetadata({
    title: `Horarios de partidos ${countryPhrase(country)}: ¿a qué hora juega tu equipo?`,
    description: `Hora exacta de los partidos de los equipos y ligas más seguidos ${countryPhrase(country)}, en horario local, con alertas por WhatsApp.`,
    path: countryHubPath(country),
    locale: 'es',
  })
}

export default async function CountryHubPage({ params }: Params) {
  if (params.lang !== 'es') notFound()
  const { catalog, country } = await resolveSeoContext(params.country)
  if (!country) notFound()

  const teams = country.teams
    .map((slug) => findTeam(catalog, slug))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
  const leagues = country.leagues
    .map((slug) => findLeague(catalog, slug))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Breadcrumbs items={[{ href: '/es', label: 'Trimry' }, { href: countryHubPath(country), label: country.name }]} />
      <header>
        <p className="tr-eyebrow">Horarios · {country.name}</p>
        <h1 className="mt-2 text-3xl sm:text-5xl">¿A qué hora juega tu equipo {countryPhrase(country)}?</h1>
        <p className="tr-copy mt-4 max-w-3xl text-lg">
          Horarios de los próximos partidos convertidos a la hora de {country.name}, actualizados varias veces
          al día. Elige tu equipo o competición.
        </p>
        <Link href={todayPagePath(country)} className="tr-btn-secondary mt-5">
          Partidos de hoy {countryPhrase(country)} →
        </Link>
      </header>

      <LinkGrid
        title="Equipos"
        links={teams.map((team) => ({ href: teamPagePath(country, team, 'time'), label: teamDisplayName(team) }))}
      />
      <LinkGrid
        title="Ligas y competiciones"
        links={leagues.map((league) => ({ href: leaguePagePath(country, league), label: league.name }))}
      />

      <AlertsCta
        title="Tu agenda deportiva cada mañana por WhatsApp"
        text={`Sigue tus equipos y ligas y Trimry te avisa qué se juega hoy y a qué hora, en horario de ${country.name}.`}
        href="/activate"
      />
    </div>
  )
}
