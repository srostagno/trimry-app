'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'

import { useLanguage } from '@/components/language-provider'
import { apiFetch, readApiError } from '@/lib/api-client'
import { trackEvent, trackMetaCustomEvent } from '@/lib/analytics'
import { isLanguageCode } from '@/lib/i18n'
import {
  fetchAccountSnapshot,
  getStartFlowDestination,
  resolveSafeRedirectPath,
} from '@/lib/start-flow'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { language, setLanguage, messages } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [sendingLink, setSendingLink] = useState(false)
  const [consumingLink, setConsumingLink] = useState(false)
  const [error, setError] = useState('')
  const [linkError, setLinkError] = useState('')
  const [linkSuccess, setLinkSuccess] = useState('')
  const requestedRedirectPath = resolveSafeRedirectPath(
    searchParams.get('redirect'),
    '',
  )
  const loginLinkToken = searchParams.get('login_link')?.trim() ?? ''
  const consumedTokenRef = useRef<string | null>(null)
  const registerHref = requestedRedirectPath
    ? `/account/register?redirect=${encodeURIComponent(requestedRedirectPath)}`
    : '/account/register'

  const resolvePostLoginDestination = useCallback(
    async (preferredPath?: string | null) => {
      const safePreferredPath = resolveSafeRedirectPath(preferredPath, '')
      const directRedirectPath = requestedRedirectPath || safePreferredPath

      if (directRedirectPath) {
        return directRedirectPath
      }

      try {
        const account = await fetchAccountSnapshot()
        return getStartFlowDestination(account)
      } catch {
        return '/dashboard'
      }
    },
    [requestedRedirectPath],
  )

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setLinkError('')
    setLinkSuccess('')

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
          id?: string
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
        user_id: payload.user?.id,
      })
      trackMetaCustomEvent('Login', {
        method: 'email',
        language: nextLocale ?? language,
      })

      const destination = await resolvePostLoginDestination()

      router.push(destination)
      router.refresh()
    } catch {
      setError(messages.notifications.error)
    } finally {
      setLoading(false)
    }
  }

  const requestLoginLink = async () => {
    setSendingLink(true)
    setError('')
    setLinkError('')
    setLinkSuccess('')

    try {
      const response = await apiFetch(
        '/auth/login-link/request',
        {
          method: 'POST',
          body: JSON.stringify({
            email,
            locale: language,
            redirectPath: requestedRedirectPath || null,
          }),
        },
        { retryUnauthorized: false },
      )

      if (!response.ok) {
        setLinkError(await readApiError(response, messages.notifications.error))
        return
      }

      trackEvent('login_link_requested', {
        method: 'email_link',
        language,
      })
      trackMetaCustomEvent('LoginLinkRequested', {
        method: 'email_link',
        language,
      })
      setLinkSuccess(messages.auth.loginWithLinkSent)
    } catch {
      setLinkError(messages.notifications.error)
    } finally {
      setSendingLink(false)
    }
  }

  useEffect(() => {
    if (!loginLinkToken || consumedTokenRef.current === loginLinkToken) {
      return
    }

    consumedTokenRef.current = loginLinkToken
    setConsumingLink(true)
    setError('')
    setLinkError('')
    setLinkSuccess('')

    const consumeLoginLink = async () => {
      try {
        const response = await apiFetch(
          '/auth/login-link/consume',
          {
            method: 'POST',
            body: JSON.stringify({ token: loginLinkToken }),
          },
          { retryUnauthorized: false },
        )

        if (!response.ok) {
          setLinkError(messages.auth.loginWithLinkInvalid)
          return
        }

        const payload = (await response.json()) as {
          user?: {
            id?: string
            locale?: string
          }
          redirectPath?: string | null
        }
        const nextLocale = payload.user?.locale

        if (nextLocale && isLanguageCode(nextLocale)) {
          setLanguage(nextLocale, { persist: false, track: false })
        }

        trackEvent('login', {
          method: 'email_link',
          language: nextLocale ?? language,
          user_id: payload.user?.id,
        })
        trackMetaCustomEvent('Login', {
          method: 'email_link',
          language: nextLocale ?? language,
        })

        const destination = await resolvePostLoginDestination(payload.redirectPath)
        router.push(destination)
        router.refresh()
      } catch {
        setLinkError(messages.auth.loginWithLinkInvalid)
      } finally {
        setConsumingLink(false)
      }
    }

    void consumeLoginLink()
  }, [
    language,
    loginLinkToken,
    messages.auth.loginWithLinkInvalid,
    requestedRedirectPath,
    resolvePostLoginDestination,
    router,
    setLanguage,
  ])

  return (
    <section className="cosmic-shell mx-auto max-w-xl rounded-[2rem] p-8">
      <h1 className="cosmic-shell-title text-3xl">{messages.auth.loginTitle}</h1>
      <p className="cosmic-shell-copy mt-2">{messages.auth.loginSubtitle}</p>
      <p className="cosmic-shell-copy mt-3 text-sm">{messages.auth.loginWithLinkHint}</p>

      {consumingLink ? (
        <p className="cosmic-info-box mt-4 rounded-xl px-4 py-3 text-sm text-cyan-50">
          {messages.auth.loginWithLinkConsuming}
        </p>
      ) : null}

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="cosmic-field-label block text-sm font-semibold">
          {messages.auth.emailLabel}
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
          />
        </label>

        <label className="cosmic-field-label block text-sm font-semibold">
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
          <p className="cosmic-error-box rounded-xl px-4 py-3 text-sm">
            {error}
          </p>
        ) : null}

        {linkError ? (
          <p className="cosmic-error-box rounded-xl px-4 py-3 text-sm">
            {linkError}
          </p>
        ) : null}

        {linkSuccess ? (
          <p className="cosmic-success-box rounded-xl px-4 py-3 text-sm">
            {linkSuccess}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading || consumingLink}
          className="cosmic-button-primary w-full rounded-full px-6 py-3 text-sm font-black uppercase tracking-[0.16em] disabled:opacity-70"
        >
          {loading ? messages.common.loading : messages.auth.loginButton}
        </button>

        <div className="relative py-1">
          <span className="block h-px w-full bg-cyan-100/16" />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-100/16 bg-slate-950/92 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-100/72">
            {messages.auth.loginWithLinkDivider}
          </span>
        </div>

        <button
          type="button"
          disabled={sendingLink || consumingLink || loading || email.trim().length === 0}
          onClick={() => {
            void requestLoginLink()
          }}
          className="cosmic-button-secondary w-full rounded-full px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-cyan-50 disabled:opacity-70"
        >
          {sendingLink
            ? messages.auth.loginWithLinkSending
            : messages.auth.loginWithLinkButton}
        </button>
      </form>

      <p className="cosmic-shell-meta mt-5 text-sm">
        {messages.auth.needAccount}{' '}
        <Link href={registerHref} className="cosmic-link font-bold">
          {messages.auth.registerButton}
        </Link>
      </p>
    </section>
  )
}
