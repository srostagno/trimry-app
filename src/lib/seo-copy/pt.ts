import type { SeoCountry } from '@/lib/seo-data'
import type { SeoCopy } from '@/lib/seo-copy/types'

const cap = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)
const inCountry = (country: SeoCountry) => `no ${country.name}`
const ofCountry = (country: SeoCountry) => `do ${country.name}`

// "pela Copa Libertadores" / "pelo Brasileirão": gender of a competition name.
function by(leagueName: string) {
  const feminine = /^(copa|liga|s[ée]rie|premier|champions|europa|uefa|bundesliga|laliga|nba|nfl|mlb|nhl|elimina|ligue|eredivisie|primeira|mls|conmebol)/i.test(
    leagueName.trim(),
  )
  return `${feminine ? 'pela' : 'pelo'} ${leagueName}`
}

export const ptCopy: SeoCopy = {
  ui: () => ({
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
  }),

  team: {
    metaTitle: (intent, c) =>
      intent === 'time'
        ? `Horário do jogo ${c.g.of} hoje: que horas ${c.g.verb} ${inCountry(c.country)}`
        : `Próximo jogo ${c.g.of}: data, horário e adversário`,
    metaDescription: (intent, c) =>
      intent === 'time'
        ? `Horário exato do próximo jogo ${c.g.of}${c.when ? ` ${c.when}` : ''} (${c.timePhrase}). Calendário atualizado e alertas no WhatsApp para você não perder.`
        : `Próximo jogo ${c.g.of}${c.when ? ` ${c.when}` : ''} (${c.timePhrase}). Tabela completa dos próximos 14 dias e lembrete no WhatsApp.`,
    keywords: (c) => {
      const n = c.g.name.toLowerCase()
      const of = c.g.of.toLowerCase()
      return [`horario do jogo ${of}`, `que horas joga ${n}`, `quando joga ${n}`, `proximo jogo ${n}`]
    },
    h1: (intent, c) => (intent === 'time' ? `Horário do jogo ${c.g.of}` : `Próximo jogo ${c.g.of}`),
    intro: (intent, c) => {
      if (intent === 'time') {
        return c.upcoming
          ? `${cap(c.g.withArticle)} ${c.g.verb} ${c.when} (${c.timePhrase})${c.opponent ? ` contra ${c.opponent}` : ''}, ${by(c.upcoming.leagueName)}. Abaixo você tem a tabela completa dos próximos 14 dias no ${c.timePhrase}.`
          : `Ainda não há data confirmada para o próximo jogo ${c.g.of}. Quando for publicada, ela aparece aqui com o ${c.timePhrase}.`
      }
      return c.upcoming
        ? `O próximo jogo ${c.g.of} é ${c.eventTitle}, ${c.when} (${c.timePhrase}), ${by(c.upcoming.leagueName)}. Depois vêm mais ${Math.max(c.eventsCount - 1, 0)} jogos nas próximas duas semanas.`
        : `Não há jogos confirmados ${c.g.of} nos próximos 14 dias. Veja o calendário ${c.leagueName ? `do ${c.leagueName}` : 'da competição'} ou ative os alertas para saber assim que forem publicados.`
    },
    faq: (c) => [
      {
        question: `Que horas ${c.g.verb} ${c.g.withArticle} hoje ${inCountry(c.country)}?`,
        answer: c.upcoming
          ? `${cap(c.g.withArticle)} ${c.g.verb} ${c.when}${c.upcoming.localTimeLabel ? ` (${c.timePhrase})` : ' (horário a confirmar)'}${c.opponent ? ` contra ${c.opponent}` : ''} ${by(c.upcoming.leagueName)}.`
          : `Não há jogo ${c.g.of} marcado hoje nem nos próximos 14 dias segundo o calendário oficial.`,
      },
      {
        question: `Quando é o próximo jogo ${c.g.of}?`,
        answer: c.upcoming
          ? `${c.eventTitle}, ${c.when}${c.upcoming.venue ? ` no ${c.upcoming.venue}` : ''}.`
          : 'Ainda não está confirmado. O Trimry revisa o calendário várias vezes por dia e avisa no WhatsApp quando for publicado.',
      },
      {
        question: `Como receber alertas dos jogos ${c.g.of}?`,
        answer: `Crie sua agenda no Trimry, siga ${c.g.withArticle} e receba toda manhã, no WhatsApp ou por e-mail, os jogos do dia no ${c.timePhrase}. Teste grátis por 7 dias.`,
      },
      {
        question: `Os horários estão no ${c.timePhrase}?`,
        answer: `Sim, todos os horários desta página estão convertidos para o fuso ${ofCountry(c.country)} (${c.country.timeZone}).`,
      },
    ],
    ctaTitle: (c) => `Nunca mais seja pego de surpresa por um jogo ${c.g.of}`,
    ctaText: (c) => `Siga ${c.g.withArticle} no Trimry e receba toda manhã o horário dos jogos no seu WhatsApp, no ${c.timePhrase}.`,
    eventsTitle: (c) => `Calendário ${c.g.of}: próximos 14 dias (${c.timePhrase})`,
    eventsEmpty: (c) => `Sem jogos confirmados ${c.g.of} nos próximos 14 dias.`,
    otherIntentLabel: (intent, c) => (intent === 'time' ? `Próximo jogo ${c.g.of}` : `Horário do jogo ${c.g.of}`),
    calendarLink: (leagueName) => `Calendário ${leagueName}`,
    countryLink: (country) => `Jogos ${inCountry(country)}`,
    othersTitle: (leagueName) => `Outros times${leagueName ? ` do ${leagueName}` : ''}`,
  },

  league: {
    metaTitle: (c) => `Tabela ${c.name}${c.domestic ? '' : ` ${inCountry(c.country)}`}: horários e próximos jogos`,
    metaDescription: (c) =>
      `${c.eventsCount > 0 ? `${c.eventsCount} jogos do ${c.name} nos próximos 14 dias` : `Tabela do ${c.name}`} no ${c.timePhrase}. Calendário atualizado e alertas no WhatsApp.`,
    keywords: (c) => {
      const n = c.name.toLowerCase()
      return [`tabela ${n}`, `jogos ${n}`, `horario ${n}`]
    },
    h1: (c) => `Tabela ${c.name}${c.domestic ? '' : ` ${inCountry(c.country)}`}`,
    intro: (c) =>
      c.upcoming
        ? `O próximo jogo do ${c.name} é ${c.eventTitle}, ${c.when} (${c.timePhrase}). Aqui estão todos os jogos dos próximos 14 dias no ${c.timePhrase}.`
        : `Não há jogos confirmados do ${c.name} nos próximos 14 dias. Quando forem publicados, aparecem aqui no ${c.timePhrase}.`,
    faq: (c) => [
      {
        question: `Que horas são os jogos do ${c.name} ${inCountry(c.country)}?`,
        answer: c.upcoming
          ? `O próximo jogo é ${c.eventTitle}, ${c.when} (${c.timePhrase}). Cada jogo tem seu horário na lista acima.`
          : 'Não há jogos marcados nos próximos 14 dias. O Trimry atualiza o calendário várias vezes por dia.',
      },
      {
        question: `Como acompanhar a tabela do ${c.name} sem perder jogos?`,
        answer: `Ative os alertas do Trimry: escolha o ${c.name} (e seus times) e receba toda manhã os jogos do dia no WhatsApp ou por e-mail, no ${c.timePhrase}.`,
      },
    ],
    ctaTitle: (c) => `Receba a agenda do ${c.name} toda manhã`,
    ctaText: (c) => `Siga o ${c.name} no Trimry e receba no WhatsApp ou por e-mail o que tem jogo hoje, no ${c.timePhrase}.`,
    eventsTitle: (c) => `Próximos 14 dias do ${c.name} (${c.timePhrase})`,
    eventsEmpty: (c) => `Sem jogos confirmados do ${c.name} nos próximos 14 dias.`,
    teamsTitle: (c) => `Times do ${c.name}`,
    teamLink: (g) => `Horário do jogo ${g.of}`,
    moreTitle: (c) => `Mais tabelas ${inCountry(c.country)}`,
  },

  match: {
    metaTitle: (c) => {
      const day = c.dayRelative === 'today' ? ' hoje' : c.dayRelative === 'tomorrow' ? ' amanhã' : ''
      return `${c.home} x ${c.away}: que horas é o jogo${day}${c.timeLabel ? ` (${c.timeLabel})` : ''}`
    },
    metaDescription: (c) =>
      `${c.home} x ${c.away} é ${c.when} (${c.timePhrase})${c.venue ? ` no ${c.venue}` : ''}, ${by(c.leagueName)}. Horário confirmado e alerta no WhatsApp antes do jogo.`,
    keywords: (c) => {
      const h = c.home.toLowerCase()
      const a = c.away.toLowerCase()
      return [`${h} x ${a}`, `que horas joga ${h} x ${a}`, `${h} ${a} horario`, `quando é ${h} x ${a}`]
    },
    h1: (c) => `${c.home} x ${c.away}: que horas é o jogo`,
    intro: (c) =>
      `${c.home} e ${c.away} se enfrentam ${c.when} (${c.timePhrase})${c.venue ? ` no ${c.venue}` : ''}, ${by(c.leagueName)}${c.round ? ` (${c.round})` : ''}. ${c.timeLabel ? 'O horário está confirmado e verificamos várias vezes por dia caso mude.' : 'O horário ainda não está confirmado; assim que sair, aparece aqui.'}`,
    faq: (c) => [
      {
        question: `Que horas é ${c.home} x ${c.away}?`,
        answer: c.timeLabel
          ? `O jogo começa às ${c.timeLabel} (${c.timePhrase}), em ${c.dateLabel}.`
          : `O horário exato ainda não está confirmado. O jogo é em ${c.dateLabel} e atualizamos esta página várias vezes por dia.`,
      },
      {
        question: `Que dia é ${c.home} x ${c.away}?`,
        answer: `É em ${c.dateLabel}${c.venue ? `, no ${c.venue}` : ''}, ${by(c.leagueName)}.`,
      },
      {
        question: 'Como recebo um aviso antes do jogo?',
        answer: `Siga o ${c.home} ou o ${c.away} no Trimry e receba toda manhã, no WhatsApp ou por e-mail, os jogos do dia no ${c.timePhrase}. Teste grátis por 7 dias, sem cartão.`,
      },
    ],
    ctaTitle: (c) => `Não perca ${c.home} x ${c.away}`,
    ctaText: (c) => `Ative o alerta e o Trimry avisa você na manhã do jogo com o horário exato no ${c.timePhrase}.`,
    eyebrow: (c) => `${c.leagueName} · ${c.country.name}`,
    otherMatchesTitle: () => 'Outros jogos da semana',
    teamLinksTitle: () => 'Calendário de cada time',
  },

  today: {
    metaTitle: (c) => `Jogos de hoje ${inCountry(c.country)}: horários de futebol e esportes`,
    metaDescription: (c) =>
      `${c.eventsCount} jogos hoje e amanhã no ${c.timePhrase}: Brasileirão, Libertadores, Champions, NBA, F1, UFC. Atualizado várias vezes por dia.`,
    h1: (c) => `Jogos de hoje ${inCountry(c.country)}`,
    intro: (c) => `O que tem jogo hoje e amanhã em ${c.leagueNames}, no ${c.timePhrase}.`,
    eventsTitle: (c) => `Agenda de hoje e amanhã (${c.timePhrase})`,
    eventsEmpty: () => 'Sem jogos confirmados para hoje.',
    ctaTitle: () => 'Esta agenda, toda manhã no seu WhatsApp',
    ctaText: () => 'Só seus times e ligas, no seu horário. Sem procurar no Google todo dia.',
  },

  hub: {
    metaTitle: (c) => `Horários de jogos ${inCountry(c.country)}: que horas joga o seu time?`,
    metaDescription: (c) =>
      `Horário exato dos jogos dos times e ligas mais acompanhados ${inCountry(c.country)}, no horário local, com alertas no WhatsApp.`,
    h1: (c) => `Horário dos jogos do seu time ${inCountry(c.country)}`,
    intro: (c) =>
      `Horários dos próximos jogos convertidos para o horário ${ofCountry(c.country)}, atualizados várias vezes por dia. Escolha seu time ou competição.`,
    ctaTitle: () => 'Sua agenda esportiva toda manhã no WhatsApp',
    ctaText: (c) => `Siga seus times e ligas e o Trimry avisa o que tem jogo hoje e a que horas, no horário ${ofCountry(c.country)}.`,
  },
}
