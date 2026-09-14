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
  countryPhrase,
  countryTimePhrase,
  eventOpponent,
  eventTitle,
  formatLongDate,
  leaguePagePath,
  nextEvent,
  ofTeam,
  teamDisplayName,
  teamPagePath,
  teamVerb,
  toTeam,
  withArticle,
} from '@/lib/seo-copy'
import { fetchSeoFeed, findLeague, findTeam, resolveSeoContext } from '@/lib/seo-data'

type Intent = 'time' | 'next'

async function loadTeamPage(countryCode: string, teamSlug: string) {
  const { catalog, country } = await resolveSeoContext(countryCode)
  const team = country && country.teams.includes(teamSlug) ? findTeam(catalog, teamSlug) : null

  if (!country || !team) {
    return null
  }

  const league = findLeague(catalog, team.leagueSlug)
  const feed = await fetchSeoFeed({
    teamId: team.slug,
    teamName: team.name,
    sport: team.sport,
    leagueName: league?.name,
    timeZone: country.timeZone,
    days: 14,
  })

  return { catalog, country, team, league, feed }
}

export async function teamPageMetadata(
  countryCode: string,
  teamSlug: string,
  intent: Intent,
): Promise<Metadata> {
  const data = await loadTeamPage(countryCode, teamSlug)

  if (!data) {
    return {}
  }

  const { country, team, feed } = data
  const name = teamDisplayName(team)
  const upcoming = nextEvent(feed)
  const when = upcoming
    ? ` ${formatLongDate(upcoming.localDateKey)}${upcoming.localTimeLabel ? ` a las ${upcoming.localTimeLabel}` : ''}`
    : ''
  const title =
    intent === 'time'
      ? `¿A qué hora ${teamVerb(team)} ${withArticle(team)} hoy? Horario ${countryPhrase(country)}`
      : `Próximo partido ${ofTeam(team)}: fecha, hora y rival`
  const description =
    intent === 'time'
      ? `Hora exacta del próximo partido ${ofTeam(team)} ${countryPhrase(country)}${when}. Calendario actualizado y alertas por WhatsApp para no perdértelo.`
      : `Próximo partido ${ofTeam(team)}${when} (${countryTimePhrase(country)}). Fixture completo de los próximos 14 días y recordatorio por WhatsApp.`

  return createPageMetadata({
    title,
    description,
    path: teamPagePath(country, team, intent),
    locale: 'es',
    keywords: [
      `a que hora juega ${name.toLowerCase()}`,
      `cuando juega ${name.toLowerCase()}`,
      `proximo partido ${name.toLowerCase()}`,
      `${name.toLowerCase()} horario ${country.name.toLowerCase()}`,
    ],
  })
}

