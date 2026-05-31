'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { useLanguage } from '@/components/language-provider'
import {
  trackEvent,
  trackEventOnce,
  trackMetaCustomEvent,
  trackMetaStandardEvent,
} from '@/lib/analytics'
import { apiFetch, readApiError } from '@/lib/api-client'
import { BillingSessionError, createBillingSession } from '@/lib/billing'
import { interpolate } from '@/lib/i18n'
import {
  fetchAccountSnapshot,
  type AccountSnapshot,
} from '@/lib/start-flow'
import {
  DEFAULT_WEEKLY_DELIVERY_HOUR,
  formatDeliveryHourLabel,
} from '@/lib/schedule'

const ANALYTICS_RETRY_ATTEMPTS = 8
const ANALYTICS_RETRY_DELAY_MS = 120
const ANALYTICS_FLUSH_DELAY_MS = 140

function waitForAnalyticsDelay(delayMs: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, delayMs)
  })
}

async function trackCheckoutSignals(input: {
  userId: string
  planId: string
  currency: string
  monthlyPriceUsd: number
  deliveryPreference: string
}) {
  let beginCheckoutTracked = false
  let initiateCheckoutTracked = false

  for (let attempt = 0; attempt < ANALYTICS_RETRY_ATTEMPTS; attempt += 1) {
    if (!beginCheckoutTracked) {
      beginCheckoutTracked = trackEvent('begin_checkout', {
        currency: input.currency,
        value: input.monthlyPriceUsd,
        user_id: input.userId,
        plan_id: input.planId,
        delivery_preference: input.deliveryPreference,
        items: [
          {
            item_id: input.planId,
            item_name: 'Trimry subscription',
            item_category: 'subscription',
            price: input.monthlyPriceUsd,
            quantity: 1,
          },
        ],
      })
    }

    if (!initiateCheckoutTracked) {
      initiateCheckoutTracked = trackMetaStandardEvent('InitiateCheckout', {
        content_name: 'Trimry subscription',
        content_category: 'subscription',
        currency: input.currency,
        value: input.monthlyPriceUsd,
        plan_id: input.planId,
        delivery_preference: input.deliveryPreference,
      })
    }

    if (beginCheckoutTracked && initiateCheckoutTracked) {
      break
    }

    if (attempt < ANALYTICS_RETRY_ATTEMPTS - 1) {
      await waitForAnalyticsDelay(ANALYTICS_RETRY_DELAY_MS)
    }
  }

  await waitForAnalyticsDelay(ANALYTICS_FLUSH_DELAY_MS)

  return {
    beginCheckoutTracked,
    initiateCheckoutTracked,
  }
}

