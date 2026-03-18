'use client'

import clsx from 'clsx'

import { LANGUAGE_OPTIONS, type LanguageCode } from '@/lib/i18n'
import { useLanguage } from '@/components/language-provider'

export function LanguageSwitcher({
  compact = false,
  fullWidth = false,
}: {
  compact?: boolean
  fullWidth?: boolean
}) {
  const { language, setLanguage, messages } = useLanguage()

  return (
    <label
      className={clsx(
        'inline-flex items-center text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/80',
        compact ? 'gap-0' : 'gap-2',
        fullWidth && 'w-full justify-between',
      )}
    >
      {!compact ? messages.languageSwitcher.label : null}
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value as LanguageCode)}
        className={clsx(
          'cosmic-input rounded-full border-cyan-200/32 bg-cyan-300/10 text-xs font-semibold tracking-[0.12em] text-cyan-50 focus:border-cyan-200/70',
          compact ? 'min-w-[7.5rem] px-3 py-2 text-center' : 'px-4 py-2',
          fullWidth && 'w-full',
        )}
      >
        {LANGUAGE_OPTIONS.map((option) => (
          <option key={option.code} value={option.code} className="text-slate-900">
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
