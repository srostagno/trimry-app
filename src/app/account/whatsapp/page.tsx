'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { DeliveryHourSelect } from '@/components/delivery-hour-select'
import { DeliveryPreferenceSelector } from '@/components/delivery-preference-selector'
import { useLanguage } from '@/components/language-provider'
import { trackEvent, trackMetaCustomEvent } from '@/lib/analytics'
import { apiFetch, readApiError } from '@/lib/api-client'
import {
  DEFAULT_WEEKLY_DELIVERY_HOUR,
  formatDeliveryHourLabel,
} from '@/lib/schedule'
import {
  type AccountSnapshot,
  type DeliveryPreference,
  fetchAccountSnapshot,
  requiresWhatsappDelivery,
} from '@/lib/start-flow'

const SIGNUP_WHATSAPP_STORAGE_KEY = 'trimry:signup-whatsapp-number'

function settingCopy(language: string) {
  const isSpanish = language.startsWith('es')

  return isSpanish
    ? {
        badge: 'Ajustes de entrega',
        title: '¿Cómo debería Trimry entregar tu proyección diaria?',
        subtitle:
          'Email sigue siendo el valor por defecto. WhatsApp se puede acordar y ambos canales se pueden activar cuando quieras.',
        emailLabel: 'Correo de entrega',
        channelLabel: 'Canal de entrega',
        scheduleLabel: 'Hora de proyección diaria',
        consentLabel: 'Acepto recibir mensajes de Trimry por WhatsApp.',
        consentHint:
          'Necesario solo si eliges WhatsApp como canal de entrega.',
        saveButton: 'Guardar ajustes',
        savingButton: 'Guardando...',
        backButton: 'Volver al dashboard',
        success: 'Ajustes de entrega actualizados.',
        help: 'Los cambios se aplican solo a futuras entregas.',
      }
    : {
        badge: 'Delivery settings',
        title: 'How should Trimry deliver your daily projection?',
        subtitle:
          'Email remains the default. WhatsApp can be agreed, and both channels can be enabled whenever you want.',
        emailLabel: 'Delivery email',
        channelLabel: 'Delivery channel',
        scheduleLabel: 'Daily projection time',
        consentLabel: 'I agree to receive Trimry messages on WhatsApp.',
        consentHint: 'Required only if you choose WhatsApp delivery.',
        saveButton: 'Save settings',
        savingButton: 'Saving...',
        backButton: 'Back to dashboard',
        success: 'Delivery settings updated.',
        help: 'Changes apply to future deliveries only.',
      }
}

