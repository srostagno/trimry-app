import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { JsonLd } from '@/components/json-ld'
import { AlertsCta, Breadcrumbs, EventsSection, LinkGrid, eventsJsonLd } from '@/components/seo/seo-blocks'
import { absoluteUrl, createPageMetadata } from '@/lib/seo'
import {
  countryHubPath,
  countryTimePhrase,
  langRoot,
  leagueDisplayName,
  leaguePagePath,
  nowLabel,
  seoCopy,
  todayPagePath,
} from '@/lib/seo-copy'
import type { TodayCtx } from '@/lib/seo-copy/types'
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
  const feed = mergeFeeds(feeds)
  const ctx: TodayCtx = {
    country,
    timePhrase: countryTimePhrase(country),
    leagueNames: leagues.map((league) => leagueDisplayName(league, country.language)).join(', '),
    eventsCount: feed?.totalEvents ?? 0,
  }
  return { catalog, country, leagues, feed, ctx }
}

export async function todayPageMetadata(countryCode: string): Promise<Metadata> {
  const data = await load(countryCode)
  if (!data) return {}
  const { country, ctx } = data
  const copy = seoCopy(country.language).today

  return createPageMetadata({
    title: copy.metaTitle(ctx),
    description: copy.metaDescription(ctx),
    path: todayPagePath(country),
    locale: country.language,
  })
}

export async function TodayPage({ countryCode }: { countryCode: string }) {
  const data = await load(countryCode)
  if (!data) notFound()
  const { catalog, country, feed, ctx } = data
  const lang = country.language
  const copy = seoCopy(lang)
  const ui = copy.ui(country)
  const events = feed?.days.flatMap((day) => day.events) ?? []

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Breadcrumbs
        items={[
          { href: langRoot(country), label: ui.home },
          { href: countryHubPath(country), label: country.name },
          { href: todayPagePath(country), label: ui.todayLabel },
        ]}
      />
      <header>
        <p className="tr-eyebrow">{nowLabel(country)}</p>
        <h1 className="mt-2 text-3xl sm:text-5xl">{copy.today.h1(ctx)}</h1>
        <p className="tr-copy mt-4 max-w-3xl text-lg">{copy.today.intro(ctx)}</p>
      </header>

      <EventsSection title={copy.today.eventsTitle(ctx)} feed={feed} empty={copy.today.eventsEmpty(ctx)} />

      <AlertsCta title={copy.today.ctaTitle(ctx)} text={copy.today.ctaText(ctx)} href="/activate" country={country} />

      <LinkGrid
        title={ui.fullCalendars}
        links={country.leagues
          .map((slug) => findLeague(catalog, slug))
          .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
          .map((league) => ({ href: leaguePagePath(country, league), label: leagueDisplayName(league, lang) }))}
      />

      <JsonLd data={eventsJsonLd(events, absoluteUrl(todayPagePath(country)), lang)} />
    </div>
  )
}
