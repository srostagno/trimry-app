'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

import { useLanguage } from '@/components/language-provider'
import { apiFetch, readApiError } from '@/lib/api-client'
import { trackEvent } from '@/lib/analytics'
import { isLanguageCode } from '@/lib/i18n'
import {
  fetchAccountSnapshot,
  getStartFlowDestination,
} from '@/lib/start-flow'

export default function LoginPage() {
  const router = useRouter()
  const { language, setLanguage, messages } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, locale: language }),
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

      trackEvent('login', {
        method: 'email',
        language: nextLocale ?? language,
      })

      let destination = '/dashboard'

      try {
        const account = await fetchAccountSnapshot()
        destination = getStartFlowDestination(account)
      } catch {
        destination = '/dashboard'
      }

      router.push(destination)
      router.refresh()
    } catch {
      setError(messages.notifications.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-xl rounded-[2rem] border border-amber-100/20 bg-black/30 p-8">
      <h1 className="text-3xl text-amber-50">{messages.auth.loginTitle}</h1>
      <p className="mt-2 text-amber-100/85">{messages.auth.loginSubtitle}</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
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
            className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
          />
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
          {loading ? messages.common.loading : messages.auth.loginButton}
        </button>
      </form>

      <p className="mt-5 text-sm text-amber-100/80">
        {messages.auth.needAccount}{' '}
        <Link href="/account/register" className="font-bold text-amber-200 underline">
          {messages.auth.registerButton}
        </Link>
      </p>
    </section>
  )
}
