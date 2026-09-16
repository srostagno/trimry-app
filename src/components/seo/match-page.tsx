import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import { JsonLd } from '@/components/json-ld'
import { AlertsCta, Breadcrumbs, FaqSection, LinkGrid } from '@/components/seo/seo-blocks'
import { absoluteUrl, createPageMetadata } from '@/lib/seo'
import {
  countryHubPath,
  countryTimePhrase,
  formatLongDate,
  langRoot,
  localizeRound,
  matchDayRelative,
  matchLocalDateKey,
  matchPagePath,
  matchTimeLabel,
  seoCopy,
  teamDisplayName,
  teamGrammar,
  teamPagePath,
} from '@/lib/seo-copy'
import type { MatchCtx } from '@/lib/seo-copy/types'
import { fetchSeoMatches, findTeam, resolveSeoContext, type SeoMatch } from '@/lib/seo-data'

const MAX_RELATED = 10

async function load(countryCode: string, slug: string) {
  const [{ catalog, country }, matches] = await Promise.all([
    resolveSeoContext(countryCode),
    fetchSeoMatches(countryCode),
  ])

  if (!country) {
    return null
  }

  const match = matches.find((entry) => entry.slug === slug)

  if (!match) {
    return null
  }

  const lang = country.language
  const timeLabel = matchTimeLabel(match.startsAt, country, match.timeKnown)
  const localDateKey = matchLocalDateKey(match.startsAt, country)
  const dateLabel = formatLongDate(localDateKey, country)
  const atTime = timeLabel ? (lang === 'pt' ? ` às ${timeLabel}` : lang === 'en' ? ` at ${timeLabel}` : ` a las ${timeLabel}`) : ''
  // Short names only when both sides are in the catalog: "Reds vs Dodgers"
  // reads fine, "Cincinnati Reds vs Dodgers" does not.
  const homeTeam = findTeam(catalog, match.homeTeamId)
  const awayTeam = findTeam(catalog, match.awayTeamId)
  const useShortNames = Boolean(homeTeam && awayTeam)
  const ctx: MatchCtx = {
    country,
    home: useShortNames && homeTeam ? teamDisplayName(homeTeam, lang) : match.homeTeamName,
    away: useShortNames && awayTeam ? teamDisplayName(awayTeam, lang) : match.awayTeamName,
    leagueName: match.leagueName,
    timePhrase: countryTimePhrase(country),
    when: `${dateLabel}${atTime}`,
    dateLabel,
    timeLabel,
    venue: match.venue,
    round: localizeRound(match.round, lang),
    dayRelative: matchDayRelative(match.startsAt, country),
  }

  return { catalog, country, match, matches, ctx }
}

// A fixture also leaves the cache when it is postponed or rescheduled, not only
// when it is played. Middleware already sends clearly expired slugs to the team
// page with a 308; anything else missing gets a temporary redirect, because the
// fixture may come back under the same slug.
async function missingMatchTarget(countryCode: string, slug: string) {
  const { catalog, country } = await resolveSeoContext(countryCode)

  if (!country) {
    return null
  }

  const homeTeamId = /^(.+?)-vs-/.exec(slug)?.[1]
  const team = homeTeamId ? findTeam(catalog, homeTeamId) : null

  return team && country.teams.includes(team.slug)
    ? teamPagePath(country, team, 'time')
    : countryHubPath(country)
}

export async function matchPageMetadata(countryCode: string, slug: string): Promise<Metadata> {
  const data = await load(countryCode, slug)

  if (!data) {
    return {}
  }

  const { country, match, ctx } = data
  const copy = seoCopy(country.language).match

  return createPageMetadata({
    title: copy.metaTitle(ctx),
    description: copy.metaDescription(ctx),
    path: matchPagePath(country, match.slug),
    locale: country.language,
    keywords: copy.keywords(ctx),
  })
}