export default function DeliverySettingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { language } = useLanguage()
  const copy = useMemo(() => settingCopy(language), [language])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [account, setAccount] = useState<AccountSnapshot | null>(null)
  const [deliveryPreference, setDeliveryPreference] =
    useState<DeliveryPreference>('email')
  const [deliveryHourLocal, setDeliveryHourLocal] = useState(
    DEFAULT_WEEKLY_DELIVERY_HOUR,
  )
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [whatsappConsentAccepted, setWhatsappConsentAccepted] = useState(false)
  const isEditMode = searchParams.get('edit') === '1'

  useEffect(() => {
    let cancelled = false

    const loadState = async () => {
      try {
        const currentAccount = await fetchAccountSnapshot()

        if (!currentAccount) {
          router.replace('/account/login')
          return
        }

        const subscription = currentAccount.subscription

        if (!subscription) {
          router.replace('/activate')
          return
        }

        if (subscription.status === 'pending_checkout') {
          router.replace('/checkout/start')
          return
        }

        if (subscription.status === 'canceled') {
          router.replace('/dashboard')
          return
        }

        if (!cancelled) {
          setAccount(currentAccount)
          setDeliveryPreference(subscription.deliveryPreference ?? 'email')
          setDeliveryHourLocal(
            subscription.deliveryHourLocal ?? DEFAULT_WEEKLY_DELIVERY_HOUR,
          )
          setWhatsappNumber(subscription.whatsappNumber?.trim() ?? '')
          setWhatsappConsentAccepted(Boolean(subscription.whatsappNumber?.trim()))
        }
      } catch {
        if (!cancelled) {
          setError('Unable to load delivery settings.')
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
  }, [router])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    if (requiresWhatsappDelivery(deliveryPreference) && !whatsappConsentAccepted) {
      setError('Please confirm WhatsApp consent before enabling WhatsApp delivery.')
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
        setError(await readApiError(response, 'Unable to save delivery settings.'))
        return
      }

      trackEvent('delivery_settings_saved', {
        entry_point: isEditMode ? 'dashboard_settings' : 'settings_page',
        user_id: account?.user.id,
        delivery_preference: deliveryPreference,
        delivery_hour_local: deliveryHourLocal,
        requires_whatsapp: requiresWhatsappDelivery(deliveryPreference),
      })
      trackMetaCustomEvent('SubscriptionSetup', {
        entry_point: isEditMode ? 'dashboard_settings' : 'settings_page',
        delivery_preference: deliveryPreference,
        delivery_hour_local: deliveryHourLocal,
        requires_whatsapp: requiresWhatsappDelivery(deliveryPreference),
      })

      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(SIGNUP_WHATSAPP_STORAGE_KEY)
      }

      setSuccess(copy.success)
      router.refresh()
    } catch {
      setError('Unable to save delivery settings.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <section className="cosmic-shell mx-auto max-w-5xl p-4 sm:p-6">
        <div className="luck-glow cosmic-panel rounded-[2.3rem] p-6 text-slate-100 sm:p-8">
          Loading delivery settings...
        </div>
      </section>
    )
  }

  if (!account) {
    return (
      <section className="cosmic-shell mx-auto max-w-5xl p-4 sm:p-6">
        <div className="luck-glow cosmic-panel rounded-[2.3rem] p-6 text-slate-100 sm:p-8">
          <p>Redirecting...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="cosmic-shell mx-auto max-w-5xl p-4 sm:p-6">
      <div className="luck-glow cosmic-panel relative overflow-hidden rounded-[2.3rem] p-5 sm:p-7 lg:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(90,243,220,0.22),transparent_30%),radial-gradient(circle_at_86%_0%,rgba(117,173,255,0.18),transparent_32%),radial-gradient(circle_at_70%_82%,rgba(247,221,145,0.12),transparent_30%)]" />
        <div className="relative z-10 grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:gap-8">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <p className="cosmic-badge inline-flex rounded-full px-4 py-1 text-xs font-bold uppercase tracking-[0.24em] text-cyan-100">
                {copy.badge}
              </p>
              {isEditMode ? (
                <span className="rounded-full border border-cyan-200/22 bg-cyan-100/8 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100/86">
                  Edit mode
                </span>
              ) : null}
            </div>

            <h1 className="max-w-2xl text-3xl leading-[1.04] text-slate-50 sm:text-4xl lg:text-5xl">
              {copy.title}
            </h1>
            <p className="max-w-xl text-base text-slate-100/86 sm:text-lg">
              {copy.subtitle}
            </p>

            <div className="rounded-[1.7rem] border border-cyan-200/18 bg-slate-950/42 p-4 sm:p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100/78">
                {copy.emailLabel}
              </p>
              <p className="mt-2 text-base text-slate-50">{account.user.email}</p>
              <p className="mt-3 text-sm text-slate-100/72">{copy.help}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                language.startsWith('es') ? 'Email primero' : 'Email first',
                language.startsWith('es') ? 'WhatsApp acordado' : 'WhatsApp agreed',
                language.startsWith('es') ? 'Ambos cuando quieras' : 'Both whenever you want',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-cyan-100/18 bg-cyan-100/8 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-cyan-50"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-cyan-200/18 bg-slate-950/42 p-4 sm:p-5">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <p className="mb-3 text-sm font-semibold text-cyan-100/90">
                  {copy.channelLabel}
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
                  {copy.scheduleLabel}
                </label>
                <DeliveryHourSelect
                  id="delivery-hour"
                  value={deliveryHourLocal}
                  onChange={setDeliveryHourLocal}
                  locale={language}
                  className="cosmic-input block w-full rounded-xl px-4 py-3"
                />
                <p className="mt-2 text-xs text-slate-100/70">
                  {formatDeliveryHourLabel(deliveryHourLocal, language)} ·{' '}
                  {account.subscription?.timeZone ||
                    account.user.timeZone ||
                    'America/Santiago'}
                </p>
              </div>

              {requiresWhatsappDelivery(deliveryPreference) ? (
                <>
                  <label className="block text-sm font-semibold text-cyan-100/90">
                    WhatsApp number
                    <input
                      type="tel"
                      value={whatsappNumber}
                      onChange={(event) => setWhatsappNumber(event.target.value)}
                      placeholder="+14155550123"
                      required
                      className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
                    />
                  </label>
                  <label className="cosmic-info-box flex items-start gap-3 rounded-2xl p-4 text-sm text-slate-100/88">
                    <input
                      type="checkbox"
                      checked={whatsappConsentAccepted}
                      onChange={(event) => setWhatsappConsentAccepted(event.target.checked)}
                      required
                      className="mt-0.5 h-4 w-4 accent-cyan-300"
                    />
                    <span>
                      <span className="block text-slate-50">{copy.consentLabel}</span>
                      <span className="cosmic-shell-meta mt-1 block text-xs">
                        {copy.consentHint}
                      </span>
                    </span>
                  </label>
                </>
              ) : (
                <div className="rounded-2xl border border-cyan-200/18 bg-slate-950/32 p-4 text-sm text-slate-100/76">
                  {language.startsWith('es')
                    ? 'WhatsApp sigue siendo opcional salvo que lo actives.'
                    : 'WhatsApp remains optional unless you turn it on.'}
                </div>
              )}

              {error ? (
                <p className="rounded-xl border border-rose-300/60 bg-rose-900/40 px-4 py-3 text-sm text-rose-100">
                  {error}
                </p>
              ) : null}

              {success ? (
                <p className="rounded-xl border border-emerald-300/50 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-100">
                  {success}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="cosmic-button-primary inline-flex rounded-full px-6 py-3 text-sm font-black uppercase tracking-[0.16em] disabled:opacity-70"
                >
                  {saving ? copy.savingButton : copy.saveButton}
                </button>
                <Link
                  href="/dashboard"
                  className="cosmic-outline-button inline-flex rounded-full px-6 py-3 text-sm font-black uppercase tracking-[0.16em]"
                >
                  {copy.backButton}
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
