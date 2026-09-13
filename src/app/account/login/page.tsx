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
  const requestedRedirectPath = resolveSafeRedirectPath(searchParams.get('redirect'), '')
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
      const response = await apiFetch(
        '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ email, password, locale: language }),
        },
        { retryUnauthorized: false },
      )

      if (!response.ok) {
        setError(await readApiError(response, messages.notifications.error))
        return
      }

      const payload = (await response.json()) as {
        user?: { id?: string; locale?: string }
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
      trackMetaCustomEvent('Login', { method: 'email', language: nextLocale ?? language })

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

      trackEvent('login_link_requested', { method: 'email_link', language })
      trackMetaCustomEvent('LoginLinkRequested', { method: 'email_link', language })
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
          user?: { id?: string; locale?: string }
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
        trackMetaCustomEvent('Login', { method: 'email_link', language: nextLocale ?? language })

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
    resolvePostLoginDestination,
    router,
    setLanguage,
  ])

  return (
    <section className="tr-shell mx-auto max-w-md p-8">
      <h1 className="text-3xl">{messages.auth.loginTitle}</h1>
      <p className="tr-copy mt-2">{messages.auth.loginSubtitle}</p>

      {consumingLink ? (
        <p className="tr-alert-info mt-4">{messages.auth.loginWithLinkConsuming}</p>
      ) : null}

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
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
        </label>

        <label className="tr-label">
          {messages.auth.passwordLabel}
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
            className="tr-input mt-2"
          />
        </label>

        {error ? <p className="tr-alert-error">{error}</p> : null}
        {linkError ? <p className="tr-alert-error">{linkError}</p> : null}
        {linkSuccess ? <p className="tr-alert-success">{linkSuccess}</p> : null}

        <button type="submit" disabled={loading || consumingLink} className="tr-btn-primary w-full">
          {loading ? messages.common.loading : messages.auth.loginButton}
        </button>

        <div className="relative py-1">
          <span className="block h-px w-full bg-trimry-line" />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-[10px] font-black uppercase tracking-[0.16em] text-trimry-muted">
            {messages.auth.loginWithLinkDivider}
          </span>
        </div>

        <button
          type="button"
          disabled={sendingLink || consumingLink || loading || email.trim().length === 0}
          onClick={() => void requestLoginLink()}
          className="tr-btn-secondary w-full"
        >
          {sendingLink ? messages.auth.loginWithLinkSending : messages.auth.loginWithLinkButton}
        </button>
        <p className="tr-meta text-xs">{messages.auth.loginWithLinkHint}</p>
      </form>

      <p className="tr-meta mt-6 text-sm">
        {messages.auth.needAccount}{' '}
        <Link href={registerHref} className="tr-link">
          {messages.nav.register}
        </Link>
      </p>
    </section>
  )
}
