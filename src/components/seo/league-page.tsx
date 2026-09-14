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
  eventTitle,
  formatLongDate,
  langRoot,
  leagueDisplayName,
  leaguePagePath,
  nextEvent,
  seoText,
  teamGrammar,
  teamPagePath,
} from '@/lib/seo-copy'
import { fetchSeoFeed, findLeague, findTeam, resolveSeoContext } from '@/lib/seo-data'

async function load(countryCode: string, leagueSlug: string) {
  const { catalog, country } = await resolveSeoContext(countryCode)
  const league = country && country.leagues.includes(leagueSlug) ? findLeague(catalog, leagueSlug) : null

  if (!country || !league) {
    return null
  }

  const feed = await fetchSeoFeed({
    locale: country.language,
    leagueId: league.slug,
    leagueName: league.name,
    sport: league.sport,
    timeZone: country.timeZone,
    days: 14,
  })

  return { catalog, country, league, feed }
}

export async function leaguePageMetadata(countryCode: string, leagueSlug: string): Promise<Metadata> {
  const data = await load(countryCode, leagueSlug)
  if (!data) return {}
  const { country, league, feed } = data
  const lang = country.language
  const name = leagueDisplayName(league, lang)
  const count = feed?.totalEvents ?? 0
  const domestic = league.country === country.name
  const suffix = domestic ? '' : ` ${countryPhrase(country)}`

  return createPageMetadata({
    title:
      lang === 'pt'
        ? `Tabela ${name}${suffix}: horários e próximos jogos`
        : `Calendario ${name}${suffix}: horarios y próximos partidos`,
    description:
      lang === 'pt'
        ? `${count > 0 ? `${count} jogos do ${name} nos próximos 14 dias` : `Tabela do ${name}`} no ${countryTimePhrase(country)}. Calendário atualizado e alertas no WhatsApp.`
        : `${count > 0 ? `${count} eventos de ${name} en los próximos 14 días` : `Calendario de ${name}`} con hora ${countryOfPhrase(country)}. Fixture actualizado y alertas por WhatsApp.`,
    path: leaguePagePath(country, league),
    locale: lang,
    keywords:
      lang === 'pt'
        ? [`tabela ${name.toLowerCase()}`, `jogos ${name.toLowerCase()}`, `horario ${name.toLowerCase()}`]
        : [`calendario ${name.toLowerCase()}`, `horario ${name.toLowerCase()} ${country.name.toLowerCase()}`, `partidos ${name.toLowerCase()}`],
  })
}

