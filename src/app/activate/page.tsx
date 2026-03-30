'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { LuckBeliefCarousel } from '@/components/luck-belief-carousel'
import { useLanguage } from '@/components/language-provider'
import { trackEvent } from '@/lib/analytics'
import { interpolate } from '@/lib/i18n'
import { formatDeliveryHourLabel } from '@/lib/schedule'
import {
  type AccountSnapshot,
  type DeliveryPreference,
  fetchAccountSnapshot,
  getStartFlowDestination,
  requiresWhatsappDelivery,
} from '@/lib/start-flow'

export default function ActivationGatewayPage() {
  const router = useRouter()
  const { language, messages } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [account, setAccount] = useState<AccountSnapshot | null>(null)
  const deliveryLabel = (preference: DeliveryPreference) => {
    if (preference === 'both') {
      return messages.deliveryChannels.bothTitle
    }

    return preference === 'email'
      ? messages.deliveryChannels.emailTitle
      : messages.deliveryChannels.whatsappTitle
  }

  useEffect(() => {
    let cancelled = false

    const loadAccount = async () => {
      try {
        const currentAccount = await fetchAccountSnapshot()

        if (!currentAccount) {
          router.replace('/account/login')
          return
        }

        const destination = getStartFlowDestination(currentAccount)

        if (destination !== '/activate') {
          router.replace(destination)
          return
        }

        if (!cancelled) {
          trackEvent('activate_subscription_view', {
            subscription_status: currentAccount.subscription?.status ?? 'none',
            delivery_preference:
              currentAccount.subscription?.deliveryPreference ?? 'none',
          })
          setAccount(currentAccount)
        }
      } catch {
        if (!cancelled) {
          setError(messages.activate.loadError)
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
  }, [messages.activate.loadError, router])

  if (loading) {
    return (
      <section className="cosmic-shell cosmic-shell-copy mx-auto max-w-3xl rounded-[2rem] p-8">
        {messages.activate.loading}
      </section>
    )
  }

  if (!account) {
    return (
      <section className="cosmic-danger-shell mx-auto max-w-3xl rounded-[2rem] p-8 text-rose-100">
        <p>{error || messages.activate.unavailable}</p>
        <Link
          href="/account/login"
          className="cosmic-danger-button mt-5 inline-flex rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.14em]"
        >
          {messages.common.backToLogin}
        </Link>
      </section>
    )
  }

  return (
    <div className="space-y-8">
      <section className="luck-glow cosmic-panel relative overflow-hidden rounded-[2.2rem] p-8 sm:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(98,247,220,0.18),transparent_28%),radial-gradient(circle_at_90%_0%,rgba(120,167,255,0.18),transparent_32%),radial-gradient(circle_at_76%_100%,rgba(247,217,138,0.1),transparent_34%)]" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.06fr_0.94fr]">
          <div>
            <p className="cosmic-badge inline-flex rounded-full px-4 py-1 text-xs font-bold uppercase tracking-[0.24em] text-cyan-100">
              {messages.activate.badge}
            </p>
            <h1 className="mt-6 max-w-3xl text-4xl leading-[1.05] text-slate-50 sm:text-6xl">
              {messages.activate.title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-100/84">{messages.activate.subtitle}</p>

            <div className="mt-7 grid gap-3 text-sm text-slate-100/82 sm:grid-cols-3">
              {messages.activate.cards.map((card) => (
                <div
                  key={card}
                  className="rounded-2xl border border-cyan-200/20 bg-slate-950/35 p-4"
                >
                  {card}
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/checkout/start"
                onClick={() =>
                  trackEvent('activation_continue_click', {
                    destination: '/checkout/start',
                  })
                }
                className="cosmic-button-primary inline-flex rounded-full px-7 py-3 text-sm font-black uppercase tracking-[0.17em]"
              >
                {messages.activate.primaryButton}
              </Link>
              <Link
                href="/account/delivery?edit=1"
                onClick={() =>
                  trackEvent('activation_edit_delivery_click', {
                    destination: '/account/delivery?edit=1',
                  })
                }
                className="cosmic-outline-button inline-flex rounded-full px-7 py-3 text-sm font-black uppercase tracking-[0.17em]"
              >
                {messages.activate.secondaryButton}
              </Link>
            </div>
          </div>

          <aside className="cosmic-card rounded-[1.8rem] p-6">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-100/78">
              {messages.activate.snapshotTitle}
            </p>
            <div className="mt-5 space-y-4 text-sm text-slate-100/84">
              <div className="rounded-2xl border border-cyan-200/18 bg-slate-950/35 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-100/70">
                  {messages.activate.deliveryPreferenceLabel}
                </p>
                <p className="mt-2 text-lg text-slate-50">
                  {account.subscription
                    ? deliveryLabel(account.subscription.deliveryPreference)
                    : null}
                </p>
              </div>
              <div className="rounded-2xl border border-cyan-200/18 bg-slate-950/35 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-100/70">
                  {messages.activate.emailDeliveryLabel}
                </p>
                <p className="mt-2 text-lg text-slate-50">{account.user.email}</p>
              </div>
              {account.subscription ? (
                <div className="rounded-2xl border border-cyan-200/18 bg-slate-950/35 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-100/70">
                    {messages.activate.projectionTimingLabel}
                  </p>
                  <p className="mt-2 text-lg text-slate-50">
                    {interpolate('{time} ({zone})', {
                      time: formatDeliveryHourLabel(
                        account.subscription.deliveryHourLocal,
                        language,
                      ),
                      zone: account.user.timeZone,
                    })}
                  </p>
                </div>
              ) : null}
              {account.subscription &&
              requiresWhatsappDelivery(account.subscription.deliveryPreference) ? (
                <div className="rounded-2xl border border-cyan-200/18 bg-slate-950/35 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-100/70">
                    {messages.activate.whatsappDeliveryLabel}
                  </p>
                  <p className="mt-2 text-lg text-slate-50">
                    {account.subscription.whatsappNumber}
                  </p>
                </div>
              ) : null}
              <div className="rounded-2xl border border-cyan-200/18 bg-slate-950/35 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-100/70">
                  {messages.activate.billingLabel}
                </p>
                <p className="mt-2 text-lg text-slate-50">{messages.activate.billingValue}</p>
              </div>
              <div className="rounded-2xl border border-cyan-200/18 bg-slate-950/35 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-100/70">
                  {messages.activate.whyItWorksLabel}
                </p>
                <p className="mt-2">{messages.activate.whyItWorksText}</p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <LuckBeliefCarousel
        badge={messages.activate.carouselBadge}
        title={messages.activate.carouselTitle}
        subtitle={messages.activate.carouselSubtitle}
        compact
      />
    </div>
  )
}
