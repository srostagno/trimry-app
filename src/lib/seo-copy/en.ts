import type { SeoCountry } from '@/lib/seo-data'
import type { SeoCopy } from '@/lib/seo-copy/types'

const cap = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)
const inCountry = (country: SeoCountry) => `in the ${country.demonym}`

// US and UK vocabulary: game/schedule vs match/fixtures.
function words(country: SeoCountry) {
  const uk = country.code === 'uk'
  return {
    game: uk ? 'match' : 'game',
    games: uk ? 'matches' : 'games',
    Game: uk ? 'Match' : 'Game',
    Games: uk ? 'Matches' : 'Games',
    schedule: uk ? 'fixtures' : 'schedule',
    Schedule: uk ? 'Fixtures' : 'Schedule',
    kickoff: uk ? 'kick-off time' : 'game time',
    timeNote: uk ? 'UK time' : 'ET',
    timeNoteLong: uk ? 'UK time' : 'Eastern Time (ET)',
    sports: uk ? 'Premier League, F1, tennis, golf and more' : 'NFL, NBA, MLB, NHL and more',
  }
}

export const enCopy: SeoCopy = {
  ui: (country) => {
    const w = words(country)
    return {
      home: 'Trimry',
      faqTitle: 'Frequently asked questions',
      ctaButton: 'Alert me on WhatsApp →',
      noEventsCard: `No confirmed ${w.games} in the next 14 days.`,
      noEventsHint: `We refresh the ${w.schedule} several times a day. Turn on alerts and we'll message you as soon as a date is published.`,
      timeTbc: 'Time TBD',
      nextMatch: `Next ${w.game}`,
      nextInCalendar: `Next on the ${w.schedule}`,
      nextEvent: 'Next event',
      calendar: w.Schedule,
      schedules: `${w.Game} times`,
      teams: 'Teams',
      leagues: 'Leagues and competitions',
      fullCalendars: `Full ${w.schedule}`,
      moreAboutTeam: 'More on this team',
      todayLabel: `${w.Games} today`,
      source:
        `Source: official competition ${w.schedule}, verified with AI-assisted web search and refreshed several times a day. Times can change; confirm with the official channel before a ${w.game}.`,
    }
  },

  team: {
    metaTitle: (intent, c) => {
      const w = words(c.country)
      return intent === 'time'
        ? `What time ${c.g.aux} ${c.g.withArticle} play today? ${cap(w.kickoff)} ${inCountry(c.country)}`
        : `${cap(c.g.possessive)} next ${w.game}: date, time and opponent`
    },
    metaDescription: (intent, c) => {
      const w = words(c.country)
      return intent === 'time'
        ? `Exact time of ${c.g.possessive} next ${w.game}${c.when ? `: ${c.when}` : ''} (${w.timeNote}). Updated ${w.schedule} and WhatsApp alerts so you never miss it.`
        : `${cap(c.g.possessive)} next ${w.game}${c.when ? ` is ${c.when}` : ''} (${w.timeNote}). Full 14-day ${w.schedule} and a WhatsApp reminder.`
    },
    keywords: (c) => {
      const n = c.g.name.toLowerCase()
      const w = words(c.country)
      return [`what time do the ${n} play`, `${n} ${w.game} time`, `${n} next ${w.game}`, `when do the ${n} play`, `${n} ${w.schedule}`]
    },
    h1: (intent, c) =>
      intent === 'time'
        ? `What time ${c.g.aux} ${c.g.withArticle} play?`
        : `${cap(c.g.possessive)} next ${words(c.country).game}`,
    intro: (intent, c) => {
      const w = words(c.country)
      if (intent === 'time') {
        return c.upcoming
          ? `${cap(c.g.withArticle)} ${c.g.verb} ${c.when} (${w.timeNote})${c.opponent ? ` against ${c.opponent}` : ''} in the ${c.upcoming.leagueName}. Below: the full ${w.schedule} for the next 14 days, all times ${c.timePhrase}.`
          : `There is no confirmed date yet for ${c.g.possessive} next ${w.game}. As soon as it's published it will show up here in ${w.timeNoteLong}.`
      }
      return c.upcoming
        ? `${cap(c.g.possessive)} next ${w.game} is ${c.eventTitle}, ${c.when} (${w.timeNote}), in the ${c.upcoming.leagueName}. ${Math.max(c.eventsCount - 1, 0)} more ${w.games} follow over the next two weeks.`
        : `No confirmed ${w.games} for ${c.g.withArticle} in the next 14 days. Check the ${c.leagueName ?? 'competition'} ${w.schedule} or turn on alerts to hear as soon as they're published.`
    },
    faq: (c) => {
      const w = words(c.country)
      return [
        {
          question: `What time ${c.g.aux} ${c.g.withArticle} play today ${inCountry(c.country)}?`,
          answer: c.upcoming
            ? `${cap(c.g.withArticle)} ${c.g.verb} ${c.when}${c.upcoming.localTimeLabel ? ` (${w.timeNote})` : ' (time to be confirmed)'}${c.opponent ? ` against ${c.opponent}` : ''} in the ${c.upcoming.leagueName}.`
            : `There is no ${c.g.name} ${w.game} scheduled today or in the next 14 days according to the official ${w.schedule}.`,
        },
        {
          question: `When is ${c.g.possessive} next ${w.game}?`,
          answer: c.upcoming
            ? `${c.eventTitle}, ${c.when}${c.upcoming.venue ? ` at ${c.upcoming.venue}` : ''}.`
            : `Not confirmed yet. Trimry checks the ${w.schedule} several times a day and messages you on WhatsApp once it's published.`,
        },
        {
          question: `How do I get ${c.g.name} ${w.game} alerts?`,
          answer: `Create your agenda on Trimry, follow ${c.g.withArticle} and every morning you'll get the day's ${w.games} on WhatsApp or email in ${w.timeNoteLong}. Free for 7 days.`,
        },
        {
          question: `Are the times shown in ${w.timeNoteLong}?`,
          answer: `Yes. Every time on this page is converted to ${w.timeNoteLong} (${c.country.timeZone}).`,
        },
      ]
    },
    ctaTitle: (c) => `Never miss another ${c.g.name} ${words(c.country).game}`,
    ctaText: (c) =>
      `Follow ${c.g.withArticle} on Trimry and get every morning's ${words(c.country).game} time on WhatsApp, in ${words(c.country).timeNoteLong}.`,
    eventsTitle: (c) => `${cap(c.g.possessive)} ${words(c.country).schedule}: next 14 days (${c.timePhrase})`,
    eventsEmpty: (c) => `No confirmed ${words(c.country).games} for ${c.g.withArticle} in the next 14 days.`,
    otherIntentLabel: (intent, c) =>
      intent === 'time' ? `${cap(c.g.possessive)} next ${words(c.country).game}` : `What time ${c.g.aux} ${c.g.withArticle} play?`,
    calendarLink: (leagueName) => `${leagueName} schedule`,
    countryLink: (country) => `${words(country).Games} ${inCountry(country)}`,
    othersTitle: (leagueName) => `Other ${leagueName ?? ''} teams`.replace(/\s+/g, ' '),
  },

  league: {
    metaTitle: (c) => {
      const w = words(c.country)
      return `${c.name} ${w.schedule}${c.domestic ? '' : ` ${inCountry(c.country)}`}: ${c.teamSport ? `${w.game} times` : 'dates, start times'} and upcoming events`
    },
    metaDescription: (c) => {
      const w = words(c.country)
      return `${c.eventsCount > 0 ? `${c.eventsCount} ${c.name} events in the next 14 days` : `${c.name} ${w.schedule}`} in ${w.timeNote}. Updated daily with WhatsApp alerts.`
    },
    keywords: (c) => {
      const n = c.name.toLowerCase()
      const w = words(c.country)
      return [`${n} ${w.schedule}`, c.teamSport ? `${n} ${w.game} times` : `${n} start times`, `${n} this week`, `when is the next ${n} event`]
    },
    h1: (c) => `${c.name} ${words(c.country).schedule}${c.domestic ? '' : ` ${inCountry(c.country)}`}`,
    intro: (c) => {
      const w = words(c.country)
      return c.upcoming
        ? `The next ${c.name} event is ${c.eventTitle}, ${c.when} (${w.timeNoteLong}). Here is everything on the ${w.schedule} for the next 14 days, all times ${c.timePhrase}.`
        : `No confirmed ${c.name} events in the next 14 days. As soon as they're published they will show up here in ${w.timeNoteLong}.`
    },
    faq: (c) => {
      const w = words(c.country)
      return [
        {
          question: `What time is ${c.name} on ${inCountry(c.country)}?`,
          answer: c.upcoming
            ? `The next event is ${c.eventTitle}, ${c.when} (${w.timeNoteLong}). Every ${c.teamSport ? w.game : 'event'} has its own time in the list above.`
            : `Nothing is scheduled in the next 14 days. Trimry refreshes the ${w.schedule} several times a day.`,
        },
        {
          question: `How do I follow the ${c.name} ${w.schedule} without missing anything?`,
          answer: `Turn on Trimry alerts: pick ${c.name}${c.teamSport ? ' (and your teams)' : ''} and every morning you get the day's ${c.teamSport ? w.games : 'events'} on WhatsApp or email in ${w.timeNoteLong}.`,
        },
      ]
    },
    ctaTitle: (c) => `Get the ${c.name} ${words(c.country).schedule} every morning`,
    ctaText: (c) => `Follow ${c.name} on Trimry and get today's ${c.teamSport ? words(c.country).games : 'events'} on WhatsApp or email, in ${words(c.country).timeNoteLong}.`,
    eventsTitle: (c) => `${c.name}: next 14 days (${c.timePhrase})`,
    eventsEmpty: (c) => `No confirmed ${c.name} events in the next 14 days.`,
    teamsTitle: (c) => `${c.name} teams`,
    teamLink: (g) => `What time ${g.aux} ${g.withArticle} play?`,
    moreTitle: (c) => `More ${words(c.country).schedule} ${inCountry(c.country)}`,
  },

  match: {
    metaTitle: (c) => {
      const day = c.dayRelative === 'today' ? ' today' : c.dayRelative === 'tomorrow' ? ' tomorrow' : ''
      return `${c.home} vs ${c.away}: what time is the ${words(c.country).game}${day}${c.timeLabel ? ` (${c.timeLabel})` : ''}`
    },
    metaDescription: (c) => {
      const w = words(c.country)
      return `${c.home} vs ${c.away} is ${c.when} (${w.timeNoteLong})${c.venue ? ` at ${c.venue}` : ''}, in the ${c.leagueName}. Confirmed ${w.game} time and a WhatsApp alert before the ${w.game}.`
    },
    keywords: (c) => {
      const h = c.home.toLowerCase()
      const a = c.away.toLowerCase()
      const w = words(c.country)
      return [`${h} vs ${a}`, `${h} vs ${a} ${w.game} time`, `what time is ${h} vs ${a}`, `${h} ${a} start time`]
    },
    h1: (c) => `${c.home} vs ${c.away}: what time is the ${words(c.country).game}?`,
    intro: (c) => {
      const w = words(c.country)
      return `${c.home} and ${c.away} meet ${c.when} (${w.timeNoteLong})${c.venue ? ` at ${c.venue}` : ''}, in the ${c.leagueName}${c.round ? ` (${c.round})` : ''}. ${c.timeLabel ? 'The time is confirmed and we re-check it several times a day in case it moves.' : 'The start time is not confirmed yet; it will show up here as soon as it is published.'}`
    },
    faq: (c) => {
      const w = words(c.country)
      return [
        {
          question: `What time is ${c.home} vs ${c.away}?`,
          answer: c.timeLabel
            ? `The ${w.game} starts at ${c.timeLabel} (${w.timeNoteLong}) on ${c.dateLabel}.`
            : `The exact time is not confirmed yet. The ${w.game} is on ${c.dateLabel} and we refresh this page several times a day.`,
        },
        {
          question: `What day is ${c.home} vs ${c.away}?`,
          answer: `It is on ${c.dateLabel}${c.venue ? `, at ${c.venue}` : ''}, in the ${c.leagueName}.`,
        },
        {
          question: `How do I get an alert before the ${w.game}?`,
          answer: `Follow ${c.home} or ${c.away} on Trimry and every morning you get the day's ${w.games} on WhatsApp or email in ${w.timeNoteLong}. Free for 7 days, no card.`,
        },
      ]
    },
    ctaTitle: (c) => `Don't miss ${c.home} vs ${c.away}`,
    ctaText: (c) =>
      `Turn on the alert and Trimry messages you on the morning of the ${words(c.country).game} with the exact time in ${words(c.country).timeNoteLong}.`,
    eyebrow: (c) => `${c.leagueName} · ${c.country.name}`,
    otherMatchesTitle: (c) => `Other ${words(c.country).games} this week`,
    teamLinksTitle: () => 'Each team\'s schedule',
  },

  today: {
    metaTitle: (c) => `${words(c.country).Games} today ${inCountry(c.country)}: ${words(c.country).game} times for ${words(c.country).sports}`,
    metaDescription: (c) =>
      `${c.eventsCount} events today and tomorrow in ${words(c.country).timeNoteLong}: ${words(c.country).sports}. Updated several times a day.`,
    h1: (c) => `${words(c.country).Games} today ${inCountry(c.country)}`,
    intro: (c) => `Today's and tomorrow's ${words(c.country).games} across ${c.leagueNames}, all times ${c.timePhrase}.`,
    eventsTitle: (c) => `Today and tomorrow (${c.timePhrase})`,
    eventsEmpty: (c) => `No confirmed ${words(c.country).games} today.`,
    ctaTitle: () => 'This agenda, every morning on WhatsApp',
    ctaText: () => 'Only your teams and leagues, in your time zone. No more googling every day.',
  },

  hub: {
    metaTitle: (c) => `${words(c.country).Game} times ${inCountry(c.country)}: what time does your team play?`,
    metaDescription: (c) =>
      `Exact ${words(c.country).game} times for the most-followed teams and leagues ${inCountry(c.country)}, in ${words(c.country).timeNoteLong}, with WhatsApp alerts.`,
    h1: (c) => `What time does your team play ${inCountry(c.country)}?`,
    intro: (c) =>
      `Upcoming ${words(c.country).game} times in ${words(c.country).timeNoteLong}, refreshed several times a day. Pick your team or competition.`,
    ctaTitle: () => 'Your sports agenda every morning on WhatsApp',
    ctaText: (c) => `Follow your teams and leagues and Trimry tells you what's on today and when, in ${words(c.country).timeNoteLong}.`,
  },
}
