'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'

import { AdminSendCampaigns } from '@/components/dashboard/admin-send-campaigns'
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
  fetchMemberPredictionMonth,
  type MemberPredictionDay,
  type MemberPredictionMonth,
  type MemberPredictionTone,
} from '@/lib/member-predictions'
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

const localeByLanguage = {
  en: 'en-US',
  es: 'es-CL',
} as const

const projectionActivityOrder = ['haircut', 'shave', 'nails', 'release'] as const

function createUtcDate(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month, day, 12))
}

function normalizeUtcDate(date: Date) {
  return createUtcDate(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  )
}

function startOfMonth(date: Date) {
  return createUtcDate(date.getUTCFullYear(), date.getUTCMonth(), 1)
}

function addMonths(date: Date, offset: number) {
  return createUtcDate(date.getUTCFullYear(), date.getUTCMonth() + offset, 1)
}

function toMonthKey(date: Date) {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

function toDayKey(isoDate: string) {
  return isoDate.slice(0, 10)
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
  const [whatsappConsentAccepted, setWhatsappConsentAccepted] = useState(false)
  const [busyAction, setBusyAction] = useState<string | null>(null)
  const [profileFirstName, setProfileFirstName] = useState('')
  const [profileLastName, setProfileLastName] = useState('')
  const [profileBirthDate, setProfileBirthDate] = useState('')
  const [profileTimeZone, setProfileTimeZone] = useState('UTC')
  const [profileBusy, setProfileBusy] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [passwordBusy, setPasswordBusy] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [subscriptionSuccess, setSubscriptionSuccess] = useState('')
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [billingBusy, setBillingBusy] = useState(false)
  const [logoutBusy, setLogoutBusy] = useState(false)
  const [activeTab, setActiveTab] = useState<
    'account' | 'prediction-calendar' | 'sends'
  >('account')
  const [projectionMonth, setProjectionMonth] = useState(() =>
    startOfMonth(new Date()),
  )
  const [projectionCalendar, setProjectionCalendar] =
    useState<MemberPredictionMonth | null>(null)
  const [projectionLoading, setProjectionLoading] = useState(false)
  const [projectionError, setProjectionError] = useState('')
  const [selectedProjectionDateKey, setSelectedProjectionDateKey] = useState(() =>
    toDayKey(normalizeUtcDate(new Date()).toISOString()),
  )
  const selectedProjectionDateKeyRef = useRef(selectedProjectionDateKey)
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
  const projectionLocale = localeByLanguage[language] ?? 'en-US'

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
      setWhatsappConsentAccepted(Boolean(typedPayload.subscription?.whatsappNumber))
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
        : searchParams.get('tab') === 'sends'
          ? 'sends'
          : 'account',
    )
  }, [data?.user.admin, searchParams])

  const setDashboardTab = (
    nextTab: 'account' | 'prediction-calendar' | 'sends',
  ) => {
    setActiveTab(nextTab)

    const params = new URLSearchParams(searchParams.toString())

    if (nextTab === 'prediction-calendar') {
      params.set('tab', 'prediction-calendar')
    } else if (nextTab === 'sends') {
      params.set('tab', 'sends')
    } else {
      params.delete('tab')
    }

    const query = params.toString()
    router.replace(query ? `/dashboard?${query}` : '/dashboard', { scroll: false })
  }

  const goToProjectionMonth = (offset: number) => {
    setProjectionMonth((currentMonth) => addMonths(currentMonth, offset))
    setProjectionError('')
  }

  const goToCurrentProjectionMonth = () => {
    const today = normalizeUtcDate(new Date())
    setProjectionMonth(startOfMonth(today))
    setSelectedProjectionDateKey(toDayKey(today.toISOString()))
    setProjectionError('')
  }

  const openProjectionUnlockFlow = async () => {
    if (!data?.subscription) {
      router.push('/account/delivery')
      return
    }

    if (data.subscription.status === 'pending_checkout') {
      router.push('/activate')
      return
    }

    if (data.subscription.status === 'canceled') {
      await reactivateSubscription()
      return
    }

    if (data.subscription.status === 'paused' && data.subscription.canManageBilling) {
      await openBillingPortal()
      return
    }

    router.push('/account/delivery?edit=1')
  }

  useEffect(() => {
    selectedProjectionDateKeyRef.current = selectedProjectionDateKey
  }, [selectedProjectionDateKey])

  useEffect(() => {
    if (!data) {
      setProjectionCalendar(null)
      setProjectionError('')
      return
    }

    let canceled = false

    const loadProjectionCalendar = async () => {
      setProjectionLoading(true)
      setProjectionError('')

      try {
        const nextCalendar = await fetchMemberPredictionMonth(
          toMonthKey(projectionMonth),
          projectionLocale,
        )

        if (canceled) {
          return
        }

        setProjectionCalendar(nextCalendar)

        const nextSelectedDay =
          nextCalendar.currentMonthDays.find(
            (day) => toDayKey(day.date) === selectedProjectionDateKeyRef.current,
          ) ??
          nextCalendar.currentMonthDays.find((day) => day.isToday) ??
          nextCalendar.currentMonthDays[0] ??
          null

        if (nextSelectedDay) {
          setSelectedProjectionDateKey(toDayKey(nextSelectedDay.date))
        }
      } catch (calendarError) {
        if (canceled) {
          return
        }

        setProjectionError(
          calendarError instanceof Error
            ? calendarError.message
            : messages.dashboard.projectionCalendar.loadError,
        )
      } finally {
        if (!canceled) {
          setProjectionLoading(false)
        }
      }
    }

    void loadProjectionCalendar()

    return () => {
      canceled = true
    }
  }, [
    data,
    messages.dashboard.projectionCalendar.loadError,
    projectionLocale,
    projectionMonth,
  ])

  const selectedProjectionDay = useMemo(() => {
    if (!projectionCalendar) {
      return null
    }

    return (
      projectionCalendar.currentMonthDays.find(
        (day) => toDayKey(day.date) === selectedProjectionDateKey,
      ) ??
      projectionCalendar.currentMonthDays[0] ??
      null
    )
  }, [projectionCalendar, selectedProjectionDateKey])

  const projectionStatus = data?.subscription?.status ?? null
  const projectionUnlockBusy =
    busyAction === 'reactivate-subscription' || billingBusy
  const projectionHasFullAccess =
    projectionCalendar?.hasFullMonthAccess ??
    (projectionStatus === 'active' || projectionStatus === 'past_due')
  const projectionUnlockButtonLabel =
    projectionStatus === 'pending_checkout'
      ? messages.dashboard.continueActivation
      : projectionStatus === 'canceled'
        ? messages.dashboard.reactivateButton
        : projectionStatus === 'paused'
          ? messages.dashboard.manageBillingButton
          : messages.dashboard.subscribeButton
  const projectionToneClass = (tone: MemberPredictionTone) =>
    tone === 'good'
      ? 'oracle-tone-badge oracle-tone-badge-good'
      : tone === 'bad'
        ? 'oracle-tone-badge oracle-tone-badge-bad'
        : 'oracle-tone-badge oracle-tone-badge-rare'
  const projectionToneLabel = (tone: MemberPredictionTone) =>
    tone === 'good'
      ? messages.dashboard.predictionCalendar.goodTone
      : tone === 'bad'
        ? messages.dashboard.predictionCalendar.badTone
        : messages.dashboard.predictionCalendar.rareTone
  const projectionActivityLabel = (
    activity: (typeof projectionActivityOrder)[number],
  ) =>
    activity === 'haircut'
      ? messages.dashboard.predictionCalendar.haircut
      : activity === 'shave'
        ? messages.dashboard.predictionCalendar.shave
        : activity === 'nails'
          ? messages.dashboard.predictionCalendar.nails
          : messages.dashboard.predictionCalendar.release
  const projectionSelectedDayLabelFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(projectionLocale, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      }),
    [projectionLocale],
  )

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

    if (requiresWhatsappDelivery(deliveryPreference) && !whatsappConsentAccepted) {
      setError(messages.dashboard.whatsappConsentError)
      setBusyAction(null)
      return
    }

    try {
      const response = await apiFetch('/subscription', {
        method: 'POST',
        body: JSON.stringify({
          action,
          deliveryPreference,
          deliveryHourLocal,
          whatsappNumber,
          whatsappConsentAccepted: requiresWhatsappDelivery(deliveryPreference)
            ? whatsappConsentAccepted
            : undefined,
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

  const savePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPasswordBusy(true)
    setPasswordError('')
    setPasswordSuccess('')

    if (newPassword !== confirmNewPassword) {
      setPasswordError(messages.dashboard.passwordMismatchError)
      setPasswordBusy(false)
      return
    }

    if (currentPassword === newPassword) {
      setPasswordError(messages.dashboard.passwordDifferentError)
      setPasswordBusy(false)
      return
    }

    try {
      const response = await apiFetch('/users/me/password', {
        method: 'PATCH',
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      if (!response.ok) {
        setPasswordError(
          await readApiError(response, messages.dashboard.passwordSaveError),
        )
        return
      }

      trackEvent('password_updated', {
        source: 'dashboard',
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
      setPasswordSuccess(messages.dashboard.passwordSuccess)
    } catch {
      setPasswordError(messages.dashboard.passwordSaveError)
    } finally {
      setPasswordBusy(false)
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
      // Clear API auth cookies (cross-subdomain) and best-effort clear legacy local session.
      await apiFetch('/auth/logout', { method: 'POST' }, { retryUnauthorized: false })
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch {
      // Even when remote logout fails, still clear local session and continue navigation.
      try {
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      } catch {
        // Ignore secondary cleanup failures and continue.
      }
    } finally {
      router.replace('/')
      router.refresh()
      window.location.assign('/')
      setLogoutBusy(false)
    }
  }

  if (loading) {
    return (
      <section className="cosmic-shell cosmic-shell-copy rounded-3xl p-8">
        {messages.dashboard.loading}
      </section>
    )
  }

  if (!data) {
    return (
      <section className="cosmic-shell cosmic-shell-copy rounded-3xl p-8">
        <p>{error || messages.dashboard.noData}</p>
        <Link
          href="/account/login"
          className="cosmic-button-primary mt-4 inline-flex rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.14em]"
        >
          {messages.nav.login}
        </Link>
      </section>
    )
  }

  const accountContent = (
    <>
      <section className="cosmic-shell rounded-[2rem] p-8">
        <h2 className="cosmic-shell-title text-2xl">{messages.dashboard.profileTitle}</h2>
        <p className="cosmic-shell-copy mt-2">{messages.dashboard.profileSubtitle}</p>

        <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={saveProfile}>
          <label className="cosmic-field-label text-sm font-semibold">
            {messages.auth.firstNameLabel}
            <input
              type="text"
              value={profileFirstName}
              onChange={(event) => setProfileFirstName(event.target.value)}
              required
              className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
            />
          </label>

          <label className="cosmic-field-label text-sm font-semibold">
            {messages.auth.lastNameLabel}
            <input
              type="text"
              value={profileLastName}
              onChange={(event) => setProfileLastName(event.target.value)}
              required
              className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
            />
          </label>

          <label className="cosmic-field-label text-sm font-semibold sm:col-span-2">
            {messages.auth.birthDateLabel}
            <input
              type="date"
              value={profileBirthDate}
              onChange={(event) => setProfileBirthDate(event.target.value)}
              className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
            />
          </label>

          <label className="cosmic-field-label text-sm font-semibold sm:col-span-2">
            {messages.auth.timeZoneLabel}
            <TimeZoneSelect
              value={profileTimeZone}
              onChange={setProfileTimeZone}
              className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
            />
            <span className="cosmic-shell-meta mt-2 block text-xs">
              {messages.dashboard.profileTimeZoneHint}
            </span>
          </label>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={profileBusy}
              className="cosmic-outline-button rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.14em] disabled:opacity-70"
            >
              {profileBusy ? messages.common.saving : messages.dashboard.profileSave}
            </button>
          </div>
        </form>

        {profileError ? (
          <p className="cosmic-error-box mt-4 rounded-xl px-4 py-3 text-sm">
            {profileError}
          </p>
        ) : null}

        {profileSuccess ? (
          <p className="cosmic-success-box mt-4 rounded-xl px-4 py-3 text-sm">
            {profileSuccess}
          </p>
        ) : null}
      </section>

      <section className="cosmic-shell rounded-[2rem] p-8">
        <h2 className="cosmic-shell-title text-2xl">{messages.dashboard.passwordTitle}</h2>
        <p className="cosmic-shell-copy mt-2">{messages.dashboard.passwordSubtitle}</p>

        <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={savePassword}>
          <label className="cosmic-field-label text-sm font-semibold sm:col-span-2">
            {messages.dashboard.currentPasswordLabel}
            <input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
              autoComplete="current-password"
              className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
            />
          </label>

          <label className="cosmic-field-label text-sm font-semibold">
            {messages.dashboard.newPasswordLabel}
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
              minLength={10}
              autoComplete="new-password"
              className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
            />
          </label>

          <label className="cosmic-field-label text-sm font-semibold">
            {messages.dashboard.confirmPasswordLabel}
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(event) => setConfirmNewPassword(event.target.value)}
              required
              minLength={10}
              autoComplete="new-password"
              className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
            />
          </label>

          <p className="cosmic-shell-meta text-xs sm:col-span-2">
            {messages.auth.passwordHint}
          </p>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={passwordBusy}
              className="cosmic-outline-button rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.14em] disabled:opacity-70"
            >
              {passwordBusy ? messages.common.saving : messages.dashboard.passwordSave}
            </button>
          </div>
        </form>

        {passwordError ? (
          <p className="cosmic-error-box mt-4 rounded-xl px-4 py-3 text-sm">
            {passwordError}
          </p>
        ) : null}

        {passwordSuccess ? (
          <p className="cosmic-success-box mt-4 rounded-xl px-4 py-3 text-sm">
            {passwordSuccess}
          </p>
        ) : null}
      </section>

      <section className="cosmic-shell rounded-[2rem] p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <h2 className="cosmic-shell-title text-2xl">
              {messages.dashboard.projectionCalendar.title}
            </h2>
            <p className="cosmic-shell-copy mt-2">
              {messages.dashboard.projectionCalendar.subtitle}
            </p>
            <p className="cosmic-shell-meta mt-3 text-xs">
              {projectionHasFullAccess
                ? messages.dashboard.projectionCalendar.fullAccessHint
                : messages.dashboard.projectionCalendar.lockedAccessHint}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => goToProjectionMonth(-1)}
              className="cosmic-outline-button rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.14em]"
            >
              {messages.common.previous}
            </button>
            <button
              type="button"
              onClick={goToCurrentProjectionMonth}
              className="cosmic-tab-active rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.14em]"
            >
              {messages.dashboard.predictionCalendar.today}
            </button>
            <button
              type="button"
              onClick={() => goToProjectionMonth(1)}
              className="cosmic-outline-button rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.14em]"
            >
              {messages.common.next}
            </button>
          </div>
        </div>

        {projectionCalendar && !projectionHasFullAccess ? (
          <div className="cosmic-info-box mt-5 flex flex-col gap-3 rounded-2xl p-4 text-sm text-slate-100/86 sm:flex-row sm:items-center sm:justify-between">
            <span>{messages.dashboard.projectionCalendar.lockedAccessHint}</span>
            <button
              type="button"
              onClick={() => {
                void openProjectionUnlockFlow()
              }}
              disabled={projectionUnlockBusy}
              className="cosmic-button-primary rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.14em] disabled:opacity-60"
            >
              {projectionUnlockButtonLabel}
            </button>
          </div>
        ) : null}

        {projectionError ? (
          <p className="cosmic-error-box mt-5 rounded-xl px-4 py-3 text-sm">
            {projectionError}
          </p>
        ) : null}

        {projectionLoading && !projectionCalendar ? (
          <p className="cosmic-shell-copy mt-5">{messages.common.loading}</p>
        ) : null}

        {projectionCalendar ? (
          <>
            <div className="mt-5">
              <p className="cosmic-shell-title text-xl">{projectionCalendar.monthLabel}</p>
            </div>

            <div className="mt-4 overflow-x-auto">
              <div className="grid min-w-[560px] grid-cols-7 gap-2">
                {projectionCalendar.weekdayLabels.map((weekdayLabel) => (
                  <p
                    key={weekdayLabel}
                    className="cosmic-shell-meta px-2 pb-1 text-center text-xs font-black uppercase tracking-[0.16em]"
                  >
                    {weekdayLabel}
                  </p>
                ))}

                {projectionCalendar.weeks.flat().map((day) => {
                  const dayKey = toDayKey(day.date)
                  const isSelected = dayKey === selectedProjectionDateKey
                  const dayTone = day.summary

                  return (
                    <button
                      key={day.date}
                      type="button"
                      onClick={() => setSelectedProjectionDateKey(dayKey)}
                      className={`relative min-h-[74px] rounded-xl border px-2 py-2 text-left transition ${
                        isSelected ? 'ring-2 ring-cyan-200/65' : ''
                      } ${
                        day.inCurrentMonth
                          ? 'opacity-100'
                          : 'opacity-42'
                      } ${
                        day.isLocked
                          ? 'border-slate-700/80 bg-slate-900/55'
                          : 'border-cyan-200/18 bg-slate-900/36 hover:border-cyan-200/46'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-100">
                          {day.dayOfMonth}
                        </span>
                        {day.isToday ? (
                          <span className="cosmic-shell-meta text-[10px] uppercase tracking-[0.14em] text-cyan-100/75">
                            {messages.dashboard.predictionCalendar.today}
                          </span>
                        ) : null}
                      </div>

                      {day.isLocked ? (
                        <p className="cosmic-shell-meta mt-2 text-[10px] uppercase tracking-[0.14em] text-slate-300/72">
                          {messages.dashboard.projectionCalendar.lockedDayBadge}
                        </p>
                      ) : dayTone ? (
                        <span className={`${projectionToneClass(dayTone)} mt-2 scale-[0.78] origin-left`}>
                          {projectionToneLabel(dayTone)}
                        </span>
                      ) : null}
                    </button>
                  )
                })}
              </div>
            </div>

            {selectedProjectionDay ? (
              <div className="mt-6 rounded-2xl border border-cyan-200/20 bg-slate-900/42 p-5">
                <p className="cosmic-shell-meta text-xs font-black uppercase tracking-[0.16em] text-cyan-100/76">
                  {projectionSelectedDayLabelFormatter.format(
                    new Date(selectedProjectionDay.date),
                  )}
                </p>

                {selectedProjectionDay.isLocked ? (
                  <>
                    <h3 className="cosmic-shell-title mt-3 text-xl">
                      {messages.dashboard.projectionCalendar.lockedDayTitle}
                    </h3>
                    <p className="cosmic-shell-copy mt-2">
                      {messages.dashboard.projectionCalendar.lockedDaySubtitle}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        void openProjectionUnlockFlow()
                      }}
                      disabled={projectionUnlockBusy}
                      className="cosmic-button-primary mt-4 rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.14em] disabled:opacity-60"
                    >
                      {projectionUnlockButtonLabel}
                    </button>
                  </>
                ) : selectedProjectionDay.summary ? (
                  <>
                    <span
                      className={`${projectionToneClass(
                        selectedProjectionDay.summary,
                      )} mt-3`}
                    >
                      {projectionToneLabel(selectedProjectionDay.summary)}
                    </span>
                    <p className="cosmic-shell-copy mt-3">
                      {selectedProjectionDay.notes}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {projectionActivityOrder.map((activity) => {
                        const tone = selectedProjectionDay.activities?.[activity]

                        if (!tone) {
                          return null
                        }

                        return (
                          <span
                            key={activity}
                            className="cosmic-info-box rounded-full px-3 py-1 text-xs text-slate-100/92"
                          >
                            {projectionActivityLabel(activity)} · {projectionToneLabel(tone)}
                          </span>
                        )
                      })}
                    </div>
                  </>
                ) : null}
              </div>
            ) : null}
          </>
        ) : null}
      </section>

      <section className="cosmic-danger-shell rounded-[2rem] p-8">
        <h2 className="text-2xl text-rose-100">{messages.dashboard.dangerTitle}</h2>
        <p className="mt-2 max-w-2xl text-rose-100/82">{messages.dashboard.dangerSubtitle}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={deleteAccount}
            disabled={deleteBusy}
            className="cosmic-danger-button rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.14em] disabled:opacity-60"
          >
            {deleteBusy ? messages.dashboard.deleteLoading : messages.dashboard.deleteButton}
          </button>
        </div>

        {deleteError ? (
          <p className="cosmic-error-box mt-4 rounded-xl px-4 py-3 text-sm">
            {deleteError}
          </p>
        ) : null}
      </section>

      <section className="cosmic-shell rounded-[2rem] p-8">
        {!data.subscription ? (
          <>
            <h2 className="cosmic-shell-title text-2xl">{messages.dashboard.noSubscription}</h2>
            <p className="cosmic-shell-copy mt-2">{messages.dashboard.noSubscriptionSubtitle}</p>
            <form className="mt-5 space-y-4" onSubmit={(event) => runAction('subscribe', event)}>
              <DeliveryPreferenceSelector
                value={deliveryPreference}
                onChange={setDeliveryPreference}
              />
              <div>
                <label
                  htmlFor="subscription-delivery-hour"
                  className="cosmic-field-label mb-3 block text-sm font-semibold"
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
                <p className="cosmic-shell-meta mt-2 text-xs">
                  {interpolate(messages.dashboard.sentOnMondaysAt, {
                    time: formatDeliveryHourLabel(deliveryHourLocal, language),
                    zone: data.user.timeZone,
                  })}
                </p>
              </div>
              <div className="cosmic-info-box rounded-2xl p-4 text-sm text-slate-100/82">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100/76">
                  {messages.dashboard.emailDeliveryLabel}
                </p>
                <p className="mt-2 text-base text-slate-50">{data.user.email}</p>
              </div>
              {requiresWhatsappDelivery(deliveryPreference) ? (
                <>
                  <input
                    type="tel"
                    value={whatsappNumber}
                    onChange={(event) => setWhatsappNumber(event.target.value)}
                    placeholder="+14155550123"
                    required
                    className="cosmic-input w-full rounded-xl px-4 py-3"
                  />
                  <label className="cosmic-info-box flex items-start gap-3 rounded-2xl p-4 text-sm text-slate-100/88">
                    <input
                      type="checkbox"
                      checked={whatsappConsentAccepted}
                      onChange={(event) =>
                        setWhatsappConsentAccepted(event.target.checked)
                      }
                      required
                      className="mt-0.5 h-4 w-4 accent-cyan-300"
                    />
                    <span>
                      <span className="block text-slate-50">
                        {messages.dashboard.whatsappConsentLabel}
                      </span>
                      <span className="cosmic-shell-meta mt-1 block text-xs">
                        {messages.dashboard.whatsappConsentHint}
                      </span>
                    </span>
                  </label>
                </>
              ) : (
                <div className="cosmic-info-box rounded-2xl p-4 text-sm text-slate-100/76">
                  {messages.dashboard.whatsappOffSetup}
                </div>
              )}
              <button
                type="submit"
                disabled={busyAction !== null}
                className="cosmic-button-primary rounded-full px-6 py-3 text-xs font-black uppercase tracking-[0.14em] disabled:opacity-70"
              >
                {messages.dashboard.subscribeButton}
              </button>
            </form>
          </>
        ) : data.subscription.status === 'pending_checkout' ? (
          <>
            <h2 className="cosmic-shell-title text-2xl">{messages.dashboard.pendingTitle}</h2>
            <p className="cosmic-shell-copy mt-2">{messages.dashboard.pendingSubtitle}</p>
            <div className="mt-5 space-y-3 text-sm text-cyan-100/86">
              <div className="cosmic-info-box rounded-2xl p-4">
                {messages.dashboard.pendingDeliveryPreferenceLabel}:{' '}
                {deliveryLabel(data.subscription.deliveryPreference)}
              </div>
              <div className="cosmic-info-box rounded-2xl p-4">
                {messages.dashboard.pendingEmailDeliveryLabel}: {data.user.email}
              </div>
              <div className="cosmic-info-box rounded-2xl p-4">
                {messages.dashboard.pendingProjectionTimingLabel}:{' '}
                {formatDeliveryHourLabel(data.subscription.deliveryHourLocal, language)} (
                {data.user.timeZone})
              </div>
              {requiresWhatsappDelivery(data.subscription.deliveryPreference) ? (
                <div className="cosmic-info-box rounded-2xl p-4">
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
                className="cosmic-outline-button rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.14em]"
              >
                {messages.dashboard.changeDeliverySettings}
              </Link>
            </div>
          </>
        ) : (
          <>
            <h2 className="cosmic-shell-title text-2xl">
              {data.subscription.status === 'canceled'
                ? messages.dashboard.canceledPlanTitle
                : messages.dashboard.activePlanTitle}
            </h2>
            <p className="cosmic-shell-copy mt-2">
              {messages.dashboard.status}:{' '}
              <span className="font-bold text-slate-50">
                {statusLabel[data.subscription.status]}
              </span>
            </p>
            {data.subscription.status === 'canceled' ? (
              <p className="cosmic-shell-copy mt-2">{messages.dashboard.canceledNote}</p>
            ) : (
              <p className="cosmic-shell-copy mt-2">{messages.dashboard.activeNote}</p>
            )}
            <p className="cosmic-shell-copy mt-1">
              {messages.dashboard.deliveryPreferenceLabel}:{' '}
              <span className="font-bold text-slate-50">
                {deliveryLabel(data.subscription.deliveryPreference)}
              </span>
            </p>
            <p className="cosmic-shell-copy mt-1">
              {data.subscription.status === 'canceled'
                ? messages.dashboard.nextMessageIfReactivated
                : messages.dashboard.nextMessage}
              :{' '}
              {formatNextDelivery(data.subscription.nextMessageAt, language, data.user.timeZone)}
            </p>
            <p className="cosmic-shell-copy mt-1">
              {messages.dashboard.weeklyProjectionTimeLabel}:{' '}
              <span className="font-bold text-slate-50">
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
                  className="cosmic-field-label mb-3 block text-sm font-semibold"
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
                <p className="cosmic-shell-meta mt-2 text-xs">
                  {interpolate(messages.dashboard.futureMessagesHint, {
                    zone: data.user.timeZone,
                  })}
                </p>
              </div>
              <div className="cosmic-info-box rounded-2xl p-4 text-sm text-slate-100/82">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100/76">
                  {messages.dashboard.emailDeliveryLabel}
                </p>
                <p className="mt-2 text-base text-slate-50">{data.user.email}</p>
              </div>
              {requiresWhatsappDelivery(deliveryPreference) ? (
                <>
                  <input
                    type="tel"
                    value={whatsappNumber}
                    onChange={(event) => setWhatsappNumber(event.target.value)}
                    placeholder="+14155550123"
                    required
                    className="cosmic-input w-full rounded-xl px-4 py-3"
                  />
                  <label className="cosmic-info-box flex items-start gap-3 rounded-2xl p-4 text-sm text-slate-100/88">
                    <input
                      type="checkbox"
                      checked={whatsappConsentAccepted}
                      onChange={(event) =>
                        setWhatsappConsentAccepted(event.target.checked)
                      }
                      required
                      className="mt-0.5 h-4 w-4 accent-cyan-300"
                    />
                    <span>
                      <span className="block text-slate-50">
                        {messages.dashboard.whatsappConsentLabel}
                      </span>
                      <span className="cosmic-shell-meta mt-1 block text-xs">
                        {messages.dashboard.whatsappConsentHint}
                      </span>
                    </span>
                  </label>
                </>
              ) : (
                <div className="cosmic-info-box rounded-2xl p-4 text-sm text-slate-100/76">
                  {messages.dashboard.whatsappOffActive}
                </div>
              )}
              <button
                type="submit"
                disabled={busyAction !== null}
                className="cosmic-outline-button rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.14em] disabled:opacity-70"
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
                  className="cosmic-danger-button rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.14em] disabled:opacity-60"
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
                  className="cosmic-outline-button rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.14em] disabled:opacity-60"
                >
                  {billingBusy
                    ? messages.dashboard.manageBillingLoading
                    : messages.dashboard.manageBillingButton}
                </button>
              ) : null}
            </div>

            <p className="cosmic-shell-meta mt-4 text-sm">
              {data.subscription.status === 'canceled'
                ? messages.dashboard.billingFootnoteCanceled
                : messages.dashboard.billingFootnoteActive}
            </p>
          </>
        )}

        {subscriptionSuccess ? (
          <p className="cosmic-success-box mt-4 rounded-xl px-4 py-3 text-sm">
            {subscriptionSuccess}
          </p>
        ) : null}

        {error ? (
          <p className="cosmic-error-box mt-4 rounded-xl px-4 py-3 text-sm">
            {error}
          </p>
        ) : null}
      </section>
    </>
  )

  return (
    <div className="space-y-8">
      <section className="cosmic-shell rounded-[2rem] p-8">
        <h1 className="cosmic-shell-title text-3xl">{messages.dashboard.title}</h1>
        <p className="cosmic-shell-copy mt-2">{messages.dashboard.intro}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <p className="cosmic-shell-meta text-sm">
            {data.user.fullName} · {data.user.email}
          </p>
          {data.user.admin ? (
            <span className="inline-flex items-center rounded-full border border-cyan-200/38 bg-cyan-500/12 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              {messages.dashboard.adminBadge}
            </span>
          ) : null}
        </div>

        {billingSuccess ? (
          <p className="cosmic-success-box mt-5 rounded-2xl px-4 py-3 text-sm">
            {messages.dashboard.billingSuccess}
          </p>
        ) : null}
        {data.user.admin ? (
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setDashboardTab('account')}
              className={`rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.14em] ${
                activeTab === 'account'
                  ? 'cosmic-tab-active'
                  : 'cosmic-tab'
              }`}
            >
              {messages.dashboard.tabs.account}
            </button>
            <button
              type="button"
              onClick={() => setDashboardTab('prediction-calendar')}
              className={`rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.14em] ${
                activeTab === 'prediction-calendar'
                  ? 'cosmic-tab-active-alt'
                  : 'cosmic-tab'
              }`}
            >
              {messages.dashboard.tabs.predictionCalendar}
            </button>
            <button
              type="button"
              onClick={() => setDashboardTab('sends')}
              className={`rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.14em] ${
                activeTab === 'sends' ? 'cosmic-tab-active' : 'cosmic-tab'
              }`}
            >
              {messages.dashboard.tabs.sends}
            </button>
          </div>
        ) : null}
      </section>

      {data.user.admin && activeTab === 'prediction-calendar' ? (
        <AdminPredictionCalendar />
      ) : data.user.admin && activeTab === 'sends' ? (
        <AdminSendCampaigns />
      ) : (
        accountContent
      )}

      <section className="cosmic-shell rounded-[2rem] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="cosmic-shell-copy text-sm">{data.user.email}</p>
            <p className="cosmic-shell-meta mt-1 text-xs font-semibold uppercase tracking-[0.18em]">
              {messages.nav.dashboard}
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            disabled={logoutBusy}
            className="cosmic-danger-button self-start rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.14em] disabled:opacity-60 sm:self-auto"
          >
            {logoutBusy ? messages.common.loading : messages.nav.logout}
          </button>
        </div>
      </section>
    </div>
  )
}
