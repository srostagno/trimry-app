'use client'

import { useEffect, useMemo, useState } from 'react'

type DateOfBirthPickerProps = {
  idPrefix: string
  value: string
  onChange: (value: string) => void
  language: string
  required?: boolean
}

function parseValue(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)

  if (!match) {
    return {
      year: '',
      month: '',
      day: '',
    }
  }

  return {
    year: match[1] ?? '',
    month: match[2] ?? '',
    day: match[3] ?? '',
  }
}

function daysInMonth(year: string, month: string) {
  const parsedYear = Number.parseInt(year, 10)
  const parsedMonth = Number.parseInt(month, 10)

  if (!Number.isInteger(parsedYear) || !Number.isInteger(parsedMonth)) {
    return 31
  }

  return new Date(Date.UTC(parsedYear, parsedMonth, 0)).getUTCDate()
}

function formatDateValue(year: string, month: string, day: string) {
  if (!year || !month || !day) {
    return ''
  }

  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

export function DateOfBirthPicker({
  idPrefix,
  value,
  onChange,
  language,
  required = false,
}: DateOfBirthPickerProps) {
  const [{ year, month, day }, setParts] = useState(() => parseValue(value))
  const locale = language.startsWith('es') ? 'es-CL' : 'en-US'
  const isSpanish = language.startsWith('es')
  const currentYear = new Date().getFullYear()
  const maxDay = daysInMonth(year, month)

  const years = useMemo(
    () => Array.from({ length: 121 }, (_, index) => String(currentYear - index)),
    [currentYear],
  )
  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => {
        const monthDate = new Date(Date.UTC(2025, index, 1))
        const label = new Intl.DateTimeFormat(locale, {
          month: 'long',
          timeZone: 'UTC',
        }).format(monthDate)

        return {
          value: String(index + 1).padStart(2, '0'),
          label: `${label.charAt(0).toLocaleUpperCase(locale)}${label.slice(1)}`,
        }
      }),
    [locale],
  )
  const days = useMemo(
    () => Array.from({ length: maxDay }, (_, index) => String(index + 1).padStart(2, '0')),
    [maxDay],
  )

  useEffect(() => {
    setParts(parseValue(value))
  }, [value])

  const updatePart = (key: 'year' | 'month' | 'day', nextValue: string) => {
    setParts((current) => {
      const next = {
        ...current,
        [key]: nextValue,
      }
      const nextMaxDay = daysInMonth(next.year, next.month)

      if (Number.parseInt(next.day, 10) > nextMaxDay) {
        next.day = String(nextMaxDay).padStart(2, '0')
      }

      onChange(formatDateValue(next.year, next.month, next.day))

      return next
    })
  }

  const selectClassName =
    'cosmic-input h-12 w-full rounded-xl px-3 py-2 text-sm font-semibold text-slate-50'

  return (
    <div className="rounded-[1.35rem] border border-cyan-100/18 bg-slate-950/30 p-3">
      <div className="grid gap-3 sm:grid-cols-[1.15fr_0.85fr_0.85fr]">
        <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100/72">
          {isSpanish ? 'Mes' : 'Month'}
          <select
            id={`${idPrefix}-month`}
            value={month}
            onChange={(event) => updatePart('month', event.target.value)}
            required={required}
            className={`${selectClassName} mt-2`}
          >
            <option value="">{isSpanish ? 'Mes' : 'Month'}</option>
            {months.map((monthOption) => (
              <option key={monthOption.value} value={monthOption.value}>
                {monthOption.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100/72">
          {isSpanish ? 'Día' : 'Day'}
          <select
            id={`${idPrefix}-day`}
            value={day}
            onChange={(event) => updatePart('day', event.target.value)}
            required={required}
            className={`${selectClassName} mt-2`}
          >
            <option value="">{isSpanish ? 'Día' : 'Day'}</option>
            {days.map((dayOption) => (
              <option key={dayOption} value={dayOption}>
                {Number.parseInt(dayOption, 10)}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100/72">
          {isSpanish ? 'Año' : 'Year'}
          <select
            id={`${idPrefix}-year`}
            value={year}
            onChange={(event) => updatePart('year', event.target.value)}
            required={required}
            className={`${selectClassName} mt-2`}
          >
            <option value="">{isSpanish ? 'Año' : 'Year'}</option>
            {years.map((yearOption) => (
              <option key={yearOption} value={yearOption}>
                {yearOption}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}
