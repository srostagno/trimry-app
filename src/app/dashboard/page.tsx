'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { FormEvent, useEffect, useMemo, useState } from 'react'

import { AdminPredictionCalendar } from '@/components/dashboard/admin-prediction-calendar'
import { DeliveryHourSelect } from '@/components/delivery-hour-select'
import { DeliveryPreferenceSelector } from '@/components/delivery-preference-selector'
import { TimeZoneSelect } from '@/components/time-zone-select'
import { useLanguage } from '@/components/language-provider'
import { apiFetch, readApiError } from '@/lib/api-client'
import { trackEvent, trackEventOnce } from '@/lib/analytics'
import { createBillingSession } from '@/lib/billing'
import { interpolate } from '@/lib/i18n'
import {
  DEFAULT_WEEKLY_DELIVERY_HOUR,
  formatDeliveryHourLabel,
  formatNextDelivery,
} from '@/lib/schedule'
import {
  type DeliveryPreference,
  requiresWhatsappDelivery,
} from '@/lib/start-flow'

type Subscription = {
  id: string
  status: 'pending_checkout' | 'active' | 'past_due' | 'paused' | 'canceled'
  deliveryPreference: DeliveryPreference
  deliveryHourLocal: number
  whatsappNumber: string
  monthlyPriceUsd: number
  currency: string
  cadence: string
  nextMessageAt: string
  planId: string
  canManageBilling: boolean
  updatedAt: string
}

