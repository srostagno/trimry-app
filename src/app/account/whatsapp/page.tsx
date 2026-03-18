'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import { DeliveryHourSelect } from '@/components/delivery-hour-select'
import { DeliveryPreferenceSelector } from '@/components/delivery-preference-selector'
import { useLanguage } from '@/components/language-provider'
import { apiFetch, readApiError } from '@/lib/api-client'
import { trackEvent } from '@/lib/analytics'
import { interpolate } from '@/lib/i18n'
import {
  DEFAULT_WEEKLY_DELIVERY_HOUR,
  formatDeliveryHourLabel,
} from '@/lib/schedule'
import {
  type AccountSnapshot,
  type DeliveryPreference,
  fetchAccountSnapshot,
  getStartFlowDestination,
  requiresWhatsappDelivery,
} from '@/lib/start-flow'

export default function DeliveryOnboardingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { language, messages } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [deliveryPreference, setDeliveryPreference] =
    useState<DeliveryPreference>('both')
  const [deliveryHourLocal, setDeliveryHourLocal] = useState(
    DEFAULT_WEEKLY_DELIVERY_HOUR,
  )
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [phase, setPhase] = useState<'form' | 'preparing'>('form')
  const [activeStep, setActiveStep] = useState(0)
  const [account, setAccount] = useState<AccountSnapshot | null>(null)

  const isEditMode = searchParams.get('edit') === '1'
  const hasExistingSubscription = Boolean(account?.subscription)
  const shouldReturnToCheckout = account?.subscription?.status === 'pending_checkout'
  const shouldProceedToActivation = !hasExistingSubscription || shouldReturnToCheckout
  const submitAction = hasExistingSubscription ? 'update-delivery' : 'subscribe'
  const preparationSteps = messages.deliveryOnboarding.preparationSteps

  const progressWidth = useMemo(
    () => `${((activeStep + 1) / preparationSteps.length) * 100}%`,
    [activeStep, preparationSteps.length],
  )

  useEffect(() => {
    let cancelled = false

    const loadState = async () => {
      try {
        const account = await fetchAccountSnapshot()

        if (!account) {
          router.replace('/account/register')
          return
        }

        setAccount(account)
        const existingPreference = account.subscription?.deliveryPreference ?? 'both'
        const existingDeliveryHour =
          account.subscription?.deliveryHourLocal ?? DEFAULT_WEEKLY_DELIVERY_HOUR
        const existingWhatsappNumber = account.subscription?.whatsappNumber?.trim() ?? ''

        if (!cancelled) {
          setDeliveryPreference(existingPreference)
          setDeliveryHourLocal(existingDeliveryHour)
        }

        if (!cancelled && existingWhatsappNumber) {
          setWhatsappNumber(existingWhatsappNumber)
        }

        const deliverySetupComplete = account.subscription
          ? !requiresWhatsappDelivery(existingPreference) || Boolean(existingWhatsappNumber)
          : false

        if (deliverySetupComplete && !isEditMode) {
          router.replace(getStartFlowDestination(account))
          return
        }
      } catch {
        if (!cancelled) {
          setError(messages.deliveryOnboarding.loadError)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadState()

    return () => {
      cancelled = true
    }
  }, [isEditMode, messages.deliveryOnboarding.loadError, router])

  useEffect(() => {
    if (phase !== 'preparing') {
      return
    }

    setActiveStep(0)

    const intervalId = window.setInterval(() => {
      setActiveStep((current) =>
        current < preparationSteps.length - 1 ? current + 1 : current,
      )
    }, 1100)

    const timeoutId = window.setTimeout(() => {
      router.push(shouldProceedToActivation ? '/activate' : '/dashboard')
      router.refresh()
    }, 4800)

    return () => {
      window.clearInterval(intervalId)
      window.clearTimeout(timeoutId)
    }
  }, [phase, preparationSteps.length, router, shouldProceedToActivation])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const response = await apiFetch('/subscription', {
        method: 'POST',
        body: JSON.stringify({
          action: submitAction,
          deliveryPreference,
          deliveryHourLocal,
          whatsappNumber,
        }),
      })

      if (!response.ok) {
        setError(await readApiError(response, messages.deliveryOnboarding.saveError))
        return
      }

      trackEvent('delivery_preferences_saved', {
        entry_point: hasExistingSubscription
          ? isEditMode
            ? 'delivery_edit'
            : 'dashboard'
          : 'onboarding',
        delivery_preference: deliveryPreference,
        delivery_hour_local: deliveryHourLocal,
        requires_whatsapp: requiresWhatsappDelivery(deliveryPreference),
        destination: shouldProceedToActivation ? 'activate' : 'dashboard',
      })

      if (shouldProceedToActivation) {
        setPhase('preparing')
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError(messages.deliveryOnboarding.saveError)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <section className="mx-auto max-w-2xl rounded-[2rem] border border-cyan-200/20 bg-slate-950/45 p-8 text-cyan-100">
        {messages.deliveryOnboarding.loading}
      </section>
    )
  }

  if (phase === 'preparing') {
    return (
      <section className="luck-glow cosmic-panel mx-auto max-w-3xl overflow-hidden rounded-[2.2rem] p-8 sm:p-10">
        <p className="cosmic-badge inline-flex rounded-full px-4 py-1 text-xs font-bold uppercase tracking-[0.24em] text-cyan-100">
          {messages.deliveryOnboarding.prepBadge}
        </p>
        <h1 className="mt-6 text-4xl text-slate-50 sm:text-5xl">
          {messages.deliveryOnboarding.prepTitle}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-100/84">{messages.deliveryOnboarding.prepSubtitle}</p>

        <div className="mt-8 rounded-3xl border border-cyan-200/18 bg-slate-950/45 p-5">
          <div className="h-3 overflow-hidden rounded-full bg-slate-900/80">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#d8fff6,#8ef4e0_45%,#7be0ff)] transition-all duration-700"
              style={{ width: progressWidth }}
            />
          </div>
          <div className="mt-6 grid gap-3">
            {preparationSteps.map((step, index) => (
              <div
                key={step}
                className={`rounded-2xl border px-4 py-3 text-sm uppercase tracking-[0.18em] transition ${
                  index <= activeStep
                    ? 'border-cyan-200/40 bg-cyan-300/14 text-cyan-50'
                    : 'border-slate-700/70 bg-slate-900/50 text-slate-400'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="luck-glow cosmic-panel mx-auto max-w-3xl overflow-hidden rounded-[2.2rem] p-8 sm:p-10">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="cosmic-badge inline-flex rounded-full px-4 py-1 text-xs font-bold uppercase tracking-[0.24em] text-cyan-100">
            {isEditMode
              ? messages.deliveryOnboarding.editBadge
              : messages.deliveryOnboarding.createBadge}
          </p>
          <h1 className="mt-6 text-4xl text-slate-50 sm:text-5xl">
            {isEditMode
              ? messages.deliveryOnboarding.editTitle
              : messages.deliveryOnboarding.createTitle}
          </h1>
          <p className="mt-4 text-lg text-slate-100/84">
            {isEditMode
              ? messages.deliveryOnboarding.editSubtitle
              : messages.deliveryOnboarding.createSubtitle}
          </p>
          <div className="mt-8 rounded-3xl border border-cyan-200/18 bg-slate-950/40 p-5 text-sm text-slate-100/82">
            {shouldProceedToActivation ? (
              <>
                {messages.deliveryOnboarding.activationChecklist.map((step, index) => (
                  <p key={step} className={index === 0 ? '' : 'mt-2'}>
                    {index + 1}. {step}
                  </p>
                ))}
              </>
            ) : (
              <>
                {messages.deliveryOnboarding.dashboardChecklist.map((step, index) => (
                  <p key={step} className={index === 0 ? '' : 'mt-2'}>
                    {index + 1}. {step}
                  </p>
                ))}
              </>
            )}
          </div>
        </div>

        <div className="cosmic-card rounded-3xl p-6">
          <h2 className="text-2xl text-slate-50">{messages.deliveryOnboarding.setupTitle}</h2>
          <p className="mt-3 text-slate-100/80">{messages.deliveryOnboarding.setupSubtitle}</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <p className="mb-3 text-sm font-semibold text-cyan-100/90">
                {messages.deliveryOnboarding.channelLabel}
              </p>
              <DeliveryPreferenceSelector
                value={deliveryPreference}
                onChange={setDeliveryPreference}
              />
            </div>

            <div>
              <label
                htmlFor="delivery-hour"
                className="mb-3 block text-sm font-semibold text-cyan-100/90"
              >
                {messages.deliveryOnboarding.mondayTimeLabel}
              </label>
              <DeliveryHourSelect
                id="delivery-hour"
                value={deliveryHourLocal}
                onChange={setDeliveryHourLocal}
                locale={language}
                className="cosmic-input block w-full rounded-xl px-4 py-3"
              />
              <p className="mt-2 text-xs text-slate-100/70">
                {interpolate(messages.deliveryOnboarding.mondayTimeHint, {
                  time: formatDeliveryHourLabel(deliveryHourLocal, language),
                  zone: account?.user.timeZone ?? 'UTC',
                })}
              </p>
            </div>

            <div className="rounded-2xl border border-cyan-200/18 bg-slate-950/32 p-4 text-sm text-slate-100/82">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100/76">
                {messages.deliveryOnboarding.emailDeliveryLabel}
              </p>
              <p className="mt-2 text-base text-slate-50">{account?.user.email}</p>
            </div>

            {requiresWhatsappDelivery(deliveryPreference) ? (
              <label className="block text-sm font-semibold text-cyan-100/90">
                {messages.auth.whatsappLabel}
                <input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(event) => setWhatsappNumber(event.target.value)}
                  placeholder="+14155550123"
                  required
                  className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
                />
              </label>
            ) : (
              <div className="rounded-2xl border border-cyan-200/18 bg-slate-950/32 p-4 text-sm text-slate-100/76">
                {messages.deliveryOnboarding.whatsappOffHint}
              </div>
            )}

            {error ? (
              <p className="rounded-xl border border-rose-300/60 bg-rose-900/40 px-4 py-3 text-sm text-rose-100">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="cosmic-button-primary w-full rounded-full px-6 py-3 text-sm font-black uppercase tracking-[0.16em] disabled:opacity-70"
            >
              {submitting
                ? messages.common.saving
                : shouldProceedToActivation
                  ? messages.deliveryOnboarding.submitContinue
                  : messages.deliveryOnboarding.submitSave}
            </button>

            {isEditMode ? (
              <Link
                href={shouldReturnToCheckout ? '/dashboard' : '/dashboard'}
                className="inline-flex w-full items-center justify-center rounded-full border border-cyan-200/24 px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-cyan-100"
              >
                {messages.common.cancel}
              </Link>
            ) : null}
          </form>
        </div>
      </div>
    </section>
  )
}
