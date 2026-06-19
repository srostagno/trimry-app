export type ActivityTone = 'good' | 'bad' | 'rare'
export type FortuneActivity = 'haircut' | 'shave' | 'nails' | 'release'

export type FortuneDay = {
  date: string
  weekday: string
  summary: ActivityTone
  notes: string
  activities: {
    haircut: ActivityTone
    shave: ActivityTone
    nails: ActivityTone
    release: ActivityTone
  }
}

export type FortuneCalendarDay = FortuneDay & {
  dayOfMonth: number
  inCurrentMonth: boolean
  isToday: boolean
  alignedActivities: FortuneActivity[]
  cautionActivities: FortuneActivity[]
}

export type FortuneMonth = {
  monthLabel: string
  weekdayLabels: string[]
  weeks: FortuneCalendarDay[][]
  currentMonthDays: FortuneCalendarDay[]
  goodDays: number
  badDays: number
  rareDays: number
}

type FortuneNoteByLanguage = {
  en: string
  es: string
  pt: string
}

const energyPulse = [3, -2, 2, -3, 1, -1, 2, -2, 3, -1, 1, -2]
const notesByTone: Record<ActivityTone, FortuneNoteByLanguage[]> = {
  good: [
    {
      en: 'Flow aligns with clean starts and confidence rituals.',
      es: 'El flujo favorece comienzos limpios y rituales de confianza.',
      pt: 'O fluxo favorece comecos limpos e rituais de confianca.',
    },
    {
      en: 'A strong day to release old weight and invite momentum.',
      es: 'Un dia fuerte para soltar peso viejo e invitar impulso.',
      pt: 'Um dia forte para soltar pesos antigos e convidar impulso.',
    },
    {
      en: 'Fortune favors lightness and intentional renewal today.',
      es: 'La fortuna favorece la ligereza y una renovacion intencional hoy.',
      pt: 'A fortuna favorece leveza e renovacao intencional hoje.',
    },
  ],
  bad: [
    {
      en: 'Hold steady today and postpone major grooming changes.',
      es: 'Mantente estable hoy y posterga cambios grandes de grooming.',
      pt: 'Mantenha-se estavel hoje e adie grandes mudancas de aparencia.',
    },
    {
      en: 'Energy feels unsettled; prefer maintenance over sharp changes.',
      es: 'La energia esta inestable; prioriza mantencion sobre cambios bruscos.',
      pt: 'A energia esta instavel; prefira manutencao em vez de mudancas bruscas.',
    },
    {
      en: 'A reflective day. Plan your reset, but execute tomorrow.',
      es: 'Un dia de reflexion. Planifica tu reinicio, pero ejecutalo manana.',
      pt: 'Um dia de reflexao. Planeje seu reinicio, mas execute amanha.',
    },
  ],
  rare: [
    {
      en: 'A wildcard day. Strange timing could open an unusual door.',
      es: 'Un dia comodin. Un timing extrano puede abrir una puerta inusual.',
      pt: 'Um dia curinga. Um timing estranho pode abrir uma porta incomum.',
    },
    {
      en: 'Rare signal today: stay observant because an unexpected turn may matter.',
      es: 'Senal rara hoy: mantente atento porque un giro inesperado puede importar.',
      pt: 'Sinal raro hoje: fique atento porque uma virada inesperada pode importar.',
    },
    {
      en: 'The pattern bends here. A coincidence, invitation, or sudden shift could land.',
      es: 'Aqui el patron se dobla. Puede aparecer una coincidencia, invitacion o giro subito.',
      pt: 'O padrao se curva aqui. Uma coincidencia, convite ou mudanca subita pode chegar.',
    },
  ],
}
const DEFAULT_LOCALE = 'en-US'

function createUtcDate(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month, day, 12))
}

function normalizeUtcDate(date: Date) {
  return createUtcDate(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  )
}

function mondayOfWeek(date: Date) {
  const utcDate = normalizeUtcDate(date)
  const day = utcDate.getUTCDay()
  const diff = day === 0 ? -6 : 1 - day
  utcDate.setUTCDate(utcDate.getUTCDate() + diff)
  return utcDate
}

function toActivityTone(value: number): ActivityTone {
  return value > 0 ? 'good' : value < 0 ? 'bad' : 'rare'
}

function isSameUtcDate(left: Date, right: Date) {
  return (
    left.getUTCFullYear() === right.getUTCFullYear() &&
    left.getUTCMonth() === right.getUTCMonth() &&
    left.getUTCDate() === right.getUTCDate()
  )
}

function firstOfMonth(date: Date) {
  return createUtcDate(date.getUTCFullYear(), date.getUTCMonth(), 1)
}

function resolveFortuneLanguage(locale = DEFAULT_LOCALE) {
  const normalized = locale.trim().toLowerCase()

  if (normalized.startsWith('es')) {
    return 'es'
  }

  if (normalized.startsWith('pt')) {
    return 'pt'
  }

  return 'en'
}

