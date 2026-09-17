'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { DeliveryHourSelect } from '@/components/delivery-hour-select'
import { DeliveryPreferenceSelector } from '@/components/delivery-preference-selector'
import { useLanguage } from '@/components/language-provider'
import { trackEvent, trackMetaCustomEvent } from '@/lib/analytics'
import { apiFetch, isProRequired, readApiErrorDetails } from '@/lib/api-client'
import { interpolate } from '@/lib/i18n'
import { DEFAULT_WEEKLY_DELIVERY_HOUR } from '@/lib/schedule'
import {
  type AccountSnapshot,
  type DeliveryPreference,
  fetchAccountSnapshot,
  requiresWhatsappDelivery,
} from '@/lib/start-flow'

function waitForStripeWebhook(delayMs: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, delayMs)
  })
}

export default function DeliverySettingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { language, messages } = useLanguage()
  const copy = messages.delivery
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [account, setAccount] = useState<AccountSnapshot | null>(null)
  const [deliveryPreference, setDeliveryPreference] = useState<DeliveryPreference>('email')
  const [deliveryHourLocal, setDeliveryHourLocal] = useState(DEFAULT_WEEKLY_DELIVERY_HOUR)
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [whatsappConsentAccepted, setWhatsappConsentAccepted] = useState(false)
  const isEditMode = searchParams.get('edit') === '1'
  const isConfirmMode = searchParams.get('confirm') === '1'

  useEffect(() => {
    let cancelled = false

    const loadState = async () => {
      try {
        let currentAccount = await fetchAccountSnapshot()

        if (!currentAccount) {
          router.replace('/account/login?redirect=/account/delivery')
          return
        }

        let subscription = currentAccount.subscription

        if (!subscription) {
          router.replace('/activate?step=3')
          return
        }

        if (subscription.status === 'pending_checkout') {
          if (isConfirmMode) {
            for (let attempt = 0; attempt < 6; attempt += 1) {
              await waitForStripeWebhook(850)

              const refreshedAccount = await fetchAccountSnapshot()
              const refreshedSubscription = refreshedAccount?.subscription

              if (refreshedAccount && refreshedSubscription && refreshedSubscription.status !== 'pending_checkout') {
                currentAccount = refreshedAccount
                subscription = refreshedSubscription
                break
              }
            }
          }

          if (subscription.status === 'pending_checkout') {
            router.replace(isConfirmMode ? '/dashboard?billing=success' : '/checkout/start')
            return
          }
        }

        if (subscription.status === 'canceled') {
          router.replace('/dashboard')
          return
        }

        if (!cancelled) {
          setAccount(currentAccount)
          setDeliveryPreference(subscription.deliveryPreference ?? 'email')
          setDeliveryHourLocal(subscription.deliveryHourLocal ?? DEFAULT_WEEKLY_DELIVERY_HOUR)
          setWhatsappNumber(subscription.whatsappNumber?.trim() ?? '')
          setWhatsappConsentAccepted(Boolean(subscription.whatsappNumber?.trim()))
        }
      } catch {
        if (!cancelled) {
          setError(copy.loadError)
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
  }, [copy.loadError, isConfirmMode, router])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    if (requiresWhatsappDelivery(deliveryPreference) && !whatsappConsentAccepted) {
      setError(copy.consentError)
      setSaving(false)
      return
    }

    try {
      const response = await apiFetch('/subscription', {
        method: 'POST',
        body: JSON.stringify({
          action: 'update-delivery',
          deliveryPreference,
          deliveryHourLocal,
          whatsappNumber,
          whatsappConsentAccepted: requiresWhatsappDelivery(deliveryPreference)
            ? whatsappConsentAccepted
            : undefined,
        }),
      })

      if (!response.ok) {
        const details = await readApiErrorDetails(response, copy.saveError)

        setError(isProRequired(details) ? messages.pro.proRequiredNotice : details.message)
        return
      }

      const entryPoint = isConfirmMode
        ? 'post_checkout_confirmation'
        : isEditMode
          ? 'dashboard_settings'
          : 'settings_page'

      trackEvent('delivery_settings_saved', {
        entry_point: entryPoint,
        user_id: account?.user.id,
        delivery_preference: deliveryPreference,
        delivery_hour_local: deliveryHourLocal,
        requires_whatsapp: requiresWhatsappDelivery(deliveryPreference),
      })
      trackMetaCustomEvent('SubscriptionSetup', {
        entry_point: entryPoint,
        delivery_preference: deliveryPreference,
        delivery_hour_local: deliveryHourLocal,
        requires_whatsapp: requiresWhatsappDelivery(deliveryPreference),
      })

      setSuccess(copy.success)
      router.refresh()

      if (isConfirmMode) {
        router.push('/dashboard?billing=success')
      }
    } catch {
      setError(copy.saveError)
    } finally {
      setSaving(false)
    }
  }

  if (loading || !account) {
    return (
      <section className="tr-shell mx-auto max-w-3xl p-8">
        <p className="tr-copy">{loading ? copy.loading : copy.redirecting}</p>
        {error ? <p className="tr-alert-error mt-4">{error}</p> : null}
      </section>
    )
  }

  const timeZone = account.subscription?.timeZone || account.user.timeZone || 'UTC'

  return (
    <section className="tr-shell mx-auto max-w-4xl p-6 sm:p-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="tr-badge tr-badge-blue">{isConfirmMode ? copy.confirmBadge : copy.badge}</p>
            {isEditMode && !isConfirmMode ? (
              <span className="tr-badge tr-badge-slate">{copy.editMode}</span>
            ) : null}
          </div>
          <h1 className="text-3xl">{isConfirmMode ? copy.confirmTitle : copy.title}</h1>
          <p className="tr-copy">{isConfirmMode ? copy.confirmSubtitle : copy.subtitle}</p>
          <div className="tr-card-muted p-4">
            <p className="tr-eyebrow">{copy.emailLabel}</p>
            <p className="mt-1 text-sm font-semibold text-trimry-ink">{account.user.email}</p>
            <p className="tr-meta mt-2 text-xs">{copy.help}</p>
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <p className="tr-label mb-2">{copy.channelLabel}</p>
            <DeliveryPreferenceSelector value={deliveryPreference} onChange={setDeliveryPreference} />
            {requiresWhatsappDelivery(deliveryPreference) ? (
              <p className="tr-alert-info mt-3 text-xs">{messages.deliveryChannels.whatsappPendingNote}</p>
            ) : null}
          </div>

          <label className="tr-label" htmlFor="delivery-hour">
            {copy.scheduleLabel}
            <DeliveryHourSelect
              id="delivery-hour"
              value={deliveryHourLocal}
              onChange={setDeliveryHourLocal}
              locale={language}
              className="tr-input mt-2"
            />
            <span className="tr-meta mt-2 block text-xs">
              {interpolate(messages.onboarding.hourHint, { zone: timeZone })}
            </span>
          </label>

          {requiresWhatsappDelivery(deliveryPreference) ? (
            <>
              <label className="tr-label">
                {copy.whatsappNumberLabel}
                <input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(event) => setWhatsappNumber(event.target.value)}
                  placeholder="+14155550123"
                  required
                  className="tr-input mt-2"
                />
              </label>
              <label className="tr-card-muted flex items-start gap-3 p-4 text-sm">
                <input
                  type="checkbox"
                  checked={whatsappConsentAccepted}
                  onChange={(event) => setWhatsappConsentAccepted(event.target.checked)}
                  required
                  className="tr-checkbox mt-0.5"
                />
                <span>
                  <span className="block font-semibold text-trimry-ink">{copy.consentLabel}</span>
                  <span className="tr-meta mt-1 block text-xs">{copy.consentHint}</span>
                </span>
              </label>
            </>
          ) : (
            <p className="tr-meta text-sm">{copy.whatsappOptional}</p>
          )}

          {error ? <p className="tr-alert-error">{error}</p> : null}
          {success ? <p className="tr-alert-success">{success}</p> : null}

          <div className="flex flex-wrap gap-3 pt-1">
            <button type="submit" disabled={saving} className="tr-btn-primary">
              {saving ? copy.savingButton : copy.saveButton}
            </button>
            <Link
              href={isConfirmMode ? '/dashboard?billing=success' : '/dashboard'}
              className="tr-btn-secondary"
            >
              {isConfirmMode ? copy.confirmBackButton : copy.backButton}
            </Link>
          </div>
        </form>
      </div>
    </section>
  )
}
