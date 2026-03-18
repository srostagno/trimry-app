'use client'

import clsx from 'clsx'
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react'

import { useLanguage } from '@/components/language-provider'
import {
  fetchAdminPredictionMonth,
  importAdminPredictionMonthFromImage,
  resetAdminPredictionDay,
  saveAdminPredictionDay,
  type AdminPredictionDay,
  type AdminPredictionMonth,
  type PredictionActivities,
  type PredictionTone,
} from '@/lib/admin-predictions'

const localeByLanguage = {
  en: 'en-US',
  es: 'es-CL',
} as const

const MAX_IMPORT_IMAGE_DIMENSION = 1600
const MAX_IMPORT_IMAGE_DATA_URL_LENGTH = 3_200_000

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

function startOfMonth(date: Date) {
  return createUtcDate(date.getUTCFullYear(), date.getUTCMonth(), 1)
}

function addMonths(date: Date, offset: number) {
  return createUtcDate(date.getUTCFullYear(), date.getUTCMonth() + offset, 1)
}

function toMonthKey(date: Date) {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

function toDayKey(isoDate: string) {
  return isoDate.slice(0, 10)
}

function buildUniformActivities(summary: PredictionTone): PredictionActivities {
  return {
    haircut: summary,
    shave: summary,
    nails: summary,
    release: summary,
  }
}

function truncate(text: string, maxLength: number) {
  const normalized = text.trim()

  if (normalized.length <= maxLength) {
    return normalized
  }

  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`
}

async function loadImageFile(file: File) {
  const objectUrl = URL.createObjectURL(file)

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const nextImage = new Image()

      nextImage.onload = () => resolve(nextImage)
      nextImage.onerror = () => reject(new Error('Unable to read this image file.'))
      nextImage.src = objectUrl
    })

    return image
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

async function toPredictionImageDataUrl(file: File) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file.')
  }

  const image = await loadImageFile(file)
  const scale = Math.min(
    1,
    MAX_IMPORT_IMAGE_DIMENSION /
      Math.max(image.naturalWidth || 1, image.naturalHeight || 1),
  )
  const canvas = document.createElement('canvas')

  canvas.width = Math.max(1, Math.round((image.naturalWidth || 1) * scale))
  canvas.height = Math.max(1, Math.round((image.naturalHeight || 1) * scale))

  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Unable to prepare the uploaded image.')
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height)

  let quality = 0.88
  let dataUrl = canvas.toDataURL('image/jpeg', quality)

  while (
    dataUrl.length > MAX_IMPORT_IMAGE_DATA_URL_LENGTH &&
    quality > 0.46
  ) {
    quality -= 0.08
    dataUrl = canvas.toDataURL('image/jpeg', quality)
  }

  if (dataUrl.length > MAX_IMPORT_IMAGE_DATA_URL_LENGTH) {
    throw new Error('The selected image is too large. Try a smaller screenshot or crop.')
  }

  return dataUrl
}

function toneBadgeClass(tone: PredictionTone, compact = false) {
  const sizeClass = compact ? 'oracle-tone-badge-compact' : ''

  return clsx(
    'oracle-tone-badge',
    sizeClass,
    tone === 'good'
      ? 'oracle-tone-badge-good'
      : tone === 'bad'
        ? 'oracle-tone-badge-bad'
        : 'oracle-tone-badge-rare',
  )
}

function toneGlyph(tone: PredictionTone) {
  return tone === 'good' ? '↑' : tone === 'bad' ? '!' : '✦'
}

function toneSurfaceClass(tone: PredictionTone) {
  return tone === 'good'
    ? 'border-cyan-200/24 bg-[radial-gradient(circle_at_top_left,rgba(144,255,224,0.18),transparent_34%),linear-gradient(160deg,rgba(6,28,42,0.94),rgba(7,24,45,0.82)_52%,rgba(8,40,60,0.72))] shadow-[0_18px_42px_rgba(7,52,68,0.22)]'
    : tone === 'bad'
      ? 'border-rose-200/24 bg-[radial-gradient(circle_at_top_left,rgba(255,145,180,0.16),transparent_34%),linear-gradient(160deg,rgba(42,10,24,0.96),rgba(33,12,31,0.84)_52%,rgba(26,11,32,0.76))] shadow-[0_18px_42px_rgba(74,16,42,0.24)]'
      : 'border-fuchsia-200/24 bg-[radial-gradient(circle_at_top_left,rgba(218,143,255,0.16),transparent_34%),linear-gradient(160deg,rgba(28,10,52,0.96),rgba(29,14,57,0.84)_52%,rgba(18,16,47,0.76))] shadow-[0_18px_42px_rgba(63,25,104,0.24)]'
}

function toneRingClass(tone: PredictionTone) {
  return tone === 'good'
    ? 'ring-cyan-200/60'
    : tone === 'bad'
      ? 'ring-rose-200/60'
      : 'ring-fuchsia-200/60'
}

function ToneToggle({
  value,
  onChange,
  goodLabel,
  badLabel,
  rareLabel,
  disabled,
}: {
  value: PredictionTone
  onChange: (nextValue: PredictionTone) => void
  goodLabel: string
  badLabel: string
  rareLabel: string
  disabled?: boolean
}) {
  const options: Array<{ tone: PredictionTone; label: string }> = [
    { tone: 'good', label: goodLabel },
    { tone: 'bad', label: badLabel },
    { tone: 'rare', label: rareLabel },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {options.map((option) => (
        <button
          key={option.tone}
          type="button"
          disabled={disabled}
          onClick={() => onChange(option.tone)}
          className={clsx(
            'rounded-[1.65rem] border bg-black/16 p-3 text-left transition duration-200 disabled:opacity-60',
            toneSurfaceClass(option.tone),
            value === option.tone
              ? clsx('scale-[1.01] ring-2', toneRingClass(option.tone))
              : 'opacity-82 hover:-translate-y-[1px] hover:opacity-100',
          )}
        >
          <span className={clsx(toneBadgeClass(option.tone), 'scale-[0.88] origin-left')}>
            <span aria-hidden="true" className="oracle-tone-badge-icon">
              {toneGlyph(option.tone)}
            </span>
            {option.label}
          </span>
        </button>
      ))}
    </div>
  )
}

export function AdminPredictionCalendar() {
  const { language, messages } = useLanguage()
  const locale = localeByLanguage[language] ?? 'en-US'
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()))
  const [calendar, setCalendar] = useState<AdminPredictionMonth | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editorOpen, setEditorOpen] = useState(false)
  const [selectedDateKey, setSelectedDateKey] = useState(() =>
    toDayKey(normalizeUtcDate(new Date()).toISOString()),
  )
  const [summary, setSummary] = useState<PredictionTone>('good')
  const [notes, setNotes] = useState('')
  const [saveBusy, setSaveBusy] = useState(false)
  const [importBusy, setImportBusy] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [saveError, setSaveError] = useState('')
  const selectedDateKeyRef = useRef(selectedDateKey)
  const imageInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    selectedDateKeyRef.current = selectedDateKey
  }, [selectedDateKey])

  useEffect(() => {
    let canceled = false

    const loadMonth = async () => {
      setLoading(true)
      setError('')

      try {
        const nextCalendar = await fetchAdminPredictionMonth(
          toMonthKey(visibleMonth),
          locale,
        )

        if (canceled) {
          return
        }

        setCalendar(nextCalendar)

        const flatDays = nextCalendar.weeks.flat()
        const nextSelectedDay =
          flatDays.find(
            (day) =>
              day.inCurrentMonth &&
              toDayKey(day.date) === selectedDateKeyRef.current,
          ) ??
          nextCalendar.currentMonthDays.find((day) => day.isToday) ??
          nextCalendar.currentMonthDays[0] ??
          null

        if (nextSelectedDay) {
          setSelectedDateKey(toDayKey(nextSelectedDay.date))
        }
      } catch (loadError) {
        if (canceled) {
          return
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : messages.dashboard.predictionCalendar.loadError,
        )
      } finally {
        if (!canceled) {
          setLoading(false)
        }
      }
    }

    void loadMonth()

    return () => {
      canceled = true
    }
  }, [locale, messages.dashboard.predictionCalendar.loadError, visibleMonth])

  const selectedDay = useMemo(() => {
    if (!calendar) {
      return null
    }

    return (
      calendar.currentMonthDays.find(
        (day) => toDayKey(day.date) === selectedDateKey,
      ) ??
      calendar.currentMonthDays[0] ??
      null
    )
  }, [calendar, selectedDateKey])

  useEffect(() => {
    if (!selectedDay) {
      return
    }

    setSummary(selectedDay.summary)
    setNotes(selectedDay.notes)
    setSaveError('')
  }, [selectedDay])

  const selectedDayLabelFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      }),
    [locale],
  )

  const overriddenDaysCount = useMemo(
    () => calendar?.currentMonthDays.filter((day) => day.isOverridden).length ?? 0,
    [calendar],
  )

  const refreshMonth = async (preferredDateKey?: string) => {
    const nextCalendar = await fetchAdminPredictionMonth(toMonthKey(visibleMonth), locale)
    setCalendar(nextCalendar)

    const nextSelectedDay =
      nextCalendar.currentMonthDays.find(
        (day) => toDayKey(day.date) === preferredDateKey,
      ) ??
      nextCalendar.currentMonthDays.find((day) => day.isToday) ??
      nextCalendar.currentMonthDays[0] ??
      null

    if (nextSelectedDay) {
      setSelectedDateKey(toDayKey(nextSelectedDay.date))
      setSummary(nextSelectedDay.summary)
      setNotes(nextSelectedDay.notes)
    }
  }

  const openEditor = (day: AdminPredictionDay) => {
    if (!day.inCurrentMonth) {
      return
    }

    setSelectedDateKey(toDayKey(day.date))
    setSummary(day.summary)
    setNotes(day.notes)
    setSaveMessage('')
    setSaveError('')
    setEditorOpen(true)
  }

  const closeEditor = () => {
    setEditorOpen(false)
    setSaveError('')
    if (selectedDay) {
      setSummary(selectedDay.summary)
      setNotes(selectedDay.notes)
    }
  }

  const goToMonth = (offset: number) => {
    setVisibleMonth((currentMonth) => addMonths(currentMonth, offset))
    setEditorOpen(false)
    setSaveMessage('')
    setSaveError('')
  }

  const goToCurrentMonth = () => {
    const today = normalizeUtcDate(new Date())
    setVisibleMonth(startOfMonth(today))
    setSelectedDateKey(toDayKey(today.toISOString()))
    setEditorOpen(false)
  }

  const handleImportImageClick = () => {
    imageInputRef.current?.click()
  }

  const handleImportImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    const confirmed = window.confirm(
      messages.dashboard.predictionCalendar.importFromImageConfirm,
    )

    if (!confirmed) {
      return
    }

    setImportBusy(true)
    setError('')
    setSaveError('')
    setSaveMessage('')

    try {
      const imageDataUrl = await toPredictionImageDataUrl(file)

      await importAdminPredictionMonthFromImage(
        {
          month: toMonthKey(visibleMonth),
          locale,
          imageDataUrl,
        },
        messages.dashboard.predictionCalendar.importFromImageError,
      )

      await refreshMonth(selectedDateKeyRef.current)
      setSaveMessage(messages.dashboard.predictionCalendar.importFromImageSuccess)
    } catch (importError) {
      setError(
        importError instanceof Error
          ? importError.message
          : messages.dashboard.predictionCalendar.importFromImageError,
      )
    } finally {
      setImportBusy(false)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedDay) {
      return
    }

    setSaveBusy(true)
    setSaveError('')
    setSaveMessage('')

    try {
      await saveAdminPredictionDay(
        toDayKey(selectedDay.date),
        {
          summary,
          notes: notes.trim(),
          activities: buildUniformActivities(summary),
        },
        messages.dashboard.predictionCalendar.saveError,
      )
      await refreshMonth(toDayKey(selectedDay.date))
      setSaveMessage(messages.dashboard.predictionCalendar.saveSuccess)
      setEditorOpen(false)
    } catch (submitError) {
      setSaveError(
        submitError instanceof Error
          ? submitError.message
          : messages.dashboard.predictionCalendar.saveError,
      )
    } finally {
      setSaveBusy(false)
    }
  }

  const handleReset = async () => {
    if (!selectedDay) {
      return
    }

    const confirmed = window.confirm(
      messages.dashboard.predictionCalendar.resetConfirm,
    )

    if (!confirmed) {
      return
    }

    setSaveBusy(true)
    setSaveError('')
    setSaveMessage('')

    try {
      await resetAdminPredictionDay(
        toDayKey(selectedDay.date),
        messages.dashboard.predictionCalendar.saveError,
      )
      await refreshMonth(toDayKey(selectedDay.date))
      setSaveMessage(messages.dashboard.predictionCalendar.saveSuccess)
      setEditorOpen(false)
    } catch (resetError) {
      setSaveError(
        resetError instanceof Error
          ? resetError.message
          : messages.dashboard.predictionCalendar.saveError,
      )
    } finally {
      setSaveBusy(false)
    }
  }

  if (loading && !calendar) {
    return (
      <section className="rounded-[2rem] border border-cyan-200/18 bg-black/30 p-8 text-amber-100">
        {messages.common.loading}
      </section>
    )
  }

  if (!calendar || !selectedDay) {
    return (
      <section className="rounded-[2rem] border border-cyan-200/18 bg-black/30 p-8">
        <p className="text-rose-100">
          {error || messages.dashboard.predictionCalendar.loadError}
        </p>
      </section>
    )
  }

  return (
    <>
      <section className="luck-glow cosmic-panel relative overflow-hidden rounded-[2.2rem] p-6 sm:p-8">
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleImportImage}
        />
        <div className="pointer-events-none absolute inset-0 cosmic-nebula opacity-90" />
        <div className="pointer-events-none absolute inset-0 cosmic-grid opacity-40" />
        <div className="pointer-events-none absolute inset-0 cosmic-stars opacity-35" />
        <span className="pointer-events-none cosmic-orb orb-1 opacity-80" />
        <span className="pointer-events-none cosmic-orb orb-2 opacity-70" />
        <span className="pointer-events-none cosmic-orb orb-3 opacity-70" />

        <div className="relative z-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-100/70">
                {messages.dashboard.predictionCalendar.title}
              </p>
              <h2 className="mt-3 text-3xl text-amber-50 sm:text-4xl">
                {calendar.monthLabel}
              </h2>
              <p className="mt-3 max-w-2xl text-amber-100/82">
                {messages.dashboard.predictionCalendar.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleImportImageClick}
                disabled={importBusy}
                className="cosmic-button-primary rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.14em] disabled:opacity-60"
              >
                {importBusy
                  ? messages.dashboard.predictionCalendar.importFromImageBusy
                  : messages.dashboard.predictionCalendar.importFromImage}
              </button>
              <button
                type="button"
                onClick={() => goToMonth(-1)}
                disabled={importBusy}
                className="cosmic-button-secondary rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-amber-50 transition hover:border-amber-100/45 disabled:opacity-50"
              >
                {messages.common.previous}
              </button>
              <button
                type="button"
                onClick={goToCurrentMonth}
                disabled={importBusy}
                className="rounded-full border border-cyan-200/28 bg-cyan-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-cyan-50 transition hover:border-cyan-100/45 disabled:opacity-50"
              >
                {messages.dashboard.predictionCalendar.jumpToCurrentMonth}
              </button>
              <button
                type="button"
                onClick={() => goToMonth(1)}
                disabled={importBusy}
                className="cosmic-button-secondary rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-amber-50 transition hover:border-amber-100/45 disabled:opacity-50"
              >
                {messages.common.next}
              </button>
            </div>
          </div>

          <p className="mt-4 max-w-3xl text-sm text-slate-100/72">
            {messages.dashboard.predictionCalendar.importFromImageHint}
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="cosmic-card rounded-[1.8rem] p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100/68">
                {messages.dashboard.predictionCalendar.monthSummary}
              </p>
              <p className="mt-3 text-3xl text-amber-50">
                {calendar.currentMonthDays.length}
              </p>
              <p className="mt-1 text-sm text-amber-100/78">
                {messages.dashboard.predictionCalendar.daysInMonth}
              </p>
            </div>
            <div className={clsx('rounded-[1.8rem] border p-4', toneSurfaceClass('good'))}>
              <span className={toneBadgeClass('good', true)}>
                <span aria-hidden="true" className="oracle-tone-badge-icon">
                  {toneGlyph('good')}
                </span>
                {messages.dashboard.predictionCalendar.goodTone}
              </span>
              <p className="mt-4 text-3xl text-slate-50">{calendar.goodDays}</p>
              <p className="mt-1 text-sm text-cyan-100/82">
                {messages.dashboard.predictionCalendar.goodSummaryText}
              </p>
            </div>
            <div className={clsx('rounded-[1.8rem] border p-4', toneSurfaceClass('bad'))}>
              <span className={toneBadgeClass('bad', true)}>
                <span aria-hidden="true" className="oracle-tone-badge-icon">
                  {toneGlyph('bad')}
                </span>
                {messages.dashboard.predictionCalendar.badTone}
              </span>
              <p className="mt-4 text-3xl text-slate-50">{calendar.badDays}</p>
              <p className="mt-1 text-sm text-rose-100/82">
                {messages.dashboard.predictionCalendar.badSummaryText}
              </p>
            </div>
            <div className={clsx('rounded-[1.8rem] border p-4', toneSurfaceClass('rare'))}>
              <span className={toneBadgeClass('rare', true)}>
                <span aria-hidden="true" className="oracle-tone-badge-icon">
                  {toneGlyph('rare')}
                </span>
                {messages.dashboard.predictionCalendar.rareTone}
              </span>
              <p className="mt-4 text-3xl text-slate-50">{calendar.rareDays}</p>
              <p className="mt-1 text-sm text-fuchsia-100/82">
                {messages.dashboard.predictionCalendar.rareSummaryText}
              </p>
            </div>
          </div>

          {overriddenDaysCount > 0 ? (
            <p className="mt-4 text-sm text-slate-100/74">
              <span className="font-semibold text-amber-50">{overriddenDaysCount}</span>{' '}
              {messages.dashboard.predictionCalendar.customDaysText}
            </p>
          ) : null}

          {saveMessage ? (
            <p className="mt-6 rounded-2xl border border-emerald-300/40 bg-emerald-900/18 px-4 py-3 text-sm text-emerald-100">
              {saveMessage}
            </p>
          ) : null}

          {error ? (
            <p className="mt-6 rounded-2xl border border-rose-300/40 bg-rose-900/20 px-4 py-3 text-sm text-rose-100">
              {error}
            </p>
          ) : null}

          <div className="mt-8 overflow-x-auto pb-2">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-7 gap-3">
                {calendar.weekdayLabels.map((weekdayLabel) => (
                  <div
                    key={weekdayLabel}
                    className="px-2 pb-2 text-center text-xs font-black uppercase tracking-[0.18em] text-amber-100/66"
                  >
                    {weekdayLabel}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-3">
                {calendar.weeks.flat().map((day) => (
                  <button
                    key={day.date}
                    type="button"
                    onClick={() => openEditor(day)}
                    disabled={!day.inCurrentMonth}
                    className={clsx(
                      'relative min-h-[11.5rem] overflow-hidden rounded-[1.85rem] border p-4 text-left transition duration-200 focus:outline-none focus-visible:ring-2 disabled:cursor-default',
                      toneSurfaceClass(day.summary),
                      day.inCurrentMonth
                        ? 'opacity-100 hover:-translate-y-[3px]'
                        : 'opacity-30 saturate-50',
                      day.inCurrentMonth &&
                        toDayKey(day.date) === selectedDateKey &&
                        clsx('ring-2', toneRingClass(day.summary)),
                    )}
                  >
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent_24%,rgba(255,255,255,0.02)_100%)]" />

                    <div className="relative z-10 flex h-full flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          {day.inCurrentMonth ? (
                            <span
                              className={clsx(
                                toneBadgeClass(day.summary, true),
                                'max-w-fit',
                              )}
                            >
                              <span
                                aria-hidden="true"
                                className="oracle-tone-badge-icon"
                              >
                                {toneGlyph(day.summary)}
                              </span>
                              {day.summary === 'good'
                                ? messages.dashboard.predictionCalendar.goodTone
                                : day.summary === 'bad'
                                  ? messages.dashboard.predictionCalendar.badTone
                                  : messages.dashboard.predictionCalendar.rareTone}
                            </span>
                          ) : null}
                          {day.inCurrentMonth ? (
                            <span className="mt-2 inline-flex rounded-full border border-white/16 bg-slate-950/26 px-2 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-slate-100/76">
                              {day.isOverridden
                                ? messages.dashboard.predictionCalendar.overrideBadge
                                : messages.dashboard.predictionCalendar.generatedBadge}
                            </span>
                          ) : null}
                        </div>

                        <span
                          className={clsx(
                            'text-2xl font-semibold',
                            day.inCurrentMonth ? 'text-amber-50' : 'text-slate-100/42',
                          )}
                        >
                          {day.dayOfMonth}
                        </span>
                      </div>

                      {day.inCurrentMonth ? (
                        <p className="mt-4 text-sm leading-6 text-slate-100/84">
                          {truncate(day.notes, 92)}
                        </p>
                      ) : null}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {editorOpen && selectedDay ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label={messages.common.cancel}
            onClick={closeEditor}
            className="absolute inset-0 bg-slate-950/72 backdrop-blur-sm"
          />

          <div className="luck-glow cosmic-panel relative z-10 w-full max-w-2xl overflow-hidden rounded-[2.2rem] p-6 shadow-[0_32px_120px_rgba(2,6,23,0.65)] sm:p-8">
            <div className="pointer-events-none absolute inset-0 cosmic-nebula opacity-80" />
            <div className="pointer-events-none absolute inset-0 cosmic-stars opacity-25" />

            <div className="relative z-10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100/68">
                    {messages.dashboard.predictionCalendar.selectedDay}
                  </p>
                  <h3 className="mt-3 text-3xl text-amber-50">
                    {selectedDayLabelFormatter.format(new Date(selectedDay.date))}
                  </h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className={toneBadgeClass(summary)}>
                      <span aria-hidden="true" className="oracle-tone-badge-icon">
                        {toneGlyph(summary)}
                      </span>
                      {summary === 'good'
                        ? messages.dashboard.predictionCalendar.goodTone
                        : summary === 'bad'
                          ? messages.dashboard.predictionCalendar.badTone
                          : messages.dashboard.predictionCalendar.rareTone}
                    </span>
                    <span
                      className={clsx(
                        'inline-flex rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.18em]',
                        selectedDay.isOverridden
                          ? 'border border-cyan-200/24 bg-cyan-400/10 text-cyan-50'
                          : 'border border-slate-200/16 bg-slate-900/34 text-slate-100/76',
                      )}
                    >
                      {selectedDay.isOverridden
                        ? messages.dashboard.predictionCalendar.overrideBadge
                        : messages.dashboard.predictionCalendar.generatedBadge}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeEditor}
                  className="cosmic-button-secondary rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-amber-50"
                >
                  {messages.common.cancel}
                </button>
              </div>

              <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                <div>
                  <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-cyan-100/68">
                    {messages.dashboard.predictionCalendar.summaryLabel}
                  </p>
                  <ToneToggle
                    value={summary}
                    onChange={setSummary}
                    goodLabel={messages.dashboard.predictionCalendar.goodOption}
                    badLabel={messages.dashboard.predictionCalendar.badOption}
                    rareLabel={messages.dashboard.predictionCalendar.rareOption}
                    disabled={saveBusy}
                  />
                </div>

                <label className="block">
                  <span className="mb-3 block text-xs font-black uppercase tracking-[0.18em] text-cyan-100/68">
                    {messages.dashboard.predictionCalendar.notesLabel}
                  </span>
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={6}
                    maxLength={600}
                    disabled={saveBusy}
                    className="cosmic-input min-h-[10rem] w-full rounded-2xl px-4 py-3"
                  />
                  <span className="mt-2 block text-xs text-amber-100/68">
                    {messages.dashboard.predictionCalendar.notesHint}
                  </span>
                </label>

                {saveError ? (
                  <p className="rounded-2xl border border-rose-300/40 bg-rose-900/20 px-4 py-3 text-sm text-rose-100">
                    {saveError}
                  </p>
                ) : null}

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={saveBusy || notes.trim().length === 0}
                    className="cosmic-button-primary rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.14em] disabled:opacity-60"
                  >
                    {saveBusy
                      ? messages.common.saving
                      : messages.dashboard.predictionCalendar.saveDay}
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={saveBusy || !selectedDay.isOverridden}
                    className="rounded-full border border-amber-100/25 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-amber-50 disabled:opacity-40"
                  >
                    {messages.dashboard.predictionCalendar.resetDay}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