export async function TeamPage({
  countryCode,
  teamSlug,
  intent,
}: {
  countryCode: string
  teamSlug: string
  intent: Intent
}) {
  const data = await loadTeamPage(countryCode, teamSlug)

  if (!data) {
    notFound()
  }

  const { catalog, country, team, league, feed } = data
  const name = teamDisplayName(team)
  const upcoming = nextEvent(feed)
  const events = feed?.days.flatMap((day) => day.events) ?? []
  const pagePath = teamPagePath(country, team, intent)
  const opponent = upcoming ? eventOpponent(upcoming, team) : null
  const timePhrase = countryTimePhrase(country)
  const title =
    intent === 'time'
      ? `¿A qué hora ${teamVerb(team)} ${withArticle(team)}?`
      : `Próximo partido ${ofTeam(team)}`
  const intro =
    intent === 'time'
      ? upcoming
        ? `${withArticle(team)} ${teamVerb(team)} ${formatLongDate(upcoming.localDateKey)}${upcoming.localTimeLabel ? ` a las ${upcoming.localTimeLabel}` : ''} (${timePhrase})${opponent ? ` frente a ${opponent}` : ''}, por ${upcoming.leagueName}. Abajo tienes el fixture completo de los próximos 14 días en horario de ${country.name}.`
        : `Todavía no hay una fecha confirmada para el próximo partido ${ofTeam(team)}. Cuando se publique, aquí aparecerá con la hora exacta de ${country.name}.`
      : upcoming
        ? `El próximo partido ${ofTeam(team)} es ${eventTitle(upcoming)}, ${formatLongDate(upcoming.localDateKey)}${upcoming.localTimeLabel ? ` a las ${upcoming.localTimeLabel}` : ''} (${timePhrase}), por ${upcoming.leagueName}. Después vienen ${Math.max(events.length - 1, 0)} partidos más en las próximas dos semanas.`
        : `No hay partidos confirmados ${ofTeam(team)} en los próximos 14 días. Revisa el calendario de ${league?.name ?? 'la competición'} o activa las alertas para enterarte apenas se publiquen.`

  const otherIntentPath = teamPagePath(country, team, intent === 'time' ? 'next' : 'time')
  const siblingTeams = country.teams
    .filter((slug) => slug !== team.slug)
    .map((slug) => findTeam(catalog, slug))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .filter((entry) => entry.leagueSlug === team.leagueSlug)
    .slice(0, 8)

  const faq = [
    {
      question: `¿A qué hora ${teamVerb(team)} ${withArticle(team)} hoy ${countryPhrase(country)}?`,
      answer: upcoming
        ? `${withArticle(team)} ${teamVerb(team)} ${formatLongDate(upcoming.localDateKey)}${upcoming.localTimeLabel ? ` a las ${upcoming.localTimeLabel} (${timePhrase})` : ' (hora por confirmar)'}${opponent ? ` contra ${opponent}` : ''} por ${upcoming.leagueName}.`
        : `No hay un partido ${ofTeam(team)} programado hoy ni en los próximos 14 días según el calendario oficial.`,
    },
    {
      question: `¿Cuándo es el próximo partido ${ofTeam(team)}?`,
      answer: upcoming
        ? `${eventTitle(upcoming)}, ${formatLongDate(upcoming.localDateKey)}${upcoming.venue ? ` en ${upcoming.venue}` : ''}.`
        : `Aún no está confirmado. Trimry revisa el calendario varias veces al día y te avisa por WhatsApp cuando se publique.`,
    },
    {
      question: `¿Cómo recibir alertas de los partidos ${ofTeam(team)}?`,
      answer: `Crea tu agenda en Trimry, sigue ${toTeam(team)} y recibirás cada mañana por WhatsApp o email los partidos del día en horario de ${country.name}. Prueba gratis 7 días.`,
    },
    {
      question: `¿Los horarios son ${timePhrase}?`,
      answer: `Sí, todos los horarios de esta página están convertidos a la zona horaria de ${country.name} (${country.timeZone}).`,
    },
  ]

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Breadcrumbs
        items={[
          { href: '/es', label: 'Trimry' },
          { href: countryHubPath(country), label: country.name },
          ...(league ? [{ href: leaguePagePath(country, league), label: league.name }] : []),
          { href: pagePath, label: name },
        ]}
      />

      <header>
        <p className="tr-eyebrow">
          {league?.name ?? 'Calendario'} · {country.name}
        </p>
        <h1 className="mt-2 text-3xl sm:text-5xl">{title}</h1>
        <p className="tr-copy mt-4 max-w-3xl text-lg">{intro}</p>
      </header>

      <NextEventCard
        event={upcoming}
        timeZoneLabel={timePhrase}
        eyebrow={intent === 'time' ? 'Próximo partido' : 'Siguiente en el calendario'}
      />

      <AlertsCta
        title={`Que ${withArticle(team)} nunca más te tome por sorpresa`}
        text={`Sigue ${toTeam(team)} en Trimry y recibe cada mañana la hora de sus partidos en tu WhatsApp, en horario de ${country.name}.`}
        href={`/activate?teamId=${encodeURIComponent(team.slug)}&teamName=${encodeURIComponent(team.name)}&sport=${team.sport}${league ? `&leagueName=${encodeURIComponent(league.name)}` : ''}`}
      />

      <EventsSection
        title={`Calendario ${ofTeam(team)}: próximos 14 días (${timePhrase})`}
        feed={feed}
        empty={`Sin partidos confirmados ${ofTeam(team)} en los próximos 14 días.`}
      />

      <FaqSection items={faq} />

      <LinkGrid
        title="Más sobre este equipo"
        links={[
          {
            href: otherIntentPath,
            label: intent === 'time' ? `Próximo partido ${ofTeam(team)}` : `¿A qué hora ${teamVerb(team)} ${withArticle(team)}?`,
          },
          ...(league ? [{ href: leaguePagePath(country, league), label: `Calendario ${league.name}` }] : []),
          { href: countryHubPath(country), label: `Partidos ${countryPhrase(country)}` },
        ]}
      />

      <LinkGrid
        title={`Otros equipos ${league ? `de ${league.name}` : ''}`}
        links={siblingTeams.map((entry) => ({
          href: teamPagePath(country, entry, intent),
          label: teamDisplayName(entry),
        }))}
      />

      <p className="tr-meta text-xs">
        Fuente: calendarios oficiales de las competiciones, verificados con búsqueda web asistida por IA y
        actualizados varias veces al día. Los horarios pueden cambiar; confirma con el canal oficial antes de un
        partido.
      </p>

      <JsonLd data={eventsJsonLd(events, absoluteUrl(pagePath))} />
    </div>
  )
}
