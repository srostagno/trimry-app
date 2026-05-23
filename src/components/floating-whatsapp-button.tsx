'use client'

import { trackEvent, trackMetaStandardEvent } from '@/lib/analytics'
import { useLanguage } from '@/components/language-provider'

const LUCK_GURU_WHATSAPP_NUMBER = '34689269278'

function WhatsAppIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      className="h-5 w-5 fill-current"
    >
      <path d="M16 3.2A12.6 12.6 0 0 0 5.1 22.1L3.6 28.8l6.8-1.7A12.6 12.6 0 1 0 16 3.2Zm0 2.4a10.2 10.2 0 0 1 8.6 15.8 10.2 10.2 0 0 1-13.5 3.2l-.4-.2-3.7.9.8-3.6-.3-.4A10.2 10.2 0 0 1 16 5.6Zm-4.1 5.2c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.2 3.5 5.5 4.7 2.7 1.1 3.3.9 3.9.8.6-.1 2-.8 2.3-1.6.3-.8.3-1.5.2-1.6-.1-.2-.3-.3-.7-.5l-2.3-1.1c-.3-.1-.6-.2-.8.2-.2.3-.9 1.1-1.1 1.3-.2.2-.4.2-.8.1-.4-.2-1.5-.6-2.8-1.7-1-1-1.7-2.1-1.9-2.5-.2-.4 0-.6.2-.8l.5-.6c.2-.2.2-.4.4-.6.1-.2.1-.5 0-.7l-1-2.5c-.2-.6-.5-.6-.8-.6h-.2Z" />
    </svg>
  )
}

export function FloatingWhatsappButton() {
  const { language } = useLanguage()
  const isSpanish = language === 'es'
  const message = isSpanish
    ? 'Hola Luck Guru, quiero saber cómo Trimry puede ayudarme a sentirme con más suerte.'
    : 'Hi Luck Guru, I want to know how Trimry can help me feel luckier.'
  const href = `https://wa.me/${LUCK_GURU_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
  const label = isSpanish ? 'Habla con Luck Guru' : 'Talk to Luck Guru'
  const subLabel = isSpanish ? 'WhatsApp' : 'WhatsApp'

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      onClick={() => {
        trackEvent('whatsapp_luck_guru_click', {
          placement: 'floating_button',
          language,
        })
        trackMetaStandardEvent('Contact', {
          content_name: 'Luck Guru WhatsApp',
          channel: 'whatsapp',
          placement: 'floating_button',
        })
      }}
      className="group fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-full border border-[rgba(172,255,214,0.52)] bg-[linear-gradient(135deg,#0bcf73,#07a85f)] px-4 py-3 text-white shadow-[0_20px_60px_rgba(0,0,0,0.42),0_0_34px_rgba(11,207,115,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(0,0,0,0.48),0_0_44px_rgba(11,207,115,0.36)] focus:outline-none focus:ring-2 focus:ring-[#9fffd0] focus:ring-offset-2 focus:ring-offset-[#061022] sm:bottom-6 sm:right-6"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/14 text-white ring-1 ring-white/24 transition group-hover:scale-105">
        <WhatsAppIcon />
      </span>
      <span className="hidden pr-1 text-left sm:block">
        <span className="block text-sm font-black leading-tight">{label}</span>
        <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-emerald-50/82">
          {subLabel}
        </span>
      </span>
    </a>
  )
}
