import type { FeedEvent, UpcomingFeed } from '@/lib/sports'
import type { SeoCountry, SeoLanguage, SeoLeague, SeoTeam } from '@/lib/seo-data'

// Copy and grammar helpers for the programmatic pages. Every market has one
// language (es or pt); the URL intents are localized per language.

export type Intent = 'time' | 'next' | 'calendar' | 'today'

export const SEO_INTENTS: Record<SeoLanguage, Record<Intent, string>> = {
  es: { time: 'a-que-hora-juega', next: 'proximo-partido', calendar: 'calendario', today: 'partidos-hoy' },
  pt: { time: 'que-horas-joga', next: 'proximo-jogo', calendar: 'calendario', today: 'jogos-de-hoje' },
}

export function intentFromSlug(language: SeoLanguage, slug: string): Intent | null {
  const entries = Object.entries(SEO_INTENTS[language]) as Array<[Intent, string]>
  return entries.find(([, value]) => value === slug)?.[0] ?? null
}

export function teamDisplayName(team: SeoTeam, language: SeoLanguage = 'es') {
  if (language === 'pt' && team.ptName) return team.ptName
  return team.shortName ?? team.name
}

export function leagueDisplayName(league: SeoLeague, language: SeoLanguage = 'es') {
  if (language === 'pt' && league.ptName) return league.ptName
  return league.name
}

// US franchises are plural ("los Lakers juegan" / "os Lakers jogam"); clubs
// and national teams are singular ("el Real Madrid juega", "Chile juega").
export function teamIsPlural(team: SeoTeam) {
  return team.sport !== 'soccer' && /s$/i.test(team.shortName ?? team.name)
}

const PT_FEMININE_NATIONAL = new Set(['argentina', 'colômbia', 'espanha', 'colombia', 'espana'])

// Grammar bundle for a team in a given language.
export type TeamGrammar = {
  name: string
  verb: string // juega / juegan / joga / jogam
  withArticle: string // el Real Madrid / la U / los Lakers / Chile / o Flamengo / a Argentina
  of: string // del Real Madrid / de la U / de los Lakers / de Chile / do Flamengo / da Argentina
  to: string // al Real Madrid / a la U / a los Lakers / a Chile / ao Flamengo / à Argentina
}

export function teamGrammar(team: SeoTeam, language: SeoLanguage): TeamGrammar {
  const name = teamDisplayName(team, language)
  const plural = teamIsPlural(team)

  if (language === 'pt') {
    const verb = plural ? 'jogam' : 'joga'
    if (team.national) {
      const feminine = PT_FEMININE_NATIONAL.has(name.toLowerCase())
      return {
        name,
        verb,
        withArticle: `${feminine ? 'a' : 'o'} ${name}`,
        of: `${feminine ? 'da' : 'do'} ${name}`,
        to: `${feminine ? 'à' : 'ao'} ${name}`,
      }
    }
    if (plural) return { name, verb, withArticle: `os ${name}`, of: `dos ${name}`, to: `aos ${name}` }
    return { name, verb, withArticle: `o ${name}`, of: `do ${name}`, to: `ao ${name}` }
  }

  const verb = plural ? 'juegan' : 'juega'
  if (team.national) return { name, verb, withArticle: name, of: `de ${name}`, to: `a ${name}` }
  if (/^el /i.test(name)) {
    const rest = name.slice(3)
    return { name, verb, withArticle: name, of: `del ${rest}`, to: `al ${rest}` }
  }
  if (/^(la|los|las) /i.test(name)) return { name, verb, withArticle: name, of: `de ${name}`, to: `a ${name}` }
  if (plural) return { name, verb, withArticle: `los ${name}`, of: `de los ${name}`, to: `a los ${name}` }
  if (/^(selecci|universidad)/i.test(name)) {
    return { name, verb, withArticle: `la ${name}`, of: `de la ${name}`, to: `a la ${name}` }
  }
  return { name, verb, withArticle: `el ${name}`, of: `del ${name}`, to: `al ${name}` }
}

