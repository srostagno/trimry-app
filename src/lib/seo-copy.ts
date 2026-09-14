import type { FeedEvent, UpcomingFeed } from '@/lib/sports'
import type { SeoCountry, SeoLanguage, SeoLeague, SeoTeam } from '@/lib/seo-data'
import { esCopy } from '@/lib/seo-copy/es'
import { ptCopy } from '@/lib/seo-copy/pt'
import { enCopy } from '@/lib/seo-copy/en'
import type { SeoCopy } from '@/lib/seo-copy/types'

// Language-agnostic helpers for the programmatic pages. Every market has one
// language (es, pt or en); the URL intents and the copy are localized per language.

export type Intent = 'time' | 'next' | 'calendar' | 'today'

export const SEO_INTENTS: Record<SeoLanguage, Record<Intent, string>> = {
  es: { time: 'a-que-hora-juega', next: 'proximo-partido', calendar: 'calendario', today: 'partidos-hoy' },
  pt: { time: 'que-horas-joga', next: 'proximo-jogo', calendar: 'calendario', today: 'jogos-de-hoje' },
  en: { time: 'game-time', next: 'next-game', calendar: 'schedule', today: 'games-today' },
}

const COPY: Record<SeoLanguage, SeoCopy> = { es: esCopy, pt: ptCopy, en: enCopy }

export function seoCopy(language: SeoLanguage): SeoCopy {
  return COPY[language]
}

export function intentFromSlug(language: SeoLanguage, slug: string): Intent | null {
  const entries = Object.entries(SEO_INTENTS[language]) as Array<[Intent, string]>
  return entries.find(([, value]) => value === slug)?.[0] ?? null
}

export function teamDisplayName(team: SeoTeam, language: SeoLanguage = 'es') {
  if (language === 'pt' && team.ptName) return team.ptName
  if (language === 'en' && team.enName) return team.enName
  return team.shortName ?? team.name
}

export function leagueDisplayName(league: SeoLeague, language: SeoLanguage = 'es') {
  if (language === 'pt' && league.ptName) return league.ptName
  return league.name
}

export function isDomesticLeague(league: SeoLeague, country: SeoCountry) {
  return league.countryCode ? league.countryCode === country.code : league.country === country.name
}

// US franchises are plural in Spanish/Portuguese ("los Lakers juegan"); clubs and
// national teams are singular ("el Real Madrid juega", "Chile juega").
export function teamIsPlural(team: SeoTeam) {
  return team.sport !== 'soccer' && /s$/i.test(team.shortName ?? team.name)
}

const PT_FEMININE_NATIONAL = new Set(['argentina', 'colômbia', 'espanha', 'colombia', 'espana'])

// Grammar bundle for a team in a given language.
export type TeamGrammar = {
  name: string
  verb: string // juega / juegan / joga / jogam / play / plays
  aux: string // English only: do / does
  withArticle: string // el Real Madrid / la U / los Lakers / Chile / o Flamengo / the Cowboys / Arsenal
  of: string // del Real Madrid / de la U / do Flamengo / da Argentina (es, pt)
  to: string // al Real Madrid / a la U / ao Flamengo / à Argentina (es, pt)
  possessive: string // English only: the Cowboys' / Arsenal's / Inter Miami's
}

