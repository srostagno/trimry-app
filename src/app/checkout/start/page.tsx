'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { useLanguage } from '@/components/language-provider'
import { trackEvent, trackEventOnce } from '@/lib/analytics'
import { createBillingSession } from '@/lib/billing'
import {
  fetchAccountSnapshot,
  requiresWhatsappDelivery,
} from '@/lib/start-flow'

export default function CheckoutStartPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { messages } = useLanguage()
  const [error, setError] = useState('')
  const checkoutCancelled = searchParams.get('billing') === 'cancelled'

  useEffect(() => {
    if (!checkoutCancelled) {
      return
    }

    trackEventOnce('checkout-cancelled', 'checkout_cancelled', {
      source: 'stripe_checkout',
    })
  }, [checkoutCancelled])

  useEffect(() => {
    let cancelled = false

    const redirectToCheckout = async () => {
      try {
        const account = await fetchAccountSnapshot()

        if (!account) {
          router.replace('/account/login')
          return
        }

        const subscription = account.subscription
        const whatsappNumber = subscription?.whatsappNumber?.trim()
        const status = subscription?.status

        if (!subscription) {
          router.replace('/account/delivery')
          return
        }

        if (
          requiresWhatsappDelivery(subscription.deliveryPreference) &&
          !whatsappNumber
        ) {
          router.replace('/account/delivery')
          return
        }

        if (status !== 'pending_checkout') {
          router.replace('/dashboard')
          return
        }

        const checkoutUrl = await createBillingSession(
          '/billing/checkout-session',
          messages.checkout.openError,
        )

        trackEvent('begin_checkout', {
          currency: subscription.currency,
          value: subscription.monthlyPriceUsd,
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
      }
    }

    void redirectToCheckout()

    return () => {
      cancelled = true
    }
  }, [checkoutCancelled, messages.checkout.openError, router])

  return (
    <section className="cosmic-shell mx-auto max-w-2xl rounded-[2rem] p-8 text-slate-100">
      <p className="cosmic-badge inline-flex rounded-full px-4 py-1 text-xs font-bold uppercase tracking-[0.24em] text-cyan-100">
        {messages.checkout.badge}
      </p>
      <h1 className="cosmic-shell-title mt-6 text-4xl">
        {checkoutCancelled ? messages.checkout.titleCancelled : messages.checkout.title}
      </h1>
      <p className="cosmic-shell-copy mt-4 text-lg">
        {checkoutCancelled
          ? messages.checkout.subtitleCancelled
          : messages.checkout.subtitle}
      </p>

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
      ) : (
        <div className="cosmic-info-box cosmic-shell-copy mt-6 rounded-3xl p-5">
          {messages.checkout.helper}
        </div>
      )}
    </section>
  )
}
