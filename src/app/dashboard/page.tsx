'use client'

import clsx from 'clsx'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'

import { AdminSendCampaigns } from '@/components/dashboard/admin-send-campaigns'
import { AdminSportsSync } from '@/components/dashboard/admin-sports-sync'
import { DeliveryHourSelect } from '@/components/delivery-hour-select'
import { DeliveryPreferenceSelector } from '@/components/delivery-preference-selector'
import { useLanguage } from '@/components/language-provider'
import { SCOUT_PREFERENCES_UPDATED_EVENT } from '@/components/scout-chat-widget'
import { ShareAgendaButton } from '@/components/share-agenda-button'
import { SportsPreferencesEditor } from '@/components/sports-preferences-editor'
import { TimeZoneSelect } from '@/components/time-zone-select'
import { UpcomingEventsFeed } from '@/components/upcoming-events-feed'
import { trackEvent, trackEventOnce, trackMetaStandardEventOnce } from '@/lib/analytics'
import { apiFetch, readApiError } from '@/lib/api-client'
import { BillingSessionError, createBillingSession } from '@/lib/billing'
import { interpolate, languageToIntlLocale } from '@/lib/i18n'
import { DEFAULT_WEEKLY_DELIVERY_HOUR, detectBrowserTimeZone, formatNextDelivery } from '@/lib/schedule'
import {
  emptyPreferences,
  fetchMemberUpcomingEvents,
  hasAnyPreferences,
  MAX_LOOKAHEAD_DAYS,
  preferencesFromSerialized,
  saveSportsPreferences,
  type MemberUpcomingFeed,
  type SportsPreferences,
} from '@/lib/sports'
import {
  fetchAccountSnapshot,
  getStartFlowDestination,
  requiresWhatsappDelivery,
  type AccountSnapshot,
  type DeliveryPreference,
} from '@/lib/start-flow'

type DashboardTab = 'agenda' | 'preferences' | 'delivery' | 'account' | 'sends' | 'sportsSync'

const TAB_ORDER: DashboardTab[] = ['agenda', 'preferences', 'delivery', 'account']
const ADMIN_TABS: DashboardTab[] = ['sends', 'sportsSync']

