'use client'

import clsx from 'clsx'
import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { useLanguage } from '@/components/language-provider'
import {
  fetchAdminPredictionMonth,
  generateAdminPredictionWeekHtml,
  importAdminPredictionMonthFromImage,
  resetAdminPredictionDay,
  saveAdminPredictionDay,
  type AdminPredictionDay,
  type AdminPredictionMonth,
  type PredictionActivities,
  type PredictionNotesByLanguage,
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

function normalizeNotesByLanguage(
  notesByLanguage: Partial<PredictionNotesByLanguage> | null | undefined,
  fallback = '',
): PredictionNotesByLanguage {
  const fallbackNote = fallback.trim()
  const english = notesByLanguage?.en?.trim() ?? ''
  const spanish = notesByLanguage?.es?.trim() ?? ''

  return {
    en: english || fallbackNote || spanish,
    es: spanish || fallbackNote || english,
  }
}

function readDayNotesByLanguage(day: Pick<AdminPredictionDay, 'notes' | 'notesByLanguage'>) {
  return normalizeNotesByLanguage(day.notesByLanguage, day.notes)
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
  const [selectedWeekKey, setSelectedWeekKey] = useState('')
  const [selectedGenerationDayKeys, setSelectedGenerationDayKeys] = useState<string[]>(
    [],
  )
  const [summary, setSummary] = useState<PredictionTone>('good')
  const [notesByLanguage, setNotesByLanguage] = useState<PredictionNotesByLanguage>({
    en: '',
    es: '',
  })
  const [saveBusy, setSaveBusy] = useState(false)
  const [importBusy, setImportBusy] = useState(false)
  const [weekHtmlBusy, setWeekHtmlBusy] = useState(false)
  const [generatedWeekHtml, setGeneratedWeekHtml] = useState('')
  const [generatedWeekSubject, setGeneratedWeekSubject] = useState('')
  const [generatedWeekPreviewText, setGeneratedWeekPreviewText] = useState('')
  const [saveMessage, setSaveMessage] = useState('')
  const [saveError, setSaveError] = useState('')
  const selectedDateKeyRef = useRef(selectedDateKey)
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const monthCacheRef = useRef(new Map<string, AdminPredictionMonth>())
  const pendingMonthRequestsRef = useRef(
    new Map<string, Promise<AdminPredictionMonth>>(),
  )
  const monthRequestVersionRef = useRef(new Map<string, number>())

  useEffect(() => {
    selectedDateKeyRef.current = selectedDateKey
  }, [selectedDateKey])

  const getMonthCacheKey = useCallback(
    (monthDate: Date) => `${toMonthKey(monthDate)}|${locale}`,
    [locale],
  )

  const fetchMonthCalendar = useCallback(
    async (monthDate: Date, options?: { force?: boolean }) => {
      const key = getMonthCacheKey(monthDate)

      if (!options?.force) {
        const cached = monthCacheRef.current.get(key)

        if (cached) {
          return cached
        }

        const pending = pendingMonthRequestsRef.current.get(key)

        if (pending) {
          return pending
        }
      }

      const nextVersion = (monthRequestVersionRef.current.get(key) ?? 0) + 1
      monthRequestVersionRef.current.set(key, nextVersion)

      const request = fetchAdminPredictionMonth(toMonthKey(monthDate), locale)
        .then((nextCalendar) => {
          if (monthRequestVersionRef.current.get(key) === nextVersion) {
            monthCacheRef.current.set(key, nextCalendar)
          }

          return nextCalendar
        })
        .finally(() => {
          if (monthRequestVersionRef.current.get(key) === nextVersion) {
            pendingMonthRequestsRef.current.delete(key)
          }
        })

      pendingMonthRequestsRef.current.set(key, request)

      return request
    },
    [getMonthCacheKey, locale],
  )

  const prefetchAdjacentMonths = useCallback(
    (monthDate: Date) => {
      void fetchMonthCalendar(addMonths(monthDate, -1)).catch(() => undefined)
      void fetchMonthCalendar(addMonths(monthDate, 1)).catch(() => undefined)
    },
    [fetchMonthCalendar],
  )

  useEffect(() => {
    let canceled = false

    const loadMonth = async () => {
      setError('')

      try {
        const cachedCalendar = monthCacheRef.current.get(
          getMonthCacheKey(visibleMonth),
        )

        if (cachedCalendar) {
          if (canceled) {
            return
          }

          setCalendar(cachedCalendar)
          setLoading(false)
          prefetchAdjacentMonths(visibleMonth)
          return
        }

        setLoading(true)

        const nextCalendar = await fetchMonthCalendar(visibleMonth)

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

        prefetchAdjacentMonths(visibleMonth)
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
  }, [
    fetchMonthCalendar,
    getMonthCacheKey,
    locale,
    messages.dashboard.predictionCalendar.loadError,
    prefetchAdjacentMonths,
    visibleMonth,
  ])

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

  const weekSelectionOptions = useMemo(() => {
    if (!calendar) {
      return []
    }

    return calendar.weeks.map((week, index) => ({
      key: toDayKey(week[0]!.date),
      index,
      week,
      firstDate: week[0]!.date,
      lastDate: week[week.length - 1]!.date,
    }))
  }, [calendar])

  useEffect(() => {
    if (weekSelectionOptions.length === 0) {
      return
    }

    const hasSelectedWeek = weekSelectionOptions.some(
      (option) => option.key === selectedWeekKey,
    )

    if (hasSelectedWeek) {
      return
    }

    const containingWeek =
      weekSelectionOptions.find((option) =>
        option.week.some((day) => toDayKey(day.date) === selectedDateKey),
      ) ?? weekSelectionOptions[0]

    if (containingWeek) {
      setSelectedWeekKey(containingWeek.key)
    }
  }, [selectedDateKey, selectedWeekKey, weekSelectionOptions])

  const selectedWeek = useMemo(
    () =>
      weekSelectionOptions.find((option) => option.key === selectedWeekKey)?.week ?? [],
    [selectedWeekKey, weekSelectionOptions],
  )

  useEffect(() => {
    if (!selectedDay) {
      return
    }

    setSummary(selectedDay.summary)
    setNotesByLanguage(readDayNotesByLanguage(selectedDay))
    setSaveError('')
  }, [selectedDay])

  const noteLanguageFromUi = language === 'es' ? 'es' : 'en'
  const notesReadyToSave =
    notesByLanguage.en.trim().length > 0 && notesByLanguage.es.trim().length > 0
  const selectedWeekDayKeys = useMemo(
    () => selectedWeek.map((day) => toDayKey(day.date)),
    [selectedWeek],
  )
  useEffect(() => {
    if (selectedWeekDayKeys.length === 0) {
      setSelectedGenerationDayKeys([])
      return
    }

    setSelectedGenerationDayKeys((current) => {
      const filtered = current.filter((dayKey) =>
        selectedWeekDayKeys.includes(dayKey),
      )

      if (filtered.length > 0) {
        return filtered
      }

      return selectedWeekDayKeys
    })
  }, [selectedWeekDayKeys])
  const selectedGenerationDaysCount = selectedGenerationDayKeys.length
  const selectedWeekRangeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
      }),
    [locale],
  )
  const generationDayChipFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        weekday: 'short',
        day: 'numeric',
        timeZone: 'UTC',
      }),
    [locale],
  )
  const selectedWeekRangeLabel = useMemo(() => {
    if (selectedWeek.length === 0) {
      return ''
    }

    const firstDate = new Date(selectedWeek[0]!.date)
    const lastDate = new Date(selectedWeek[selectedWeek.length - 1]!.date)

    return `${selectedWeekRangeFormatter.format(firstDate)} - ${selectedWeekRangeFormatter.format(lastDate)}`
  }, [selectedWeek, selectedWeekRangeFormatter])

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

  const visibleMonthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(visibleMonth),
    [locale, visibleMonth],
  )

  const overriddenDaysCount = useMemo(
    () => calendar?.currentMonthDays.filter((day) => day.isOverridden).length ?? 0,
    [calendar],
  )

  const refreshMonth = async (preferredDateKey?: string) => {
    const nextCalendar = await fetchMonthCalendar(visibleMonth, { force: true })
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
      setNotesByLanguage(readDayNotesByLanguage(nextSelectedDay))
    }

    prefetchAdjacentMonths(visibleMonth)
  }

  const openEditor = (day: AdminPredictionDay) => {
    if (!day.inCurrentMonth) {
      return
    }

    setSelectedDateKey(toDayKey(day.date))
    const containingWeek = weekSelectionOptions.find((option) =>
      option.week.some((candidate) => candidate.date === day.date),
    )

    if (containingWeek) {
      setSelectedWeekKey(containingWeek.key)
    }
    setSummary(day.summary)
    setNotesByLanguage(readDayNotesByLanguage(day))
    setSaveMessage('')
    setSaveError('')
    setEditorOpen(true)
  }

  const closeEditor = () => {
    setEditorOpen(false)
    setSaveError('')
    if (selectedDay) {
      setSummary(selectedDay.summary)
      setNotesByLanguage(readDayNotesByLanguage(selectedDay))
    }
  }

  const goToMonth = (offset: number) => {
    setVisibleMonth((currentMonth) => addMonths(currentMonth, offset))
    setEditorOpen(false)
    setSaveMessage('')
    setSaveError('')
    setGeneratedWeekHtml('')
    setGeneratedWeekSubject('')
    setGeneratedWeekPreviewText('')
  }

  const goToCurrentMonth = () => {
    const today = normalizeUtcDate(new Date())
    setVisibleMonth(startOfMonth(today))
    setSelectedDateKey(toDayKey(today.toISOString()))
    setEditorOpen(false)
    setGeneratedWeekHtml('')
    setGeneratedWeekSubject('')
    setGeneratedWeekPreviewText('')
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

  const handleToggleGenerationDay = (dayKey: string) => {
    setSelectedGenerationDayKeys((current) => {
      if (current.includes(dayKey)) {
        return current.filter((candidate) => candidate !== dayKey)
      }

      return [...current, dayKey]
    })
  }

  const handleSelectAllWeekDays = () => {
    setSelectedGenerationDayKeys(selectedWeekDayKeys)
  }

  const handleClearSelectedWeekDays = () => {
    setSelectedGenerationDayKeys([])
  }

  const handleGenerateSelectedDays = async () => {
    if (selectedGenerationDaysCount === 0) {
      return
    }

    const confirmed = window.confirm(
      messages.dashboard.predictionCalendar.generateWeekHtmlConfirm,
    )

    if (!confirmed) {
      return
    }

    setWeekHtmlBusy(true)
    setError('')
    setSaveError('')
    setSaveMessage('')

    try {
      const generated = await generateAdminPredictionWeekHtml(
        {
          dates: selectedGenerationDayKeys,
          locale,
        },
        messages.dashboard.predictionCalendar.generateWeekHtmlError,
      )
      setGeneratedWeekHtml(generated.html)
      setGeneratedWeekSubject(generated.subject)
      setGeneratedWeekPreviewText(generated.previewText)
      setSaveMessage(messages.dashboard.predictionCalendar.generateWeekHtmlSuccess)
    } catch (generationError) {
      setError(
        generationError instanceof Error
          ? generationError.message
          : messages.dashboard.predictionCalendar.generateWeekHtmlError,
      )
    } finally {
      setWeekHtmlBusy(false)
    }
  }

  const handleCopyWeekHtml = async () => {
    if (!generatedWeekHtml) {
      return
    }

    try {
      await navigator.clipboard.writeText(generatedWeekHtml)
      setSaveMessage(messages.dashboard.predictionCalendar.copyWeekHtmlSuccess)
      setError('')
    } catch {
      setError(messages.dashboard.predictionCalendar.copyWeekHtmlError)
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
      const normalizedNotesByLanguage = normalizeNotesByLanguage(notesByLanguage)

      await saveAdminPredictionDay(
        toDayKey(selectedDay.date),
        {
          summary,
          notes: normalizedNotesByLanguage[noteLanguageFromUi],
          notesByLanguage: normalizedNotesByLanguage,
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
      <section className="cosmic-shell cosmic-shell-copy rounded-[2rem] p-8">
        {messages.common.loading}
      </section>
    )
  }

  if (!calendar || !selectedDay) {
    return (
      <section className="cosmic-shell rounded-[2rem] p-8">
        <p className="cosmic-error-box rounded-2xl px-4 py-3 text-sm">
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
              <h2 className="cosmic-shell-title mt-3 text-3xl sm:text-4xl">
                {visibleMonthLabel}
              </h2>
              <p className="cosmic-shell-copy mt-3 max-w-2xl">
                {messages.dashboard.predictionCalendar.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleImportImageClick}
                disabled={importBusy || weekHtmlBusy}
                className="cosmic-button-primary rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.14em] disabled:opacity-60"
              >
                {importBusy
                  ? messages.dashboard.predictionCalendar.importFromImageBusy
                  : messages.dashboard.predictionCalendar.importFromImage}
              </button>
              <button
                type="button"
                onClick={() => goToMonth(-1)}
                disabled={importBusy || weekHtmlBusy}
                className="cosmic-outline-button rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.14em] disabled:opacity-50"
              >
                {messages.common.previous}
              </button>
              <button
                type="button"
                onClick={goToCurrentMonth}
                disabled={importBusy || weekHtmlBusy}
                className="cosmic-tab-active rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.14em] disabled:opacity-50"
              >
                {messages.dashboard.predictionCalendar.jumpToCurrentMonth}
              </button>
              <button
                type="button"
                onClick={() => goToMonth(1)}
                disabled={importBusy || weekHtmlBusy}
                className="cosmic-outline-button rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.14em] disabled:opacity-50"
              >
                {messages.common.next}
              </button>
            </div>
          </div>

          <p className="mt-4 max-w-3xl text-sm text-slate-100/72">
            {messages.dashboard.predictionCalendar.importFromImageHint}
          </p>

          <div className="cosmic-card mt-6 rounded-[1.8rem] p-4 sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100/68">
                  {messages.dashboard.predictionCalendar.weekHtmlGeneratorLabel}
                </p>
                <p className="cosmic-shell-meta mt-2 text-sm">
                  {messages.dashboard.predictionCalendar.selectedWeekLabel}:{' '}
                  <span className="font-semibold text-slate-100">
                    {selectedWeekRangeLabel}
                  </span>
                </p>
                <p className="cosmic-shell-meta mt-1 text-sm">
                  {messages.dashboard.predictionCalendar.selectedDaysCountLabel}:{' '}
                  <span className="font-semibold text-slate-100">
                    {selectedGenerationDaysCount}
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleGenerateSelectedDays}
                  disabled={weekHtmlBusy || importBusy || selectedGenerationDaysCount === 0}
                  className="cosmic-button-primary rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.14em] disabled:opacity-60"
                >
                  {weekHtmlBusy
                    ? messages.dashboard.predictionCalendar.generateWeekHtmlBusy
                    : messages.dashboard.predictionCalendar.generateWeekHtml}
                </button>
                <button
                  type="button"
                  onClick={handleCopyWeekHtml}
                  disabled={weekHtmlBusy || generatedWeekHtml.length === 0}
                  className="cosmic-outline-button rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.14em] disabled:opacity-60"
                >
                  {messages.dashboard.predictionCalendar.copyWeekHtml}
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(16rem,24rem)_1fr] lg:items-start">
              <label className="block">
                <span className="mb-2 block text-[0.7rem] font-black uppercase tracking-[0.16em] text-cyan-100/66">
                  {messages.dashboard.predictionCalendar.weekSelectorLabel}
                </span>
                <select
                  value={selectedWeekKey}
                  onChange={(event) => setSelectedWeekKey(event.target.value)}
                  className="cosmic-input w-full rounded-2xl px-4 py-3"
                  disabled={weekHtmlBusy || importBusy}
                >
                  {weekSelectionOptions.map((option) => {
                    const rangeLabel = `${selectedWeekRangeFormatter.format(new Date(option.firstDate))} - ${selectedWeekRangeFormatter.format(new Date(option.lastDate))}`

                    return (
                      <option key={option.key} value={option.key}>
                        {`W${option.index + 1} · ${rangeLabel}`}
                      </option>
                    )
                  })}
                </select>
              </label>

              <div>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[0.7rem] font-black uppercase tracking-[0.16em] text-cyan-100/66">
                    {messages.dashboard.predictionCalendar.weekDaysToGenerateLabel}
                  </span>
                  <span className="cosmic-shell-meta text-xs">
                    {messages.dashboard.predictionCalendar.selectedDaysCountLabel}:{' '}
                    <span className="font-semibold text-slate-100">
                      {selectedGenerationDaysCount}
                    </span>
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedWeek.map((day) => {
                    const dayKey = toDayKey(day.date)
                    const isSelected = selectedGenerationDayKeys.includes(dayKey)
                    const dayLabel = generationDayChipFormatter.format(
                      new Date(day.date),
                    )

                    return (
                      <button
                        key={day.date}
                        type="button"
                        onClick={() => handleToggleGenerationDay(dayKey)}
                        className={clsx(
                          'rounded-full border px-3 py-2 text-[0.65rem] font-black uppercase tracking-[0.14em] transition',
                          isSelected
                            ? 'border-cyan-200/30 bg-cyan-300/15 text-cyan-50'
                            : 'border-white/16 bg-slate-900/32 text-slate-100/76 hover:border-cyan-200/22 hover:text-slate-50',
                        )}
                      >
                        {`${dayLabel} · ${day.summary}`}
                      </button>
                    )
                  })}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllWeekDays}
                    disabled={weekHtmlBusy || importBusy || selectedWeekDayKeys.length === 0}
                    className="cosmic-outline-button rounded-full px-3 py-2 text-[0.65rem] font-black uppercase tracking-[0.14em] disabled:opacity-60"
                  >
                    {messages.dashboard.predictionCalendar.selectAllWeekDays}
                  </button>
                  <button
                    type="button"
                    onClick={handleClearSelectedWeekDays}
                    disabled={weekHtmlBusy || importBusy || selectedGenerationDaysCount === 0}
                    className="cosmic-outline-button rounded-full px-3 py-2 text-[0.65rem] font-black uppercase tracking-[0.14em] disabled:opacity-60"
                  >
                    {messages.dashboard.predictionCalendar.clearSelectedWeekDays}
                  </button>
                </div>
              </div>
            </div>
            <span className="cosmic-shell-meta mt-2 block text-xs">
              {messages.dashboard.predictionCalendar.weekHtmlGeneratorHint}
            </span>

            {generatedWeekHtml ? (
              <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(16rem,22rem)_1fr]">
                <div className="space-y-3">
                  <label className="block">
                    <span className="mb-2 block text-[0.7rem] font-black uppercase tracking-[0.16em] text-cyan-100/66">
                      {messages.dashboard.predictionCalendar.weekHtmlSubjectLabel}
                    </span>
                    <input
                      readOnly
                      value={generatedWeekSubject}
                      className="cosmic-input w-full rounded-2xl px-4 py-3 text-sm"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[0.7rem] font-black uppercase tracking-[0.16em] text-cyan-100/66">
                      {messages.dashboard.predictionCalendar.weekHtmlPreviewTextLabel}
                    </span>
                    <textarea
                      readOnly
                      value={generatedWeekPreviewText}
                      rows={3}
                      className="cosmic-input w-full rounded-2xl px-4 py-3 text-sm"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[0.7rem] font-black uppercase tracking-[0.16em] text-cyan-100/66">
                      {messages.dashboard.predictionCalendar.weekHtmlCodeLabel}
                    </span>
                    <textarea
                      readOnly
                      value={generatedWeekHtml}
                      rows={14}
                      className="cosmic-input w-full rounded-2xl px-4 py-3 font-mono text-[0.7rem]"
                    />
                  </label>
                </div>

                <div>
                  <p className="mb-2 text-[0.7rem] font-black uppercase tracking-[0.16em] text-cyan-100/66">
                    {messages.dashboard.predictionCalendar.weekHtmlPreviewLabel}
                  </p>
                  <iframe
                    title={messages.dashboard.predictionCalendar.weekHtmlPreviewLabel}
                    srcDoc={generatedWeekHtml}
                    sandbox=""
                    className="h-[560px] w-full rounded-2xl border border-white/16 bg-white"
                  />
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="cosmic-card rounded-[1.8rem] p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100/68">
                {messages.dashboard.predictionCalendar.monthSummary}
              </p>
              <p className="cosmic-shell-title mt-3 text-3xl">
                {calendar.currentMonthDays.length}
              </p>
              <p className="cosmic-shell-meta mt-1 text-sm">
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
              <span className="font-semibold text-slate-50">{overriddenDaysCount}</span>{' '}
              {messages.dashboard.predictionCalendar.customDaysText}
            </p>
          ) : null}

          {saveMessage ? (
            <p className="cosmic-success-box mt-6 rounded-2xl px-4 py-3 text-sm">
              {saveMessage}
            </p>
          ) : null}

          {error ? (
            <p className="cosmic-error-box mt-6 rounded-2xl px-4 py-3 text-sm">
              {error}
            </p>
          ) : null}

          <div className="mt-8 overflow-x-auto pb-2">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-7 gap-3">
                {calendar.weekdayLabels.map((weekdayLabel) => (
                  <div
                    key={weekdayLabel}
                    className="cosmic-shell-meta px-2 pb-2 text-center text-xs font-black uppercase tracking-[0.18em]"
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
                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className="inline-flex rounded-full border border-white/16 bg-slate-950/26 px-2 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-slate-100/76">
                                {day.isOverridden
                                  ? messages.dashboard.predictionCalendar.overrideBadge
                                  : messages.dashboard.predictionCalendar.generatedBadge}
                              </span>
                              {day.generatedImage ? (
                                <span className="inline-flex rounded-full border border-cyan-200/24 bg-cyan-400/10 px-2 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-cyan-50">
                                  {messages.dashboard.predictionCalendar.dayImageBadge}
                                </span>
                              ) : null}
                            </div>
                          ) : null}
                        </div>

                        <span
                          className={clsx(
                            'text-2xl font-semibold',
                            day.inCurrentMonth ? 'text-slate-50' : 'text-slate-100/42',
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
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
          <button
            type="button"
            aria-label={messages.common.cancel}
            onClick={closeEditor}
            className="absolute inset-0 bg-slate-950/72 backdrop-blur-sm"
          />

          <div className="luck-glow cosmic-panel relative z-10 my-4 max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-[2.2rem] p-6 shadow-[0_32px_120px_rgba(2,6,23,0.65)] sm:p-8">
            <div className="pointer-events-none absolute inset-0 cosmic-nebula opacity-80" />
            <div className="pointer-events-none absolute inset-0 cosmic-stars opacity-25" />

            <div className="relative z-10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100/68">
                    {messages.dashboard.predictionCalendar.selectedDay}
                  </p>
                  <h3 className="cosmic-shell-title mt-3 text-3xl">
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
                    {selectedDay.generatedImage ? (
                      <span className="inline-flex rounded-full border border-cyan-200/24 bg-cyan-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-50">
                        {messages.dashboard.predictionCalendar.dayImageBadge}
                      </span>
                    ) : null}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeEditor}
                  className="cosmic-outline-button rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.14em]"
                >
                  {messages.common.cancel}
                </button>
              </div>

              {selectedDay.generatedImage ? (
                <div className="mt-6">
                  <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-100/68">
                    {messages.dashboard.predictionCalendar.dayImagePreviewLabel}
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedDay.generatedImage.dataUrl}
                    alt={messages.dashboard.predictionCalendar.dayImagePreviewLabel}
                    className="h-60 w-full rounded-2xl border border-white/16 bg-slate-900/38 object-cover"
                  />
                </div>
              ) : null}

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

                <div>
                  <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-cyan-100/68">
                    {messages.dashboard.predictionCalendar.notesLabel}
                  </p>
                  <div className="grid gap-4">
                    <label className="block">
                      <span className="mb-2 block text-[0.7rem] font-black uppercase tracking-[0.16em] text-cyan-100/66">
                        {messages.dashboard.predictionCalendar.notesEnglishLabel}
                      </span>
                      <textarea
                        value={notesByLanguage.en}
                        onChange={(event) =>
                          setNotesByLanguage((current) => ({
                            ...current,
                            en: event.target.value,
                          }))
                        }
                        rows={4}
                        maxLength={600}
                        disabled={saveBusy}
                        className="cosmic-input min-h-[7.6rem] w-full rounded-2xl px-4 py-3"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-[0.7rem] font-black uppercase tracking-[0.16em] text-cyan-100/66">
                        {messages.dashboard.predictionCalendar.notesSpanishLabel}
                      </span>
                      <textarea
                        value={notesByLanguage.es}
                        onChange={(event) =>
                          setNotesByLanguage((current) => ({
                            ...current,
                            es: event.target.value,
                          }))
                        }
                        rows={4}
                        maxLength={600}
                        disabled={saveBusy}
                        className="cosmic-input min-h-[7.6rem] w-full rounded-2xl px-4 py-3"
                      />
                    </label>
                  </div>
                  <span className="cosmic-shell-meta mt-2 block text-xs">
                    {messages.dashboard.predictionCalendar.notesHint}
                  </span>
                </div>

                {saveError ? (
                  <p className="cosmic-error-box rounded-2xl px-4 py-3 text-sm">
                    {saveError}
                  </p>
                ) : null}

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={saveBusy || !notesReadyToSave}
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
                    className="cosmic-outline-button rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.14em] disabled:opacity-40"
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
