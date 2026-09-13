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
        'inline-flex items-center text-xs font-bold uppercase tracking-[0.16em] text-trimry-muted',
        compact ? 'gap-0' : 'gap-2',
        fullWidth && 'w-full justify-between',
      )}
    >
      {!compact ? messages.languageSwitcher.label : null}
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value as LanguageCode)}
        className={clsx(
          'rounded-full border border-trimry-line bg-white text-xs font-bold tracking-[0.08em] text-trimry-ink focus:border-trimry-blue focus:ring-2 focus:ring-trimry-blue/20',
          compact ? 'min-w-[7.5rem] px-3 py-2 text-center' : 'px-4 py-2',
          fullWidth && 'w-full',
        )}
      >
        {LANGUAGE_OPTIONS.map((option) => (
          <option key={option.code} value={option.code}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