function eventJsonLd(match: SeoMatch, pageUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `${match.homeTeamName} vs ${match.awayTeamName}`,
    startDate: match.startsAt,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    ...(match.venue ? { location: { '@type': 'Place', name: match.venue } } : {}),
    homeTeam: { '@type': 'SportsTeam', name: match.homeTeamName },
    awayTeam: { '@type': 'SportsTeam', name: match.awayTeamName },
    competitor: [
      { '@type': 'SportsTeam', name: match.homeTeamName },
      { '@type': 'SportsTeam', name: match.awayTeamName },
    ],
    organizer: { '@type': 'Organization', name: match.leagueName },
    url: pageUrl,
  }
}

export async function MatchPage({ countryCode, slug }: { countryCode: string; slug: string }) {
  const data = await load(countryCode, slug)

  if (!data) {
    const target = await missingMatchTarget(countryCode, slug)

    if (!target) {
      notFound()
    }

    redirect(target)
  }

  const { catalog, country, match, matches, ctx } = data
  const lang = country.language
  const copy = seoCopy(lang)
  const ui = copy.ui(country)
  const pagePath = matchPagePath(country, match.slug)
  const related = matches.filter((entry) => entry.slug !== match.slug).slice(0, MAX_RELATED)
  // Both sides of the fixture that exist in the catalog get a team-page link.
  const teamLinks = [match.homeTeamId, match.awayTeamId]
    .map((teamSlug) => findTeam(catalog, teamSlug))
    .filter((team): team is NonNullable<typeof team> => Boolean(team))
    .filter((team) => country.teams.includes(team.slug))

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Breadcrumbs
        items={[
          { href: langRoot(country), label: ui.home },
          { href: countryHubPath(country), label: country.name },
          { href: pagePath, label: `${ctx.home} ${lang === 'pt' ? 'x' : 'vs'} ${ctx.away}` },
        ]}
      />

      <header>
        <p className="tr-eyebrow">{copy.match.eyebrow(ctx)}</p>
        <h1 className="mt-2 text-3xl sm:text-5xl">{copy.match.h1(ctx)}</h1>
        <p className="tr-copy mt-4 max-w-3xl text-lg">{copy.match.intro(ctx)}</p>
      </header>

      <div className="tr-gradient-panel p-6 sm:p-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-white/80">
          {ctx.dateLabel}
        </p>
        <p className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">
          {ctx.timeLabel ?? ui.timeTbc}
          <span className="ml-3 text-base font-semibold text-white/85">{ctx.timePhrase}</span>
        </p>
        <p className="mt-3 text-xl font-bold">
          {ctx.home} {lang === 'pt' ? 'x' : 'vs'} {ctx.away}
        </p>
        <p className="mt-1 text-sm text-white/90">
          {ctx.leagueName}
          {ctx.round ? ` · ${ctx.round}` : ''}
          {ctx.venue ? ` · ${ctx.venue}` : ''}
        </p>
      </div>

      <AlertsCta
        title={copy.match.ctaTitle(ctx)}
        text={copy.match.ctaText(ctx)}
        href={`/activate?teamId=${encodeURIComponent(match.homeTeamId)}&teamName=${encodeURIComponent(match.homeTeamName)}&sport=${match.sport}&leagueName=${encodeURIComponent(match.leagueName)}`}
        country={country}
      />

      <FaqSection items={copy.match.faq(ctx)} country={country} />

      <LinkGrid
        title={copy.match.teamLinksTitle(ctx)}
        links={teamLinks.map((team) => ({
          href: teamPagePath(country, team, 'time'),
          label: copy.league.teamLink(teamGrammar(team, country)),
        }))}
      />

      <LinkGrid
        title={copy.match.otherMatchesTitle(ctx)}
        links={related.map((entry) => {
          const label = `${entry.homeTeamName} ${lang === 'pt' ? 'x' : 'vs'} ${entry.awayTeamName}`
          return { href: matchPagePath(country, entry.slug), label }
        })}
      />

      <p className="tr-meta text-xs">{ui.source}</p>

      <JsonLd data={eventJsonLd(match, absoluteUrl(pagePath))} />
    </div>
  )
}
