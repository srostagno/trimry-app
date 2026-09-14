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
  atTime,
  countryHubPath,
  countryOfPhrase,
  countryPhrase,
  countryTimePhrase,
  eventOpponent,
  eventTitle,
  formatLongDate,
  langRoot,
  leagueDisplayName,
  leaguePagePath,
  nextEvent,
  ptByLeague,
  seoText,
  teamDisplayName,
  teamGrammar,
  teamPagePath,
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
    locale: country.language,
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
  const lang = country.language
  const g = teamGrammar(team, lang)
  const upcoming = nextEvent(feed)
  const when = upcoming ? ` ${formatLongDate(upcoming.localDateKey, lang)}${atTime(upcoming, lang)}` : ''
  const lower = g.name.toLowerCase()

  const title =
    lang === 'pt'
      ? intent === 'time'
        ? `Que horas ${g.verb} ${g.withArticle} hoje? Horário ${countryPhrase(country)}`
        : `Próximo jogo ${g.of}: data, horário e adversário`
      : intent === 'time'
        ? `¿A qué hora ${g.verb} ${g.withArticle} hoy? Horario ${countryPhrase(country)}`
        : `Próximo partido ${g.of}: fecha, hora y rival`
  const description =
    lang === 'pt'
      ? intent === 'time'
        ? `Horário exato do próximo jogo ${g.of}${when} (${countryTimePhrase(country)}). Calendário atualizado e alertas no WhatsApp para você não perder.`
        : `Próximo jogo ${g.of}${when} (${countryTimePhrase(country)}). Tabela completa dos próximos 14 dias e lembrete no WhatsApp.`
      : intent === 'time'
        ? `Hora exacta del próximo partido ${g.of} ${countryPhrase(country)}${when}. Calendario actualizado y alertas por WhatsApp para no perdértelo.`
        : `Próximo partido ${g.of}${when} (${countryTimePhrase(country)}). Fixture completo de los próximos 14 días y recordatorio por WhatsApp.`
  const keywords =
    lang === 'pt'
      ? [`que horas joga ${lower}`, `quando joga ${lower}`, `proximo jogo ${lower}`, `${lower} horario`]
      : [
          `a que hora juega ${lower}`,
          `cuando juega ${lower}`,
          `proximo partido ${lower}`,
          `${lower} horario ${country.name.toLowerCase()}`,
        ]

  return createPageMetadata({
    title,
    description,
    path: teamPagePath(country, team, intent),
    locale: lang,
    keywords,
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
  const lang = country.language
  const t = seoText(lang)
  const g = teamGrammar(team, lang)
  const upcoming = nextEvent(feed)
  const events = feed?.days.flatMap((day) => day.events) ?? []
  const pagePath = teamPagePath(country, team, intent)
  const opponent = upcoming ? eventOpponent(upcoming, team) : null
  const timePhrase = countryTimePhrase(country)
  const leagueName = league ? leagueDisplayName(league, lang) : null
  const when = upcoming ? `${formatLongDate(upcoming.localDateKey, lang)}${atTime(upcoming, lang)}` : ''

  const title =
    lang === 'pt'
      ? intent === 'time'
        ? `Que horas ${g.verb} ${g.withArticle}?`
        : `Próximo jogo ${g.of}`
      : intent === 'time'
        ? `¿A qué hora ${g.verb} ${g.withArticle}?`
        : `Próximo partido ${g.of}`

  const cap = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

  const intro =
    lang === 'pt'
      ? intent === 'time'
        ? upcoming
          ? `${cap(g.withArticle)} ${g.verb} ${when} (${timePhrase})${opponent ? ` contra ${opponent}` : ''}, ${ptByLeague(upcoming.leagueName)}. Abaixo você tem a tabela completa dos próximos 14 dias no ${timePhrase}.`
          : `Ainda não há data confirmada para o próximo jogo ${g.of}. Quando for publicada, ela aparece aqui com o ${timePhrase}.`
        : upcoming
          ? `O próximo jogo ${g.of} é ${eventTitle(upcoming, lang)}, ${when} (${timePhrase}), ${ptByLeague(upcoming.leagueName)}. Depois vêm mais ${Math.max(events.length - 1, 0)} jogos nas próximas duas semanas.`
          : `Não há jogos confirmados ${g.of} nos próximos 14 dias. Veja o calendário ${leagueName ? `do ${leagueName}` : 'da competição'} ou ative os alertas para saber assim que forem publicados.`
      : intent === 'time'
        ? upcoming
          ? `${cap(g.withArticle)} ${g.verb} ${when} (${timePhrase})${opponent ? ` frente a ${opponent}` : ''}, por ${upcoming.leagueName}. Abajo tienes el fixture completo de los próximos 14 días en horario ${countryOfPhrase(country)}.`
          : `Todavía no hay una fecha confirmada para el próximo partido ${g.of}. Cuando se publique, aquí aparecerá con la hora exacta ${countryOfPhrase(country)}.`
        : upcoming
          ? `El próximo partido ${g.of} es ${eventTitle(upcoming, lang)}, ${when} (${timePhrase}), por ${upcoming.leagueName}. Después vienen ${Math.max(events.length - 1, 0)} partidos más en las próximas dos semanas.`
          : `No hay partidos confirmados ${g.of} en los próximos 14 días. Revisa el calendario de ${leagueName ?? 'la competición'} o activa las alertas para enterarte apenas se publiquen.`

  const otherIntentPath = teamPagePath(country, team, intent === 'time' ? 'next' : 'time')
  const siblingTeams = country.teams
    .filter((slug) => slug !== team.slug)
    .map((slug) => findTeam(catalog, slug))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .filter((entry) => entry.leagueSlug === team.leagueSlug)
    .slice(0, 8)

  const faq =
    lang === 'pt'
      ? [
          {
            question: `Que horas ${g.verb} ${g.withArticle} hoje ${countryPhrase(country)}?`,
            answer: upcoming
              ? `${cap(g.withArticle)} ${g.verb} ${formatLongDate(upcoming.localDateKey, lang)}${upcoming.localTimeLabel ? ` às ${upcoming.localTimeLabel} (${timePhrase})` : ' (horário a confirmar)'}${opponent ? ` contra ${opponent}` : ''} ${ptByLeague(upcoming.leagueName)}.`
              : `Não há jogo ${g.of} marcado hoje nem nos próximos 14 dias segundo o calendário oficial.`,
          },
          {
            question: `Quando é o próximo jogo ${g.of}?`,
            answer: upcoming
              ? `${eventTitle(upcoming, lang)}, ${formatLongDate(upcoming.localDateKey, lang)}${upcoming.venue ? ` no ${upcoming.venue}` : ''}.`
              : `Ainda não está confirmado. O Trimry revisa o calendário várias vezes por dia e avisa no WhatsApp quando for publicado.`,
          },
          {
            question: `Como receber alertas dos jogos ${g.of}?`,
            answer: `Crie sua agenda no Trimry, siga ${g.withArticle} e receba toda manhã, no WhatsApp ou por e-mail, os jogos do dia no ${timePhrase}. Teste grátis por 7 dias.`,
          },
          {
            question: `Os horários estão no ${timePhrase}?`,
            answer: `Sim, todos os horários desta página estão convertidos para o fuso ${countryOfPhrase(country)} (${country.timeZone}).`,
          },
        ]
      : [
          {
            question: `¿A qué hora ${g.verb} ${g.withArticle} hoy ${countryPhrase(country)}?`,
            answer: upcoming
              ? `${cap(g.withArticle)} ${g.verb} ${formatLongDate(upcoming.localDateKey, lang)}${upcoming.localTimeLabel ? ` a las ${upcoming.localTimeLabel} (${timePhrase})` : ' (hora por confirmar)'}${opponent ? ` contra ${opponent}` : ''} por ${upcoming.leagueName}.`
              : `No hay un partido ${g.of} programado hoy ni en los próximos 14 días según el calendario oficial.`,
          },
          {
            question: `¿Cuándo es el próximo partido ${g.of}?`,
            answer: upcoming
              ? `${eventTitle(upcoming, lang)}, ${formatLongDate(upcoming.localDateKey, lang)}${upcoming.venue ? ` en ${upcoming.venue}` : ''}.`
              : `Aún no está confirmado. Trimry revisa el calendario varias veces al día y te avisa por WhatsApp cuando se publique.`,
          },
          {
            question: `¿Cómo recibir alertas de los partidos ${g.of}?`,
            answer: `Crea tu agenda en Trimry, sigue ${g.to} y recibirás cada mañana por WhatsApp o email los partidos del día en horario ${countryOfPhrase(country)}. Prueba gratis 7 días.`,
          },
          {
            question: `¿Los horarios son ${timePhrase}?`,
            answer: `Sí, todos los horarios de esta página están convertidos a la zona horaria ${countryOfPhrase(country)} (${country.timeZone}).`,
          },
        ]

  const ctaTitle =
    lang === 'pt' ? `Nunca mais seja pego de surpresa por um jogo ${g.of}` : `Que ${g.withArticle} nunca más te tome por sorpresa`
  const ctaText =
    lang === 'pt'
      ? `Siga ${g.withArticle} no Trimry e receba toda manhã o horário dos jogos no seu WhatsApp, no ${timePhrase}.`
      : `Sigue ${g.to} en Trimry y recibe cada mañana la hora de sus partidos en tu WhatsApp, en horario ${countryOfPhrase(country)}.`

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Breadcrumbs
        items={[
          { href: langRoot(country), label: t.home },
          { href: countryHubPath(country), label: country.name },
          ...(league && leagueName ? [{ href: leaguePagePath(country, league), label: leagueName }] : []),
          { href: pagePath, label: g.name },
        ]}
      />

      <header>
        <p className="tr-eyebrow">
          {leagueName ?? t.calendar} · {country.name}
        </p>
        <h1 className="mt-2 text-3xl sm:text-5xl">{title}</h1>
        <p className="tr-copy mt-4 max-w-3xl text-lg">{intro}</p>
      </header>

      <NextEventCard
        event={upcoming}
        timeZoneLabel={timePhrase}
        eyebrow={intent === 'time' ? t.nextMatch : t.nextInCalendar}
        language={lang}
      />

      <AlertsCta
        title={ctaTitle}
        text={ctaText}
        href={`/activate?teamId=${encodeURIComponent(team.slug)}&teamName=${encodeURIComponent(team.name)}&sport=${team.sport}${league ? `&leagueName=${encodeURIComponent(league.name)}` : ''}`}
        language={lang}
      />

      <EventsSection
        title={
          lang === 'pt'
            ? `Calendário ${g.of}: próximos 14 dias (${timePhrase})`
            : `Calendario ${g.of}: próximos 14 días (${timePhrase})`
        }
        feed={feed}
        empty={
          lang === 'pt'
            ? `Sem jogos confirmados ${g.of} nos próximos 14 dias.`
            : `Sin partidos confirmados ${g.of} en los próximos 14 días.`
        }
      />

      <FaqSection items={faq} language={lang} />

      <LinkGrid
        title={t.moreAboutTeam}
        links={[
          {
            href: otherIntentPath,
            label:
              lang === 'pt'
                ? intent === 'time'
                  ? `Próximo jogo ${g.of}`
                  : `Que horas ${g.verb} ${g.withArticle}?`
                : intent === 'time'
                  ? `Próximo partido ${g.of}`
                  : `¿A qué hora ${g.verb} ${g.withArticle}?`,
          },
          ...(league && leagueName ? [{ href: leaguePagePath(country, league), label: `${t.calendar} ${leagueName}` }] : []),
          { href: countryHubPath(country), label: lang === 'pt' ? `Jogos ${countryPhrase(country)}` : `Partidos ${countryPhrase(country)}` },
        ]}
      />

      <LinkGrid
        title={
          lang === 'pt'
            ? `Outros times ${leagueName ? `do ${leagueName}` : ''}`
            : `Otros equipos ${leagueName ? `de ${leagueName}` : ''}`
        }
        links={siblingTeams.map((entry) => ({
          href: teamPagePath(country, entry, intent),
          label: teamDisplayName(entry, lang),
        }))}
      />

      <p className="tr-meta text-xs">{t.source}</p>

      <JsonLd data={eventsJsonLd(events, absoluteUrl(pagePath), lang)} />
    </div>
  )
}
