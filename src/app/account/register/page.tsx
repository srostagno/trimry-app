'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'

import { useLanguage } from '@/components/language-provider'
import { apiFetch, readApiError } from '@/lib/api-client'
import { trackEvent, trackMetaStandardEvent } from '@/lib/analytics'
import { isLanguageCode } from '@/lib/i18n'
import { detectBrowserTimeZone } from '@/lib/schedule'

const EMAIL_CONTACT_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const WHATSAPP_CONTACT_PATTERN = /^\+?[1-9][0-9]{7,14}$/
const SYNTHETIC_WHATSAPP_EMAIL_DOMAIN = 'whatsapp.trimry.local'
const SIGNUP_WHATSAPP_STORAGE_KEY = 'trimry:signup-whatsapp-number'

function collectRegistrationClientMetadata(timeZone: string) {
  if (typeof window === 'undefined') {
    return {
      timeZone,
    }
  }

  return {
    browserLocale: navigator.language || null,
    browserLanguages: Array.from(navigator.languages ?? []).slice(0, 12),
    timeZone,
    timeZoneOffsetMinutes: new Date().getTimezoneOffset(),
    platform: navigator.platform || null,
    referrer: document.referrer || null,
    landingUrl: window.location.href,
    screen: {
      width: window.screen?.width ?? null,
      height: window.screen?.height ?? null,
      pixelRatio: window.devicePixelRatio ?? null,
    },
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
  }
}

function normalizeWhatsappNumber(value: string) {
  let normalized = value.replace(/[^0-9+]/g, '').replace(/(?!^)\+/g, '')

  if (normalized.startsWith('00')) {
    normalized = `+${normalized.slice(2)}`
  }

  if (!normalized.startsWith('+')) {
    normalized = `+${normalized}`
  }

  if (!WHATSAPP_CONTACT_PATTERN.test(normalized)) {
    return null
  }

  return normalized
}

function buildSyntheticEmailFromWhatsapp(whatsappNumber: string) {
  const digits = whatsappNumber.replace(/\D/g, '').slice(-15)
  return `wa-${digits}@${SYNTHETIC_WHATSAPP_EMAIL_DOMAIN}`
}

export default function RegisterPage() {
  const router = useRouter()
  const { language, setLanguage, messages } = useLanguage()
  const [firstName, setFirstName] = useState('')
  const [timeZone, setTimeZone] = useState('UTC')
  const [contact, setContact] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const isSpanish = language === 'es'

  useEffect(() => {
    setTimeZone(detectBrowserTimeZone())
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    const normalizedFirstName = firstName.trim()
    const normalizedContact = contact.trim()
    const isEmailContact = EMAIL_CONTACT_PATTERN.test(normalizedContact)
    const whatsappNumber = isEmailContact
      ? null
      : normalizeWhatsappNumber(normalizedContact)

    if (!isEmailContact && !whatsappNumber) {
      setError(
        isSpanish
          ? 'Ingresa un correo válido o un WhatsApp en formato internacional (ejemplo: +56912345678).'
          : 'Enter a valid email or a WhatsApp number in international format (example: +14155550123).',
      )
      setLoading(false)
      return
    }

    const resolvedEmail = isEmailContact
      ? normalizedContact.toLowerCase()
      : buildSyntheticEmailFromWhatsapp(whatsappNumber!)
    const contactType = isEmailContact ? 'email' : 'whatsapp'

    trackEvent('signup_started', {
      language,
      contact_type: contactType,
      time_zone: timeZone,
    })

    try {
      const response = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          firstName: normalizedFirstName,
          email: resolvedEmail,
          locale: language,
          timeZone,
          clientMetadata: collectRegistrationClientMetadata(timeZone),
        }),
      }, { retryUnauthorized: false })

      if (!response.ok) {
        setError(await readApiError(response, messages.notifications.error))
        return
      }

      const payload = (await response.json()) as {
        user?: {
          id?: string
          locale?: string
        }
      }
      const nextLocale = payload.user?.locale

      if (nextLocale && isLanguageCode(nextLocale)) {
        setLanguage(nextLocale, { persist: false, track: false })
      }

      trackEvent('sign_up', {
        method: contactType,
        language: nextLocale ?? language,
        user_id: payload.user?.id,
      })
      trackEvent('signup_completed', {
        method: contactType,
        language: nextLocale ?? language,
        user_id: payload.user?.id,
      })
      trackMetaStandardEvent('CompleteRegistration', {
        content_name: 'Trimry account',
        method: contactType,
        status: 'created',
        language: nextLocale ?? language,
      })

      if (whatsappNumber && typeof window !== 'undefined') {
        window.sessionStorage.setItem(SIGNUP_WHATSAPP_STORAGE_KEY, whatsappNumber)
      }

      router.push('/activate')
      router.refresh()
    } catch {
      setError(messages.notifications.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="cosmic-shell mx-auto max-w-xl rounded-[2rem] p-8">
      <h1 className="cosmic-shell-title text-3xl">{messages.auth.registerTitle}</h1>
      <p className="cosmic-shell-copy mt-2">{messages.auth.registerSubtitle}</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="cosmic-field-label block text-sm font-semibold">
          {messages.auth.firstNameLabel}
          <input
            type="text"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            required
            autoComplete="given-name"
            minLength={1}
            className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
          />
        </label>

        <label className="cosmic-field-label block text-sm font-semibold">
          {isSpanish ? 'Email o WhatsApp' : 'Email or WhatsApp'}
          <input
            type="text"
            value={contact}
            onChange={(event) => setContact(event.target.value)}
            required
            autoComplete="email"
            placeholder={isSpanish ? 'tu@correo.com o +56912345678' : 'you@email.com or +14155550123'}
            className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
          />
          <span className="cosmic-shell-meta mt-2 block text-xs">
            {isSpanish
              ? 'Primero te damos valor. Los datos de personalización se piden después.'
              : 'Get value first. Personalization details can be added later.'}
          </span>
        </label>

        {error ? (
          <p className="cosmic-error-box rounded-xl px-4 py-3 text-sm">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="cosmic-button-primary w-full rounded-full px-6 py-3 text-sm font-black uppercase tracking-[0.16em] disabled:opacity-70"
        >
          {loading ? messages.common.loading : messages.auth.registerButton}
        </button>
      </form>

      <p className="cosmic-shell-meta mt-5 text-sm">
        {messages.auth.alreadyHaveAccount}{' '}
        <Link href="/account/login" className="cosmic-link font-bold">
          {messages.auth.loginButton}
        </Link>
      </p>
    </section>
  )
}
