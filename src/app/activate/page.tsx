'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { OpenLuckGuruChatButton } from '@/components/open-luck-guru-chat-button'
import { useLanguage } from '@/components/language-provider'
import { trackEvent, trackMetaCustomEvent } from '@/lib/analytics'
import { apiFetch, readApiError } from '@/lib/api-client'
import { buildWeeklyFortune, type ActivityTone } from '@/lib/fortune'
import { languageToIntlLocale, normalizeLanguageCode } from '@/lib/i18n'
import { DEFAULT_WEEKLY_DELIVERY_HOUR } from '@/lib/schedule'
import {
  type AccountSnapshot,
  fetchAccountSnapshot,
} from '@/lib/start-flow'

type SampleDeliveryChannel = 'email' | 'whatsapp' | 'both'

const SYNTHETIC_WHATSAPP_EMAIL_DOMAIN = '@whatsapp.trimry.local'

function toneLabel(language: string, tone: ActivityTone) {
  const resolvedLanguage = normalizeLanguageCode(language)

  if (tone === 'good') {
    return resolvedLanguage === 'es'
      ? 'BUENO'
      : resolvedLanguage === 'pt'
        ? 'BOM'
        : 'GOOD'
  }

  if (tone === 'bad') {
    return resolvedLanguage === 'es'
      ? 'MALO'
      : resolvedLanguage === 'pt'
        ? 'RUIM'
        : 'BAD'
  }

  return resolvedLanguage === 'en' ? 'RARE' : 'RARO'
}

function hasRegularEmail(account: AccountSnapshot | null) {
  const email = account?.user.email?.trim().toLowerCase()

  return Boolean(email && !email.endsWith(SYNTHETIC_WHATSAPP_EMAIL_DOMAIN))
}