export async function LeaguePage({ countryCode, leagueSlug }: { countryCode: string; leagueSlug: string }) {
  const data = await load(countryCode, leagueSlug)
  if (!data) notFound()

  const { catalog, country, league, feed } = data
  const lang = country.language
  const t = seoText(lang)
  const name = leagueDisplayName(league, lang)
  const upcoming = nextEvent(feed)
  const events = feed?.days.flatMap((day) => day.events) ?? []
  const pagePath = leaguePagePath(country, league)
  const timePhrase = countryTimePhrase(country)
  const domestic = league.country === country.name
  const suffix = domestic ? '' : ` ${countryPhrase(country)}`
  const when = upcoming ? `${formatLongDate(upcoming.localDateKey, lang)}${atTime(upcoming, lang)}` : ''
  const teams = country.teams
    .map((slug) => findTeam(catalog, slug))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .filter((entry) => entry.leagueSlug === league.slug)

  const intro =
    lang === 'pt'
      ? upcoming
        ? `O próximo jogo do ${name} é ${eventTitle(upcoming, lang)}, ${when} (${timePhrase}). Aqui estão todos os jogos dos próximos 14 dias no ${timePhrase}.`
        : `Não há jogos confirmados do ${name} nos próximos 14 dias. Quando forem publicados, aparecem aqui no ${timePhrase}.`
      : upcoming
        ? `El próximo evento de ${name} es ${eventTitle(upcoming, lang)}, ${when} (${timePhrase}). Aquí tienes todos los partidos de los próximos 14 días en horario ${countryOfPhrase(country)}.`
        : `No hay eventos confirmados de ${name} en los próximos 14 días. Cuando se publiquen aparecerán aquí en horario ${countryOfPhrase(country)}.`

  const faq =
    lang === 'pt'
      ? [
          {
            question: `Que horas são os jogos do ${name} ${countryPhrase(country)}?`,
            answer: upcoming
              ? `O próximo jogo é ${eventTitle(upcoming, lang)}, ${when} (${timePhrase}). Cada jogo tem seu horário na lista acima.`
              : `Não há jogos marcados nos próximos 14 dias. O Trimry atualiza o calendário várias vezes por dia.`,
          },
          {
            question: `Como acompanhar a tabela do ${name} sem perder jogos?`,
            answer: `Ative os alertas do Trimry: escolha o ${name} (e seus times) e receba toda manhã os jogos do dia no WhatsApp ou por e-mail, no ${timePhrase}.`,
          },
        ]
      : [
          {
            question: `¿A qué hora se juega ${name} ${countryPhrase(country)}?`,
            answer: upcoming
              ? `El próximo evento es ${eventTitle(upcoming, lang)}, ${when} (${timePhrase}). Cada partido tiene su horario en la lista de arriba.`
              : `No hay eventos programados en los próximos 14 días. Trimry actualiza el calendario varias veces al día.`,
          },
          {
            question: `¿Cómo sigo el calendario de ${name} sin perderme partidos?`,
            answer: `Activa las alertas de Trimry: eliges ${name} (y tus equipos) y recibes cada mañana los partidos del día por WhatsApp o email, con la hora ${countryOfPhrase(country)}.`,
          },
        ]

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Breadcrumbs
        items={[
          { href: langRoot(country), label: t.home },
          { href: countryHubPath(country), label: country.name },
          { href: pagePath, label: name },
        ]}
      />
      <header>
        <p className="tr-eyebrow">
          {t.calendar} · {country.name}
        </p>
        <h1 className="mt-2 text-3xl sm:text-5xl">
          {lang === 'pt' ? 'Tabela' : 'Calendario'} {name}
          {suffix}
        </h1>
        <p className="tr-copy mt-4 max-w-3xl text-lg">{intro}</p>
      </header>

      <NextEventCard event={upcoming} timeZoneLabel={timePhrase} eyebrow={t.nextEvent} language={lang} />

      <AlertsCta
        title={lang === 'pt' ? `Receba a agenda do ${name} toda manhã` : `Recibe la agenda de ${name} cada mañana`}
        text={
          lang === 'pt'
            ? `Siga o ${name} no Trimry e receba no WhatsApp ou por e-mail o que tem jogo hoje, no ${timePhrase}.`
            : `Sigue ${name} en Trimry y te llega por WhatsApp o email lo que se juega hoy, en horario ${countryOfPhrase(country)}.`
        }
        href={`/activate?leagueId=${encodeURIComponent(league.slug)}&leagueName=${encodeURIComponent(league.name)}&sport=${league.sport}`}
        language={lang}
      />

      <EventsSection
        title={lang === 'pt' ? `Próximos 14 dias do ${name} (${timePhrase})` : `Próximos 14 días de ${name} (${timePhrase})`}
        feed={feed}
        empty={
          lang === 'pt'
            ? `Sem jogos confirmados do ${name} nos próximos 14 dias.`
            : `Sin eventos confirmados de ${name} en los próximos 14 días.`
        }
      />

      <FaqSection items={faq} language={lang} />

      <LinkGrid
        title={lang === 'pt' ? `Times do ${name}` : `Equipos de ${name}`}
        links={teams.map((team) => {
          const g = teamGrammar(team, lang)
          return {
            href: teamPagePath(country, team, 'time'),
            label: lang === 'pt' ? `Que horas ${g.verb} ${g.withArticle}?` : `¿A qué hora ${g.verb} ${g.withArticle}?`,
          }
        })}
      />

      <LinkGrid
        title={lang === 'pt' ? `Mais tabelas ${countryPhrase(country)}` : `Más calendarios ${countryPhrase(country)}`}
        links={country.leagues
          .filter((slug) => slug !== league.slug)
          .map((slug) => findLeague(catalog, slug))
          .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
          .slice(0, 10)
          .map((entry) => ({ href: leaguePagePath(country, entry), label: leagueDisplayName(entry, lang) }))}
      />

      <JsonLd data={eventsJsonLd(events, absoluteUrl(pagePath), lang)} />
    </div>
  )
}
