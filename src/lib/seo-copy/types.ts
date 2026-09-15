import type { FeedEvent } from '@/lib/sports'
import type { SeoCountry } from '@/lib/seo-data'
import type { TeamGrammar } from '@/lib/seo-copy'

// One implementation per language (es, pt, en). Pages stay language-free and
// only call into this interface.

export type TeamIntent = 'time' | 'next'

export type TeamCtx = {
  g: TeamGrammar
  country: SeoCountry
  timePhrase: string // "hora de Chile" / "horário de Brasília" / "ET"
  leagueName: string | null
  upcoming: FeedEvent | null
  when: string // localized "friday, 25 september at 8:00 PM" or ''
  opponent: string | null
  eventTitle: string | null // title of the upcoming event
  eventsCount: number
}

export type LeagueCtx = {
  name: string
  teamSport: boolean // false for golf, tennis, motorsport, fighting
  country: SeoCountry
  timePhrase: string
  domestic: boolean
  upcoming: FeedEvent | null
  when: string
  eventTitle: string | null
  eventsCount: number
}

export type MatchCtx = {
  country: SeoCountry
  home: string
  away: string
  leagueName: string
  timePhrase: string
  when: string // "viernes, 25 de septiembre a las 20:00"
  dateLabel: string
  timeLabel: string | null
  venue: string | null
  round: string | null
  dayRelative: 'today' | 'tomorrow' | null
}

export type TodayCtx = {
  country: SeoCountry
  timePhrase: string
  leagueNames: string
  eventsCount: number
}

export type HubCtx = {
  country: SeoCountry
}

export type Faq = { question: string; answer: string }

export type UiStrings = {
  home: string
  faqTitle: string
  ctaButton: string
  noEventsCard: string
  noEventsHint: string
  timeTbc: string
  nextMatch: string
  nextInCalendar: string
  nextEvent: string
  calendar: string
  schedules: string
  teams: string
  leagues: string
  fullCalendars: string
  moreAboutTeam: string
  todayLabel: string
  source: string
}

export type SeoCopy = {
  ui(country: SeoCountry): UiStrings
  team: {
    metaTitle(intent: TeamIntent, c: TeamCtx): string
    metaDescription(intent: TeamIntent, c: TeamCtx): string
    keywords(c: TeamCtx): string[]
    h1(intent: TeamIntent, c: TeamCtx): string
    intro(intent: TeamIntent, c: TeamCtx): string
    faq(c: TeamCtx): Faq[]
    ctaTitle(c: TeamCtx): string
    ctaText(c: TeamCtx): string
    eventsTitle(c: TeamCtx): string
    eventsEmpty(c: TeamCtx): string
    otherIntentLabel(intent: TeamIntent, c: TeamCtx): string
    calendarLink(leagueName: string): string
    countryLink(country: SeoCountry): string
    othersTitle(leagueName: string | null): string
  }
  league: {
    metaTitle(c: LeagueCtx): string
    metaDescription(c: LeagueCtx): string
    keywords(c: LeagueCtx): string[]
    h1(c: LeagueCtx): string
    intro(c: LeagueCtx): string
    faq(c: LeagueCtx): Faq[]
    ctaTitle(c: LeagueCtx): string
    ctaText(c: LeagueCtx): string
    eventsTitle(c: LeagueCtx): string
    eventsEmpty(c: LeagueCtx): string
    teamsTitle(c: LeagueCtx): string
    teamLink(g: TeamGrammar): string
    moreTitle(c: LeagueCtx): string
  }
  match: {
    metaTitle(c: MatchCtx): string
    metaDescription(c: MatchCtx): string
    keywords(c: MatchCtx): string[]
    h1(c: MatchCtx): string
    intro(c: MatchCtx): string
    faq(c: MatchCtx): Faq[]
    ctaTitle(c: MatchCtx): string
    ctaText(c: MatchCtx): string
    eyebrow(c: MatchCtx): string
    otherMatchesTitle(c: MatchCtx): string
    teamLinksTitle(c: MatchCtx): string
  }
  today: {
    metaTitle(c: TodayCtx): string
    metaDescription(c: TodayCtx): string
    h1(c: TodayCtx): string
    intro(c: TodayCtx): string
    eventsTitle(c: TodayCtx): string
    eventsEmpty(c: TodayCtx): string
    ctaTitle(c: TodayCtx): string
    ctaText(c: TodayCtx): string
  }
  hub: {
    metaTitle(c: HubCtx): string
    metaDescription(c: HubCtx): string
    h1(c: HubCtx): string
    intro(c: HubCtx): string
    ctaTitle(c: HubCtx): string
    ctaText(c: HubCtx): string
  }
}