function selectLocalizedFortuneNote(
  notes: FortuneNoteByLanguage,
  locale = DEFAULT_LOCALE,
) {
  const language = resolveFortuneLanguage(locale)

  if (language === 'es') {
    return notes.es || notes.en || notes.pt
  }

  if (language === 'pt') {
    return notes.pt || notes.en || notes.es
  }

  return notes.en || notes.es || notes.pt
}

export function buildFortuneDay(
  referenceDate = new Date(),
  locale = DEFAULT_LOCALE,
): FortuneDay {
  const day = normalizeUtcDate(referenceDate)
  const cycleBase =
    day.getUTCFullYear() +
    day.getUTCMonth() * 3 +
    Math.floor(day.getUTCDate() / 2)

  const pulseIndex = cycleBase % energyPulse.length
  const pulse = energyPulse[pulseIndex]

  const haircut = toActivityTone(pulse + ((day.getUTCDate() - 1) % 2 === 0 ? 1 : -1))
  const shave = toActivityTone(pulse - 1)
  const nails = toActivityTone(pulse + ((day.getUTCDate() - 1) % 3) - 1)
  const release = toActivityTone(pulse + 1)

  const score =
    (haircut === 'good' ? 1 : haircut === 'bad' ? -1 : 0) +
    (shave === 'good' ? 1 : shave === 'bad' ? -1 : 0) +
    (nails === 'good' ? 1 : nails === 'bad' ? -1 : 0) +
    (release === 'good' ? 1 : release === 'bad' ? -1 : 0)

  const summary: ActivityTone =
    score >= 2 ? 'good' : score <= -2 ? 'bad' : 'rare'
  const notesForTone = notesByTone[summary]
  const noteIndex = (day.getUTCDate() - 1) % notesForTone.length
  const noteByLanguage = notesForTone[noteIndex] ?? notesForTone[0]
  const notes = selectLocalizedFortuneNote(noteByLanguage, locale)

  return {
    date: day.toISOString(),
    weekday: day.toLocaleDateString(locale, { weekday: 'long', timeZone: 'UTC' }),
    summary,
    notes,
    activities: {
      haircut,
      shave,
      nails,
      release,
    },
  }
}

export function buildWeeklyFortune(
  referenceDate = new Date(),
  locale = DEFAULT_LOCALE,
) {
  const start = mondayOfWeek(referenceDate)

  return Array.from({ length: 7 }, (_, index): FortuneDay => {
    const day = new Date(start)
    day.setUTCDate(start.getUTCDate() + index)
    return buildFortuneDay(day, locale)
  })
}

export function buildMonthlyFortuneCalendar(options?: {
  referenceDate?: Date
  locale?: string
  today?: Date
}) {
  const referenceDate = options?.referenceDate ?? new Date()
  const locale = options?.locale ?? DEFAULT_LOCALE
  const today = normalizeUtcDate(options?.today ?? new Date())
  const monthStart = firstOfMonth(referenceDate)
  const gridStart = mondayOfWeek(monthStart)
  const weekdayFormatter = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    timeZone: 'UTC',
  })
  const monthFormatter = new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
  const monthIndex = monthStart.getUTCMonth()
  const weeks = Array.from({ length: 6 }, (_, weekIndex) =>
    Array.from({ length: 7 }, (_, dayIndex): FortuneCalendarDay => {
      const day = new Date(gridStart)
      day.setUTCDate(gridStart.getUTCDate() + weekIndex * 7 + dayIndex)

      const fortune = buildFortuneDay(day, locale)
      const alignedActivities = (
        Object.entries(fortune.activities) as Array<[FortuneActivity, ActivityTone]>
      )
        .filter(([, tone]) => tone === 'good')
        .map(([activity]) => activity)
      const cautionActivities = (
        Object.entries(fortune.activities) as Array<[FortuneActivity, ActivityTone]>
      )
        .filter(([, tone]) => tone === 'bad')
        .map(([activity]) => activity)

      return {
        ...fortune,
        dayOfMonth: day.getUTCDate(),
        inCurrentMonth: day.getUTCMonth() === monthIndex,
        isToday: isSameUtcDate(day, today),
        alignedActivities,
        cautionActivities,
      }
    }),
  )
  const currentMonthDays = weeks
    .flat()
    .filter((day) => day.inCurrentMonth)

  return {
    monthLabel: monthFormatter.format(monthStart),
    weekdayLabels: Array.from({ length: 7 }, (_, index) => {
      const day = new Date(gridStart)
      day.setUTCDate(gridStart.getUTCDate() + index)
      return weekdayFormatter.format(day)
    }),
    weeks,
    currentMonthDays,
    goodDays: currentMonthDays.filter((day) => day.summary === 'good').length,
    badDays: currentMonthDays.filter((day) => day.summary === 'bad').length,
    rareDays: currentMonthDays.filter((day) => day.summary === 'rare').length,
  } satisfies FortuneMonth
}
