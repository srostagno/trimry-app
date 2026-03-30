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
        'inline-flex items-center text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--cosmic-muted)]',
        compact ? 'gap-0' : 'gap-2',
        fullWidth && 'w-full justify-between',
      )}
    >
      {!compact ? messages.languageSwitcher.label : null}
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value as LanguageCode)}
        className={clsx(
          'cosmic-input rounded-full border-[rgba(140,198,255,0.32)] bg-[rgba(53,93,180,0.14)] text-xs font-semibold tracking-[0.12em] text-slate-50 focus:border-[rgba(160,220,255,0.62)]',
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