export default function CheckoutStartPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { language, messages } = useLanguage()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState<AccountSnapshot | null>(null)
  const pendingCheckoutCreatedRef = useRef(false)
  const checkoutCancelled = searchParams.get('billing') === 'cancelled'

  useEffect(() => {
    trackEventOnce('checkout-page-viewed', 'checkout_page_viewed', {
      source: 'stripe_checkout',
      checkout_cancelled: checkoutCancelled,
    })
    trackMetaCustomEvent('CheckoutPageViewed', {
      source: 'stripe_checkout',
      checkout_cancelled: checkoutCancelled,
    })
  }, [checkoutCancelled])

  useEffect(() => {
    let cancelled = false

    const loadAndMaybeRedirect = async () => {
      try {
        let currentAccount = await fetchAccountSnapshot()

        if (!currentAccount) {
          router.replace('/account/login')
          return
        }

        let subscription = currentAccount.subscription

        if (!subscription) {
          if (pendingCheckoutCreatedRef.current) {
            return
          }

          pendingCheckoutCreatedRef.current = true

          const createResponse = await apiFetch(
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

          if (createResponse.status === 401) {
            router.replace('/account/login')
            return
          }

          if (!createResponse.ok) {
            throw new Error(
              await readApiError(createResponse, messages.checkout.openError),
            )
          }

          const createPayload = (await createResponse.json()) as {
            subscription?: AccountSnapshot['subscription']
          }

          subscription = createPayload.subscription ?? currentAccount.subscription
          currentAccount = {
            ...currentAccount,
            subscription,
          }
        } else if (subscription.status === 'pending_checkout') {
          const normalizedPreference = subscription.deliveryPreference ?? 'email'

          if (normalizedPreference !== 'email') {
            const normalizeResponse = await apiFetch(
              '/subscription',
              {
                method: 'POST',
                body: JSON.stringify({
                  action: 'update-delivery',
                  deliveryPreference: 'email',
                  deliveryHourLocal:
                    subscription.deliveryHourLocal ?? DEFAULT_WEEKLY_DELIVERY_HOUR,
                }),
              },
              { retryUnauthorized: false },
            )

            if (normalizeResponse.status === 401) {
              router.replace('/account/login')
              return
            }

            if (!normalizeResponse.ok) {
              throw new Error(
                await readApiError(normalizeResponse, messages.checkout.openError),
              )
            }

            const normalizePayload = (await normalizeResponse.json()) as {
              subscription?: AccountSnapshot['subscription']
            }

            subscription =
              normalizePayload.subscription ?? currentAccount.subscription
            currentAccount = {
              ...currentAccount,
              subscription,
            }
          }
        }

        if (!subscription) {
          router.replace('/activate')
          return
        }

        if (subscription.status !== 'pending_checkout') {
          router.replace('/dashboard')
          return
        }

        if (cancelled) {
          return
        }

        setAccount(currentAccount)

        if (checkoutCancelled) {
          trackEventOnce('checkout-abandoned', 'checkout_abandoned', {
            source: 'stripe_checkout',
            user_id: currentAccount.user.id,
            plan_id: subscription.planId,
            delivery_preference: subscription.deliveryPreference,
          })
          trackMetaCustomEvent('CheckoutAbandoned', {
            source: 'stripe_checkout',
            user_id: currentAccount.user.id,
            plan_id: subscription.planId,
            delivery_preference: subscription.deliveryPreference,
          })
          return
        }

        let checkoutUrl: string | null = null

        try {
          checkoutUrl = await createBillingSession(
            '/billing/checkout-session',
            messages.checkout.openError,
          )
        } catch (error) {
          if (!(error instanceof BillingSessionError)) {
            throw error
          }

          if (error.status === 401) {
            router.replace('/account/login')
            return
          }

          if (error.status === 409) {
            router.replace('/dashboard')
            return
          }

          if (error.status !== 404) {
            throw error
          }

          const repairResponse = await apiFetch(
            '/subscription',
            {
              method: 'POST',
              body: JSON.stringify({
                action: 'subscribe',
                deliveryPreference: 'email',
                deliveryHourLocal:
                  subscription.deliveryHourLocal ?? DEFAULT_WEEKLY_DELIVERY_HOUR,
              }),
            },
            { retryUnauthorized: false },
          )

          if (repairResponse.status === 401) {
            router.replace('/account/login')
            return
          }

          if (!repairResponse.ok) {
            throw new Error(
              await readApiError(repairResponse, messages.checkout.openError),
            )
          }

          checkoutUrl = await createBillingSession(
            '/billing/checkout-session',
            messages.checkout.openError,
          )
        }

        if (!checkoutUrl) {
          return
        }

        const trackingState = await trackCheckoutSignals({
          userId: currentAccount.user.id,
          planId: subscription.planId,
          currency: subscription.currency,
          monthlyPriceUsd: subscription.monthlyPriceUsd,
          deliveryPreference: subscription.deliveryPreference,
        })

        if (
          !trackingState.beginCheckoutTracked ||
          !trackingState.initiateCheckoutTracked
        ) {
          trackEvent('checkout_tracking_incomplete', {
            begin_checkout_tracked: trackingState.beginCheckoutTracked,
            initiate_checkout_tracked: trackingState.initiateCheckoutTracked,
            plan_id: subscription.planId,
            delivery_preference: subscription.deliveryPreference,
          })
        }

        if (cancelled) {
          return
        }

        trackEvent('stripe_loaded', {
          source: 'stripe_checkout',
          user_id: currentAccount.user.id,
          plan_id: subscription.planId,
          delivery_preference: subscription.deliveryPreference,
        })
        trackMetaCustomEvent('StripeLoaded', {
          source: 'stripe_checkout',
          user_id: currentAccount.user.id,
          plan_id: subscription.planId,
          delivery_preference: subscription.deliveryPreference,
        })

        window.location.assign(checkoutUrl)
      } catch (error) {
        if (!cancelled) {
          trackEvent('checkout_redirect_failed', {
            step: 'checkout_session',
            checkout_cancelled: checkoutCancelled,
          })
          setError(
            error instanceof Error
              ? error.message
              : messages.checkout.openError,
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadAndMaybeRedirect()

    return () => {
      cancelled = true
    }
  }, [checkoutCancelled, messages.checkout.openError, router])

  const recoveryCopy = checkoutCancelled
    ? messages.checkout.subtitleCancelled
    : messages.checkout.helper

  if (loading && !error && !account) {
    return (
      <section className="cosmic-shell mx-auto max-w-3xl rounded-[2rem] p-8 text-slate-100">
        <p className="cosmic-badge inline-flex rounded-full px-4 py-1 text-xs font-bold uppercase tracking-[0.24em] text-cyan-100">
          {checkoutCancelled ? messages.checkout.badgeCancelled : messages.checkout.badge}
        </p>
        <h1 className="cosmic-shell-title mt-6 text-4xl">
          {checkoutCancelled
            ? messages.checkout.titleCancelled
            : messages.checkout.title}
        </h1>
        <p className="cosmic-shell-copy mt-4 text-lg">{recoveryCopy}</p>
      </section>
    )
  }

  return (
    <section className="cosmic-shell mx-auto max-w-3xl rounded-[2rem] p-8 text-slate-100">
      <p className="cosmic-badge inline-flex rounded-full px-4 py-1 text-xs font-bold uppercase tracking-[0.24em] text-cyan-100">
        {checkoutCancelled ? messages.checkout.badgeCancelled : messages.checkout.badge}
      </p>
      <h1 className="cosmic-shell-title mt-6 text-4xl">
        {checkoutCancelled
          ? messages.checkout.titleCancelled
          : messages.checkout.title}
      </h1>
      <p className="cosmic-shell-copy mt-4 text-lg">{recoveryCopy}</p>

      {error ? (
        <div className="cosmic-error-box mt-6 rounded-3xl p-5">
          <p>{error}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                trackEvent('checkout_retry_click', {
                  source: 'checkout_error_state',
                })
                window.location.reload()
              }}
              className="cosmic-button-primary inline-flex rounded-full px-5 py-3 text-sm font-black uppercase tracking-[0.14em]"
            >
              {messages.common.tryAgain}
            </button>
            <Link
              href="/dashboard"
              className="cosmic-outline-button rounded-full px-5 py-3 text-sm font-black uppercase tracking-[0.14em]"
            >
              {messages.common.backToDashboard}
            </Link>
          </div>
        </div>
      ) : checkoutCancelled ? (
        <div className="cosmic-info-box mt-6 rounded-3xl p-5">
          <p className="text-base font-semibold text-slate-50">
            {messages.checkout.resumeTitle}
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-100/82">
            {messages.checkout.resumeSubtitle}
          </p>
          {account?.subscription ? (
            <div className="mt-4 grid gap-3 text-sm text-slate-100/80 sm:grid-cols-2">
              <div className="rounded-2xl border border-cyan-200/16 bg-slate-950/35 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-100/72">
                  {messages.checkout.deliveryLabel}
                </p>
                <p className="mt-2 text-slate-50">
                  {account.subscription.deliveryPreference === 'email'
                    ? messages.deliveryChannels.emailTitle
                    : account.subscription.deliveryPreference === 'whatsapp'
                      ? messages.deliveryChannels.whatsappTitle
                      : messages.deliveryChannels.bothTitle}
                </p>
              </div>
              <div className="rounded-2xl border border-cyan-200/16 bg-slate-950/35 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-100/72">
                  {messages.checkout.timingLabel}
                </p>
                <p className="mt-2 text-slate-50">
                  {interpolate(messages.deliveryOnboarding.mondayTimeHint, {
                    time: formatDeliveryHourLabel(
                      account.subscription.deliveryHourLocal,
                      language,
                    ),
                    zone: account.user.timeZone,
                  })}
                </p>
              </div>
            </div>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/checkout/start"
              onClick={() => {
                trackEvent('checkout_resume_click', {
                  source: 'checkout_cancel_state',
                  user_id: account?.user.id,
                })
                trackMetaCustomEvent('CheckoutResumeClick', {
                  source: 'checkout_cancel_state',
                  user_id: account?.user.id,
                })
              }}
              className="cosmic-button-primary inline-flex rounded-full px-5 py-3 text-sm font-black uppercase tracking-[0.14em]"
            >
              {messages.checkout.resumeButton}
            </Link>
            <Link
              href="/dashboard"
              className="cosmic-outline-button rounded-full px-5 py-3 text-sm font-black uppercase tracking-[0.14em]"
            >
              {messages.common.backToDashboard}
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-100/68">
            {messages.checkout.resumeHint}
          </p>
        </div>
      ) : (
        <div className="cosmic-info-box cosmic-shell-copy mt-6 rounded-3xl p-5">
          {messages.checkout.helper}
        </div>
      )}
    </section>
  )
}
