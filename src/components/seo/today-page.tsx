import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { JsonLd } from '@/components/json-ld'
import { AlertsCta, Breadcrumbs, EventsSection, LinkGrid, eventsJsonLd } from '@/components/seo/seo-blocks'
import { absoluteUrl, createPageMetadata } from '@/lib/seo'
import {
  countryHubPath,
  countryOfPhrase,
  countryPhrase,
  countryTimePhrase,
  langRoot,
  leagueDisplayName,
  leaguePagePath,
  nowLabel,
  seoText,
  todayPagePath,
} from '@/lib/seo-copy'
import { fetchSeoFeed, findLeague, resolveSeoContext } from '@/lib/seo-data'
import type { UpcomingFeed } from '@/lib/sports'

// The country's own league(s) plus the global competitions everyone follows.
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
      fetchSeoFeed({
        locale: country.language,
        leagueId: league.slug,
        leagueName: league.name,
        sport: league.sport,
        timeZone: country.timeZone,
        days: 2,
      }),
    ),
  )
  return { catalog, country, leagues, feed: mergeFeeds(feeds) }
}

export async function todayPageMetadata(countryCode: string): Promise<Metadata> {
  const data = await load(countryCode)
  if (!data) return {}
  const { country, feed } = data
  const lang = country.language
  const count = feed?.totalEvents ?? 0

  return createPageMetadata({
    title:
      lang === 'pt'
        ? `Jogos de hoje ${countryPhrase(country)}: horários de futebol e esportes`
        : `Partidos de hoy ${countryPhrase(country)}: horarios de fútbol y deportes`,
    description:
      lang === 'pt'
        ? `${count} jogos hoje e amanhã no ${countryTimePhrase(country)}: Brasileirão, Libertadores, Champions, NBA, F1, UFC. Atualizado várias vezes por dia.`
        : `${count} eventos hoy y mañana con hora ${countryOfPhrase(country)}: fútbol, Champions, NBA, F1, UFC. Actualizado varias veces al día.`,
    path: todayPagePath(country),
    locale: lang,
  })
}

export async function TodayPage({ countryCode }: { countryCode: string }) {
  const data = await load(countryCode)
  if (!data) notFound()
  const { catalog, country, leagues, feed } = data
  const lang = country.language
  const t = seoText(lang)
  const events = feed?.days.flatMap((day) => day.events) ?? []
  const timePhrase = countryTimePhrase(country)
  const leagueNames = leagues.map((league) => leagueDisplayName(league, lang)).join(', ')

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Breadcrumbs
        items={[
          { href: langRoot(country), label: t.home },
          { href: countryHubPath(country), label: country.name },
          { href: todayPagePath(country), label: t.todayLabel },
        ]}
      />
      <header>
        <p className="tr-eyebrow">{nowLabel(country.timeZone, lang)}</p>
        <h1 className="mt-2 text-3xl sm:text-5xl">
          {t.todayLabel} {countryPhrase(country)}
        </h1>
        <p className="tr-copy mt-4 max-w-3xl text-lg">
          {lang === 'pt'
            ? `O que tem jogo hoje e amanhã em ${leagueNames}, no ${timePhrase}.`
            : `Lo que se juega hoy y mañana en ${leagueNames}, con ${timePhrase}.`}
        </p>
      </header>

      <EventsSection
        title={lang === 'pt' ? `Agenda de hoje e amanhã (${timePhrase})` : `Agenda de hoy y mañana (${timePhrase})`}
        feed={feed}
        empty={lang === 'pt' ? 'Sem jogos confirmados para hoje.' : 'Sin eventos confirmados para hoy.'}
      />

      <AlertsCta
        title={lang === 'pt' ? 'Esta agenda, toda manhã no seu WhatsApp' : 'Esta agenda, cada mañana en tu WhatsApp'}
        text={
          lang === 'pt'
            ? 'Só seus times e ligas, no seu horário. Sem procurar no Google todo dia.'
            : 'Solo tus equipos y ligas, en tu horario. Sin buscar en Google cada día.'
        }
        href="/activate"
        language={lang}
      />

      <LinkGrid
        title={t.fullCalendars}
        links={country.leagues
          .map((slug) => findLeague(catalog, slug))
          .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
          .map((league) => ({ href: leaguePagePath(country, league), label: leagueDisplayName(league, lang) }))}
      />

      <JsonLd data={eventsJsonLd(events, absoluteUrl(todayPagePath(country)), lang)} />
    </div>
  )
}
