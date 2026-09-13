'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'

import { useLanguage } from '@/components/language-provider'
import { TimeZoneSelect } from '@/components/time-zone-select'
import { trackEvent, trackMetaStandardEvent } from '@/lib/analytics'
import { isLanguageCode } from '@/lib/i18n'
import { EMAIL_PATTERN, registerAccount } from '@/lib/registration'
import { detectBrowserTimeZone } from '@/lib/schedule'
import { hasAnyPreferences, loadPreferencesDraft } from '@/lib/sports'
import { resolveSafeRedirectPath } from '@/lib/start-flow'

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { language, setLanguage, messages } = useLanguage()
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [timeZone, setTimeZone] = useState('UTC')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const requestedRedirectPath = resolveSafeRedirectPath(searchParams.get('redirect'), '')
  const loginHref = requestedRedirectPath
    ? `/account/login?redirect=${encodeURIComponent(requestedRedirectPath)}`
    : '/account/login'

  useEffect(() => {
    setTimeZone(detectBrowserTimeZone())
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!EMAIL_PATTERN.test(email.trim())) {
      setError(messages.auth.invalidEmail)
      return
    }

    setLoading(true)
    trackEvent('signup_started', { language, contact_type: 'email', time_zone: timeZone })

    try {
      const draft = loadPreferencesDraft()
      const payload = await registerAccount(
        {
          firstName,
          email,
          language,
          timeZone,
          sportsPreferences: hasAnyPreferences(draft) ? draft : null,
        },
        messages.notifications.error,
      )
      const nextLocale = payload.user?.locale

      if (nextLocale && isLanguageCode(nextLocale)) {
        setLanguage(nextLocale, { persist: false, track: false })
      }

      trackEvent('sign_up', { method: 'email', language: nextLocale ?? language, user_id: payload.user?.id })
      trackMetaStandardEvent('CompleteRegistration', {
        content_name: 'Trimry account',
        method: 'email',
        status: 'created',
        language: nextLocale ?? language,
      })

      router.push(
        requestedRedirectPath || (hasAnyPreferences(draft) ? '/activate?step=3' : '/activate'),
      )
      router.refresh()
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : messages.notifications.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="tr-shell mx-auto max-w-md p-8">
      <h1 className="text-3xl">{messages.auth.registerTitle}</h1>
      <p className="tr-copy mt-2">{messages.auth.registerSubtitle}</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="tr-label">
          {messages.auth.firstNameLabel}
          <input
            type="text"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            required
            autoComplete="given-name"
            className="tr-input mt-2"
          />
        </label>

        <label className="tr-label">
          {messages.auth.emailLabel}
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
            className="tr-input mt-2"
          />
          <span className="tr-meta mt-2 block text-xs">{messages.auth.emailHint}</span>
        </label>

        <label className="tr-label" htmlFor="register-time-zone">
          {messages.auth.timeZoneLabel}
          <TimeZoneSelect
            id="register-time-zone"
            value={timeZone}
            onChange={setTimeZone}
            className="tr-input mt-2"
          />
          <span className="tr-meta mt-2 block text-xs">{messages.auth.timeZoneHint}</span>
        </label>

        {error ? <p className="tr-alert-error">{error}</p> : null}

        <button type="submit" disabled={loading} className="tr-btn-primary w-full">
          {loading ? messages.common.loading : messages.auth.registerButton}
        </button>
        <p className="tr-meta text-xs">{messages.auth.termsNotice}</p>
      </form>

      <p className="tr-meta mt-6 text-sm">
        {messages.auth.alreadyHaveAccount}{' '}
        <Link href={loginHref} className="tr-link">
          {messages.auth.loginButton}
        </Link>
      </p>
    </section>
  )
}
