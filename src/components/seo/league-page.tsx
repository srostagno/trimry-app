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
  countryTimePhrase,
  eventTitle,
  isDomesticLeague,
  langRoot,
  leagueDisplayName,
  leaguePagePath,
  nextEvent,
  seoCopy,
  teamGrammar,
  teamPagePath,
  whenPhrase,
} from '@/lib/seo-copy'
import type { LeagueCtx } from '@/lib/seo-copy/types'
import { fetchSeoFeed, findLeague, findTeam, resolveSeoContext } from '@/lib/seo-data'

const TEAM_SPORTS = new Set(['soccer', 'basketball', 'american_football', 'baseball', 'ice_hockey', 'rugby', 'cricket', 'volleyball', 'handball'])

async function load(countryCode: string, leagueSlug: string) {
  const { catalog, country } = await resolveSeoContext(countryCode)
  const league = country && country.leagues.includes(leagueSlug) ? findLeague(catalog, leagueSlug) : null

  if (!country || !league) {
    return null
  }

  const feed = await fetchSeoFeed({
    locale: country.language,
    leagueId: league.slug,
    leagueName: league.name,
    sport: league.sport,
    timeZone: country.timeZone,
    days: 14,
  })
  const upcoming = nextEvent(feed)
  const events = feed?.days.flatMap((day) => day.events) ?? []
  const ctx: LeagueCtx = {
    name: leagueDisplayName(league, country.language),
    teamSport: TEAM_SPORTS.has(league.sport),
    country,
    timePhrase: countryTimePhrase(country),
    domestic: isDomesticLeague(league, country),
    upcoming,
    when: whenPhrase(upcoming, country),
    eventTitle: upcoming ? eventTitle(upcoming, country.language) : null,
    eventsCount: events.length,
  }

  return { catalog, country, league, feed, events, ctx }
}

export async function leaguePageMetadata(countryCode: string, leagueSlug: string): Promise<Metadata> {
  const data = await load(countryCode, leagueSlug)
  if (!data) return {}
  const { country, league, ctx } = data
  const copy = seoCopy(country.language).league

  return createPageMetadata({
    title: copy.metaTitle(ctx),
    description: copy.metaDescription(ctx),
    path: leaguePagePath(country, league),
    locale: country.language,
    keywords: copy.keywords(ctx),
  })
}

export async function LeaguePage({ countryCode, leagueSlug }: { countryCode: string; leagueSlug: string }) {
  const data = await load(countryCode, leagueSlug)
  if (!data) notFound()

  const { catalog, country, league, feed, events, ctx } = data
  const lang = country.language
  const copy = seoCopy(lang)
  const ui = copy.ui(country)
  const pagePath = leaguePagePath(country, league)
  const teams = country.teams
    .map((slug) => findTeam(catalog, slug))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .filter((entry) => entry.leagueSlug === league.slug)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Breadcrumbs
        items={[
          { href: langRoot(country), label: ui.home },
          { href: countryHubPath(country), label: country.name },
          { href: pagePath, label: ctx.name },
        ]}
      />
      <header>
        <p className="tr-eyebrow">
          {ui.calendar} · {country.name}
        </p>
        <h1 className="mt-2 text-3xl sm:text-5xl">{copy.league.h1(ctx)}</h1>
        <p className="tr-copy mt-4 max-w-3xl text-lg">{copy.league.intro(ctx)}</p>
      </header>

      <NextEventCard event={ctx.upcoming} timeZoneLabel={ctx.timePhrase} eyebrow={ui.nextEvent} country={country} />

      <AlertsCta
        title={copy.league.ctaTitle(ctx)}
        text={copy.league.ctaText(ctx)}
        href={`/activate?leagueId=${encodeURIComponent(league.slug)}&leagueName=${encodeURIComponent(league.name)}&sport=${league.sport}`}
        country={country}
      />

      <EventsSection title={copy.league.eventsTitle(ctx)} feed={feed} empty={copy.league.eventsEmpty(ctx)} />

      <FaqSection items={copy.league.faq(ctx)} country={country} />

      <LinkGrid
        title={copy.league.teamsTitle(ctx)}
        links={teams.map((team) => ({
          href: teamPagePath(country, team, 'time'),
          label: copy.league.teamLink(teamGrammar(team, country)),
        }))}
      />

      <LinkGrid
        title={copy.league.moreTitle(ctx)}
        links={country.leagues
          .filter((slug) => slug !== league.slug)
          .map((slug) => findLeague(catalog, slug))
          .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
          .slice(0, 10)
          .map((entry) => ({ href: leaguePagePath(country, entry), label: leagueDisplayName(entry, lang) }))}
      />

      <JsonLd data={eventsJsonLd(events, absoluteUrl(pagePath), lang)} />
    </div>
  )
}
