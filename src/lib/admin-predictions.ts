import { apiFetch, readApiError } from '@/lib/api-client'
import type { FortuneActivity } from '@/lib/fortune'

export type PredictionTone = 'good' | 'bad' | 'rare'

export type PredictionActivities = Record<FortuneActivity, PredictionTone>

export type AdminPredictionDay = {
  date: string
  weekday: string
  summary: PredictionTone
  notes: string
  activities: PredictionActivities
  dayOfMonth: number
  inCurrentMonth: boolean
  isToday: boolean
  alignedActivities: FortuneActivity[]
  cautionActivities: FortuneActivity[]
  isOverridden?: boolean
}

export type AdminPredictionMonth = {
  monthLabel: string
  weekdayLabels: string[]
  weeks: AdminPredictionDay[][]
  currentMonthDays: AdminPredictionDay[]
  goodDays: number
  badDays: number
  rareDays: number
}

export async function fetchAdminPredictionMonth(month: string, locale: string) {
  const response = await apiFetch(
    `/admin/predictions?month=${encodeURIComponent(month)}&locale=${encodeURIComponent(locale)}`,
    { cache: 'no-store' },
  )

  if (!response.ok) {
    throw new Error(await readApiError(response, 'Unable to load prediction month.'))
  }

  return (await response.json()) as AdminPredictionMonth
}

export async function saveAdminPredictionDay(
  date: string,
  payload: {
    summary: PredictionTone
    notes: string
    activities: PredictionActivities
  },
  fallbackMessage: string,
) {
  const response = await apiFetch(`/admin/predictions/${date}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(await readApiError(response, fallbackMessage))
  }
}

export async function importAdminPredictionMonthFromImage(
  payload: {
    month: string
    locale: string
    imageDataUrl: string
  },
  fallbackMessage: string,
) {
  const response = await apiFetch('/admin/predictions/import-from-image', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(await readApiError(response, fallbackMessage))
  }

  return (await response.json()) as {
    ok: true
    month: string
    importedDays: number
  }
}

export async function resetAdminPredictionDay(
  date: string,
  fallbackMessage: string,
) {
  const response = await apiFetch(`/admin/predictions/${date}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(await readApiError(response, fallbackMessage))
  }
}