type MeResponse = {
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    fullName: string
    birthDate: string | null
    locale: string
    timeZone: string
    admin: boolean
  }
  subscription: Subscription | null
}

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { language, messages } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState<MeResponse | null>(null)
  const [deliveryPreference, setDeliveryPreference] =
    useState<DeliveryPreference>('both')
  const [deliveryHourLocal, setDeliveryHourLocal] = useState(
    DEFAULT_WEEKLY_DELIVERY_HOUR,
  )
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [busyAction, setBusyAction] = useState<string | null>(null)
  const [profileFirstName, setProfileFirstName] = useState('')
  const [profileLastName, setProfileLastName] = useState('')
  const [profileBirthDate, setProfileBirthDate] = useState('')
  const [profileTimeZone, setProfileTimeZone] = useState('UTC')
  const [profileBusy, setProfileBusy] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  const [subscriptionSuccess, setSubscriptionSuccess] = useState('')
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [billingBusy, setBillingBusy] = useState(false)
  const [logoutBusy, setLogoutBusy] = useState(false)
  const [activeTab, setActiveTab] = useState<'account' | 'prediction-calendar'>(
    'account',
  )
  const billingSuccess = searchParams.get('billing') === 'success'
  const deliveryLabel = (preference: DeliveryPreference) => {
    if (preference === 'both') {
      return messages.deliveryChannels.bothTitle
    }

    return preference === 'email'
      ? messages.deliveryChannels.emailTitle
      : messages.deliveryChannels.whatsappTitle
  }

  const statusLabel = useMemo(
    () => ({
      pending_checkout: messages.dashboard.paymentPending,
      active: messages.statuses.active,
      past_due: messages.dashboard.paymentIssue,
      paused: messages.statuses.paused,
      canceled: messages.statuses.canceled,
    }),
    [messages.dashboard.paymentIssue, messages.dashboard.paymentPending, messages.statuses],
  )

  const loadData = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await apiFetch('/me', { cache: 'no-store' })
      const payload = (await response.json()) as MeResponse | { message?: string }

      if (!response.ok) {
        setData(null)
        setError((payload as { message?: string }).message ?? messages.dashboard.noData)
        return
      }

      const typedPayload = payload as MeResponse
      setData(typedPayload)
      setDeliveryPreference(typedPayload.subscription?.deliveryPreference ?? 'both')
      setDeliveryHourLocal(
        typedPayload.subscription?.deliveryHourLocal ?? DEFAULT_WEEKLY_DELIVERY_HOUR,
      )
      setWhatsappNumber(typedPayload.subscription?.whatsappNumber ?? '')
      setProfileFirstName(typedPayload.user.firstName)
      setProfileLastName(typedPayload.user.lastName)
      setProfileBirthDate(typedPayload.user.birthDate ?? '')
      setProfileTimeZone(typedPayload.user.timeZone || 'UTC')
    } catch {
      setError(messages.notifications.error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!billingSuccess || !data?.subscription) {
      return
    }

    trackEventOnce(
      `subscription-started-${data.subscription.id}-${data.subscription.updatedAt}`,
      'subscription_started',
      {
        plan_id: data.subscription.planId,
        currency: data.subscription.currency,
        value: data.subscription.monthlyPriceUsd,
        delivery_preference: data.subscription.deliveryPreference,
      },
    )
  }, [billingSuccess, data?.subscription])

  useEffect(() => {
    if (!data?.user.admin) {
      setActiveTab('account')
      return
    }

    setActiveTab(
      searchParams.get('tab') === 'prediction-calendar'
        ? 'prediction-calendar'
        : 'account',
    )
  }, [data?.user.admin, searchParams])

  const setDashboardTab = (nextTab: 'account' | 'prediction-calendar') => {
    setActiveTab(nextTab)

    const params = new URLSearchParams(searchParams.toString())

    if (nextTab === 'prediction-calendar') {
      params.set('tab', 'prediction-calendar')
    } else {
      params.delete('tab')
    }

    const query = params.toString()
    router.replace(query ? `/dashboard?${query}` : '/dashboard', { scroll: false })
  }

  const runAction = async (
    action: 'subscribe' | 'update-delivery',
    event?: FormEvent,
  ) => {
    if (event) {
      event.preventDefault()
    }

    setBusyAction(action)
    setError('')
    setSubscriptionSuccess('')

    try {
      const response = await apiFetch('/subscription', {
        method: 'POST',
        body: JSON.stringify({
          action,
          deliveryPreference,
          deliveryHourLocal,
          whatsappNumber,
        }),
      })

      if (!response.ok) {
        setError(await readApiError(response, messages.notifications.error))
        return
      }

      trackEvent('delivery_preferences_saved', {
        entry_point: action === 'subscribe' ? 'dashboard_subscribe' : 'dashboard_manage',
        delivery_preference: deliveryPreference,
        delivery_hour_local: deliveryHourLocal,
        requires_whatsapp: requiresWhatsappDelivery(deliveryPreference),
        destination: action === 'subscribe' ? 'activate' : 'dashboard',
      })

      if (action === 'subscribe') {
        router.push('/activate')
        router.refresh()
        return
      }

      await loadData()
    } catch {
      setError(messages.notifications.error)
    } finally {
      setBusyAction(null)
    }
  }

  const saveDeliverySettingsForReactivation = async () => {
    const response = await apiFetch('/subscription', {
      method: 'POST',
      body: JSON.stringify({
        action: 'update-delivery',
        deliveryPreference,
        deliveryHourLocal,
        whatsappNumber,
      }),
    })

    if (!response.ok) {
      setError(await readApiError(response, messages.notifications.error))
      return false
    }

    return true
  }

  const openBillingPortal = async () => {
    setBillingBusy(true)
    setError('')

    try {
      const portalUrl = await createBillingSession(
        '/billing/portal-session',
        messages.dashboard.openBillingError,
      )

      trackEvent('billing_portal_opened', {
        subscription_status: data?.subscription?.status ?? 'unknown',
      })

      window.location.assign(portalUrl)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : messages.dashboard.openBillingError,
      )
    } finally {
      setBillingBusy(false)
    }
  }

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setProfileBusy(true)
    setProfileError('')
    setProfileSuccess('')

    try {
      const response = await apiFetch('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({
          firstName: profileFirstName,
          lastName: profileLastName,
          birthDate: profileBirthDate || null,
          timeZone: profileTimeZone,
        }),
      })

      if (!response.ok) {
        setProfileError(await readApiError(response, messages.notifications.error))
        return
      }

      trackEvent('profile_updated', {
        updated_fields: 'profile',
      })
      setProfileSuccess(messages.notifications.success)
      await loadData()
    } catch {
      setProfileError(messages.notifications.error)
    } finally {
      setProfileBusy(false)
    }
  }

  const cancelSubscription = async () => {
    const confirmed = window.confirm(messages.dashboard.cancelConfirm)

    if (!confirmed) {
      return
    }

    setBusyAction('cancel-subscription')
    setError('')
    setSubscriptionSuccess('')

    try {
      const response = await apiFetch('/billing/cancel-subscription', {
        method: 'POST',
      })

      if (!response.ok) {
        setError(await readApiError(response, messages.dashboard.cancelError))
        return
      }

      trackEvent('subscription_canceled', {
        plan_id: data?.subscription?.planId ?? 'unknown',
      })
      setSubscriptionSuccess(messages.dashboard.cancelSuccess)
      await loadData()
    } catch {
      setError(messages.dashboard.cancelError)
    } finally {
      setBusyAction(null)
    }
  }

  const reactivateSubscription = async () => {
    setBusyAction('reactivate-subscription')
    setError('')
    setSubscriptionSuccess('')

    try {
      const settingsSaved = await saveDeliverySettingsForReactivation()

      if (!settingsSaved) {
        return
      }

      const response = await apiFetch('/billing/reactivate-subscription', {
        method: 'POST',
      })

      if (!response.ok) {
        setError(await readApiError(response, messages.dashboard.reactivateError))
        return
      }

      trackEvent('subscription_reactivated', {
        plan_id: data?.subscription?.planId ?? 'unknown',
      })
      router.push('/activate')
      router.refresh()
    } catch {
      setError(messages.dashboard.reactivateError)
    } finally {
      setBusyAction(null)
    }
  }

  const deleteAccount = async () => {
    const confirmed = window.confirm(messages.dashboard.deleteConfirm)

    if (!confirmed) {
      return
    }

    setDeleteBusy(true)
    setDeleteError('')

    try {
      const response = await apiFetch(
        '/users/me',
        {
          method: 'DELETE',
        },
        { retryUnauthorized: false },
      )

      if (!response.ok) {
        setDeleteError(await readApiError(response, messages.dashboard.deleteError))
        return
      }

      trackEvent('account_deleted', {
        source: 'dashboard',
      })
      router.push('/')
      router.refresh()
    } catch {
      setDeleteError(messages.dashboard.deleteError)
    } finally {
      setDeleteBusy(false)
    }
  }

  const logout = async () => {
    setLogoutBusy(true)

    try {
      await apiFetch('/auth/logout', { method: 'POST' }, { retryUnauthorized: false })
      router.push('/')
      router.refresh()
    } finally {
      setLogoutBusy(false)
    }
  }

  if (loading) {
    return (
      <section className="rounded-3xl border border-amber-100/20 bg-black/30 p-8 text-amber-100">
        {messages.dashboard.loading}
      </section>
    )
  }

  if (!data) {
    return (
      <section className="rounded-3xl border border-amber-100/20 bg-black/30 p-8 text-amber-100">
        <p>{error || messages.dashboard.noData}</p>
        <Link
          href="/account/login"
          className="mt-4 inline-flex rounded-full bg-amber-200 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-amber-950"
        >
          {messages.nav.login}
        </Link>
      </section>
    )
  }

  const accountContent = (
    <>
      <section className="rounded-[2rem] border border-amber-100/20 bg-black/30 p-8">
        <h2 className="text-2xl text-amber-50">{messages.dashboard.profileTitle}</h2>
        <p className="mt-2 text-amber-100/85">{messages.dashboard.profileSubtitle}</p>

        <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={saveProfile}>
          <label className="text-sm font-semibold text-amber-100/90">
            {messages.auth.firstNameLabel}
            <input
              type="text"
              value={profileFirstName}
              onChange={(event) => setProfileFirstName(event.target.value)}
              required
              className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
            />
          </label>

          <label className="text-sm font-semibold text-amber-100/90">
            {messages.auth.lastNameLabel}
            <input
              type="text"
              value={profileLastName}
              onChange={(event) => setProfileLastName(event.target.value)}
              required
              className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
            />
          </label>

          <label className="text-sm font-semibold text-amber-100/90 sm:col-span-2">
            {messages.auth.birthDateLabel}
            <input
              type="date"
              value={profileBirthDate}
              onChange={(event) => setProfileBirthDate(event.target.value)}
              className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
            />
          </label>

          <label className="text-sm font-semibold text-amber-100/90 sm:col-span-2">
            {messages.auth.timeZoneLabel}
            <TimeZoneSelect
              value={profileTimeZone}
              onChange={setProfileTimeZone}
              className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
            />
            <span className="mt-2 block text-xs text-amber-100/70">
              {messages.dashboard.profileTimeZoneHint}
            </span>
          </label>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={profileBusy}
              className="rounded-full border border-amber-100/30 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-amber-50 disabled:opacity-70"
            >
              {profileBusy ? messages.common.saving : messages.dashboard.profileSave}
            </button>
          </div>
        </form>

        {profileError ? (
          <p className="mt-4 rounded-xl border border-rose-300/60 bg-rose-900/40 px-4 py-3 text-sm text-rose-100">
            {profileError}
          </p>
        ) : null}

        {profileSuccess ? (
          <p className="mt-4 rounded-xl border border-emerald-300/60 bg-emerald-900/40 px-4 py-3 text-sm text-emerald-100">
            {profileSuccess}
          </p>
        ) : null}
      </section>

      <section className="rounded-[2rem] border border-rose-300/25 bg-rose-950/12 p-8">
        <h2 className="text-2xl text-rose-100">{messages.dashboard.dangerTitle}</h2>
        <p className="mt-2 max-w-2xl text-rose-100/82">{messages.dashboard.dangerSubtitle}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={deleteAccount}
            disabled={deleteBusy}
            className="rounded-full border border-rose-300/45 bg-rose-900/35 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-rose-100 disabled:opacity-60"
          >
            {deleteBusy ? messages.dashboard.deleteLoading : messages.dashboard.deleteButton}
          </button>
        </div>

        {deleteError ? (
          <p className="mt-4 rounded-xl border border-rose-300/60 bg-rose-900/40 px-4 py-3 text-sm text-rose-100">
            {deleteError}
          </p>
        ) : null}
      </section>

      <section className="rounded-[2rem] border border-amber-100/20 bg-black/30 p-8">
        {!data.subscription ? (
          <>
            <h2 className="text-2xl text-amber-50">{messages.dashboard.noSubscription}</h2>
            <p className="mt-2 text-amber-100/85">{messages.dashboard.noSubscriptionSubtitle}</p>
            <form className="mt-5 space-y-4" onSubmit={(event) => runAction('subscribe', event)}>
              <DeliveryPreferenceSelector
                value={deliveryPreference}
                onChange={setDeliveryPreference}
              />
              <div>
                <label
                  htmlFor="subscription-delivery-hour"
                  className="mb-3 block text-sm font-semibold text-amber-100/90"
                >
                  {messages.dashboard.mondayProjectionTime}
                </label>
                <DeliveryHourSelect
                  id="subscription-delivery-hour"
                  value={deliveryHourLocal}
                  onChange={setDeliveryHourLocal}
                  locale={language}
                  className="cosmic-input block w-full rounded-xl px-4 py-3"
                />
                <p className="mt-2 text-xs text-amber-100/70">
                  {interpolate(messages.dashboard.sentOnMondaysAt, {
                    time: formatDeliveryHourLabel(deliveryHourLocal, language),
                    zone: data.user.timeZone,
                  })}
                </p>
              </div>
              <div className="rounded-2xl border border-cyan-200/18 bg-slate-950/32 p-4 text-sm text-slate-100/82">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100/76">
                  {messages.dashboard.emailDeliveryLabel}
                </p>
                <p className="mt-2 text-base text-slate-50">{data.user.email}</p>
              </div>
              {requiresWhatsappDelivery(deliveryPreference) ? (
                <input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(event) => setWhatsappNumber(event.target.value)}
                  placeholder="+14155550123"
                  required
                  className="cosmic-input w-full rounded-xl px-4 py-3"
                />
              ) : (
                <div className="rounded-2xl border border-cyan-200/18 bg-slate-950/32 p-4 text-sm text-slate-100/76">
                  {messages.dashboard.whatsappOffSetup}
                </div>
              )}
              <button
                type="submit"
                disabled={busyAction !== null}
                className="rounded-full bg-amber-200 px-6 py-3 text-xs font-black uppercase tracking-[0.14em] text-amber-950 disabled:opacity-70"
              >
                {messages.dashboard.subscribeButton}
              </button>
            </form>
          </>
        ) : data.subscription.status === 'pending_checkout' ? (
          <>
            <h2 className="text-2xl text-amber-50">{messages.dashboard.pendingTitle}</h2>
            <p className="mt-2 text-amber-100/85">{messages.dashboard.pendingSubtitle}</p>
            <div className="mt-5 space-y-3 text-sm text-cyan-100/86">
              <div className="rounded-2xl border border-cyan-200/18 bg-slate-950/35 p-4">
                {messages.dashboard.pendingDeliveryPreferenceLabel}:{' '}
                {deliveryLabel(data.subscription.deliveryPreference)}
              </div>
              <div className="rounded-2xl border border-cyan-200/18 bg-slate-950/35 p-4">
                {messages.dashboard.pendingEmailDeliveryLabel}: {data.user.email}
              </div>
              <div className="rounded-2xl border border-cyan-200/18 bg-slate-950/35 p-4">
                {messages.dashboard.pendingProjectionTimingLabel}:{' '}
                {formatDeliveryHourLabel(data.subscription.deliveryHourLocal, language)} (
                {data.user.timeZone})
              </div>
              {requiresWhatsappDelivery(data.subscription.deliveryPreference) ? (
                <div className="rounded-2xl border border-cyan-200/18 bg-slate-950/35 p-4">
                  {messages.dashboard.pendingWhatsappLabel}: {data.subscription.whatsappNumber}
                </div>
              ) : null}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/activate"
                className="cosmic-button-primary inline-flex rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.14em]"
              >
                {messages.dashboard.continueActivation}
              </Link>
              <Link
                href="/account/delivery?edit=1"
                className="rounded-full border border-amber-100/30 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-amber-50"
              >
                {messages.dashboard.changeDeliverySettings}
              </Link>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl text-amber-50">
              {data.subscription.status === 'canceled'
                ? messages.dashboard.canceledPlanTitle
                : messages.dashboard.activePlanTitle}
            </h2>
            <p className="mt-2 text-amber-100/85">
              {messages.dashboard.status}:{' '}
              <span className="font-bold text-amber-50">
                {statusLabel[data.subscription.status]}
              </span>
            </p>
            {data.subscription.status === 'canceled' ? (
              <p className="mt-2 text-amber-100/85">{messages.dashboard.canceledNote}</p>
            ) : (
              <p className="mt-2 text-amber-100/85">{messages.dashboard.activeNote}</p>
            )}
            <p className="mt-1 text-amber-100/85">
              {messages.dashboard.deliveryPreferenceLabel}:{' '}
              <span className="font-bold text-amber-50">
                {deliveryLabel(data.subscription.deliveryPreference)}
              </span>
            </p>
            <p className="mt-1 text-amber-100/85">
              {data.subscription.status === 'canceled'
                ? messages.dashboard.nextMessageIfReactivated
                : messages.dashboard.nextMessage}
              :{' '}
              {formatNextDelivery(data.subscription.nextMessageAt, language, data.user.timeZone)}
            </p>
            <p className="mt-1 text-amber-100/85">
              {messages.dashboard.weeklyProjectionTimeLabel}:{' '}
              <span className="font-bold text-amber-50">
                {formatDeliveryHourLabel(data.subscription.deliveryHourLocal, language)} (
                {data.user.timeZone})
              </span>
            </p>

            <form className="mt-5 space-y-4" onSubmit={(event) => runAction('update-delivery', event)}>
              <DeliveryPreferenceSelector
                value={deliveryPreference}
                onChange={setDeliveryPreference}
              />
              <div>
                <label
                  htmlFor="active-delivery-hour"
                  className="mb-3 block text-sm font-semibold text-amber-100/90"
                >
                  {messages.dashboard.mondayProjectionTime}
                </label>
                <DeliveryHourSelect
                  id="active-delivery-hour"
                  value={deliveryHourLocal}
                  onChange={setDeliveryHourLocal}
                  locale={language}
                  className="cosmic-input block w-full rounded-xl px-4 py-3"
                />
                <p className="mt-2 text-xs text-amber-100/70">
                  {interpolate(messages.dashboard.futureMessagesHint, {
                    zone: data.user.timeZone,
                  })}
                </p>
              </div>
              <div className="rounded-2xl border border-cyan-200/18 bg-slate-950/32 p-4 text-sm text-slate-100/82">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100/76">
                  {messages.dashboard.emailDeliveryLabel}
                </p>
                <p className="mt-2 text-base text-slate-50">{data.user.email}</p>
              </div>
              {requiresWhatsappDelivery(deliveryPreference) ? (
                <input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(event) => setWhatsappNumber(event.target.value)}
                  placeholder="+14155550123"
                  required
                  className="cosmic-input w-full rounded-xl px-4 py-3"
                />
              ) : (
                <div className="rounded-2xl border border-cyan-200/18 bg-slate-950/32 p-4 text-sm text-slate-100/76">
                  {messages.dashboard.whatsappOffActive}
                </div>
              )}
              <button
                type="submit"
                disabled={busyAction !== null}
                className="rounded-full border border-amber-100/30 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-amber-50 disabled:opacity-70"
              >
                {messages.dashboard.saveDeliverySettings}
              </button>
            </form>

            <div className="mt-5 flex flex-wrap gap-3">
              {data.subscription.status === 'canceled' ? (
                <button
                  type="button"
                  onClick={reactivateSubscription}
                  disabled={busyAction !== null}
                  className="cosmic-button-primary inline-flex rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.14em] disabled:opacity-60"
                >
                  {busyAction === 'reactivate-subscription'
                    ? messages.dashboard.reactivateLoading
                    : messages.dashboard.reactivateButton}
                </button>
              ) : data.subscription.status === 'active' ||
                data.subscription.status === 'past_due' ? (
                <button
                  type="button"
                  onClick={cancelSubscription}
                  disabled={busyAction !== null}
                  className="rounded-full border border-rose-300/45 bg-rose-900/25 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-rose-100 disabled:opacity-60"
                >
                  {busyAction === 'cancel-subscription'
                    ? messages.dashboard.cancelLoading
                    : messages.dashboard.cancelButton}
                </button>
              ) : null}
              {data.subscription.canManageBilling ? (
                <button
                  type="button"
                  onClick={openBillingPortal}
                  disabled={billingBusy}
                  className="rounded-full border border-cyan-200/30 bg-cyan-400/10 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-cyan-50 disabled:opacity-60"
                >
                  {billingBusy
                    ? messages.dashboard.manageBillingLoading
                    : messages.dashboard.manageBillingButton}
                </button>
              ) : null}
            </div>

            <p className="mt-4 text-sm text-amber-100/72">
              {data.subscription.status === 'canceled'
                ? messages.dashboard.billingFootnoteCanceled
                : messages.dashboard.billingFootnoteActive}
            </p>
          </>
        )}

        {subscriptionSuccess ? (
          <p className="mt-4 rounded-xl border border-emerald-300/60 bg-emerald-900/40 px-4 py-3 text-sm text-emerald-100">
            {subscriptionSuccess}
          </p>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-xl border border-rose-300/60 bg-rose-900/40 px-4 py-3 text-sm text-rose-100">
            {error}
          </p>
        ) : null}
      </section>
    </>
  )

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-amber-100/20 bg-black/30 p-8">
        <h1 className="text-3xl text-amber-50">{messages.dashboard.title}</h1>
        <p className="mt-2 text-amber-100/85">{messages.dashboard.intro}</p>
        <p className="mt-3 text-sm text-amber-100/85">
          {data.user.fullName} · {data.user.email}
        </p>

        {billingSuccess ? (
          <p className="mt-5 rounded-2xl border border-emerald-300/45 bg-emerald-900/20 px-4 py-3 text-sm text-emerald-100">
            {messages.dashboard.billingSuccess}
          </p>
        ) : null}
        {data.user.admin ? (
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setDashboardTab('account')}
              className={`rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.14em] transition ${
                activeTab === 'account'
                  ? 'bg-amber-200 text-amber-950'
                  : 'border border-amber-100/30 text-amber-50 hover:border-amber-100/50'
              }`}
            >
              {messages.dashboard.tabs.account}
            </button>
            <button
              type="button"
              onClick={() => setDashboardTab('prediction-calendar')}
              className={`rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.14em] transition ${
                activeTab === 'prediction-calendar'
                  ? 'bg-cyan-100 text-slate-950'
                  : 'border border-cyan-200/28 text-cyan-50 hover:border-cyan-100/48'
              }`}
            >
              {messages.dashboard.tabs.predictionCalendar}
            </button>
          </div>
        ) : null}
      </section>

      {data.user.admin && activeTab === 'prediction-calendar' ? (
        <AdminPredictionCalendar />
      ) : (
        accountContent
      )}

      <section className="rounded-[2rem] border border-amber-100/16 bg-black/25 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-amber-100/72">{data.user.email}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-100/54">
              {messages.nav.dashboard}
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            disabled={logoutBusy}
            className="self-start rounded-full border border-rose-200/25 bg-rose-400/10 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-rose-100 transition hover:bg-rose-400/18 disabled:opacity-60 sm:self-auto"
          >
            {logoutBusy ? messages.common.loading : messages.nav.logout}
          </button>
        </div>
      </section>
    </div>
  )
}
