import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { JsonLd } from '@/components/json-ld'
import { AlertsCta, Breadcrumbs, EventsSection, LinkGrid, eventsJsonLd } from '@/components/seo/seo-blocks'
import { absoluteUrl, createPageMetadata } from '@/lib/seo'
import { countryHubPath, countryPhrase, countryTimePhrase, leaguePagePath, nowLabel, todayPagePath } from '@/lib/seo-copy'
import { FEED_REVALIDATE_SECONDS, fetchSeoFeed, findLeague, resolveSeoContext } from '@/lib/seo-data'
import type { UpcomingFeed } from '@/lib/sports'

export const revalidate = FEED_REVALIDATE_SECONDS

type Params = { params: { lang: string; country: string } }

// The country's own league plus the global competitions everyone follows.
const TODAY_LEAGUES_PER_COUNTRY = 6

function mergeFeeds(feeds: Array<UpcomingFeed | null>): UpcomingFeed | null {
  const valid = feeds.filter((feed): feed is UpcomingFeed => Boolean(feed))
  const base = valid[0]
  if (!base) return null
  const dayMap = new Map<string, UpcomingFeed['days'][number]>()
  const seen = new Set<string>()

  for (const feed of valid) {
    for (const day of feed.days) {
      const existing = dayMap.get(day.dateKey) ?? { ...day, events: [] }
      for (const event of day.events) {
        if (!seen.has(event.id)) {
          seen.add(event.id)
          existing.events.push(event)
        }
      }
      dayMap.set(day.dateKey, existing)
    }
  }

  const days = Array.from(dayMap.values())
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
    .map((day) => ({ ...day, events: [...day.events].sort((a, b) => a.startsAt.localeCompare(b.startsAt)) }))

  return { ...base, days, totalEvents: days.reduce((sum, day) => sum + day.events.length, 0), highlights: [] }
}

async function load(countryCode: string) {
  const { catalog, country } = await resolveSeoContext(countryCode)
  if (!country) return null
  const leagues = country.leagues
    .slice(0, TODAY_LEAGUES_PER_COUNTRY)
    .map((slug) => findLeague(catalog, slug))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
  const feeds = await Promise.all(
    leagues.map((league) =>
      fetchSeoFeed({ leagueId: league.slug, leagueName: league.name, sport: league.sport, timeZone: country.timeZone, days: 2 }),
    ),
  )
  return { catalog, country, leagues, feed: mergeFeeds(feeds) }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  if (params.lang !== 'es') return {}
  const data = await load(params.country)
  if (!data) return {}
  const { country, feed } = data

  return createPageMetadata({
    title: `Partidos de hoy ${countryPhrase(country)}: horarios de fútbol y deportes`,
    description: `${feed?.totalEvents ?? 0} eventos hoy y mañana con hora de ${country.name}: fútbol, Champions, NBA, F1, UFC. Actualizado varias veces al día.`,
    path: todayPagePath(country),
    locale: 'es',
  })
}

export default async function TodayPage({ params }: Params) {
  if (params.lang !== 'es') notFound()
  const data = await load(params.country)
  if (!data) notFound()
  const { catalog, country, leagues, feed } = data
  const events = feed?.days.flatMap((day) => day.events) ?? []

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Breadcrumbs
        items={[
          { href: '/es', label: 'Trimry' },
          { href: countryHubPath(country), label: country.name },
          { href: todayPagePath(country), label: 'Partidos de hoy' },
        ]}
      />
      <header>
        <p className="tr-eyebrow">{nowLabel(country.timeZone)}</p>
        <h1 className="mt-2 text-3xl sm:text-5xl">Partidos de hoy {countryPhrase(country)}</h1>
        <p className="tr-copy mt-4 max-w-3xl text-lg">
          Lo que se juega hoy y mañana en {leagues.map((league) => league.name).join(', ')}, con {countryTimePhrase(country)}.
        </p>
      </header>

      <EventsSection title={`Agenda de hoy y mañana (${countryTimePhrase(country)})`} feed={feed} empty="Sin eventos confirmados para hoy." />

      <AlertsCta
        title="Esta agenda, cada mañana en tu WhatsApp"
        text="Solo tus equipos y ligas, en tu horario. Sin buscar en Google cada día."
        href="/activate"
      />

      <LinkGrid
        title="Calendarios completos"
        links={country.leagues
          .map((slug) => findLeague(catalog, slug))
          .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
          .map((league) => ({ href: leaguePagePath(country, league), label: league.name }))}
      />

      <JsonLd data={eventsJsonLd(events, absoluteUrl(todayPagePath(country)))} />
    </div>
  )
}
