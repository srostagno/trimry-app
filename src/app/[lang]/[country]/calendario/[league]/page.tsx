import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { JsonLd } from '@/components/json-ld'
import {
  AlertsCta,
  Breadcrumbs,
  EventsSection,
  FaqSection,
  LinkGrid,
  NextEventCard,
  eventsJsonLd,
} from '@/components/seo/seo-blocks'
import { absoluteUrl, createPageMetadata } from '@/lib/seo'
import {
  countryHubPath,
  countryPhrase,
  countryTimePhrase,
  eventTitle,
  formatLongDate,
  leaguePagePath,
  nextEvent,
  teamDisplayName,
  teamPagePath,
} from '@/lib/seo-copy'
import { FEED_REVALIDATE_SECONDS, fetchSeoFeed, findLeague, findTeam, resolveSeoContext } from '@/lib/seo-data'

export const revalidate = FEED_REVALIDATE_SECONDS

type Params = { params: { lang: string; country: string; league: string } }

async function load(countryCode: string, leagueSlug: string) {
  const { catalog, country } = await resolveSeoContext(countryCode)
  const league = country && country.leagues.includes(leagueSlug) ? findLeague(catalog, leagueSlug) : null

  if (!country || !league) {
    return null
  }

  const feed = await fetchSeoFeed({
    leagueId: league.slug,
    leagueName: league.name,
    sport: league.sport,
    timeZone: country.timeZone,
    days: 14,
  })

  return { catalog, country, league, feed }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  if (params.lang !== 'es') return {}
  const data = await load(params.country, params.league)
  if (!data) return {}
  const { country, league, feed } = data
  const count = feed?.totalEvents ?? 0

  return createPageMetadata({
    title: `Calendario ${league.name}${league.country === country.name ? '' : ` ${countryPhrase(country)}`}: horarios y próximos partidos`,
    description: `${count > 0 ? `${count} eventos de ${league.name} en los próximos 14 días` : `Calendario de ${league.name}`} con hora de ${country.name}. Fixture actualizado y alertas por WhatsApp.`,
    path: leaguePagePath(country, league),
    locale: 'es',
    keywords: [`calendario ${league.name.toLowerCase()}`, `horario ${league.name.toLowerCase()} ${country.name.toLowerCase()}`, `partidos ${league.name.toLowerCase()}`],
  })
}

export default async function LeaguePage({ params }: Params) {
  if (params.lang !== 'es') notFound()
  const data = await load(params.country, params.league)
  if (!data) notFound()

  const { catalog, country, league, feed } = data
  const upcoming = nextEvent(feed)
  const events = feed?.days.flatMap((day) => day.events) ?? []
  const pagePath = leaguePagePath(country, league)
  const timePhrase = countryTimePhrase(country)
  const teams = country.teams
    .map((slug) => findTeam(catalog, slug))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .filter((entry) => entry.leagueSlug === league.slug)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Breadcrumbs
        items={[
          { href: '/es', label: 'Trimry' },
          { href: countryHubPath(country), label: country.name },
          { href: pagePath, label: league.name },
        ]}
      />
      <header>
        <p className="tr-eyebrow">Calendario · {country.name}</p>
        <h1 className="mt-2 text-3xl sm:text-5xl">
          Calendario {league.name}{league.country === country.name ? '' : ` ${countryPhrase(country)}`}
        </h1>
        <p className="tr-copy mt-4 max-w-3xl text-lg">
          {upcoming
            ? `El próximo evento de ${league.name} es ${eventTitle(upcoming)}, ${formatLongDate(upcoming.localDateKey)}${upcoming.localTimeLabel ? ` a las ${upcoming.localTimeLabel}` : ''} (${timePhrase}). Aquí tienes todos los partidos de los próximos 14 días en horario de ${country.name}.`
            : `No hay eventos confirmados de ${league.name} en los próximos 14 días. Cuando se publiquen aparecerán aquí en horario de ${country.name}.`}
        </p>
      </header>

      <NextEventCard event={upcoming} timeZoneLabel={timePhrase} eyebrow="Próximo evento" />

      <AlertsCta
        title={`Recibe la agenda de ${league.name} cada mañana`}
        text={`Sigue ${league.name} en Trimry y te llega por WhatsApp o email lo que se juega hoy, en horario de ${country.name}.`}
        href={`/activate?leagueId=${encodeURIComponent(league.slug)}&leagueName=${encodeURIComponent(league.name)}&sport=${league.sport}`}
      />

      <EventsSection
        title={`Próximos 14 días de ${league.name} (${timePhrase})`}
        feed={feed}
        empty={`Sin eventos confirmados de ${league.name} en los próximos 14 días.`}
      />

      <FaqSection
        items={[
          {
            question: `¿A qué hora se juega ${league.name} ${countryPhrase(country)}?`,
            answer: upcoming
              ? `El próximo evento es ${eventTitle(upcoming)}, ${formatLongDate(upcoming.localDateKey)}${upcoming.localTimeLabel ? ` a las ${upcoming.localTimeLabel}` : ''} (${timePhrase}). Cada partido tiene su horario en la lista de arriba.`
              : `No hay eventos programados en los próximos 14 días. Trimry actualiza el calendario varias veces al día.`,
          },
          {
            question: `¿Cómo sigo el calendario de ${league.name} sin perderme partidos?`,
            answer: `Activa las alertas de Trimry: eliges ${league.name} (y tus equipos) y recibes cada mañana los partidos del día por WhatsApp o email, con la hora de ${country.name}.`,
          },
        ]}
      />

      <LinkGrid
        title={`Equipos de ${league.name}`}
        links={teams.map((team) => ({
          href: teamPagePath(country, team, 'time'),
          label: `¿A qué hora juega ${teamDisplayName(team)}?`,
        }))}
      />

      <LinkGrid
        title={`Más calendarios ${countryPhrase(country)}`}
        links={country.leagues
          .filter((slug) => slug !== league.slug)
          .map((slug) => findLeague(catalog, slug))
          .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
          .slice(0, 10)
          .map((entry) => ({ href: leaguePagePath(country, entry), label: entry.name }))}
      />

      <JsonLd data={eventsJsonLd(events, absoluteUrl(pagePath))} />
    </div>
  )
}