export function countryPhrase(country: SeoCountry) {
  return country.language === 'pt' ? `no ${country.name}` : `en ${country.name}`
}

export function countryTimePhrase(country: SeoCountry) {
  return country.language === 'pt' ? `horário de Brasília` : `hora de ${country.name}`
}

export function countryOfPhrase(country: SeoCountry) {
  // "de Chile" / "do Brasil"
  return country.language === 'pt' ? `do ${country.name}` : `de ${country.name}`
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

export function formatLongDate(dateKey: string, language: SeoLanguage = 'es') {
  return new Intl.DateTimeFormat(language === 'pt' ? 'pt-BR' : 'es', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${dateKey}T12:00:00Z`))
}

export function nowLabel(timeZone: string, language: SeoLanguage = 'es') {
  return new Intl.DateTimeFormat(language === 'pt' ? 'pt-BR' : 'es', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone,
  }).format(new Date())
}

// "pela Copa Libertadores" / "pelo Brasileirão": Portuguese gender of a league name.
export function ptByLeague(leagueName: string) {
  const feminine = /^(copa|liga|s[ée]rie|premier|champions|europa|uefa|bundesliga|laliga|nba|nfl|mlb|elimina|ligue|eredivisie|primeira|mls|conmebol)/i.test(
    leagueName.trim(),
  )
  return `${feminine ? 'pela' : 'pelo'} ${leagueName}`
}

// "a las 21:00" / "às 21:00"
export function atTime(event: FeedEvent, language: SeoLanguage) {
  if (!event.localTimeLabel) return ''
  return language === 'pt' ? ` às ${event.localTimeLabel}` : ` a las ${event.localTimeLabel}`
}

// Static UI strings per language.
export const SEO_TEXT = {
  es: {
    home: 'Trimry',
    faqTitle: 'Preguntas frecuentes',
    ctaButton: 'Avísame por WhatsApp →',
    noEventsCard: 'Sin partidos confirmados en los próximos 14 días.',
    noEventsHint: 'Actualizamos el calendario varias veces al día; activa las alertas y te avisamos apenas se publique la fecha.',
    timeTbc: 'Hora por confirmar',
    nextMatch: 'Próximo partido',
    nextInCalendar: 'Siguiente en el calendario',
    nextEvent: 'Próximo evento',
    calendar: 'Calendario',
    schedules: 'Horarios',
    teams: 'Equipos',
    leagues: 'Ligas y competiciones',
    fullCalendars: 'Calendarios completos',
    moreAboutTeam: 'Más sobre este equipo',
    todayLabel: 'Partidos de hoy',
    source:
      'Fuente: calendarios oficiales de las competiciones, verificados con búsqueda web asistida por IA y actualizados varias veces al día. Los horarios pueden cambiar; confirma con el canal oficial antes de un partido.',
  },
  pt: {
    home: 'Trimry',
    faqTitle: 'Perguntas frequentes',
    ctaButton: 'Me avise no WhatsApp →',
    noEventsCard: 'Sem jogos confirmados nos próximos 14 dias.',
    noEventsHint: 'Atualizamos o calendário várias vezes por dia; ative os alertas e avisamos assim que a data for publicada.',
    timeTbc: 'Horário a confirmar',
    nextMatch: 'Próximo jogo',
    nextInCalendar: 'Próximo no calendário',
    nextEvent: 'Próximo evento',
    calendar: 'Calendário',
    schedules: 'Horários',
    teams: 'Times',
    leagues: 'Ligas e competições',
    fullCalendars: 'Calendários completos',
    moreAboutTeam: 'Mais sobre este time',
    todayLabel: 'Jogos de hoje',
    source:
      'Fonte: calendários oficiais das competições, verificados com busca na web assistida por IA e atualizados várias vezes por dia. Os horários podem mudar; confirme no canal oficial antes do jogo.',
  },
} as const

export function seoText(language: SeoLanguage) {
  return SEO_TEXT[language]
}
