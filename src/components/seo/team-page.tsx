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
  eventOpponent,
  eventTitle,
  langRoot,
  leagueDisplayName,
  leaguePagePath,
  nextEvent,
  seoCopy,
  teamDisplayName,
  teamGrammar,
  teamPagePath,
  whenPhrase,
} from '@/lib/seo-copy'
import type { TeamCtx, TeamIntent } from '@/lib/seo-copy/types'
import { fetchSeoFeed, findLeague, findTeam, resolveSeoContext } from '@/lib/seo-data'

async function loadTeamPage(countryCode: string, teamSlug: string) {
  const { catalog, country } = await resolveSeoContext(countryCode)
  const team = country && country.teams.includes(teamSlug) ? findTeam(catalog, teamSlug) : null

  if (!country || !team) {
    return null
  }

  const league = findLeague(catalog, team.leagueSlug)
  const feed = await fetchSeoFeed({
    locale: country.language,
    teamId: team.slug,
    teamName: team.name,
    sport: team.sport,
    leagueName: league?.name,
    timeZone: country.timeZone,
    days: 14,
  })

  const upcoming = nextEvent(feed)
  const events = feed?.days.flatMap((day) => day.events) ?? []
  const ctx: TeamCtx = {
    g: teamGrammar(team, country),
    country,
    timePhrase: countryTimePhrase(country),
    leagueName: league ? leagueDisplayName(league, country.language) : null,
    upcoming,
    when: whenPhrase(upcoming, country),
    opponent: upcoming ? eventOpponent(upcoming, team) : null,
    eventTitle: upcoming ? eventTitle(upcoming, country.language) : null,
    eventsCount: events.length,
  }

  return { catalog, country, team, league, feed, events, ctx }
}

export async function teamPageMetadata(
  countryCode: string,
  teamSlug: string,
  intent: TeamIntent,
): Promise<Metadata> {
  const data = await loadTeamPage(countryCode, teamSlug)

  if (!data) {
    return {}
  }

  const { country, team, ctx } = data
  const copy = seoCopy(country.language).team

  return createPageMetadata({
    title: copy.metaTitle(intent, ctx),
    description: copy.metaDescription(intent, ctx),
    path: teamPagePath(country, team, intent),
    locale: country.language,
    keywords: copy.keywords(ctx),
  })
}

export async function TeamPage({
  countryCode,
  teamSlug,
  intent,
}: {
  countryCode: string
  teamSlug: string
  intent: TeamIntent
}) {
  const data = await loadTeamPage(countryCode, teamSlug)

  if (!data) {
    notFound()
  }

  const { catalog, country, team, league, feed, events, ctx } = data
  const lang = country.language
  const copy = seoCopy(lang)
  const ui = copy.ui(country)
  const pagePath = teamPagePath(country, team, intent)
  const otherIntentPath = teamPagePath(country, team, intent === 'time' ? 'next' : 'time')
  const siblingTeams = country.teams
    .filter((slug) => slug !== team.slug)
    .map((slug) => findTeam(catalog, slug))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .filter((entry) => entry.leagueSlug === team.leagueSlug)
    .slice(0, 8)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Breadcrumbs
        items={[
          { href: langRoot(country), label: ui.home },
          { href: countryHubPath(country), label: country.name },
          ...(league && ctx.leagueName ? [{ href: leaguePagePath(country, league), label: ctx.leagueName }] : []),
          { href: pagePath, label: ctx.g.name },
        ]}
      />

      <header>
        <p className="tr-eyebrow">
          {ctx.leagueName ?? ui.calendar} · {country.name}
        </p>
        <h1 className="mt-2 text-3xl sm:text-5xl">{copy.team.h1(intent, ctx)}</h1>
        <p className="tr-copy mt-4 max-w-3xl text-lg">{copy.team.intro(intent, ctx)}</p>
      </header>

      <NextEventCard
        event={ctx.upcoming}
        timeZoneLabel={ctx.timePhrase}
        eyebrow={intent === 'time' ? ui.nextMatch : ui.nextInCalendar}
        country={country}
      />

      <AlertsCta
        title={copy.team.ctaTitle(ctx)}
        text={copy.team.ctaText(ctx)}
        href={`/activate?teamId=${encodeURIComponent(team.slug)}&teamName=${encodeURIComponent(team.name)}&sport=${team.sport}${league ? `&leagueName=${encodeURIComponent(league.name)}` : ''}`}
        country={country}
      />

      <EventsSection title={copy.team.eventsTitle(ctx)} feed={feed} empty={copy.team.eventsEmpty(ctx)} />

      <FaqSection items={copy.team.faq(ctx)} country={country} />

      <LinkGrid
        title={ui.moreAboutTeam}
        links={[
          { href: otherIntentPath, label: copy.team.otherIntentLabel(intent, ctx) },
          ...(league && ctx.leagueName
            ? [{ href: leaguePagePath(country, league), label: copy.team.calendarLink(ctx.leagueName) }]
            : []),
          { href: countryHubPath(country), label: copy.team.countryLink(country) },
        ]}
      />

      <LinkGrid
        title={copy.team.othersTitle(ctx.leagueName)}
        links={siblingTeams.map((entry) => ({
          href: teamPagePath(country, entry, intent),
          label: teamDisplayName(entry, lang),
        }))}
      />

      <p className="tr-meta text-xs">{ui.source}</p>

      <JsonLd data={eventsJsonLd(events, absoluteUrl(pagePath), lang)} />
    </div>
  )
}
