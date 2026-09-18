import type { LanguageCode } from '@/lib/i18n'
import type { SportKey } from '@/lib/sports'

// Paid-traffic landings: one page per sport and language where a visitor
// signs up in one step and starts the card-less trial.

export type LandingSport = 'soccer' | 'american_football' | 'golf' | 'tennis'

export const LANDING_SEGMENT: Record<LanguageCode, string> = {
  es: 'alertas',
  pt: 'alertas',
  en: 'alerts',
}

const SLUGS: Record<LanguageCode, Record<LandingSport, string>> = {
  es: { soccer: 'futbol', american_football: 'futbol-americano', golf: 'golf', tennis: 'tenis' },
  pt: { soccer: 'futebol', american_football: 'futebol-americano', golf: 'golfe', tennis: 'tenis' },
  en: { soccer: 'soccer', american_football: 'football', golf: 'golf', tennis: 'tennis' },
}

export const LANDING_SPORTS: LandingSport[] = ['soccer', 'american_football', 'golf', 'tennis']

export function landingSportFromSlug(language: LanguageCode, slug: string): LandingSport | null {
  const entries = Object.entries(SLUGS[language]) as Array<[LandingSport, string]>
  return entries.find(([, value]) => value === slug)?.[0] ?? null
}

export function landingPath(language: LanguageCode, sport: LandingSport) {
  return `/${language}/${LANDING_SEGMENT[language]}/${SLUGS[language][sport]}`
}

export function isLandingSegment(language: LanguageCode, segment: string) {
  return LANDING_SEGMENT[language] === segment
}

export type LandingCopy = {
  eyebrow: string
  title: string
  subtitle: string
  bullets: string[]
  previewTitle: string
  formTitle: string
  formSubtitle: string
  submit: string
  submitting: string
  noCard: string
  successTitle: string
  successText: string
  refine: string
  refineHint: string
  goToAgenda: string
  alreadyTitle: string
  alreadyText: string
  alreadyCta: string
  faq: Array<{ question: string; answer: string }>
  metaTitle: string
  metaDescription: string
  keywords: string[]
}

type SportWords = { name: string; events: string; single: string; leagues: string; sample: string[] }

const SPORT_WORDS: Record<LanguageCode, Record<LandingSport, SportWords>> = {
  es: {
    soccer: {
      name: 'fútbol',
      single: 'partido',
      events: 'partidos',
      leagues: 'Champions, LaLiga, Premier, Libertadores, Liga MX, Primera División y las Eliminatorias',
      sample: ['⚽ 21:00 Real Madrid vs Barcelona · LaLiga', '⚽ 16:30 Colo-Colo vs U. de Chile · Primera División', '⚽ 15:00 Liverpool vs Arsenal · Premier League'],
    },
    american_football: {
      name: 'fútbol americano',
      single: 'partido',
      events: 'partidos',
      leagues: 'toda la temporada NFL: cada semana, playoffs y Super Bowl',
      sample: ['🏈 17:25 Cowboys vs Eagles · NFL Week 3', '🏈 21:20 Chiefs vs Bills · Sunday Night Football', '🏈 14:00 Packers vs Bears · NFL'],
    },
    golf: {
      name: 'golf',
      single: 'torneo',
      events: 'torneos',
      leagues: 'PGA Tour, los cuatro majors y la Ryder Cup',
      sample: ['⛳ Jueves · Arranca el Presidents Cup · Medinah', '⛳ Domingo · Ronda final BMW Championship', '⛳ Próximo major: The Masters · Augusta'],
    },
    tennis: {
      name: 'tenis',
      single: 'partido',
      events: 'partidos y torneos',
      leagues: 'ATP, WTA, los cuatro Grand Slam y los Masters 1000',
      sample: ['🎾 Lunes · Arranca el ATP 500 de Tokio', '🎾 Domingo · Final del US Open · Nueva York', '🎾 Miércoles · Cuartos de final WTA Pekín'],
    },
  },
  pt: {
    soccer: {
      name: 'futebol',
      single: 'jogo',
      events: 'jogos',
      leagues: 'Brasileirão, Libertadores, Champions, Premier League, LaLiga e as Eliminatórias',
      sample: ['⚽ 21:30 Flamengo x Palmeiras · Brasileirão', '⚽ 16:00 Real Madrid x Barcelona · LaLiga', '⚽ 21:45 Liverpool x Arsenal · Champions'],
    },
    american_football: {
      name: 'futebol americano',
      single: 'jogo',
      events: 'jogos',
      leagues: 'toda a temporada da NFL: cada semana, playoffs e Super Bowl',
      sample: ['🏈 17:25 Cowboys x Eagles · NFL Semana 3', '🏈 21:20 Chiefs x Bills · Sunday Night Football', '🏈 14:00 Packers x Bears · NFL'],
    },
    golf: {
      name: 'golfe',
      single: 'torneio',
      events: 'torneios',
      leagues: 'PGA Tour, os quatro majors e a Ryder Cup',
      sample: ['⛳ Quinta · Começa a Presidents Cup · Medinah', '⛳ Domingo · Rodada final BMW Championship', '⛳ Próximo major: The Masters · Augusta'],
    },
    tennis: {
      name: 'tênis',
      single: 'jogo',
      events: 'jogos e torneios',
      leagues: 'ATP, WTA, os quatro Grand Slams e os Masters 1000',
      sample: ['🎾 Segunda · Começa o ATP 500 de Tóquio', '🎾 Domingo · Final do US Open · Nova York', '🎾 Quarta · Quartas de final WTA Pequim'],
    },
  },
  en: {
    soccer: {
      name: 'soccer',
      events: 'matches',
      single: 'match',
      leagues: 'Champions League, Premier League, LaLiga, MLS, Liga MX and World Cup qualifiers',
      sample: ['⚽ 3:00 PM Real Madrid vs Barcelona · LaLiga', '⚽ 10:00 AM Liverpool vs Arsenal · Premier League', '⚽ 8:30 PM Inter Miami vs LA Galaxy · MLS'],
    },
    american_football: {
      name: 'football',
      events: 'games',
      single: 'game',
      leagues: 'the whole NFL season: every week, playoffs and the Super Bowl',
      sample: ['🏈 4:25 PM Cowboys vs Eagles · NFL Week 3', '🏈 8:20 PM Chiefs vs Bills · Sunday Night Football', '🏈 1:00 PM Packers vs Bears · NFL'],
    },
    golf: {
      name: 'golf',
      events: 'tournaments',
      single: 'tournament',
      leagues: 'the PGA Tour, all four majors and the Ryder Cup',
      sample: ['⛳ Thursday · Presidents Cup tees off · Medinah', '⛳ Sunday · Final round, BMW Championship', '⛳ Next major: The Masters · Augusta'],
    },
    tennis: {
      name: 'tennis',
      events: 'matches and tournaments',
      single: 'match',
      leagues: 'ATP, WTA, all four Grand Slams and the Masters 1000s',
      sample: ['🎾 Monday · ATP 500 Tokyo starts', '🎾 Sunday · US Open final · New York', '🎾 Wednesday · WTA Beijing quarter-finals'],
    },
  },
}

