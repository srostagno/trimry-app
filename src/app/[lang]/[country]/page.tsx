import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Breadcrumbs, LinkGrid, AlertsCta } from '@/components/seo/seo-blocks'
import { createPageMetadata } from '@/lib/seo'
import {
  countryHubPath,
  countryOfPhrase,
  countryPhrase,
  langRoot,
  leagueDisplayName,
  leaguePagePath,
  seoText,
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
  const lang = country.language

  return createPageMetadata({
    title:
      lang === 'pt'
        ? `Horários de jogos ${countryPhrase(country)}: que horas joga o seu time?`
        : `Horarios de partidos ${countryPhrase(country)}: ¿a qué hora juega tu equipo?`,
    description:
      lang === 'pt'
        ? `Horário exato dos jogos dos times e ligas mais acompanhados ${countryPhrase(country)}, no horário local, com alertas no WhatsApp.`
        : `Hora exacta de los partidos de los equipos y ligas más seguidos ${countryPhrase(country)}, en horario local, con alertas por WhatsApp.`,
    path: countryHubPath(country),
    locale: lang,
  })
}

export default async function CountryHubPage({ params }: Params) {
  const { catalog, country } = await resolveSeoContext(params.country)
  if (!country || country.language !== params.lang) notFound()
  const lang = country.language
  const t = seoText(lang)

  const teams = country.teams
    .map((slug) => findTeam(catalog, slug))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
  const leagues = country.leagues
    .map((slug) => findLeague(catalog, slug))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Breadcrumbs items={[{ href: langRoot(country), label: t.home }, { href: countryHubPath(country), label: country.name }]} />
      <header>
        <p className="tr-eyebrow">
          {t.schedules} · {country.name}
        </p>
        <h1 className="mt-2 text-3xl sm:text-5xl">
          {lang === 'pt'
            ? `Que horas joga o seu time ${countryPhrase(country)}?`
            : `¿A qué hora juega tu equipo ${countryPhrase(country)}?`}
        </h1>
        <p className="tr-copy mt-4 max-w-3xl text-lg">
          {lang === 'pt'
            ? `Horários dos próximos jogos convertidos para o horário ${countryOfPhrase(country)}, atualizados várias vezes por dia. Escolha seu time ou competição.`
            : `Horarios de los próximos partidos convertidos a la hora ${countryOfPhrase(country)}, actualizados varias veces al día. Elige tu equipo o competición.`}
        </p>
        <Link href={todayPagePath(country)} className="tr-btn-secondary mt-5">
          {t.todayLabel} {countryPhrase(country)} →
        </Link>
      </header>

      <LinkGrid
        title={t.teams}
        links={teams.map((team) => ({ href: teamPagePath(country, team, 'time'), label: teamDisplayName(team, lang) }))}
      />
      <LinkGrid
        title={t.leagues}
        links={leagues.map((league) => ({ href: leaguePagePath(country, league), label: leagueDisplayName(league, lang) }))}
      />

      <AlertsCta
        title={lang === 'pt' ? 'Sua agenda esportiva toda manhã no WhatsApp' : 'Tu agenda deportiva cada mañana por WhatsApp'}
        text={
          lang === 'pt'
            ? `Siga seus times e ligas e o Trimry avisa o que tem jogo hoje e a que horas, no horário ${countryOfPhrase(country)}.`
            : `Sigue tus equipos y ligas y Trimry te avisa qué se juega hoy y a qué hora, en horario ${countryOfPhrase(country)}.`
        }
        href="/activate"
        language={lang}
      />
    </div>
  )
}
