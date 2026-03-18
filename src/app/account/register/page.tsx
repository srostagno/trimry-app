'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'

import { TimeZoneSelect } from '@/components/time-zone-select'
import { useLanguage } from '@/components/language-provider'
import { apiFetch, readApiError } from '@/lib/api-client'
import { trackEvent } from '@/lib/analytics'
import { isLanguageCode } from '@/lib/i18n'
import { detectBrowserTimeZone } from '@/lib/schedule'

export default function RegisterPage() {
  const router = useRouter()
  const { language, setLanguage, messages } = useLanguage()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [timeZone, setTimeZone] = useState('UTC')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setTimeZone(detectBrowserTimeZone())
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          firstName,
          lastName,
          birthDate: birthDate || null,
          email,
          password,
          locale: language,
          timeZone,
        }),
      }, { retryUnauthorized: false })

      if (!response.ok) {
        setError(await readApiError(response, messages.notifications.error))
        return
      }

      const payload = (await response.json()) as {
        user?: {
          locale?: string
        }
      }
      const nextLocale = payload.user?.locale

      if (nextLocale && isLanguageCode(nextLocale)) {
        setLanguage(nextLocale, { persist: false, track: false })
      }

      trackEvent('sign_up', {
        method: 'email',
        language: nextLocale ?? language,
      })

      router.push('/account/delivery')
      router.refresh()
    } catch {
      setError(messages.notifications.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-xl rounded-[2rem] border border-amber-100/20 bg-black/30 p-8">
      <h1 className="text-3xl text-amber-50">{messages.auth.registerTitle}</h1>
      <p className="mt-2 text-amber-100/85">{messages.auth.registerSubtitle}</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-semibold text-amber-100/90">
          {messages.auth.firstNameLabel}
          <input
            type="text"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            required
            minLength={1}
            className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
          />
        </label>

        <label className="block text-sm font-semibold text-amber-100/90">
          {messages.auth.lastNameLabel}
          <input
            type="text"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            required
            minLength={1}
            className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
          />
        </label>

        <label className="block text-sm font-semibold text-amber-100/90">
          {messages.auth.birthDateLabel}
          <input
            type="date"
            value={birthDate}
            onChange={(event) => setBirthDate(event.target.value)}
            className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
          />
        </label>

        <label className="block text-sm font-semibold text-amber-100/90">
          {messages.auth.timeZoneLabel}
          <TimeZoneSelect
            value={timeZone}
            onChange={setTimeZone}
            className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
          />
          <span className="mt-2 block text-xs text-amber-100/70">
            {messages.auth.timeZoneHint}
          </span>
        </label>

        <label className="block text-sm font-semibold text-amber-100/90">
          {messages.auth.emailLabel}
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
          />
        </label>

        <label className="block text-sm font-semibold text-amber-100/90">
          {messages.auth.passwordLabel}
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={10}
            className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
          />
          <span className="mt-2 block text-xs text-amber-100/70">
            {messages.auth.passwordHint}
          </span>
        </label>

        {error ? (
          <p className="rounded-xl border border-rose-300/60 bg-rose-900/40 px-4 py-3 text-sm text-rose-100">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-amber-200 px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-amber-950 disabled:opacity-70"
        >
          {loading ? messages.common.loading : messages.auth.registerButton}
        </button>
      </form>

      <p className="mt-5 text-sm text-amber-100/80">
        {messages.auth.alreadyHaveAccount}{' '}
        <Link href="/account/login" className="font-bold text-amber-200 underline">
          {messages.auth.loginButton}
        </Link>
      </p>
    </section>
  )
}