function isDashboardTab(value: string | null): value is DashboardTab {
  return value !== null && [...TAB_ORDER, ...ADMIN_TABS].includes(value as DashboardTab)
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { language, messages } = useLanguage()
  const copy = messages.dashboard
  const intlLocale = languageToIntlLocale(language)
  const billingSuccess = searchParams.get('billing') === 'success'
  const requestedTab = searchParams.get('tab')

  const [account, setAccount] = useState<AccountSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [activeTab, setActiveTab] = useState<DashboardTab>(
    isDashboardTab(requestedTab) ? requestedTab : 'agenda',
  )

  const [feed, setFeed] = useState<MemberUpcomingFeed | null>(null)
  const [feedLoading, setFeedLoading] = useState(false)
  const [feedError, setFeedError] = useState('')
  const [lookaheadDays, setLookaheadDays] = useState<number | null>(null)

  const [preferencesDraft, setPreferencesDraft] = useState<SportsPreferences>(emptyPreferences)
  const [preferencesSaving, setPreferencesSaving] = useState(false)
  const [preferencesMessage, setPreferencesMessage] = useState('')
  const [preferencesError, setPreferencesError] = useState('')

  const [deliveryPreference, setDeliveryPreference] = useState<DeliveryPreference>('email')
  const [deliveryHourLocal, setDeliveryHourLocal] = useState(DEFAULT_WEEKLY_DELIVERY_HOUR)
  const [deliveryTimeZone, setDeliveryTimeZone] = useState('UTC')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [whatsappConsentAccepted, setWhatsappConsentAccepted] = useState(false)
  const [deliveryBusy, setDeliveryBusy] = useState<string | null>(null)
  const [deliveryMessage, setDeliveryMessage] = useState('')
  const [deliveryError, setDeliveryError] = useState('')

  const [profileFirstName, setProfileFirstName] = useState('')
  const [profileLastName, setProfileLastName] = useState('')
  const [profileTimeZone, setProfileTimeZone] = useState('UTC')
  const [profileBusy, setProfileBusy] = useState(false)
  const [profileMessage, setProfileMessage] = useState('')
  const [profileError, setProfileError] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordBusy, setPasswordBusy] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [logoutBusy, setLogoutBusy] = useState(false)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const subscription = account?.subscription ?? null
  const isAdmin = Boolean(account?.user.admin)
  const hasPreferences = hasAnyPreferences(account?.user.sportsPreferences)
  const subscriptionActive =
    subscription?.status === 'active' || subscription?.status === 'past_due' || subscription?.status === 'paused'
  // Card-less internal trial: show the days left and a direct subscribe link.
  const trialDaysLeft =
    subscription?.status === 'active' && subscription.trialSource === 'internal' && subscription.internalTrialEndsAt
      ? Math.max(0, Math.ceil((new Date(subscription.internalTrialEndsAt).getTime() - Date.now()) / 86_400_000))
      : null

  const applySnapshot = useCallback((snapshot: AccountSnapshot) => {
    setAccount(snapshot)
    setPreferencesDraft(preferencesFromSerialized(snapshot.user.sportsPreferences))
    setProfileFirstName(snapshot.user.firstName ?? '')
    setProfileLastName(snapshot.user.lastName ?? '')
    setProfileTimeZone(snapshot.user.timeZone || 'UTC')

    if (snapshot.subscription) {
      setDeliveryPreference(snapshot.subscription.deliveryPreference ?? 'email')
      setDeliveryHourLocal(snapshot.subscription.deliveryHourLocal ?? DEFAULT_WEEKLY_DELIVERY_HOUR)
      // Accounts created before time zones were captured default to UTC; offer the
      // browser zone instead so the delivery hour means what the user expects.
      const storedZone = snapshot.subscription.timeZone || snapshot.user.timeZone
      setDeliveryTimeZone(!storedZone || storedZone === 'UTC' ? detectBrowserTimeZone() : storedZone)
      setWhatsappNumber(snapshot.subscription.whatsappNumber?.trim() ?? '')
      setWhatsappConsentAccepted(Boolean(snapshot.subscription.whatsappNumber?.trim()))
    }
  }, [])

  const loadAccount = useCallback(async () => {
    try {
      let snapshot = await fetchAccountSnapshot()

      if (!snapshot) {
        router.replace('/account/login?redirect=/dashboard')
        return null
      }

      if (billingSuccess && snapshot.subscription?.status === 'pending_checkout') {
        for (let attempt = 0; attempt < 6; attempt += 1) {
          await wait(900)
          const refreshed = await fetchAccountSnapshot()

          if (refreshed?.subscription && refreshed.subscription.status !== 'pending_checkout') {
            snapshot = refreshed
            break
          }
        }
      }

      if (billingSuccess && snapshot.subscription && snapshot.subscription.status !== 'pending_checkout') {
        // Stripe checkout completed: report the trial/subscription once per session.
        const key = `subscription-started:${snapshot.subscription.id ?? snapshot.user.id}`
        trackEventOnce(key, 'subscription_started', {
          status: snapshot.subscription.status,
          delivery_preference: snapshot.subscription.deliveryPreference ?? 'email',
        })
        trackMetaStandardEventOnce(key, 'StartTrial', {
          content_name: 'Trimry subscription',
          predicted_ltv: 0,
        })
        trackMetaStandardEventOnce(`${key}:subscribe`, 'Subscribe', {
          content_name: 'Trimry subscription',
        })
      }

      applySnapshot(snapshot)
      setLoadError('')
      return snapshot
    } catch {
      setLoadError(copy.noData)
      return null
    } finally {
      setLoading(false)
    }
  }, [applySnapshot, billingSuccess, copy.noData, router])

  const loadFeed = useCallback(
    async (options: { refresh?: boolean; days?: number | null } = {}) => {
      setFeedLoading(true)
      setFeedError('')

      try {
        const payload = await fetchMemberUpcomingEvents({
          language,
          days: options.days ?? lookaheadDays ?? undefined,
          refresh: options.refresh,
        })
        setFeed(payload)
      } catch (error) {
        setFeedError(error instanceof Error ? error.message : messages.agenda.loadError)
      } finally {
        setFeedLoading(false)
      }
    },
    [language, lookaheadDays, messages.agenda.loadError],
  )

  useEffect(() => {
    void loadAccount().then((snapshot) => {
      if (snapshot && hasAnyPreferences(snapshot.user.sportsPreferences)) {
        void loadFeed()
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const handler = () => {
      void loadAccount().then((snapshot) => {
        if (snapshot) {
          void loadFeed({ refresh: false })
        }
      })
    }

    window.addEventListener(SCOUT_PREFERENCES_UPDATED_EVENT, handler)
    return () => window.removeEventListener(SCOUT_PREFERENCES_UPDATED_EVENT, handler)
  }, [loadAccount, loadFeed])

  useEffect(() => {
    if (isDashboardTab(requestedTab) && requestedTab !== activeTab) {
      setActiveTab(requestedTab)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedTab])

  const selectTab = (tab: DashboardTab) => {
    setActiveTab(tab)
    const params = new URLSearchParams(searchParams.toString())

    if (tab === 'agenda') {
      params.delete('tab')
    } else {
      params.set('tab', tab)
    }

    params.delete('billing')
    const query = params.toString()
    router.replace(query ? `/dashboard?${query}` : '/dashboard', { scroll: false })
  }

  const savePreferences = async () => {
    setPreferencesSaving(true)
    setPreferencesMessage('')
    setPreferencesError('')

    try {
      await saveSportsPreferences(preferencesDraft)
      trackEvent('preferences_saved', {
        source: 'dashboard',
        sports: preferencesDraft.sports,
        teams: preferencesDraft.teams.length,
        leagues: preferencesDraft.leagues.length,
        frequency: preferencesDraft.frequency,
      })
      setPreferencesMessage(copy.preferencesSaved)
      await loadAccount()
      setLookaheadDays(null)
      await loadFeed({ days: preferencesDraft.lookaheadDays })
    } catch (error) {
      setPreferencesError(error instanceof Error ? error.message : copy.preferencesSaveError)
    } finally {
      setPreferencesSaving(false)
    }
  }

  const saveDelivery = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setDeliveryMessage('')
    setDeliveryError('')

    if (requiresWhatsappDelivery(deliveryPreference) && !whatsappConsentAccepted) {
      setDeliveryError(copy.whatsappConsentError)
      return
    }

    setDeliveryBusy('save')

    try {
      const response = await apiFetch('/subscription', {
        method: 'POST',
        body: JSON.stringify({
          action: 'update-delivery',
          deliveryPreference,
          deliveryHourLocal,
          timeZone: deliveryTimeZone,
          whatsappNumber,
          whatsappConsentAccepted: requiresWhatsappDelivery(deliveryPreference)
            ? whatsappConsentAccepted
            : undefined,
        }),
      })

      if (!response.ok) {
        setDeliveryError(await readApiError(response, messages.delivery.saveError))
        return
      }

      trackEvent('delivery_settings_saved', {
        entry_point: 'dashboard',
        delivery_preference: deliveryPreference,
        delivery_hour_local: deliveryHourLocal,
      })
      setDeliveryMessage(messages.delivery.success)
      await loadAccount()
    } catch {
      setDeliveryError(messages.delivery.saveError)
    } finally {
      setDeliveryBusy(null)
    }
  }

  const openBillingPortal = async () => {
    setDeliveryBusy('portal')
    setDeliveryError('')

    try {
      const url = await createBillingSession('/billing/portal-session', copy.openBillingError)
      window.location.assign(url)
    } catch (error) {
      setDeliveryError(
        error instanceof BillingSessionError || error instanceof Error
          ? error.message
          : copy.openBillingError,
      )
      setDeliveryBusy(null)
    }
  }

  const cancelSubscription = async () => {
    if (!window.confirm(copy.cancelConfirm)) {
      return
    }

    setDeliveryBusy('cancel')
    setDeliveryError('')
    setDeliveryMessage('')

    try {
      const response = await apiFetch('/billing/cancel-subscription', { method: 'POST' })

      if (!response.ok) {
        setDeliveryError(await readApiError(response, copy.cancelError))
        return
      }

      trackEvent('subscription_cancelled', { source: 'dashboard' })
      setDeliveryMessage(copy.cancelSuccess)
      await loadAccount()
    } catch {
      setDeliveryError(copy.cancelError)
    } finally {
      setDeliveryBusy(null)
    }
  }

  const reactivateSubscription = async () => {
    setDeliveryBusy('reactivate')
    setDeliveryError('')

    try {
      const response = await apiFetch('/billing/reactivate-subscription', { method: 'POST' })

      if (!response.ok) {
        setDeliveryError(await readApiError(response, copy.reactivateError))
        return
      }

      trackEvent('subscription_reactivate_started', { source: 'dashboard' })
      const snapshot = await fetchAccountSnapshot()
      router.push(getStartFlowDestination(snapshot))
      router.refresh()
    } catch {
      setDeliveryError(copy.reactivateError)
    } finally {
      setDeliveryBusy(null)
    }
  }

  const sendNow = async () => {
    setDeliveryBusy('send-now')
    setDeliveryError('')
    setDeliveryMessage('')

    try {
      const response = await apiFetch('/subscription', {
        method: 'POST',
        body: JSON.stringify({ action: 'send-now' }),
      })

      if (!response.ok) {
        setDeliveryError(await readApiError(response, messages.notifications.error))
        return
      }

      const payload = (await response.json()) as {
        result: {
          eventCount: number
          email: 'sent' | 'skipped' | 'failed'
          whatsapp: 'sent' | 'skipped' | 'failed'
          errors: string[]
        }
      }
      const failed = payload.result.errors.filter(
        (entry) => !entry.toLowerCase().includes('template is not configured'),
      )

      if (failed.length > 0) {
        setDeliveryError(failed.join(' '))
      }

      if (payload.result.email === 'sent' || payload.result.whatsapp === 'sent') {
        setDeliveryMessage(
          `${interpolate(copy.sendNowSuccess, { count: payload.result.eventCount })}${
            requiresWhatsappDelivery(deliveryPreference) && payload.result.whatsapp !== 'sent'
              ? ` ${copy.sendNowWhatsappPending}`
              : ''
          }`,
        )
      }

      await loadAccount()
    } catch {
      setDeliveryError(messages.notifications.error)
    } finally {
      setDeliveryBusy(null)
    }
  }

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setProfileBusy(true)
    setProfileMessage('')
    setProfileError('')

    try {
      const response = await apiFetch('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({
          firstName: profileFirstName,
          lastName: profileLastName,
          timeZone: profileTimeZone,
        }),
      })

      if (!response.ok) {
        setProfileError(await readApiError(response, messages.notifications.error))
        return
      }

      setProfileMessage(messages.notifications.success)
      await loadAccount()
      router.refresh()
      void loadFeed({ refresh: false })
    } catch {
      setProfileError(messages.notifications.error)
    } finally {
      setProfileBusy(false)
    }
  }

  const savePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPasswordMessage('')
    setPasswordError('')

    if (newPassword !== confirmPassword) {
      setPasswordError(copy.passwordMismatchError)
      return
    }

    if (currentPassword && currentPassword === newPassword) {
      setPasswordError(copy.passwordDifferentError)
      return
    }

    setPasswordBusy(true)

    try {
      const response = await apiFetch('/users/me/password', {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      if (!response.ok) {
        setPasswordError(await readApiError(response, copy.passwordSaveError))
        return
      }

      setPasswordMessage(copy.passwordSuccess)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      setPasswordError(copy.passwordSaveError)
    } finally {
      setPasswordBusy(false)
    }
  }

  const logout = async () => {
    setLogoutBusy(true)

    try {
      await apiFetch('/auth/logout', { method: 'POST' }, { retryUnauthorized: false })
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch {
      // Clear the local session regardless of the remote result.
    } finally {
      router.replace('/')
      router.refresh()
      window.location.assign('/')
    }
  }

  const deleteAccount = async () => {
    if (!window.confirm(copy.deleteConfirm)) {
      return
    }

    setDeleteBusy(true)
    setDeleteError('')

    try {
      const response = await apiFetch('/users/me', { method: 'DELETE' })

      if (!response.ok) {
        setDeleteError(await readApiError(response, copy.deleteError))
        return
      }

      trackEvent('account_deleted', { source: 'dashboard' })
      window.location.assign('/')
    } catch {
      setDeleteError(copy.deleteError)
    } finally {
      setDeleteBusy(false)
    }
  }

  const statusBadge = useMemo(() => {
    if (!subscription) {
      return { label: copy.noSubscription, className: 'tr-badge-slate' }
    }

    switch (subscription.status) {
      case 'active':
        return { label: messages.statuses.active, className: 'tr-badge-green' }
      case 'paused':
        return { label: messages.statuses.paused, className: 'tr-badge-amber' }
      case 'past_due':
        return { label: copy.paymentIssue, className: 'tr-badge-amber' }
      case 'pending_checkout':
        return { label: copy.paymentPending, className: 'tr-badge-amber' }
      default:
        return { label: messages.statuses.canceled, className: 'tr-badge-slate' }
    }
  }, [copy.noSubscription, copy.paymentIssue, copy.paymentPending, messages.statuses, subscription])

  const deliveryLabel = (preference: DeliveryPreference) =>
    preference === 'none'
      ? messages.deliveryChannels.noneTitle
      : preference === 'email'
        ? messages.deliveryChannels.emailTitle
        : preference === 'whatsapp'
          ? messages.deliveryChannels.whatsappTitle
          : messages.deliveryChannels.bothTitle

  if (loading) {
    return (
      <section className="tr-shell mx-auto max-w-3xl p-8">
        <p className="tr-copy">{copy.loading}</p>
      </section>
    )
  }

  if (!account) {
    return (
      <section className="tr-shell mx-auto max-w-3xl p-8">
        <p className="tr-alert-error">{loadError || copy.noData}</p>
      </section>
    )
  }

  const timeZone = subscription?.timeZone || account.user.timeZone || 'UTC'
  const tabs: DashboardTab[] = isAdmin ? [...TAB_ORDER, ...ADMIN_TABS] : TAB_ORDER

  return (
    <div className="min-w-0 space-y-6">
      <header className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="tr-eyebrow">{copy.title}</p>
          <h1 className="mt-1 text-3xl">
            {account.user.firstName ? `${account.user.firstName} 👋` : copy.title}
          </h1>
          <p className="tr-copy mt-1 text-sm">{copy.intro}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={clsx('tr-badge', statusBadge.className)}>{statusBadge.label}</span>
          {isAdmin ? <span className="tr-badge tr-badge-blue">{copy.adminBadge}</span> : null}
          {subscriptionActive && subscription ? (
            <span className="tr-meta text-xs">
              {copy.nextMessage}: {formatNextDelivery(subscription.nextMessageAt, intlLocale, timeZone)}
            </span>
          ) : null}
        </div>
      </header>

      {billingSuccess && subscriptionActive ? (
        <p className="tr-alert-success">{copy.billingSuccess}</p>
      ) : null}

      {trialDaysLeft !== null ? (
        <div className="tr-card-muted flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-extrabold text-trimry-ink">
              {trialDaysLeft <= 1 ? copy.trialLastDay : interpolate(copy.trialDaysLeft, { days: trialDaysLeft })}
            </p>
            <p className="tr-meta mt-0.5 text-xs">{copy.trialNote}</p>
          </div>
          <Link href="/checkout/start" className="tr-btn-primary tr-btn-sm shrink-0">
            {interpolate(copy.trialCta, { price: subscription?.monthlyPriceUsd ?? 2.99 })}
          </Link>
        </div>
      ) : null}

      <nav className="tr-tab-strip">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => selectTab(tab)}
            className={clsx('tr-tab', activeTab === tab && 'tr-tab-active')}
          >
            {copy.tabs[tab]}
          </button>
        ))}
      </nav>

      {activeTab === 'agenda' ? (
        <section className="tr-shell min-w-0 p-5 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-2xl">{messages.agenda.title}</h2>
              <p className="tr-copy mt-1 text-sm">{messages.agenda.subtitle}</p>
              <p className="tr-meta mt-2 text-xs">
                {messages.agenda.lastDigestLabel}:{' '}
                {account.lastDigest
                  ? `${new Intl.DateTimeFormat(intlLocale, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                      timeZone,
                    }).format(new Date(account.lastDigest.sentAt))} · ${account.lastDigest.channel}`
                  : messages.agenda.lastDigestNever}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ShareAgendaButton feed={feed} source="dashboard" />
              <label className="tr-meta flex items-center gap-2 text-xs">
                {messages.agenda.lookahead}
                <select
                  value={lookaheadDays ?? feed?.lookaheadDays ?? preferencesDraft.lookaheadDays}
                  onChange={(event) => {
                    const days = Number.parseInt(event.target.value, 10)
                    setLookaheadDays(days)
                    void loadFeed({ days, refresh: false })
                  }}
                  className="rounded-full border border-trimry-line bg-white px-3 py-1.5 text-xs font-bold text-trimry-ink"
                >
                  {Array.from({ length: MAX_LOOKAHEAD_DAYS }, (_, index) => index + 1).map((days) => (
                    <option key={days} value={days}>
                      {days} {messages.agenda.days}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={() => void loadFeed({ refresh: true })}
                disabled={feedLoading}
                className="tr-btn-secondary tr-btn-sm"
              >
                {feedLoading ? messages.agenda.refreshing : messages.agenda.refresh}
              </button>
            </div>
          </div>

          <div className="mt-6">
            {hasPreferences ? (
              <UpcomingEventsFeed feed={feed} loading={feedLoading} error={feedError} showHighlights />
            ) : (
              <div className="tr-card-muted p-8 text-center">
                <p className="tr-copy">{messages.agenda.emptyNoPreferences}</p>
                <button type="button" onClick={() => selectTab('preferences')} className="tr-btn-primary mt-4">
                  {messages.agenda.emptyCta}
                </button>
              </div>
            )}
          </div>

          {!subscriptionActive ? (
            <div className="tr-gradient-panel mt-8 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-lg font-extrabold">{copy.noSubscription}</p>
                <p className="mt-1 text-sm text-white/90">{copy.noSubscriptionSubtitle}</p>
              </div>
              <Link
                href={subscription?.status === 'pending_checkout' ? '/checkout/start' : '/activate?step=3'}
                className="tr-btn shrink-0 bg-white text-trimry-ink hover:bg-white/90"
              >
                {copy.subscribeButton}
              </Link>
            </div>
          ) : null}
        </section>
      ) : null}

      {activeTab === 'preferences' ? (
        <section className="tr-shell p-6 sm:p-8">
          <h2 className="text-2xl">{copy.preferencesTitle}</h2>
          <p className="tr-copy mt-1 text-sm">{copy.preferencesSubtitle}</p>
          <div className="mt-6">
            <SportsPreferencesEditor value={preferencesDraft} onChange={setPreferencesDraft} />
          </div>
          {preferencesError ? <p className="tr-alert-error mt-6">{preferencesError}</p> : null}
          {preferencesMessage ? <p className="tr-alert-success mt-6">{preferencesMessage}</p> : null}
          <div className="mt-6 flex flex-wrap gap-3 border-t border-trimry-line pt-6">
            <button
              type="button"
              onClick={() => void savePreferences()}
              disabled={preferencesSaving || preferencesDraft.sports.length === 0}
              className="tr-btn-primary"
            >
              {preferencesSaving ? messages.common.saving : messages.common.save}
            </button>
          </div>
        </section>
      ) : null}

      {activeTab === 'delivery' ? (
        <section className="space-y-6">
          <div className="tr-shell p-6 sm:p-8">
            {!subscription ? (
              <>
                <h2 className="text-2xl">{copy.noSubscription}</h2>
                <p className="tr-copy mt-1 text-sm">{copy.noSubscriptionSubtitle}</p>
                <Link href="/activate?step=3" className="tr-btn-primary mt-5">
                  {copy.subscribeButton}
                </Link>
              </>
            ) : subscription.status === 'pending_checkout' ? (
              <>
                <h2 className="text-2xl">{copy.pendingTitle}</h2>
                <p className="tr-copy mt-1 text-sm">{copy.pendingSubtitle}</p>
                <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="tr-card-muted p-4">
                    <dt className="tr-eyebrow">{copy.pendingDeliveryPreferenceLabel}</dt>
                    <dd className="mt-1 text-sm font-bold text-trimry-ink">
                      {deliveryLabel(subscription.deliveryPreference)}
                    </dd>
                  </div>
                  <div className="tr-card-muted p-4">
                    <dt className="tr-eyebrow">{copy.pendingEmailDeliveryLabel}</dt>
                    <dd className="mt-1 text-sm font-bold text-trimry-ink">{account.user.email}</dd>
                  </div>
                  <div className="tr-card-muted p-4">
                    <dt className="tr-eyebrow">{copy.pendingTimingLabel}</dt>
                    <dd className="mt-1 text-sm font-bold text-trimry-ink">
                      {String(subscription.deliveryHourLocal).padStart(2, '0')}:00 · {timeZone}
                    </dd>
                  </div>
                </dl>
                <Link href="/checkout/start" className="tr-btn-primary mt-5">
                  {copy.subscribeButton}
                </Link>
              </>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl">
                      {subscription.status === 'canceled' ? copy.canceledPlanTitle : copy.activePlanTitle}
                    </h2>
                    <p className="tr-copy mt-1 text-sm">
                      {subscription.status === 'canceled' ? copy.canceledNote : copy.activeNote}
                    </p>
                  </div>
                  <span className={clsx('tr-badge', statusBadge.className)}>{statusBadge.label}</span>
                </div>

                <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="tr-card-muted p-4">
                    <dt className="tr-eyebrow">{copy.deliveryPreferenceLabel}</dt>
                    <dd className="mt-1 text-sm font-bold text-trimry-ink">
                      {deliveryLabel(subscription.deliveryPreference)}
                    </dd>
                  </div>
                  <div className="tr-card-muted p-4">
                    <dt className="tr-eyebrow">
                      {subscription.status === 'canceled' ? copy.nextMessageIfReactivated : copy.nextMessage}
                    </dt>
                    <dd className="mt-1 text-sm font-bold text-trimry-ink">
                      {formatNextDelivery(subscription.nextMessageAt, intlLocale, timeZone)}
                    </dd>
                  </div>
                  <div className="tr-card-muted p-4">
                    <dt className="tr-eyebrow">{messages.onboarding.frequencyLabel}</dt>
                    <dd className="mt-1 text-sm font-bold text-trimry-ink">
                      {preferencesDraft.frequency === 'weekly'
                        ? messages.onboarding.frequencyWeekly
                        : messages.onboarding.frequencyDaily}
                    </dd>
                  </div>
                </dl>

                {subscription.status !== 'canceled' ? (
                  <form className="mt-8 space-y-5" onSubmit={saveDelivery}>
                    <div>
                      <p className="tr-label mb-2">{copy.deliveryPreferenceLabel}</p>
                      <DeliveryPreferenceSelector value={deliveryPreference} onChange={setDeliveryPreference} />
                      {requiresWhatsappDelivery(deliveryPreference) ? (
                        <p className="tr-alert-info mt-3 text-xs">
                          {messages.deliveryChannels.whatsappPendingNote}
                        </p>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <label className="tr-label" htmlFor="dashboard-delivery-hour">
                        {copy.deliveryHourLabel}
                        <DeliveryHourSelect
                          id="dashboard-delivery-hour"
                          value={deliveryHourLocal}
                          onChange={setDeliveryHourLocal}
                          locale={language}
                          className="tr-input mt-2"
                        />
                      </label>
                      <label className="tr-label" htmlFor="dashboard-delivery-zone">
                        {messages.auth.timeZoneLabel}
                        <TimeZoneSelect
                          id="dashboard-delivery-zone"
                          value={deliveryTimeZone}
                          onChange={setDeliveryTimeZone}
                          className="tr-input mt-2"
                        />
                        <span className="tr-meta mt-2 block text-xs">
                          {interpolate(copy.deliveryHourHint, { zone: deliveryTimeZone })}
                        </span>
                      </label>
                      {requiresWhatsappDelivery(deliveryPreference) ? (
                        <label className="tr-label">
                          {messages.delivery.whatsappNumberLabel}
                          <input
                            type="tel"
                            value={whatsappNumber}
                            onChange={(event) => setWhatsappNumber(event.target.value)}
                            placeholder="+14155550123"
                            required
                            className="tr-input mt-2"
                          />
                        </label>
                      ) : (
                        <p className="tr-meta self-end text-sm">{copy.whatsappOffSetup}</p>
                      )}
                    </div>

                    {requiresWhatsappDelivery(deliveryPreference) ? (
                      <label className="tr-card-muted flex items-start gap-3 p-4 text-sm">
                        <input
                          type="checkbox"
                          checked={whatsappConsentAccepted}
                          onChange={(event) => setWhatsappConsentAccepted(event.target.checked)}
                          className="tr-checkbox mt-0.5"
                        />
                        <span>
                          <span className="block font-semibold text-trimry-ink">{copy.whatsappConsentLabel}</span>
                          <span className="tr-meta mt-1 block text-xs">{copy.whatsappConsentHint}</span>
                        </span>
                      </label>
                    ) : null}

                    {deliveryError ? <p className="tr-alert-error">{deliveryError}</p> : null}
                    {deliveryMessage ? <p className="tr-alert-success">{deliveryMessage}</p> : null}

                    <div className="flex flex-wrap gap-3">
                      <button type="submit" disabled={deliveryBusy !== null} className="tr-btn-primary">
                        {deliveryBusy === 'save' ? messages.common.saving : copy.saveDeliverySettings}
                      </button>
                      <button
                        type="button"
                        onClick={() => void sendNow()}
                        disabled={deliveryBusy !== null || !hasPreferences}
                        className="tr-btn-secondary"
                      >
                        {deliveryBusy === 'send-now' ? copy.sendNowSending : copy.sendNowButton}
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    {deliveryError ? <p className="tr-alert-error mt-6">{deliveryError}</p> : null}
                    {deliveryMessage ? <p className="tr-alert-success mt-6">{deliveryMessage}</p> : null}
                  </>
                )}

                <div className="mt-8 flex flex-wrap gap-3 border-t border-trimry-line pt-6">
                  {subscription.status === 'canceled' ? (
                    <button
                      type="button"
                      onClick={() => void reactivateSubscription()}
                      disabled={deliveryBusy !== null}
                      className="tr-btn-primary"
                    >
                      {deliveryBusy === 'reactivate' ? copy.reactivateLoading : copy.reactivateButton}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void cancelSubscription()}
                      disabled={deliveryBusy !== null}
                      className="tr-btn-danger"
                    >
                      {deliveryBusy === 'cancel' ? copy.cancelLoading : copy.cancelButton}
                    </button>
                  )}
                  {subscription.canManageBilling ? (
                    <button
                      type="button"
                      onClick={() => void openBillingPortal()}
                      disabled={deliveryBusy !== null}
                      className="tr-btn-secondary"
                    >
                      {deliveryBusy === 'portal' ? copy.manageBillingLoading : copy.manageBillingButton}
                    </button>
                  ) : null}
                </div>
                <p className="tr-meta mt-3 text-xs">
                  {subscription.status === 'canceled' ? copy.billingFootnoteCanceled : copy.billingFootnoteActive}
                </p>
              </>
            )}
          </div>
        </section>
      ) : null}

      {activeTab === 'account' ? (
        <section className="space-y-6">
          <div className="tr-shell p-6 sm:p-8">
            <h2 className="text-2xl">{copy.profileTitle}</h2>
            <p className="tr-copy mt-1 text-sm">{copy.profileSubtitle}</p>
            <form className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={saveProfile}>
              <label className="tr-label">
                {messages.auth.firstNameLabel}
                <input
                  type="text"
                  value={profileFirstName}
                  onChange={(event) => setProfileFirstName(event.target.value)}
                  required
                  className="tr-input mt-2"
                />
              </label>
              <label className="tr-label">
                {messages.auth.lastNameLabel}
                <input
                  type="text"
                  value={profileLastName}
                  onChange={(event) => setProfileLastName(event.target.value)}
                  className="tr-input mt-2"
                />
              </label>
              <label className="tr-label sm:col-span-2" htmlFor="profile-time-zone">
                {messages.auth.timeZoneLabel}
                <TimeZoneSelect
                  id="profile-time-zone"
                  value={profileTimeZone}
                  onChange={setProfileTimeZone}
                  className="tr-input mt-2"
                />
                <span className="tr-meta mt-2 block text-xs">{copy.profileTimeZoneHint}</span>
              </label>
              <div className="sm:col-span-2">
                <p className="tr-meta text-xs">
                  {messages.auth.emailLabel}: {account.user.email}
                </p>
              </div>
              {profileError ? <p className="tr-alert-error sm:col-span-2">{profileError}</p> : null}
              {profileMessage ? <p className="tr-alert-success sm:col-span-2">{profileMessage}</p> : null}
              <div className="sm:col-span-2">
                <button type="submit" disabled={profileBusy} className="tr-btn-primary">
                  {profileBusy ? messages.common.saving : copy.profileSave}
                </button>
              </div>
            </form>
          </div>

          <div className="tr-shell p-6 sm:p-8">
            <h2 className="text-2xl">{copy.passwordTitle}</h2>
            <p className="tr-copy mt-1 text-sm">{copy.passwordSubtitle}</p>
            <form className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3" onSubmit={savePassword}>
              <label className="tr-label">
                {copy.currentPasswordLabel}
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  autoComplete="current-password"
                  className="tr-input mt-2"
                />
              </label>
              <label className="tr-label">
                {copy.newPasswordLabel}
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  required
                  autoComplete="new-password"
                  className="tr-input mt-2"
                />
              </label>
              <label className="tr-label">
                {copy.confirmPasswordLabel}
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  autoComplete="new-password"
                  className="tr-input mt-2"
                />
              </label>
              <p className="tr-meta text-xs sm:col-span-3">{messages.auth.passwordHint}</p>
              {passwordError ? <p className="tr-alert-error sm:col-span-3">{passwordError}</p> : null}
              {passwordMessage ? <p className="tr-alert-success sm:col-span-3">{passwordMessage}</p> : null}
              <div className="sm:col-span-3">
                <button type="submit" disabled={passwordBusy} className="tr-btn-secondary">
                  {passwordBusy ? messages.common.saving : copy.passwordSave}
                </button>
              </div>
            </form>
          </div>

          <div className="tr-shell flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-trimry-ink">{account.user.email}</p>
              <p className="tr-meta text-xs">{messages.nav.dashboard}</p>
            </div>
            <button type="button" onClick={() => void logout()} disabled={logoutBusy} className="tr-btn-secondary">
              {logoutBusy ? messages.common.loading : messages.nav.logout}
            </button>
          </div>

          <div className="rounded-3xl border border-rose-200 bg-rose-50/60 p-6 sm:p-8">
            <h2 className="text-2xl text-rose-800">{copy.dangerTitle}</h2>
            <p className="mt-1 text-sm text-rose-700">{copy.dangerSubtitle}</p>
            <button
              type="button"
              onClick={() => void deleteAccount()}
              disabled={deleteBusy}
              className="tr-btn-danger mt-5"
            >
              {deleteBusy ? copy.deleteLoading : copy.deleteButton}
            </button>
            {deleteError ? <p className="tr-alert-error mt-4">{deleteError}</p> : null}
          </div>
        </section>
      ) : null}

      {activeTab === 'sends' && isAdmin ? (
        <div className="tr-admin-surface">
          <AdminSendCampaigns />
        </div>
      ) : null}

      {activeTab === 'sportsSync' && isAdmin ? <AdminSportsSync /> : null}
    </div>
  )
}
