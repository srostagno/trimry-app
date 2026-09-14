import type { FeedEvent, UpcomingFeed } from '@/lib/sports'
import type { SeoCountry, SeoLeague, SeoTeam } from '@/lib/seo-data'

// Spanish copy and helpers for the programmatic pages.

export const SEO_INTENTS = {
  time: 'a-que-hora-juega',
  next: 'proximo-partido',
  calendar: 'calendario',
  today: 'partidos-hoy',
} as const

export function teamDisplayName(team: SeoTeam) {
  return team.shortName ?? team.name
}

// US franchises are plural in Spanish ("los Lakers juegan"); clubs and national
// teams are singular ("el Real Madrid juega", "Chile juega").
export function teamIsPlural(team: SeoTeam) {
  return team.sport !== 'soccer' && /s$/i.test(teamDisplayName(team))
}

export function teamVerb(team: SeoTeam) {
  return teamIsPlural(team) ? 'juegan' : 'juega'
}

export function teamArticle(team: SeoTeam) {
  // "el Real Madrid", "la U", "los Lakers", "Chile"
  const name = teamDisplayName(team)
  if (/^(el|la|los|las) /i.test(name)) return ''
  if (team.national) return ''
  if (teamIsPlural(team)) return 'los '
  if (/^(selecci|universidad)/i.test(name)) return 'la '
  return 'el '
}

// "al Real Madrid", "a la U", "a los Lakers", "a Chile"
export function toTeam(team: SeoTeam) {
  const article = teamArticle(team)
  const name = teamDisplayName(team)
  if (article === 'el ') return `al ${name}`
  if (/^el /i.test(name)) return `al ${name.slice(3)}`
  return `a ${article}${name}`.replace(/\s+/g, ' ')
}

export function withArticle(team: SeoTeam) {
  return `${teamArticle(team)}${teamDisplayName(team)}`.trim()
}

// "del Real Madrid", "de la U", "de la Selección de Chile", "de Chile"
export function ofTeam(team: SeoTeam) {
  const article = teamArticle(team)
  const name = teamDisplayName(team)
  if (article === 'el ') return `del ${name}`
  if (/^el /i.test(name)) return `del ${name.slice(3)}`
  return `de ${article}${name}`.replace(/\s+/g, ' ')
}

export function countryPhrase(country: SeoCountry) {
  return `en ${country.name}`
}

export function countryTimePhrase(country: SeoCountry) {
  return `hora de ${country.name}`
}

export function teamPagePath(country: SeoCountry, team: SeoTeam, intent: 'time' | 'next') {
  return `/es/${country.code}/${SEO_INTENTS[intent]}/${team.slug}`
}

export function leaguePagePath(country: SeoCountry, league: SeoLeague) {
  return `/es/${country.code}/${SEO_INTENTS.calendar}/${league.slug}`
}

export function countryHubPath(country: SeoCountry) {
  return `/es/${country.code}`
}

export function todayPagePath(country: SeoCountry) {
  return `/es/${country.code}/${SEO_INTENTS.today}`
}

export function nextEvent(feed: UpcomingFeed | null): FeedEvent | null {
  if (!feed) return null
  for (const day of feed.days) {
    const event = day.events.find((entry) => entry.status !== 'finished' && entry.status !== 'canceled')
    if (event) return event
  }
  return null
}

export function eventOpponent(event: FeedEvent, team: SeoTeam) {
  if (!event.homeTeamName || !event.awayTeamName) return null
  const home = event.homeTeamId === team.slug
  return home ? event.awayTeamName : event.homeTeamName
}

export function eventTitle(event: FeedEvent) {
  return event.homeTeamName && event.awayTeamName
    ? `${event.homeTeamName} vs ${event.awayTeamName}`
    : event.name
}

export function formatLongDate(dateKey: string) {
  return new Intl.DateTimeFormat('es', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${dateKey}T12:00:00Z`))
}

export function nowLabel(timeZone: string) {
  return new Intl.DateTimeFormat('es', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone,
  }).format(new Date())
}
