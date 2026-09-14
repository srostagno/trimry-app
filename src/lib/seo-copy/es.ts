import type { SeoCountry } from '@/lib/seo-data'
import type { SeoCopy } from '@/lib/seo-copy/types'

const cap = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)
const inCountry = (country: SeoCountry) => `en ${country.name}`
const ofCountry = (country: SeoCountry) => `de ${country.name}`

export const esCopy: SeoCopy = {
  ui: () => ({
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
  }),

  team: {
    metaTitle: (intent, c) =>
      intent === 'time'
        ? `¿A qué hora ${c.g.verb} ${c.g.withArticle} hoy? Horario ${inCountry(c.country)}`
        : `Próximo partido ${c.g.of}: fecha, hora y rival`,
    metaDescription: (intent, c) =>
      intent === 'time'
        ? `Hora exacta del próximo partido ${c.g.of} ${inCountry(c.country)}${c.when ? ` ${c.when}` : ''}. Calendario actualizado y alertas por WhatsApp para no perdértelo.`
        : `Próximo partido ${c.g.of}${c.when ? ` ${c.when}` : ''} (${c.timePhrase}). Fixture completo de los próximos 14 días y recordatorio por WhatsApp.`,
    keywords: (c) => {
      const n = c.g.name.toLowerCase()
      return [`a que hora juega ${n}`, `cuando juega ${n}`, `proximo partido ${n}`, `${n} horario ${c.country.name.toLowerCase()}`]
    },
    h1: (intent, c) => (intent === 'time' ? `¿A qué hora ${c.g.verb} ${c.g.withArticle}?` : `Próximo partido ${c.g.of}`),
    intro: (intent, c) => {
      if (intent === 'time') {
        return c.upcoming
          ? `${cap(c.g.withArticle)} ${c.g.verb} ${c.when} (${c.timePhrase})${c.opponent ? ` frente a ${c.opponent}` : ''}, por ${c.upcoming.leagueName}. Abajo tienes el fixture completo de los próximos 14 días en horario ${ofCountry(c.country)}.`
          : `Todavía no hay una fecha confirmada para el próximo partido ${c.g.of}. Cuando se publique, aquí aparecerá con la hora exacta ${ofCountry(c.country)}.`
      }
      return c.upcoming
        ? `El próximo partido ${c.g.of} es ${c.eventTitle}, ${c.when} (${c.timePhrase}), por ${c.upcoming.leagueName}. Después vienen ${Math.max(c.eventsCount - 1, 0)} partidos más en las próximas dos semanas.`
        : `No hay partidos confirmados ${c.g.of} en los próximos 14 días. Revisa el calendario de ${c.leagueName ?? 'la competición'} o activa las alertas para enterarte apenas se publiquen.`
    },
    faq: (c) => [
      {
        question: `¿A qué hora ${c.g.verb} ${c.g.withArticle} hoy ${inCountry(c.country)}?`,
        answer: c.upcoming
          ? `${cap(c.g.withArticle)} ${c.g.verb} ${c.when}${c.upcoming.localTimeLabel ? ` (${c.timePhrase})` : ' (hora por confirmar)'}${c.opponent ? ` contra ${c.opponent}` : ''} por ${c.upcoming.leagueName}.`
          : `No hay un partido ${c.g.of} programado hoy ni en los próximos 14 días según el calendario oficial.`,
      },
      {
        question: `¿Cuándo es el próximo partido ${c.g.of}?`,
        answer: c.upcoming
          ? `${c.eventTitle}, ${c.when}${c.upcoming.venue ? ` en ${c.upcoming.venue}` : ''}.`
          : 'Aún no está confirmado. Trimry revisa el calendario varias veces al día y te avisa por WhatsApp cuando se publique.',
      },
      {
        question: `¿Cómo recibir alertas de los partidos ${c.g.of}?`,
        answer: `Crea tu agenda en Trimry, sigue ${c.g.to} y recibirás cada mañana por WhatsApp o email los partidos del día en horario ${ofCountry(c.country)}. Prueba gratis 7 días.`,
      },
      {
        question: `¿Los horarios son ${c.timePhrase}?`,
        answer: `Sí, todos los horarios de esta página están convertidos a la zona horaria ${ofCountry(c.country)} (${c.country.timeZone}).`,
      },
    ],
    ctaTitle: (c) => `Que ${c.g.withArticle} nunca más te tome por sorpresa`,
    ctaText: (c) => `Sigue ${c.g.to} en Trimry y recibe cada mañana la hora de sus partidos en tu WhatsApp, en horario ${ofCountry(c.country)}.`,
    eventsTitle: (c) => `Calendario ${c.g.of}: próximos 14 días (${c.timePhrase})`,
    eventsEmpty: (c) => `Sin partidos confirmados ${c.g.of} en los próximos 14 días.`,
    otherIntentLabel: (intent, c) => (intent === 'time' ? `Próximo partido ${c.g.of}` : `¿A qué hora ${c.g.verb} ${c.g.withArticle}?`),
    calendarLink: (leagueName) => `Calendario ${leagueName}`,
    countryLink: (country) => `Partidos ${inCountry(country)}`,
    othersTitle: (leagueName) => `Otros equipos${leagueName ? ` de ${leagueName}` : ''}`,
  },

  league: {
    metaTitle: (c) => `Calendario ${c.name}${c.domestic ? '' : ` ${inCountry(c.country)}`}: horarios y próximos partidos`,
    metaDescription: (c) =>
      `${c.eventsCount > 0 ? `${c.eventsCount} eventos de ${c.name} en los próximos 14 días` : `Calendario de ${c.name}`} con hora ${ofCountry(c.country)}. Fixture actualizado y alertas por WhatsApp.`,
    keywords: (c) => {
      const n = c.name.toLowerCase()
      return [`calendario ${n}`, `horario ${n} ${c.country.name.toLowerCase()}`, `partidos ${n}`]
    },
    h1: (c) => `Calendario ${c.name}${c.domestic ? '' : ` ${inCountry(c.country)}`}`,
    intro: (c) =>
      c.upcoming
        ? `El próximo evento de ${c.name} es ${c.eventTitle}, ${c.when} (${c.timePhrase}). Aquí tienes todos los partidos de los próximos 14 días en horario ${ofCountry(c.country)}.`
        : `No hay eventos confirmados de ${c.name} en los próximos 14 días. Cuando se publiquen aparecerán aquí en horario ${ofCountry(c.country)}.`,
    faq: (c) => [
      {
        question: `¿A qué hora se juega ${c.name} ${inCountry(c.country)}?`,
        answer: c.upcoming
          ? `El próximo evento es ${c.eventTitle}, ${c.when} (${c.timePhrase}). Cada partido tiene su horario en la lista de arriba.`
          : 'No hay eventos programados en los próximos 14 días. Trimry actualiza el calendario varias veces al día.',
      },
      {
        question: `¿Cómo sigo el calendario de ${c.name} sin perderme partidos?`,
        answer: `Activa las alertas de Trimry: eliges ${c.name} (y tus equipos) y recibes cada mañana los partidos del día por WhatsApp o email, con la hora ${ofCountry(c.country)}.`,
      },
    ],
    ctaTitle: (c) => `Recibe la agenda de ${c.name} cada mañana`,
    ctaText: (c) => `Sigue ${c.name} en Trimry y te llega por WhatsApp o email lo que se juega hoy, en horario ${ofCountry(c.country)}.`,
    eventsTitle: (c) => `Próximos 14 días de ${c.name} (${c.timePhrase})`,
    eventsEmpty: (c) => `Sin eventos confirmados de ${c.name} en los próximos 14 días.`,
    teamsTitle: (c) => `Equipos de ${c.name}`,
    teamLink: (g) => `¿A qué hora ${g.verb} ${g.withArticle}?`,
    moreTitle: (c) => `Más calendarios ${inCountry(c.country)}`,
  },

  today: {
    metaTitle: (c) => `Partidos de hoy ${inCountry(c.country)}: horarios de fútbol y deportes`,
    metaDescription: (c) =>
      `${c.eventsCount} eventos hoy y mañana con hora ${ofCountry(c.country)}: fútbol, Champions, NBA, F1, UFC. Actualizado varias veces al día.`,
    h1: (c) => `Partidos de hoy ${inCountry(c.country)}`,
    intro: (c) => `Lo que se juega hoy y mañana en ${c.leagueNames}, con ${c.timePhrase}.`,
    eventsTitle: (c) => `Agenda de hoy y mañana (${c.timePhrase})`,
    eventsEmpty: () => 'Sin eventos confirmados para hoy.',
    ctaTitle: () => 'Esta agenda, cada mañana en tu WhatsApp',
    ctaText: () => 'Solo tus equipos y ligas, en tu horario. Sin buscar en Google cada día.',
  },

  hub: {
    metaTitle: (c) => `Horarios de partidos ${inCountry(c.country)}: ¿a qué hora juega tu equipo?`,
    metaDescription: (c) =>
      `Hora exacta de los partidos de los equipos y ligas más seguidos ${inCountry(c.country)}, en horario local, con alertas por WhatsApp.`,
    h1: (c) => `¿A qué hora juega tu equipo ${inCountry(c.country)}?`,
    intro: (c) =>
      `Horarios de los próximos partidos convertidos a la hora ${ofCountry(c.country)}, actualizados varias veces al día. Elige tu equipo o competición.`,
    ctaTitle: () => 'Tu agenda deportiva cada mañana por WhatsApp',
    ctaText: (c) => `Sigue tus equipos y ligas y Trimry te avisa qué se juega hoy y a qué hora, en horario ${ofCountry(c.country)}.`,
  },
}
