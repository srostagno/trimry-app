import { apiFetch, readApiError } from '@/lib/api-client'
import type { FortuneActivity } from '@/lib/fortune'

export type MemberPredictionTone = 'good' | 'bad' | 'rare'

export type MemberPredictionActivities = Record<FortuneActivity, MemberPredictionTone>
export type MemberPredictionNotesByLanguage = {
  en: string
  es: string
  pt: string
}

export type MemberPredictionDay = {
  date: string
  weekday: string
  dayOfMonth: number
  inCurrentMonth: boolean
  isToday: boolean
  isLocked: boolean
  summary: MemberPredictionTone | null
  notes: string | null
  notesByLanguage: MemberPredictionNotesByLanguage | null
  activities: MemberPredictionActivities | null
  alignedActivities: FortuneActivity[]
  cautionActivities: FortuneActivity[]
  isOverridden: boolean
}

export type MemberPredictionMonth = {
  accessMode: 'week' | 'today_only'
  hasWeekAccess: boolean
  hasFullMonthAccess: boolean
  unlockedThrough: string
  monthLabel: string
  weekdayLabels: string[]
  weeks: MemberPredictionDay[][]
  currentMonthDays: MemberPredictionDay[]
  goodDays: number | null
  badDays: number | null
  rareDays: number | null
}

export async function fetchMemberPredictionMonth(month: string, locale: string) {
  const response = await apiFetch(
    `/me/predictions?month=${encodeURIComponent(month)}&locale=${encodeURIComponent(locale)}`,
    { cache: 'no-store' },
  )

  if (!response.ok) {
    throw new Error(
      await readApiError(response, 'Unable to load your projection calendar.'),
    )
  }

  return (await response.json()) as MemberPredictionMonth
}
