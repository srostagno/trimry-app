'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'

import { DateOfBirthPicker } from '@/components/date-of-birth-picker'
import { useLanguage } from '@/components/language-provider'
import { apiFetch, readApiError } from '@/lib/api-client'
import { trackEvent, trackMetaStandardEvent } from '@/lib/analytics'
import { isLanguageCode, normalizeLanguageCode } from '@/lib/i18n'
import { buildPersonalSignProfile } from '@/lib/personal-signs'
import { detectBrowserTimeZone } from '@/lib/schedule'

const EMAIL_CONTACT_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function getRegisterInlineCopy(language: string) {
  const resolvedLanguage = normalizeLanguageCode(language)

  if (resolvedLanguage === 'es') {
    return {
      invalidContact:
        'Ingresa un correo válido.',
      missingBirthDate:
        'Ingresa tu fecha de nacimiento para calcular tu código de fortuna.',
      birthHint:
        'Usamos tu nacimiento para abrir tu zodíaco y tu señal del calendario chino.',
      fortuneCode: 'Código de fortuna',
      zodiac: 'Zodíaco',
      chineseCalendar: 'Calendario chino',
      contactLabel: 'Email',
      contactPlaceholder: 'tu@correo.com',
      contactHint:
        'Usaremos este email para tu cuenta. Después de suscribirte podrás elegir si recibes predicciones por email, WhatsApp o ambos.',
    }
  }

  if (resolvedLanguage === 'pt') {
    return {
      invalidContact:
        'Digite um email válido.',
      missingBirthDate:
        'Digite sua data de nascimento para calcular seu código de fortuna.',
      birthHint:
        'Usamos seu nascimento para abrir seu zodíaco e seu sinal do calendário chinês.',
      fortuneCode: 'Código de fortuna',
      zodiac: 'Zodíaco',
      chineseCalendar: 'Calendário chinês',
      contactLabel: 'Email',
      contactPlaceholder: 'voce@email.com',
      contactHint:
        'Usaremos este email para sua conta. Depois de assinar, você poderá escolher email, WhatsApp ou ambos para receber previsões.',
    }
  }

  return {
    invalidContact:
      'Enter a valid email.',
    missingBirthDate:
      'Enter your date of birth so we can calculate your fortune code.',
    birthHint:
      'We use your birthday to unlock your zodiac and Chinese calendar signal.',
    fortuneCode: 'Fortune code',
    zodiac: 'Zodiac',
    chineseCalendar: 'Chinese calendar',
    contactLabel: 'Email',
    contactPlaceholder: 'you@email.com',
    contactHint:
      'We use this email for your account. After subscribing, you can choose email, WhatsApp, or both for prediction delivery.',
  }
}

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

export default function RegisterPage() {
  const router = useRouter()
  const { language, setLanguage, messages } = useLanguage()
  const [firstName, setFirstName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [timeZone, setTimeZone] = useState('UTC')
  const [contact, setContact] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inlineCopy = getRegisterInlineCopy(language)
  const personalSigns = buildPersonalSignProfile(birthDate, language)

  useEffect(() => {
    setTimeZone(detectBrowserTimeZone())
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    const normalizedFirstName = firstName.trim()
    const normalizedContact = contact.trim()

    if (!EMAIL_CONTACT_PATTERN.test(normalizedContact)) {
      setError(inlineCopy.invalidContact)
      setLoading(false)
      return
    }

    if (!birthDate) {
      setError(inlineCopy.missingBirthDate)
      setLoading(false)
      return
    }

    const resolvedEmail = normalizedContact.toLowerCase()
    const contactType = 'email'

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
          birthDate,
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

        <div>
          <label className="cosmic-field-label block text-sm font-semibold" htmlFor="register-birth-month">
            {messages.auth.birthDateLabel}
          </label>
          <div className="mt-2">
            <DateOfBirthPicker
              idPrefix="register-birth"
              value={birthDate}
              onChange={setBirthDate}
              language={language}
              required
            />
          </div>
          <span className="cosmic-shell-meta mt-2 block text-xs">
            {inlineCopy.birthHint}
          </span>
        </div>

        {personalSigns ? (
          <div className="rounded-[1.35rem] border border-amber-200/24 bg-amber-200/10 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-100/86">
              {inlineCopy.fortuneCode}
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-cyan-100/18 bg-slate-950/34 p-3">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100/72">
                  {inlineCopy.zodiac}
                </p>
                <p className="mt-1 text-lg text-slate-50">{personalSigns.zodiac.name}</p>
                <p className="mt-1 text-xs leading-5 text-slate-100/76">
                  {personalSigns.zodiac.summary}
                </p>
              </div>
              <div className="rounded-2xl border border-cyan-100/18 bg-slate-950/34 p-3">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100/72">
                  {inlineCopy.chineseCalendar}
                </p>
                <p className="mt-1 text-lg text-slate-50">{personalSigns.chinese.name}</p>
                <p className="mt-1 text-xs leading-5 text-slate-100/76">
                  {personalSigns.chinese.summary}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <label className="cosmic-field-label block text-sm font-semibold">
          {inlineCopy.contactLabel}
          <input
            type="email"
            value={contact}
            onChange={(event) => setContact(event.target.value)}
            required
            autoComplete="email"
            placeholder={inlineCopy.contactPlaceholder}
            className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
          />
          <span className="cosmic-shell-meta mt-2 block text-xs">
            {inlineCopy.contactHint}
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
