'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { DeliveryHourSelect } from '@/components/delivery-hour-select'
import { DeliveryPreferenceSelector } from '@/components/delivery-preference-selector'
import { useLanguage } from '@/components/language-provider'
import { trackEvent, trackMetaCustomEvent } from '@/lib/analytics'
import { apiFetch, readApiError } from '@/lib/api-client'
import { normalizeLanguageCode } from '@/lib/i18n'
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

function waitForStripeWebhook(delayMs: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, delayMs)
  })
}

function settingCopy(language: string) {
  const resolvedLanguage = normalizeLanguageCode(language)

  if (resolvedLanguage === 'es') {
    return {
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
        confirmBadge: 'Confirmación de entrega',
        confirmTitle: 'Confirma dónde quieres recibir tus predicciones',
        confirmSubtitle:
          'Tu suscripción ya quedó lista. Antes de entrar al dashboard, confirma si quieres recibir Trimry por email, WhatsApp o ambos.',
        confirmBackButton: 'Ir al dashboard',
        success: 'Ajustes de entrega actualizados.',
        help: 'Los cambios se aplican solo a futuras entregas.',
        editMode: 'Modo edición',
        quickCards: [
          'Email primero',
          'WhatsApp acordado',
          'Ambos cuando quieras',
        ],
        whatsappNumberLabel: 'Número de WhatsApp',
        whatsappOptional:
          'WhatsApp sigue siendo opcional salvo que lo actives.',
        loadError: 'No pudimos cargar los ajustes de entrega.',
        consentError:
          'Confirma el consentimiento de WhatsApp antes de habilitar la entrega por WhatsApp.',
        saveError: 'No pudimos guardar los ajustes de entrega.',
        loading: 'Cargando ajustes de entrega...',
        redirecting: 'Redirigiendo...',
      }
  }

  if (resolvedLanguage === 'pt') {
    return {
      badge: 'Ajustes de entrega',
      title: 'Como a Trimry deve entregar sua projeção diária?',
      subtitle:
        'Email continua sendo o padrão. WhatsApp pode ser combinado, e ambos os canais podem ser ativados quando você quiser.',
      emailLabel: 'Email de entrega',
      channelLabel: 'Canal de entrega',
      scheduleLabel: 'Horário da projeção diária',
      consentLabel: 'Aceito receber mensagens da Trimry pelo WhatsApp.',
      consentHint:
        'Necessário apenas se você escolher entrega por WhatsApp.',
      saveButton: 'Salvar ajustes',
      savingButton: 'Salvando...',
      backButton: 'Voltar ao painel',
      confirmBadge: 'Confirmação de entrega',
      confirmTitle: 'Confirme onde quer receber suas previsões',
      confirmSubtitle:
        'Sua assinatura já está pronta. Antes de entrar no painel, confirme se quer receber a Trimry por email, WhatsApp ou ambos.',
      confirmBackButton: 'Ir para o painel',
      success: 'Ajustes de entrega atualizados.',
      help: 'As mudanças valem apenas para entregas futuras.',
      editMode: 'Modo edição',
      quickCards: [
        'Email primeiro',
        'WhatsApp combinado',
        'Ambos quando quiser',
      ],
      whatsappNumberLabel: 'Número de WhatsApp',
      whatsappOptional: 'WhatsApp continua opcional até você ativá-lo.',
      loadError: 'Não foi possível carregar os ajustes de entrega.',
      consentError:
        'Confirme o consentimento do WhatsApp antes de habilitar a entrega por WhatsApp.',
      saveError: 'Não foi possível salvar os ajustes de entrega.',
      loading: 'Carregando ajustes de entrega...',
      redirecting: 'Redirecionando...',
    }
  }

  return {
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
    confirmBadge: 'Delivery confirmation',
    confirmTitle: 'Confirm where you want to receive predictions',
    confirmSubtitle:
      'Your subscription is ready. Before entering the dashboard, confirm whether Trimry should reach you by email, WhatsApp, or both.',
    confirmBackButton: 'Go to dashboard',
    success: 'Delivery settings updated.',
    help: 'Changes apply to future deliveries only.',
    editMode: 'Edit mode',
    quickCards: [
      'Email first',
      'WhatsApp agreed',
      'Both whenever you want',
    ],
    whatsappNumberLabel: 'WhatsApp number',
    whatsappOptional: 'WhatsApp remains optional unless you turn it on.',
    loadError: 'Unable to load delivery settings.',
    consentError:
      'Please confirm WhatsApp consent before enabling WhatsApp delivery.',
    saveError: 'Unable to save delivery settings.',
    loading: 'Loading delivery settings...',
    redirecting: 'Redirecting...',
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
  const isConfirmMode = searchParams.get('confirm') === '1'

  useEffect(() => {
    let cancelled = false

    const loadState = async () => {
      try {
        let currentAccount = await fetchAccountSnapshot()

        if (!currentAccount) {
          router.replace('/account/login')
          return
        }

        let subscription = currentAccount.subscription

        if (!subscription) {
          router.replace('/activate')
          return
        }

        if (subscription.status === 'pending_checkout') {
          if (isConfirmMode) {
            for (let attempt = 0; attempt < 6; attempt += 1) {
              await waitForStripeWebhook(850)

              const refreshedAccount = await fetchAccountSnapshot()
              const refreshedSubscription = refreshedAccount?.subscription

              if (
                refreshedAccount &&
                refreshedSubscription &&
                refreshedSubscription.status !== 'pending_checkout'
              ) {
                currentAccount = refreshedAccount
                subscription = refreshedSubscription
                break
              }
            }
          }

          if (subscription.status === 'pending_checkout') {
            router.replace(
              isConfirmMode ? '/dashboard?billing=success' : '/checkout/start',
            )
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
          setDeliveryHourLocal(
            subscription.deliveryHourLocal ?? DEFAULT_WEEKLY_DELIVERY_HOUR,
          )
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
        setError(await readApiError(response, copy.saveError))
        return
      }

      trackEvent('delivery_settings_saved', {
        entry_point: isConfirmMode
          ? 'post_checkout_confirmation'
          : isEditMode
            ? 'dashboard_settings'
            : 'settings_page',
        user_id: account?.user.id,
        delivery_preference: deliveryPreference,
        delivery_hour_local: deliveryHourLocal,
        requires_whatsapp: requiresWhatsappDelivery(deliveryPreference),
      })
      trackMetaCustomEvent('SubscriptionSetup', {
        entry_point: isConfirmMode
          ? 'post_checkout_confirmation'
          : isEditMode
            ? 'dashboard_settings'
            : 'settings_page',
        delivery_preference: deliveryPreference,
        delivery_hour_local: deliveryHourLocal,
        requires_whatsapp: requiresWhatsappDelivery(deliveryPreference),
      })

      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(SIGNUP_WHATSAPP_STORAGE_KEY)
      }

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

  if (loading) {
    return (
      <section className="cosmic-shell mx-auto max-w-5xl p-4 sm:p-6">
        <div className="luck-glow cosmic-panel rounded-[2.3rem] p-6 text-slate-100 sm:p-8">
          {copy.loading}
        </div>
      </section>
    )
  }

  if (!account) {
    return (
      <section className="cosmic-shell mx-auto max-w-5xl p-4 sm:p-6">
        <div className="luck-glow cosmic-panel rounded-[2.3rem] p-6 text-slate-100 sm:p-8">
          <p>{copy.redirecting}</p>
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
                {isConfirmMode ? copy.confirmBadge : copy.badge}
              </p>
              {isEditMode && !isConfirmMode ? (
                <span className="rounded-full border border-cyan-200/22 bg-cyan-100/8 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100/86">
                  {copy.editMode}
                </span>
              ) : null}
            </div>

            <h1 className="max-w-2xl text-3xl leading-[1.04] text-slate-50 sm:text-4xl lg:text-5xl">
              {isConfirmMode ? copy.confirmTitle : copy.title}
            </h1>
            <p className="max-w-xl text-base text-slate-100/86 sm:text-lg">
              {isConfirmMode ? copy.confirmSubtitle : copy.subtitle}
            </p>

            <div className="rounded-[1.7rem] border border-cyan-200/18 bg-slate-950/42 p-4 sm:p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100/78">
                {copy.emailLabel}
              </p>
              <p className="mt-2 text-base text-slate-50">{account.user.email}</p>
              <p className="mt-3 text-sm text-slate-100/72">{copy.help}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {copy.quickCards.map((item) => (
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
                    {copy.whatsappNumberLabel}
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
                  {copy.whatsappOptional}
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
                  href={isConfirmMode ? '/dashboard?billing=success' : '/dashboard'}
                  className="cosmic-outline-button inline-flex rounded-full px-6 py-3 text-sm font-black uppercase tracking-[0.16em]"
                >
                  {isConfirmMode ? copy.confirmBackButton : copy.backButton}
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
