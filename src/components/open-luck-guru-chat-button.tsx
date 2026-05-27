'use client'

import clsx from 'clsx'

import { useLanguage } from '@/components/language-provider'
import { trackEvent } from '@/lib/analytics'

const OPEN_LUCK_GURU_CHAT_EVENT = 'trimry:open-luck-guru-chat'

type OpenLuckGuruChatButtonProps = {
  className?: string
  label?: string
  analyticsLocation?: string
}

export function OpenLuckGuruChatButton({
  className,
  label,
  analyticsLocation = 'seo_landing_cta',
}: OpenLuckGuruChatButtonProps) {
  const { language } = useLanguage()
  const resolvedLabel = label ?? (language === 'es' ? 'Habla con Luck Guru' : 'Talk to Luck Guru')

  return (
    <button
      type="button"
      onClick={() => {
        trackEvent('ask_luck_guru_click', {
          location: analyticsLocation,
          language,
        })
        trackEvent('open_luck_guru_chat_click', {
          location: analyticsLocation,
          language,
        })
        window.dispatchEvent(new CustomEvent(OPEN_LUCK_GURU_CHAT_EVENT))
      }}
      className={clsx(className)}
    >
      {resolvedLabel}
    </button>
  )
}