const cap = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

export function landingCopy(language: LanguageCode, sport: LandingSport): LandingCopy {
  const w = SPORT_WORDS[language][sport]

  if (language === 'pt') {
    return {
      eyebrow: `Alertas de ${w.name}`,
      title: `Todos os ${w.events} de ${w.name} que vêm aí, toda manhã no seu WhatsApp`,
      subtitle: `Cadastre-se e o Trimry avisa você automaticamente sobre ${w.leagues}, no seu horário. Grátis por e-mail e toda semana no WhatsApp.`,
      bullets: [
        `Cobre ${w.leagues}.`,
        'Horários convertidos para o seu fuso, verificados todos os dias.',
        'Por WhatsApp, e-mail ou os dois. Você escolhe.',
        'Depois ajuste por times e ligas, se quiser.',
      ],
      previewTitle: `O que vem aí no ${w.name}`,
      formTitle: 'Comece grátis agora',
      formSubtitle: 'Seu primeiro aviso chega hoje. Sem cartão de crédito.',
      submit: 'Quero receber os alertas',
      submitting: 'Criando sua agenda…',
      noCard: 'Grátis por e-mail e semanal no WhatsApp · Todo dia no WhatsApp com o Pro',
      successTitle: 'Pronto! Sua agenda está ativa',
      successText: `Seu primeiro aviso de ${w.name} chega hoje. Quer ajustar por times ou ligas específicas?`,
      refine: 'Escolher times e ligas',
      refineHint: 'Opcional, leva 1 minuto',
      goToAgenda: 'Ver minha agenda',
      alreadyTitle: 'Você já tem uma conta',
      alreadyText: 'Ajuste seus esportes, times e ligas na sua agenda.',
      alreadyCta: 'Ir para minha agenda',
      faq: [
        { question: 'É grátis mesmo?', answer: 'Sim. A agenda por e-mail é grátis, e uma agenda semanal no WhatsApp também. Receber a agenda no WhatsApp toda manhã é o Trimry Pro: US$3,99 por mês, cancele quando quiser.' },
        { question: 'A que horas chega o aviso?', answer: 'Toda manhã, às 9h no seu fuso horário por padrão. Você pode mudar a hora na sua agenda.' },
        { question: `Posso escolher só alguns times de ${w.name}?`, answer: 'Sim. Depois do cadastro você pode seguir times e ligas específicas, ou combinar vários esportes.' },
      ],
      metaTitle: `Alertas de ${w.name} no WhatsApp: todos os ${w.events} que vêm aí`,
      metaDescription: `Receba toda manhã os ${w.events} de ${w.name} do dia, no seu horário, por WhatsApp ou e-mail. ${cap(w.leagues)}. Grátis por e-mail e semanal no WhatsApp.`,
      keywords: [`alertas ${w.name}`, `${w.events} de ${w.name} hoje`, `agenda ${w.name} whatsapp`],
    }
  }

  if (language === 'en') {
    return {
      eyebrow: `${cap(w.name)} alerts`,
      title: `Every upcoming ${w.name} ${w.single}, in your WhatsApp every morning`,
      subtitle: `Sign up and Trimry automatically keeps you on top of ${w.leagues}, in your time zone. Free by email, and every week on WhatsApp.`,
      bullets: [
        `Covers ${w.leagues}.`,
        'Times converted to your time zone and verified every day.',
        'On WhatsApp, email or both. Your call.',
        'Refine by teams and leagues later, if you want.',
      ],
      previewTitle: `What's coming up in ${w.name}`,
      formTitle: 'Start free now',
      formSubtitle: 'Your first alert arrives today. Free, no card.',
      submit: 'Send me the alerts',
      submitting: 'Setting up your agenda…',
      noCard: 'Free by email and weekly on WhatsApp · Every morning on WhatsApp with Pro',
      successTitle: 'Done! Your agenda is live',
      successText: `Your first ${w.name} alert arrives today. Want to narrow it down to specific teams or leagues?`,
      refine: 'Pick teams and leagues',
      refineHint: 'Optional, takes a minute',
      goToAgenda: 'See my agenda',
      alreadyTitle: 'You already have an account',
      alreadyText: 'Adjust your sports, teams and leagues from your agenda.',
      alreadyCta: 'Go to my agenda',
      faq: [
        { question: 'Is it really free?', answer: 'Yes. The agenda by email is free, and so is a weekly agenda on WhatsApp. Getting the agenda on WhatsApp every morning is Trimry Pro: US$3.99 a month, cancel anytime.' },
        { question: 'What time does the alert arrive?', answer: 'Every morning at 9 AM in your time zone by default. You can change the hour from your agenda.' },
        { question: `Can I follow just a few ${w.name} teams?`, answer: 'Yes. After signing up you can follow specific teams and leagues, or combine several sports.' },
      ],
      metaTitle: `${cap(w.name)} alerts on WhatsApp: every upcoming ${w.single}`,
      metaDescription: `Get the day's ${w.name} ${w.events} every morning, in your time zone, on WhatsApp or email. ${cap(w.leagues)}. Free by email and weekly on WhatsApp.`,
      keywords: [`${w.name} alerts`, `${w.name} ${w.events} today`, `${w.name} schedule whatsapp`],
    }
  }

  return {
    eyebrow: `Alertas de ${w.name}`,
    title: `Todos los ${w.events} de ${w.name} que se vienen, cada mañana en tu WhatsApp`,
    subtitle: `Regístrate y Trimry te avisa automáticamente de ${w.leagues}, en tu horario. Gratis por email y cada semana por WhatsApp.`,
    bullets: [
      `Cubre ${w.leagues}.`,
      'Horarios convertidos a tu zona horaria y verificados cada día.',
      'Por WhatsApp, email o ambos. Tú eliges.',
      'Después lo afinas por equipos y ligas, si quieres.',
    ],
    previewTitle: `Lo que se viene en ${w.name}`,
    formTitle: 'Empieza gratis ahora',
    formSubtitle: 'Tu primer aviso llega hoy. Gratis, sin tarjeta.',
    submit: 'Quiero recibir las alertas',
    submitting: 'Creando tu agenda…',
    noCard: 'Gratis por email y semanal por WhatsApp · Cada mañana por WhatsApp con Pro',
    successTitle: '¡Listo! Tu agenda está activa',
    successText: `Tu primer aviso de ${w.name} llega hoy. ¿Quieres afinarlo por equipos o ligas específicas?`,
    refine: 'Elegir equipos y ligas',
    refineHint: 'Opcional, toma 1 minuto',
    goToAgenda: 'Ver mi agenda',
    alreadyTitle: 'Ya tienes una cuenta',
    alreadyText: 'Ajusta tus deportes, equipos y ligas desde tu agenda.',
    alreadyCta: 'Ir a mi agenda',
    faq: [
      { question: '¿Es gratis de verdad?', answer: 'Sí. La agenda por email es gratis, y una agenda semanal por WhatsApp también. Recibir la agenda por WhatsApp cada mañana es Trimry Pro: US$3,99 al mes, cancelas cuando quieras.' },
      { question: '¿A qué hora llega el aviso?', answer: 'Cada mañana a las 9:00 en tu zona horaria por defecto. Puedes cambiar la hora desde tu agenda.' },
      { question: `¿Puedo seguir solo algunos equipos de ${w.name}?`, answer: 'Sí. Después de registrarte puedes seguir equipos y ligas específicas, o combinar varios deportes.' },
    ],
    metaTitle: `Alertas de ${w.name} por WhatsApp: todos los ${w.events} que se vienen`,
    metaDescription: `Recibe cada mañana los ${w.events} de ${w.name} del día, en tu horario, por WhatsApp o email. ${cap(w.leagues)}. Gratis por email y semanal por WhatsApp.`,
    keywords: [`alertas ${w.name}`, `${w.events} de ${w.name} hoy`, `agenda ${w.name} whatsapp`, `a que hora juegan hoy ${w.name}`],
  }
}

export function landingSampleLines(language: LanguageCode, sport: LandingSport) {
  return SPORT_WORDS[language][sport].sample
}

export type LandingSportKey = SportKey & LandingSport
