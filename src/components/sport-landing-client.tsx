'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState, type FormEvent } from 'react'

import { DeliveryPreferenceSelector } from '@/components/delivery-preference-selector'
import { useLanguage } from '@/components/language-provider'
import { UpcomingEventsFeed } from '@/components/upcoming-events-feed'
import {
  trackEvent,
  trackMetaCustomEvent,
  trackMetaStandardEvent,
} from '@/lib/analytics'
import { apiFetch, isProRequired, readApiErrorDetails } from '@/lib/api-client'
import type { LanguageCode } from '@/lib/i18n'
import { isLanguageCode } from '@/lib/i18n'
import { HoneypotField } from '@/components/honeypot-field'
import { EMAIL_PATTERN, registerAccount } from '@/lib/registration'
import { DEFAULT_WEEKLY_DELIVERY_HOUR, detectBrowserTimeZone } from '@/lib/schedule'
import { landingCopy, landingSampleLines, type LandingSport } from '@/lib/sport-landing'
import { fetchEventsPreview, type UpcomingFeed } from '@/lib/sports'
import {
  fetchAccountSnapshot,
  requiresWhatsappDelivery,
  type DeliveryPreference,
} from '@/lib/start-flow'

type Stage = 'form' | 'done' | 'existing'

export function SportLandingClient({ language, sport }: { language: LanguageCode; sport: LandingSport }) {
  const { messages, setLanguage } = useLanguage()
  const router = useRouter()
  const copy = landingCopy(language, sport)
  const sample = landingSampleLines(language, sport)

  const [feed, setFeed] = useState<UpcomingFeed | null>(null)
  const [feedLoading, setFeedLoading] = useState(true)
  const [attempt, setAttempt] = useState(0)
  const [timeZone] = useState(() => detectBrowserTimeZone())

  const [stage, setStage] = useState<Stage>('form')
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [deliveryPreference, setDeliveryPreference] = useState<DeliveryPreference>('both')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [consent, setConsent] = useState(false)
  const [honeypot, setHoneypot] = useState('')
  const [formOpenedAt] = useState(() => Date.now())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Logged-in visitors (e.g. coming back from an ad) skip the form.
  useEffect(() => {
    let cancelled = false
    fetchAccountSnapshot()
      .then((snapshot) => {
        if (!cancelled && snapshot?.user) setStage('existing')
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    let retry: number | undefined
    setFeedLoading(true)

    fetchEventsPreview({ sport, days: 14, language, timeZone })
      .then((payload) => {
        if (cancelled) return
        setFeed(payload)
        if (payload.totalEvents === 0 && payload.cacheState === 'warming' && attempt < 5) {
          retry = window.setTimeout(() => setAttempt((value) => value + 1), 8_000)
        }
      })
      .catch(() => {
        if (!cancelled) setFeed(null)
      })
      .finally(() => {
        if (!cancelled) setFeedLoading(false)
      })

    return () => {
      cancelled = true
      window.clearTimeout(retry)
    }
  }, [attempt, language, sport, timeZone])

  const needsWhatsapp = requiresWhatsappDelivery(deliveryPreference)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')

    if (!firstName.trim()) {
      setError(messages.auth.firstNameLabel)
      return
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError(messages.auth.invalidEmail)
      return
    }
    if (needsWhatsapp && whatsappNumber.trim().length < 8) {
      setError(messages.onboarding.whatsappNumberLabel)
      return
    }
    if (!consent) {
      setError(messages.onboarding.whatsappConsentError)
      return
    }

    setSubmitting(true)
    trackEvent('signup_started', { language, contact_type: 'email', time_zone: timeZone, source: `landing:${sport}` })

    const preferences = { sports: [sport], leagues: [], teams: [], lookaheadDays: 7, frequency: 'daily' as const }

    try {
      const payload = await registerAccount(
        { firstName, email, language, timeZone, sportsPreferences: preferences, honeypot, formOpenedAt },
        messages.notifications.error,
      )
      const nextLocale = payload.user?.locale
      if (nextLocale && isLanguageCode(nextLocale)) {
        setLanguage(nextLocale, { persist: false, track: false })
      }

      trackEvent('sign_up', { method: 'email', language, user_id: payload.user?.id, source: `landing:${sport}` })
      trackMetaStandardEvent('CompleteRegistration', {
        content_name: 'Trimry account',
        method: 'email',
        status: 'created',
        language,
        content_category: sport,
      })

      const response = await apiFetch('/subscription', {
        method: 'POST',
        body: JSON.stringify({
          action: 'subscribe',
          deliveryPreference,
          deliveryHourLocal: DEFAULT_WEEKLY_DELIVERY_HOUR,
          timeZone,
          whatsappNumber: needsWhatsapp ? whatsappNumber.trim() : undefined,
          whatsappConsentAccepted: needsWhatsapp ? true : undefined,
        }),
      })

      if (!response.ok) {
        // The account exists; send them on to finish in the guided flow.
        const details = await readApiErrorDetails(response, messages.notifications.error)

        setError(isProRequired(details) ? messages.pro.proRequiredNotice : details.message)
        router.push('/activate?step=3')
        return
      }

      const result = (await response.json().catch(() => null)) as { trialStarted?: boolean } | null

      trackEvent('activation_completed', {
        action: 'subscribe',
        delivery_preference: deliveryPreference,
        frequency: 'daily',
        sports: [sport],
        teams: 0,
        leagues: 0,
        source: `landing:${sport}`,
      })
      trackMetaStandardEvent('Lead', { content_name: 'Sports agenda activated', content_category: sport, delivery_preference: deliveryPreference })
      trackMetaCustomEvent('ActivationCompleted', { delivery_preference: deliveryPreference, sport })
      if (result?.trialStarted) {
        trackEvent('trial_started', { source: `landing:${sport}`, delivery_preference: deliveryPreference })
        trackMetaStandardEvent('StartTrial', { content_name: 'Trimry internal trial', predicted_ltv: 0 })
      }

      setStage('done')
      router.refresh()
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : messages.notifications.error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Mobile order: title, form, then proof. Desktop: copy left, form right. */}
      <header className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:grid-rows-[auto_1fr] lg:gap-x-10 lg:gap-y-6">
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          <p className="tr-eyebrow">{copy.eyebrow}</p>
          <h1 className="mt-2 text-[28px] leading-[1.15] sm:text-4xl lg:text-5xl">{copy.title}</h1>
          <p className="tr-copy mt-3 max-w-2xl text-base sm:text-lg">{copy.subtitle}</p>
        </div>

        <div className="min-w-0 order-3 lg:order-none lg:col-start-1 lg:row-start-2">
          <div className="tr-gradient-panel max-w-md p-4 text-white">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/80">WhatsApp · 09:00</p>
            <p className="mt-1 text-sm font-extrabold">📣 {messages.agenda.today}</p>
            <ul className="mt-2 space-y-1 text-sm">
              {sample.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          <ul className="mt-5 space-y-2">
            {copy.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-2 text-sm text-trimry-slate">
                <span aria-hidden="true">✅</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        <div id="signup" className="tr-shell order-2 p-5 sm:p-8 lg:order-none lg:col-start-2 lg:row-start-1 lg:row-span-2">
          {stage === 'existing' ? (
            <>
              <h2 className="text-2xl">{copy.alreadyTitle}</h2>
              <p className="tr-copy mt-2 text-sm">{copy.alreadyText}</p>
              <Link href="/dashboard" className="tr-btn-primary mt-5 w-full">
                {copy.alreadyCta}
              </Link>
            </>
          ) : stage === 'done' ? (
            <>
              <p className="tr-eyebrow">Trimry</p>
              <h2 className="mt-2 text-2xl">{copy.successTitle}</h2>
              <p className="tr-copy mt-2 text-sm">{copy.successText}</p>
              <Link href="/activate?step=2" className="tr-btn-primary mt-5 w-full">
                {copy.refine}
              </Link>
              <p className="tr-meta mt-2 text-center text-xs">{copy.refineHint}</p>
              <Link href="/dashboard?trial=started" className="tr-btn-secondary mt-3 w-full">
                {copy.goToAgenda}
              </Link>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h2 className="text-2xl">{copy.formTitle}</h2>
                <p className="tr-copy mt-1 text-sm">{copy.formSubtitle}</p>
              </div>

              <label className="tr-label">
                {messages.auth.firstNameLabel}
                <input
                  className="tr-input"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  autoComplete="given-name"
                  required
                />
              </label>

              <label className="tr-label">
                {messages.auth.emailLabel}
                <input
                  className="tr-input"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </label>

              <div>
                <p className="tr-label">{messages.onboarding.deliveryTitle}</p>
                <div className="mt-2">
                  <DeliveryPreferenceSelector
                    value={deliveryPreference}
                    onChange={setDeliveryPreference}
                    includeNone={false}
                    compact
                  />
                </div>
              </div>

              {needsWhatsapp ? (
                <label className="tr-label">
                  {messages.onboarding.whatsappNumberLabel}
                  <input
                    className="tr-input"
                    type="tel"
                    inputMode="tel"
                    placeholder="+56 9 1234 5678"
                    value={whatsappNumber}
                    onChange={(event) => setWhatsappNumber(event.target.value)}
                    autoComplete="tel"
                  />
                </label>
              ) : null}

              <label className="flex items-start gap-2 text-xs leading-5 text-trimry-slate">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={consent}
                  onChange={(event) => setConsent(event.target.checked)}
                />
                <span>{messages.onboarding.whatsappConsentLabel}</span>
              </label>

              <HoneypotField value={honeypot} onChange={setHoneypot} />

              {error ? <p className="tr-alert-error">{error}</p> : null}

              <button type="submit" disabled={submitting} className="tr-btn-primary w-full">
                {submitting ? copy.submitting : copy.submit}
              </button>
              <p className="tr-meta text-center text-xs">{copy.noCard}</p>
            </form>
          )}
        </div>
      </header>

      <section className="tr-shell p-6 sm:p-8">
        <h2 className="text-2xl">{copy.previewTitle}</h2>
        <div className="mt-5">
          <UpcomingEventsFeed
            feed={feed}
            loading={feedLoading}
            emptyMessage={feed?.cacheState === 'warming' ? messages.home.previewWarming : messages.home.previewEmpty}
            compact
            maxEventsPerDay={6}
            showHighlights
          />
        </div>
        {stage === 'form' ? (
          <a href="#signup" className="tr-btn-primary mt-6">
            {copy.submit} →
          </a>
        ) : null}
      </section>

      <section className="tr-shell p-6 sm:p-8">
        <h2 className="text-2xl">{messages.faq.title}</h2>
        <dl className="mt-5 divide-y divide-trimry-line">
          {copy.faq.map((item) => (
            <div key={item.question} className="py-4">
              <dt className="text-base font-bold text-trimry-ink">{item.question}</dt>
              <dd className="tr-copy mt-1.5 text-sm leading-6">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  )
}
