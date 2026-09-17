import type { FeedEvent, UpcomingFeed } from '@/lib/sports'
import type { SeoCountry, SeoLanguage, SeoLeague, SeoTeam } from '@/lib/seo-data'
import { esCopy } from '@/lib/seo-copy/es'
import { ptCopy } from '@/lib/seo-copy/pt'
import { enCopy } from '@/lib/seo-copy/en'
import type { SeoCopy } from '@/lib/seo-copy/types'

// Language-agnostic helpers for the programmatic pages. Every market has one
// language (es, pt or en); the URL intents and the copy are localized per language.

export type Intent = 'time' | 'next' | 'calendar' | 'today' | 'match'

export const SEO_INTENTS: Record<SeoLanguage, Record<Intent, string>> = {
  es: { time: 'a-que-hora-juega', next: 'proximo-partido', calendar: 'calendario', today: 'partidos-hoy', match: 'partido' },
  pt: { time: 'horario-do-jogo', next: 'proximo-jogo', calendar: 'calendario', today: 'jogos-de-hoje', match: 'jogo' },
  en: { time: 'game-time', next: 'next-game', calendar: 'schedule', today: 'games-today', match: 'game' },
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

export function matchPagePath(country: SeoCountry, slug: string) {
  return `/${country.language}/${country.code}/${SEO_INTENTS[country.language].match}/${slug}`
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

// The provider returns the round in English ("Matchweek 8", "Quarter-finals
// (2nd leg)"). Translate the handful of shapes it actually uses so Spanish and
// Portuguese pages do not mix languages.
const ROUND_RULES: Array<{ match: RegExp; es: string; pt: string }> = [
  { match: /^(matchweek|match week|week|matchday|round)\s*(\d+)/i, es: 'Jornada $2', pt: 'Rodada $2' },
  { match: /round\s*of\s*16/i, es: 'Octavos de final', pt: 'Oitavas de final' },
  { match: /round\s*of\s*32/i, es: 'Dieciseisavos de final', pt: '16 avos de final' },
  { match: /quarter[-\s]?finals?/i, es: 'Cuartos de final', pt: 'Quartas de final' },
  { match: /semi[-\s]?finals?/i, es: 'Semifinal', pt: 'Semifinal' },
  { match: /^final$/i, es: 'Final', pt: 'Final' },
  { match: /third\s*round/i, es: 'Tercera ronda', pt: 'Terceira fase' },
  { match: /second\s*round/i, es: 'Segunda ronda', pt: 'Segunda fase' },
  { match: /first\s*round/i, es: 'Primera ronda', pt: 'Primeira fase' },
  { match: /group\s*stage/i, es: 'Fase de grupos', pt: 'Fase de grupos' },
  { match: /group\s*([a-h])\b/i, es: 'Grupo $1', pt: 'Grupo $1' },
  { match: /playoffs?/i, es: 'Playoffs', pt: 'Playoffs' },
]

export function localizeRound(round: string | null, language: SeoLanguage) {
  if (!round || language === 'en') return round

  let localized = round.trim()

  for (const rule of ROUND_RULES) {
    if (rule.match.test(localized)) {
      localized = localized.replace(rule.match, language === 'pt' ? rule.pt : rule.es)
      break
    }
  }

  // Leg markers can appear alongside any of the above.
  localized = localized
    .replace(/\(?\s*1st leg\s*\)?/i, language === 'pt' ? '(ida)' : '(ida)')
    .replace(/\(?\s*2nd leg\s*\)?/i, language === 'pt' ? '(volta)' : '(vuelta)')

  return localized.replace(/\s+/g, ' ').trim()
}

// Local clock label of a fixture in the market's zone: 24h for es/pt, 12h for en.
export function matchTimeLabel(startsAt: string, country: SeoCountry, timeKnown: boolean) {
  if (!timeKnown) return null
  try {
    return new Intl.DateTimeFormat(country.language === 'en' ? 'en-US' : 'es-CL', {
      // 12h clocks read "6:40 PM", not "06:40 PM".
      hour: country.language === 'en' ? 'numeric' : '2-digit',
      minute: '2-digit',
      hour12: country.language === 'en',
      timeZone: country.timeZone,
    }).format(new Date(startsAt))
  } catch {
    return null
  }
}

export function matchLocalDateKey(startsAt: string, country: SeoCountry) {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: country.timeZone,
    }).formatToParts(new Date(startsAt))
    const get = (type: string) => parts.find((part) => part.type === type)?.value ?? ''
    return `${get('year')}-${get('month')}-${get('day')}`
  } catch {
    return startsAt.slice(0, 10)
  }
}

// 'today' / 'tomorrow' relative to the market's own calendar day, else null.
export function matchDayRelative(startsAt: string, country: SeoCountry): 'today' | 'tomorrow' | null {
  const target = matchLocalDateKey(startsAt, country)
  const today = matchLocalDateKey(new Date().toISOString(), country)
  if (target === today) return 'today'
  const tomorrow = matchLocalDateKey(new Date(Date.now() + 86_400_000).toISOString(), country)
  return target === tomorrow ? 'tomorrow' : null
}

// "viernes, 25 de septiembre a las 20:00" for the next event, or ''.
export function whenPhrase(event: FeedEvent | null, country: SeoCountry) {
  if (!event) return ''
  return `${formatLongDate(event.localDateKey, country)}${atTime(event, country.language)}`
}