export function teamGrammar(team: SeoTeam, country: SeoCountry): TeamGrammar {
  const language = country.language
  const name = teamDisplayName(team, language)
  const plural = teamIsPlural(team)

  if (language === 'en') {
    // North American franchises are always "the X" and take a plural verb
    // ("the Heat play"); British English also treats clubs as plural.
    const franchise = team.sport !== 'soccer'
    const pluralVerb = franchise || country.code === 'uk' || /s$/i.test(name)
    const withArticle = franchise || name === 'USA' ? `the ${name}` : name
    const possessive = /s$/i.test(name) ? `${withArticle}'` : `${withArticle}'s`
    return {
      name,
      verb: pluralVerb ? 'play' : 'plays',
      aux: pluralVerb ? 'do' : 'does',
      withArticle,
      of: `of ${withArticle}`,
      to: withArticle,
      possessive,
    }
  }

  if (language === 'pt') {
    const verb = plural ? 'jogam' : 'joga'
    if (team.national) {
      const feminine = PT_FEMININE_NATIONAL.has(name.toLowerCase())
      const art = feminine ? 'a' : 'o'
      return {
        name,
        verb,
        aux: '',
        withArticle: `${art} ${name}`,
        of: `${feminine ? 'da' : 'do'} ${name}`,
        to: `${feminine ? 'à' : 'ao'} ${name}`,
        possessive: `${feminine ? 'da' : 'do'} ${name}`,
      }
    }
    if (plural) return { name, verb, aux: '', withArticle: `os ${name}`, of: `dos ${name}`, to: `aos ${name}`, possessive: `dos ${name}` }
    return { name, verb, aux: '', withArticle: `o ${name}`, of: `do ${name}`, to: `ao ${name}`, possessive: `do ${name}` }
  }

  const verb = plural ? 'juegan' : 'juega'
  const es = (withArticle: string, of: string, to: string): TeamGrammar => ({
    name,
    verb,
    aux: '',
    withArticle,
    of,
    to,
    possessive: of,
  })
  if (team.national) return es(name, `de ${name}`, `a ${name}`)
  if (/^el /i.test(name)) {
    const rest = name.slice(3)
    return es(name, `del ${rest}`, `al ${rest}`)
  }
  if (/^(la|los|las) /i.test(name)) return es(name, `de ${name}`, `a ${name}`)
  if (plural) return es(`los ${name}`, `de los ${name}`, `a los ${name}`)
  if (/^(selecci|universidad)/i.test(name)) return es(`la ${name}`, `de la ${name}`, `a la ${name}`)
  return es(`el ${name}`, `del ${name}`, `al ${name}`)
}

// "en Chile" / "no Brasil" / "in the US"
export function countryPhrase(country: SeoCountry) {
  if (country.language === 'pt') return `no ${country.name}`
  if (country.language === 'en') return `in the ${country.demonym}`
  return `en ${country.name}`
}

// "hora de Chile" / "horário de Brasília" / "ET" / "UK time"
export function countryTimePhrase(country: SeoCountry) {
  if (country.language === 'pt') return 'horário de Brasília'
  if (country.language === 'en') return country.code === 'us' ? 'ET' : 'UK time'
  return `hora de ${country.name}`
}

// "de Chile" / "do Brasil" / "US"
export function countryOfPhrase(country: SeoCountry) {
  if (country.language === 'pt') return `do ${country.name}`
  if (country.language === 'en') return country.demonym
  return `de ${country.name}`
}

export function langRoot(country: SeoCountry) {
  return `/${country.language}`
}

export function teamPagePath(country: SeoCountry, team: SeoTeam, intent: 'time' | 'next') {
  return `/${country.language}/${country.code}/${SEO_INTENTS[country.language][intent]}/${team.slug}`
}

export function leaguePagePath(country: SeoCountry, league: SeoLeague) {
  return `/${country.language}/${country.code}/${SEO_INTENTS[country.language].calendar}/${league.slug}`
}

export function countryHubPath(country: SeoCountry) {
  return `/${country.language}/${country.code}`
}

export function todayPagePath(country: SeoCountry) {
  return `/${country.language}/${country.code}/${SEO_INTENTS[country.language].today}`
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

export function eventTitle(event: FeedEvent, language: SeoLanguage = 'es') {
  return event.homeTeamName && event.awayTeamName
    ? `${event.homeTeamName} ${language === 'pt' ? 'x' : 'vs'} ${event.awayTeamName}`
    : event.name
}

function dateLocale(country: SeoCountry) {
  if (country.language === 'pt') return 'pt-BR'
  if (country.language === 'en') return country.code === 'uk' ? 'en-GB' : 'en-US'
  return 'es'
}

export function formatLongDate(dateKey: string, country: SeoCountry) {
  return new Intl.DateTimeFormat(dateLocale(country), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${dateKey}T12:00:00Z`))
}

export function nowLabel(country: SeoCountry) {
  return new Intl.DateTimeFormat(dateLocale(country), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: country.timeZone,
  }).format(new Date())
}

// "a las 21:00" / "às 21:00" / "at 8:30 PM"
export function atTime(event: FeedEvent, language: SeoLanguage) {
  if (!event.localTimeLabel) return ''
  if (language === 'pt') return ` às ${event.localTimeLabel}`
  if (language === 'en') return ` at ${event.localTimeLabel}`
  return ` a las ${event.localTimeLabel}`
}

// "viernes, 25 de septiembre a las 20:00" for the next event, or ''.
export function whenPhrase(event: FeedEvent | null, country: SeoCountry) {
  if (!event) return ''
  return `${formatLongDate(event.localDateKey, country)}${atTime(event, country.language)}`
}