export default function ActivationGatewayPage() {
  const router = useRouter()
  const { language, messages } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState(false)
  const [error, setError] = useState('')
  const [account, setAccount] = useState<AccountSnapshot | null>(null)
  const [sampleSendingChannel, setSampleSendingChannel] =
    useState<SampleDeliveryChannel | null>(null)
  const [sampleError, setSampleError] = useState('')
  const [sampleSuccess, setSampleSuccess] = useState('')
  const [sampleWhatsappNumber, setSampleWhatsappNumber] = useState('')
  const [sampleWhatsappConsent, setSampleWhatsappConsent] = useState(false)
  const [selectedSampleChannel, setSelectedSampleChannel] =
    useState<SampleDeliveryChannel>('email')

  const resolvedLanguage = normalizeLanguageCode(language)
  const sampleAlreadySent = Boolean(account?.subscription?.sampleDeliverySentAt)
  const sampleEmailAvailable = hasRegularEmail(account)
  const sampleFortune = useMemo(
    () => buildWeeklyFortune(new Date(), languageToIntlLocale(resolvedLanguage)).slice(0, 3),
    [resolvedLanguage],
  )

  useEffect(() => {
    let cancelled = false

    const loadAccount = async () => {
      try {
        const currentAccount = await fetchAccountSnapshot()

        if (!currentAccount) {
          router.replace('/account/login')
          return
        }

        const status = currentAccount.subscription?.status ?? null

        if (
          status === 'active' ||
          status === 'past_due' ||
          status === 'paused' ||
          status === 'canceled'
        ) {
          router.replace('/dashboard')
          return
        }

        if (!cancelled) {
          const accountHasEmail = hasRegularEmail(currentAccount)
          const accountHasWhatsapp = Boolean(
            currentAccount.subscription?.whatsappNumber?.trim(),
          )

          setAccount(currentAccount)
          setSampleWhatsappNumber(currentAccount.subscription?.whatsappNumber ?? '')
          setSampleWhatsappConsent(Boolean(currentAccount.subscription?.whatsappNumber))
          setSelectedSampleChannel(
            accountHasEmail ? (accountHasWhatsapp ? 'both' : 'email') : 'whatsapp',
          )
          trackEvent('activate_subscription_view', {
            user_id: currentAccount.user.id,
            subscription_status: status ?? 'none',
          })
          trackMetaCustomEvent('SubscriptionActivationView', {
            user_id: currentAccount.user.id,
            subscription_status: status ?? 'none',
          })
        }
      } catch {
        if (!cancelled) {
          router.replace('/account/login')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadAccount()

    return () => {
      cancelled = true
    }
  }, [router])

  const actionState = useMemo(() => {
    if (!account?.subscription) {
      return {
        href: '/dashboard',
        label: messages.activate.primaryButton,
      }
    }

    if (account.subscription.status === 'pending_checkout') {
      return {
        href: '/checkout/start',
        label: messages.checkout.resumeButton,
      }
    }

    return {
      href: '/dashboard',
      label: messages.nav.dashboard,
    }
  }, [
    account?.subscription,
    messages.activate.primaryButton,
    messages.checkout.resumeButton,
    messages.nav.dashboard,
  ])

  const activateInternalTrial = async () => {
    if (!account) {
      router.replace('/account/login')
      return
    }

    if (account.subscription?.status === 'pending_checkout') {
      router.push('/checkout/start')
      return
    }

    setActivating(true)
    setError('')

    try {
      const response = await apiFetch(
        '/subscription',
        {
          method: 'POST',
          body: JSON.stringify({
            action: 'subscribe',
            deliveryPreference: 'email',
            deliveryHourLocal: DEFAULT_WEEKLY_DELIVERY_HOUR,
          }),
        },
        { retryUnauthorized: false },
      )

      if (response.status === 401) {
        router.replace('/account/login')
        return
      }

      if (!response.ok) {
        setError(await readApiError(response, messages.activate.unavailable))
        return
      }

      trackEvent('internal_trial_started', {
        user_id: account.user.id,
        delivery_preference: 'email',
      })
      trackMetaCustomEvent('InternalTrialStarted', {
        user_id: account.user.id,
        delivery_preference: 'email',
      })

      router.push('/checkout/start')
      router.refresh()
    } catch {
      setError(messages.activate.unavailable)
    } finally {
      setActivating(false)
    }
  }

  const sendSampleDelivery = async (sampleChannel: SampleDeliveryChannel) => {
    if (!account) {
      router.replace('/account/login')
      return
    }

    if (sampleAlreadySent) {
      setSampleError(messages.activate.sampleAlreadySent)
      return
    }

    if (
      (sampleChannel === 'email' || sampleChannel === 'both') &&
      !sampleEmailAvailable
    ) {
      setSampleError(messages.activate.sampleEmailUnavailable)
      return
    }

    if (
      (sampleChannel === 'whatsapp' || sampleChannel === 'both') &&
      !sampleWhatsappConsent
    ) {
      setSampleError(messages.activate.sampleWhatsappConsentError)
      return
    }

    setSampleSendingChannel(sampleChannel)
    setSampleError('')
    setSampleSuccess('')
    setError('')

    try {
      const response = await apiFetch(
        '/subscription',
        {
          method: 'POST',
          body: JSON.stringify({
            action: 'send-sample',
            sampleChannel,
            deliveryHourLocal: DEFAULT_WEEKLY_DELIVERY_HOUR,
            ...(sampleChannel === 'whatsapp' || sampleChannel === 'both'
              ? {
                  whatsappNumber: sampleWhatsappNumber,
                  whatsappConsentAccepted: sampleWhatsappConsent,
                }
              : {}),
          }),
        },
        { retryUnauthorized: false },
      )

      if (response.status === 401) {
        router.replace('/account/login')
        return
      }

      if (!response.ok) {
        setSampleError(await readApiError(response, messages.activate.unavailable))
        return
      }

      const payload = (await response.json()) as {
        subscription: AccountSnapshot['subscription']
      }

      setAccount((currentAccount) =>
        currentAccount
          ? {
              ...currentAccount,
              subscription: payload.subscription ?? currentAccount.subscription,
            }
          : currentAccount,
      )
      setSampleSuccess(messages.activate.sampleSuccess)
      trackEvent('subscription_sample_sent', {
        user_id: account.user.id,
        channel: sampleChannel,
      })
      trackMetaCustomEvent('SubscriptionSampleSent', {
        user_id: account.user.id,
        channel: sampleChannel,
      })
    } catch {
      setSampleError(messages.activate.unavailable)
    } finally {
      setSampleSendingChannel(null)
    }
  }

  if (loading) {
    return (
      <section className="cosmic-shell mx-auto max-w-5xl rounded-[2rem] p-6 text-slate-100 sm:p-8">
        <p>{messages.activate.loading}</p>
      </section>
    )
  }

  const primaryAction =
    account?.subscription?.status === 'pending_checkout' ? (
      <Link
        href={actionState.href}
        onClick={() => {
          trackEvent('activate_subscription_click', {
            language,
            destination: actionState.href,
          })
          trackMetaCustomEvent('ActivateSubscriptionClick', {
            language,
            destination: actionState.href,
          })
        }}
        className="cosmic-button-primary inline-flex justify-center rounded-full px-6 py-3 text-sm font-black uppercase tracking-[0.16em]"
      >
        {actionState.label}
      </Link>
    ) : (
      <button
        type="button"
        onClick={() => {
          trackEvent('activate_subscription_click', {
            language,
            destination: '/checkout/start',
          })
          trackMetaCustomEvent('ActivateSubscriptionClick', {
            language,
            destination: '/checkout/start',
          })
          void activateInternalTrial()
        }}
        disabled={activating}
        className="cosmic-button-primary inline-flex justify-center rounded-full px-6 py-3 text-sm font-black uppercase tracking-[0.16em] disabled:opacity-70"
      >
        {activating ? messages.common.loading : actionState.label}
      </button>
    )
  const selectedSampleRequiresEmail =
    selectedSampleChannel === 'email' || selectedSampleChannel === 'both'
  const selectedSampleRequiresWhatsapp =
    selectedSampleChannel === 'whatsapp' || selectedSampleChannel === 'both'
  const selectedSampleEmailUnavailable =
    selectedSampleRequiresEmail && !sampleEmailAvailable
  const selectedSampleWhatsappMissing =
    selectedSampleRequiresWhatsapp && sampleWhatsappNumber.trim().length === 0
  const selectedSampleConsentMissing =
    selectedSampleRequiresWhatsapp && !sampleWhatsappConsent
  const sampleSubmitDisabled =
    sampleAlreadySent ||
    sampleSendingChannel !== null ||
    selectedSampleEmailUnavailable ||
    selectedSampleWhatsappMissing ||
    selectedSampleConsentMissing
  const selectedSampleButtonLabel =
    selectedSampleChannel === 'email'
      ? messages.activate.sampleEmailButton
      : selectedSampleChannel === 'whatsapp'
        ? messages.activate.sampleWhatsappButton
        : messages.activate.sampleBothButton
  const sampleChannelOptions: Array<{
    channel: SampleDeliveryChannel
    disabled: boolean
    label: string
  }> = [
    {
      channel: 'email',
      disabled: !sampleEmailAvailable,
      label: messages.activate.sampleEmailOption,
    },
    {
      channel: 'whatsapp',
      disabled: false,
      label: messages.activate.sampleWhatsappOption,
    },
    {
      channel: 'both',
      disabled: !sampleEmailAvailable,
      label: messages.activate.sampleBothOption,
    },
  ]

  return (
    <section className="cosmic-shell mx-auto max-w-6xl p-4 sm:p-6">
      <div className="luck-glow cosmic-panel relative overflow-hidden rounded-[2.3rem] p-5 sm:p-7 lg:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(90,243,220,0.22),transparent_30%),radial-gradient(circle_at_86%_0%,rgba(117,173,255,0.18),transparent_32%),radial-gradient(circle_at_70%_82%,rgba(247,221,145,0.12),transparent_30%)]" />
        <div className="relative z-10 grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-start lg:gap-8">
          <div className="space-y-5">
            <p className="cosmic-badge inline-flex rounded-full px-4 py-1 text-xs font-bold uppercase tracking-[0.24em] text-cyan-100">
              {messages.activate.badge}
            </p>
            <h1 className="max-w-2xl text-4xl leading-[1.04] text-slate-50 sm:text-5xl">
              {messages.activate.title}
            </h1>
            <p className="max-w-xl text-base text-slate-100/86 sm:text-lg">
              {messages.activate.subtitle}
            </p>

            <div className="flex flex-wrap gap-3">
              {primaryAction}
              <OpenLuckGuruChatButton
                analyticsLocation="activation_gate"
                label={
                  resolvedLanguage === 'es'
                    ? 'Hablar con Luck Guru'
                    : resolvedLanguage === 'pt'
                      ? 'Falar com Luck Guru'
                      : 'Talk to Luck Guru'
                }
                className="cosmic-button-secondary inline-flex justify-center rounded-full px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-cyan-50"
              />
            </div>
            {error ? (
              <p className="cosmic-error-box rounded-xl px-4 py-3 text-sm">
                {error}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2">
              {messages.activate.cards.map((item) => (
                <div
                  key={item}
                  className="rounded-full border border-cyan-100/18 bg-cyan-100/8 px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-50"
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.4rem] border border-cyan-200/18 bg-slate-950/42 p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100/78">
                  {messages.activate.billingLabel}
                </p>
                <p className="mt-2 text-xl leading-tight text-slate-50">
                  {messages.activate.billingValue}
                </p>
              </div>
              <div className="rounded-[1.4rem] border border-emerald-200/18 bg-emerald-300/10 p-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-100/86">
                  {messages.activate.unsubscribeTitle}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-100/82">
                  {messages.activate.unsubscribeText}
                </p>
              </div>
            </div>
          </div>

          <div className="cosmic-info-box rounded-[1.7rem] p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100/78">
                  {messages.activate.previewLabel}
                </p>
                <h2 className="mt-2 text-2xl leading-tight text-slate-50">
                  {messages.activate.sampleTitle}
                </h2>
              </div>
              {sampleAlreadySent ? (
                <span className="rounded-full border border-emerald-200/22 bg-emerald-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-100">
                  {messages.activate.sampleAlreadySent}
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-100/84">
              {messages.activate.sampleText}
            </p>

            {sampleAlreadySent ? (
              <div className="mt-4 rounded-2xl border border-emerald-200/20 bg-emerald-300/10 px-4 py-3 text-sm leading-6 text-emerald-50">
                {sampleSuccess || messages.activate.sampleAlreadySent}
              </div>
            ) : (
              <div className="mt-4 grid gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100/78">
                    {messages.activate.sampleChannelLabel}
                  </p>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {sampleChannelOptions.map((option) => {
                      const selected = selectedSampleChannel === option.channel

                      return (
                        <button
                          key={option.channel}
                          type="button"
                          onClick={() => {
                            setSelectedSampleChannel(option.channel)
                          }}
                          disabled={option.disabled || sampleSendingChannel !== null}
                          className={`rounded-full border px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] transition disabled:opacity-40 ${
                            selected
                              ? 'border-cyan-100/52 bg-cyan-100/18 text-cyan-50'
                              : 'border-cyan-100/14 bg-slate-950/30 text-cyan-100/78'
                          }`}
                        >
                          {option.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {!sampleEmailAvailable ? (
                  <p className="text-xs leading-5 text-amber-100/82">
                    {messages.activate.sampleEmailUnavailable}
                  </p>
                ) : null}

                {selectedSampleRequiresWhatsapp ? (
                  <div className="rounded-2xl border border-cyan-100/14 bg-slate-950/32 p-3">
                    <label className="block text-xs font-black uppercase tracking-[0.16em] text-cyan-100/78">
                      {messages.activate.sampleWhatsappNumberLabel}
                      <input
                        type="tel"
                        value={sampleWhatsappNumber}
                        onChange={(event) => {
                          setSampleWhatsappNumber(event.target.value)
                        }}
                        placeholder={messages.activate.sampleWhatsappPlaceholder}
                        disabled={sampleAlreadySent || sampleSendingChannel !== null}
                        className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3 text-sm font-semibold text-slate-50 disabled:opacity-60"
                      />
                    </label>
                    <label className="mt-3 flex gap-3 text-xs leading-5 text-slate-100/82">
                      <input
                        type="checkbox"
                        checked={sampleWhatsappConsent}
                        onChange={(event) => {
                          setSampleWhatsappConsent(event.target.checked)
                        }}
                        disabled={sampleAlreadySent || sampleSendingChannel !== null}
                        className="mt-1 h-4 w-4 accent-cyan-300"
                      />
                      <span>{messages.activate.sampleWhatsappConsentLabel}</span>
                    </label>
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={() => {
                    void sendSampleDelivery(selectedSampleChannel)
                  }}
                  disabled={sampleSubmitDisabled}
                  className="cosmic-button-primary inline-flex w-full justify-center rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.14em] disabled:opacity-50"
                >
                  {sampleSendingChannel === selectedSampleChannel
                    ? messages.common.loading
                    : selectedSampleButtonLabel}
                </button>
              </div>
            )}

            {sampleError ? (
              <p className="cosmic-error-box mt-3 rounded-xl px-4 py-3 text-sm">
                {sampleError}
              </p>
            ) : null}
          </div>
        </div>

        <div className="relative z-10 mt-6 rounded-[1.7rem] border border-cyan-200/18 bg-slate-950/36 p-4 sm:p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-100/84">
                {messages.activate.previewBadge}
              </p>
              <h2 className="mt-2 text-2xl leading-tight text-slate-50">
                {messages.activate.previewTitle}
              </h2>
            </div>
            <div className="hidden sm:block">{primaryAction}</div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {sampleFortune.map((day) => (
              <article
                key={day.date}
                className="rounded-2xl border border-cyan-100/16 bg-slate-950/38 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-50">{day.weekday}</p>
                  <span className="rounded-full border border-cyan-100/18 bg-cyan-100/8 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100">
                    {toneLabel(language, day.summary)}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-100/82">{day.notes}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
