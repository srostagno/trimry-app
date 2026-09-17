'use client'

import clsx from 'clsx'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { DeliveryHourSelect } from '@/components/delivery-hour-select'
import { DeliveryPreferenceSelector } from '@/components/delivery-preference-selector'
import { useLanguage } from '@/components/language-provider'
import { PlanPicker } from '@/components/plan-picker'
import { ProUpgradeSheet } from '@/components/pro-upgrade-sheet'
import {
  LeaguePicker,
  PreferencesSummary,
  RhythmPicker,
  SportPicker,
  TeamSearch,
  useSportsCatalog,
} from '@/components/sports-preferences-editor'
import { UpcomingEventsFeed } from '@/components/upcoming-events-feed'
import { trackEvent, trackMetaStandardEvent, trackMetaCustomEvent } from '@/lib/analytics'
import { apiFetch, isProRequired, readApiErrorDetails } from '@/lib/api-client'
import { interpolate, isLanguageCode } from '@/lib/i18n'
import { HoneypotField } from '@/components/honeypot-field'
import { EMAIL_PATTERN, registerAccount } from '@/lib/registration'
import { DEFAULT_WEEKLY_DELIVERY_HOUR, detectBrowserTimeZone } from '@/lib/schedule'
import {
  emptyPreferences,
  fetchMemberUpcomingEvents,
  hasAnyPreferences,
  loadPreferencesDraft,
  preferencesFromSerialized,
  savePreferencesDraft,
  saveSportsPreferences,
  type MemberUpcomingFeed,
  type SportsPreferences,
} from '@/lib/sports'
import {
  fetchAccountSnapshot,
  planForPreference,
  requiresWhatsappDelivery,
  saveActivationFunnelStep,
  type AccountSnapshot,
  type DeliveryPreference,
  type PlanChoice,
} from '@/lib/start-flow'

const TOTAL_STEPS = 4

const SPORT_KEYS_SET = new Set<string>([
  'soccer', 'basketball', 'american_football', 'baseball', 'ice_hockey', 'tennis',
  'motorsport', 'fighting', 'rugby', 'golf', 'cycling', 'cricket',
])

// SEO pages link here with a team or league to follow; merge it into the draft.
function applyPrefillFromQuery(
  draft: SportsPreferences | null,
  searchParams: { get: (name: string) => string | null },
): SportsPreferences | null {
  const sport = searchParams.get('sport')
  const teamId = searchParams.get('teamId')
  const teamName = searchParams.get('teamName')
  const leagueId = searchParams.get('leagueId')
  const leagueName = searchParams.get('leagueName')

  if (!sport || !SPORT_KEYS_SET.has(sport) || (!teamId && !leagueId)) {
    return draft
  }

  const next: SportsPreferences = draft ? { ...draft } : emptyPreferences()
  const sportKey = sport as SportsPreferences['sports'][number]
  next.sports = next.sports.includes(sportKey) ? next.sports : [...next.sports, sportKey]

  if (teamId && teamName && !next.teams.some((team) => team.id === teamId)) {
    next.teams = [
      ...next.teams,
      { id: teamId, name: teamName, sport: sportKey, leagueId: leagueId ?? null, leagueName: leagueName ?? null, badge: null },
    ]
  } else if (leagueId && leagueName && !teamId && !next.leagues.some((league) => league.id === leagueId)) {
    next.leagues = [...next.leagues, { id: leagueId, name: leagueName, sport: sportKey }]
  }

  return next
}

function clampStep(value: string | null) {
  const parsed = Number.parseInt(value ?? '', 10)

  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1
  }

  return Math.min(parsed, TOTAL_STEPS)
}

export default function ActivatePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { language, setLanguage, messages } = useLanguage()
  const copy = messages.onboarding
  const { catalog, loading: catalogLoading } = useSportsCatalog()

  const [step, setStep] = useState(() => clampStep(searchParams.get('step')))
  const [account, setAccount] = useState<AccountSnapshot | null>(null)
  const [accountLoaded, setAccountLoaded] = useState(false)
  const [preferences, setPreferences] = useState<SportsPreferences>(emptyPreferences)
  const [deliveryPreference, setDeliveryPreference] = useState<DeliveryPreference>('email')
  const [plan, setPlan] = useState<PlanChoice>('free')
  // Opened when the API answers 402: the account already used its trial, so the
  // only way to WhatsApp is checkout.
  const [proSheetOpen, setProSheetOpen] = useState(false)
  const [deliveryHourLocal, setDeliveryHourLocal] = useState(DEFAULT_WEEKLY_DELIVERY_HOUR)
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [whatsappConsentAccepted, setWhatsappConsentAccepted] = useState(false)
  const [timeZone, setTimeZone] = useState('UTC')
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [formOpenedAt] = useState(() => Date.now())
  const [registering, setRegistering] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [reviewFeed, setReviewFeed] = useState<MemberUpcomingFeed | null>(null)
  const [reviewLoading, setReviewLoading] = useState(false)
  const initializedRef = useRef(false)
  const savedSignatureRef = useRef('')

  const isAuthenticated = Boolean(account)
  const subscription = account?.subscription ?? null
  const hasLiveSubscription =
    subscription?.status === 'active' || subscription?.status === 'past_due' || subscription?.status === 'paused'

  useEffect(() => {
    setTimeZone(detectBrowserTimeZone())
  }, [])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      let snapshot: AccountSnapshot | null = null

      try {
        snapshot = await fetchAccountSnapshot()
      } catch {
        snapshot = null
      }

      if (cancelled) {
        return
      }

      const draft = applyPrefillFromQuery(loadPreferencesDraft(), searchParams)

      if (snapshot) {
        setAccount(snapshot)
        setTimeZone(snapshot.subscription?.timeZone || snapshot.user.timeZone || detectBrowserTimeZone())

        if (snapshot.subscription) {
          const storedPreference =
            snapshot.subscription.deliveryPreference === 'none'
              ? 'email'
              : snapshot.subscription.deliveryPreference

          setDeliveryPreference(storedPreference)
          setPlan(planForPreference(storedPreference))
          setDeliveryHourLocal(snapshot.subscription.deliveryHourLocal)
          setWhatsappNumber(snapshot.subscription.whatsappNumber ?? '')
          setWhatsappConsentAccepted(Boolean(snapshot.subscription.whatsappNumber))
        }

        if (hasAnyPreferences(draft)) {
          setPreferences(draft ?? emptyPreferences())
        } else if (snapshot.user.sportsPreferences) {
          setPreferences(preferencesFromSerialized(snapshot.user.sportsPreferences))
        }
      } else if (draft) {
        setPreferences(draft)
      }

      if (hasAnyPreferences(draft) && searchParams.get('teamId')) {
        // Arriving from a team page: jump straight to teams & leagues with it followed.
        setStep((current) => (current === 1 ? 2 : current))
      }

      initializedRef.current = true
      setAccountLoaded(true)
    }

    void load()

    return () => {
      cancelled = true
    }
    // Mount-only: the prefill query is read once on first load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!initializedRef.current) {
      return
    }

    savePreferencesDraft(preferences)
  }, [preferences])

  useEffect(() => {
    if (!accountLoaded) {
      return
    }

    trackEvent('activation_step_viewed', { step, authenticated: isAuthenticated })

    if (isAuthenticated) {
      void saveActivationFunnelStep(step, TOTAL_STEPS).catch(() => null)
    }
  }, [accountLoaded, isAuthenticated, step])

  const goToStep = useCallback(
    (next: number) => {
      const clamped = Math.min(Math.max(next, 1), TOTAL_STEPS)
      setStep(clamped)
      setError('')
      router.replace(clamped === 1 ? '/activate' : `/activate?step=${clamped}`, { scroll: false })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [router],
  )

  const persistPreferences = useCallback(async () => {
    if (!isAuthenticated) {
      return
    }

    const signature = JSON.stringify(preferences)

    if (savedSignatureRef.current === signature) {
      return
    }

    await saveSportsPreferences(preferences)
    savedSignatureRef.current = signature
  }, [isAuthenticated, preferences])

  useEffect(() => {
    if (step !== 4 || !isAuthenticated) {
      return
    }

    let cancelled = false
    setReviewLoading(true)

    persistPreferences()
      .then(() => fetchMemberUpcomingEvents({ language, days: 7 }))
      .then((feed) => {
        if (!cancelled) {
          setReviewFeed(feed)
        }
      })
      .catch((nextError: unknown) => {
        if (!cancelled) {
          setError(nextError instanceof Error ? nextError.message : copy.saveError)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setReviewLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [copy.saveError, isAuthenticated, language, persistPreferences, step])

  const updatePreferences = (patch: Partial<SportsPreferences>) => {
    setPreferences((current) => {
      const next = { ...current, ...patch }
      const sports = new Set(next.sports)

      for (const league of next.leagues) {
        sports.add(league.sport)
      }

      for (const team of next.teams) {
        sports.add(team.sport)
      }

      return { ...next, sports: Array.from(sports) }
    })
  }

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!EMAIL_PATTERN.test(email.trim())) {
      setError(messages.auth.invalidEmail)
      return
    }

    setRegistering(true)
    trackEvent('signup_started', { language, contact_type: 'email', time_zone: timeZone, source: 'activate' })

    try {
      const payload = await registerAccount(
        {
          firstName,
          email,
          language,
          timeZone,
          sportsPreferences: preferences,
          honeypot,
          formOpenedAt,
        },
        copy.registerError,
      )
      const nextLocale = payload.user?.locale

      if (nextLocale && isLanguageCode(nextLocale)) {
        setLanguage(nextLocale, { persist: false, track: false })
      }

      trackEvent('sign_up', { method: 'email', language: nextLocale ?? language, user_id: payload.user?.id })
      trackMetaStandardEvent('CompleteRegistration', {
        content_name: 'Trimry account',
        method: 'email',
        status: 'created',
        language: nextLocale ?? language,
      })

      savedSignatureRef.current = JSON.stringify(preferences)
      const snapshot = await fetchAccountSnapshot()
      setAccount(snapshot)
      router.refresh()
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : copy.registerError)
    } finally {
      setRegistering(false)
    }
  }

  const handleStart = async () => {
    if (!isAuthenticated) {
      goToStep(3)
      return
    }

    if (requiresWhatsappDelivery(deliveryPreference) && !whatsappConsentAccepted) {
      setError(copy.whatsappConsentError)
      return
    }

    setSaving(true)
    setError('')

    try {
      await persistPreferences()

      const action = hasLiveSubscription ? 'update-delivery' : 'subscribe'
      const response = await apiFetch('/subscription', {
        method: 'POST',
        body: JSON.stringify({
          action,
          deliveryPreference,
          deliveryHourLocal,
          whatsappNumber: requiresWhatsappDelivery(deliveryPreference) ? whatsappNumber : undefined,
          whatsappConsentAccepted: requiresWhatsappDelivery(deliveryPreference)
            ? whatsappConsentAccepted
            : undefined,
        }),
      })

      if (!response.ok) {
        const details = await readApiErrorDetails(response, copy.saveError)

        // The account already spent its card-less trial, so WhatsApp now runs
        // through checkout. Show the offer rather than a raw error.
        if (isProRequired(details)) {
          openProSheet('activate_submit')
          return
        }

        setError(details.message)
        return
      }

      const result = (await response.json().catch(() => null)) as {
        subscription?: { status?: string }
        trialStarted?: boolean
      } | null
      const subscriptionLive = hasLiveSubscription || result?.subscription?.status === 'active'

      savePreferencesDraft(null)
      trackEvent('activation_completed', {
        action,
        delivery_preference: deliveryPreference,
        frequency: preferences.frequency,
        sports: preferences.sports,
        teams: preferences.teams.length,
        leagues: preferences.leagues.length,
      })
      // Meta: an activated agenda is the lead we optimize ads for.
      trackMetaStandardEvent('Lead', {
        content_name: 'Sports agenda activated',
        content_category: preferences.sports.join(','),
        delivery_preference: deliveryPreference,
      })
      trackMetaCustomEvent('ActivationCompleted', {
        delivery_preference: deliveryPreference,
        frequency: preferences.frequency,
        teams: preferences.teams.length,
        leagues: preferences.leagues.length,
      })

      if (result?.trialStarted) {
        trackEvent('trial_started', { source: 'activate', delivery_preference: deliveryPreference })
        trackMetaStandardEvent('StartTrial', { content_name: 'Trimry internal trial', predicted_ltv: 0 })
      }

      if (subscriptionLive) {
        router.push(result?.trialStarted ? '/dashboard?trial=started' : '/dashboard')
      } else {
        router.push('/checkout/start')
      }

      router.refresh()
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : copy.saveError)
    } finally {
      setSaving(false)
    }
  }

  // The plan and the channel are two views of one decision, so picking a plan
  // sets a sensible channel and picking a channel keeps the plan honest.
  const choosePlan = useCallback(
    (next: PlanChoice) => {
      setPlan(next)
      trackEvent('plan_selected', { plan: next })

      if (next === 'free') {
        setDeliveryPreference('email')
        setWhatsappConsentAccepted(false)
        return
      }

      setDeliveryPreference((current) => (requiresWhatsappDelivery(current) ? current : 'whatsapp'))
    },
    [],
  )

  const openProSheet = useCallback((source: string) => {
    setProSheetOpen(true)
    trackEvent('pro_paywall_viewed', { source })
  }, [])

  const stepIsValid = useMemo(() => {
    if (step === 1) {
      return preferences.sports.length > 0
    }

    if (step === 3) {
      if (!isAuthenticated) {
        return false
      }

      if (requiresWhatsappDelivery(deliveryPreference)) {
        return whatsappNumber.trim().length > 6 && whatsappConsentAccepted
      }
    }

    return true
  }, [deliveryPreference, isAuthenticated, preferences.sports.length, step, whatsappConsentAccepted, whatsappNumber])

  return (
    <div className="mx-auto min-w-0 max-w-4xl space-y-6">
      <header className="min-w-0">
        <p className="tr-eyebrow">{copy.title}</p>
        {/* Compact progress on phones, full step pills from sm up. */}
        <div className="mt-3 sm:hidden">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-lg font-extrabold text-trimry-ink">{copy.steps[step - 1]}</p>
            <p className="tr-meta shrink-0 text-xs">
              {interpolate(copy.stepLabel, { step, total: TOTAL_STEPS })}
            </p>
          </div>
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {copy.steps.map((label, index) => {
              const number = index + 1
              const reachable = number < step || (number === step + 1 && stepIsValid)

              return (
                <button
                  key={label}
                  type="button"
                  aria-label={label}
                  disabled={!reachable && number !== step}
                  onClick={() => goToStep(number)}
                  className={clsx(
                    'h-1.5 rounded-full transition',
                    number <= step ? 'bg-brand-gradient' : 'bg-trimry-line',
                  )}
                />
              )
            })}
          </div>
        </div>
        <ol className="mt-3 hidden grid-cols-4 gap-2 sm:grid">
          {copy.steps.map((label, index) => {
            const number = index + 1
            const reachable = number < step || (number === step + 1 && stepIsValid)

            return (
              <li key={label} className="min-w-0">
                <button
                  type="button"
                  disabled={!reachable && number !== step}
                  onClick={() => goToStep(number)}
                  className={clsx(
                    'w-full min-w-0 rounded-2xl border px-3 py-2.5 text-left transition',
                    number === step
                      ? 'border-transparent bg-brand-gradient text-white shadow-glow'
                      : number < step
                        ? 'border-trimry-line bg-white text-trimry-ink hover:border-trimry-blue/40'
                        : 'border-trimry-line bg-trimry-surface text-trimry-muted',
                  )}
                >
                  <span className="block truncate text-[10px] font-black uppercase tracking-[0.16em] opacity-80">
                    {interpolate(copy.stepLabel, { step: number, total: TOTAL_STEPS })}
                  </span>
                  <span className="block truncate text-sm font-bold">{label}</span>
                </button>
              </li>
            )
          })}
        </ol>
      </header>

      <section className="tr-shell min-w-0 p-5 sm:p-8">
        {step === 1 ? (
          <>
            <h1 className="text-2xl sm:text-3xl">{copy.sportsTitle}</h1>
            <p className="tr-copy mt-2">{copy.sportsSubtitle}</p>
            <div className="mt-6">
              <SportPicker
                catalog={catalog}
                loading={catalogLoading}
                value={preferences.sports}
                onChange={(sports) =>
                  updatePreferences({
                    sports,
                    leagues: preferences.leagues.filter((league) => sports.includes(league.sport)),
                    teams: preferences.teams.filter((team) => sports.includes(team.sport)),
                  })
                }
              />
            </div>
            {preferences.sports.length === 0 ? (
              <p className="tr-meta mt-4 text-xs">{copy.sportsEmpty}</p>
            ) : null}
          </>
        ) : null}

        {step === 2 ? (
          <>
            <h1 className="text-2xl sm:text-3xl">{copy.teamsTitle}</h1>
            <p className="tr-copy mt-2">{copy.teamsSubtitle}</p>
            <div className="mt-6 space-y-8">
              <TeamSearch
                sports={preferences.sports}
                value={preferences.teams}
                onChange={(teams) => updatePreferences({ teams })}
              />
              <div>
                <h2 className="text-lg">{copy.leaguesTitle}</h2>
                <p className="tr-meta mt-1">{copy.leaguesHint}</p>
                <div className="mt-4">
                  <LeaguePicker
                    catalog={catalog}
                    sports={preferences.sports}
                    value={preferences.leagues}
                    onChange={(leagues) => updatePreferences({ leagues })}
                  />
                </div>
              </div>
              {preferences.leagues.length === 0 && preferences.teams.length === 0 ? (
                <p className="tr-alert-info text-xs">{copy.skipTeamsHint}</p>
              ) : null}
            </div>
          </>
        ) : null}

        {step === 3 && !isAuthenticated ? (
          <>
            <h1 className="text-2xl sm:text-3xl">{copy.accountTitle}</h1>
            <p className="tr-copy mt-2">{copy.accountSubtitle}</p>
            <form className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleRegister}>
              <label className="tr-label">
                {messages.auth.firstNameLabel}
                <input
                  type="text"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  required
                  autoComplete="given-name"
                  className="tr-input mt-2"
                />
              </label>
              <label className="tr-label">
                {messages.auth.emailLabel}
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                  className="tr-input mt-2"
                />
              </label>
              {error ? <p className="tr-alert-error sm:col-span-2">{error}</p> : null}
              <div className="sm:col-span-2">
                <HoneypotField value={honeypot} onChange={setHoneypot} />

                <button type="submit" disabled={registering || !accountLoaded} className="tr-btn-primary w-full sm:w-auto">
                  {registering ? messages.common.loading : messages.auth.registerButton}
                </button>
                <p className="tr-meta mt-3 text-xs">{messages.auth.termsNotice}</p>
                <p className="tr-meta mt-2 text-sm">
                  {copy.accountExistingHint}{' '}
                  <Link href="/account/login?redirect=/activate?step=3" className="tr-link">
                    {messages.auth.loginButton}
                  </Link>
                </p>
              </div>
            </form>
          </>
        ) : null}

        {step === 3 && isAuthenticated ? (
          <>
            <h1 className="text-2xl sm:text-3xl">{copy.deliveryTitle}</h1>
            <p className="tr-copy mt-2">{copy.deliverySubtitle}</p>
            <div className="mt-6 space-y-8">
              <RhythmPicker
                frequency={preferences.frequency}
                lookaheadDays={preferences.lookaheadDays}
                onFrequencyChange={(frequency) => updatePreferences({ frequency })}
                onLookaheadChange={(lookaheadDays) => updatePreferences({ lookaheadDays })}
              />

              <div>
                <p className="tr-label mb-2">{messages.pro.planPickerLabel}</p>
                <PlanPicker
                  value={plan}
                  onChange={choosePlan}
                  priceUsd={account?.subscription?.monthlyPriceUsd}
                />
              </div>

              {plan === 'pro' ? (
                <div>
                  <p className="tr-label mb-2">{copy.channelLabel}</p>
                  <DeliveryPreferenceSelector
                    value={deliveryPreference}
                    onChange={setDeliveryPreference}
                    includeNone={false}
                  />
                  {requiresWhatsappDelivery(deliveryPreference) ? (
                    <p className="tr-alert-info mt-3 text-xs">{messages.deliveryChannels.whatsappPendingNote}</p>
                  ) : null}
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="tr-label" htmlFor="delivery-hour">
                  {copy.hourLabel}
                  <DeliveryHourSelect
                    id="delivery-hour"
                    value={deliveryHourLocal}
                    onChange={setDeliveryHourLocal}
                    locale={language}
                    className="tr-input mt-2"
                  />
                  <span className="tr-meta mt-2 block text-xs">
                    {interpolate(copy.hourHint, { zone: timeZone })}
                  </span>
                </label>

                {requiresWhatsappDelivery(deliveryPreference) ? (
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
                ) : null}
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
            </div>
          </>
        ) : null}

        {step === 4 ? (
          <>
            <h1 className="text-2xl sm:text-3xl">{copy.reviewTitle}</h1>
            <p className="tr-copy mt-2">{copy.reviewSubtitle}</p>
            <div className="mt-6 space-y-6">
              <PreferencesSummary catalog={catalog} preferences={preferences} />
              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="tr-card-muted p-4">
                  <dt className="tr-eyebrow">{copy.reviewFrequency}</dt>
                  <dd className="mt-2 text-sm font-bold text-trimry-ink">
                    {preferences.frequency === 'weekly' ? copy.frequencyWeekly : copy.frequencyDaily}
                  </dd>
                </div>
                <div className="tr-card-muted p-4">
                  <dt className="tr-eyebrow">{copy.reviewChannel}</dt>
                  <dd className="mt-2 text-sm font-bold text-trimry-ink">
                    {deliveryPreference === 'email'
                      ? messages.deliveryChannels.emailTitle
                      : deliveryPreference === 'whatsapp'
                        ? messages.deliveryChannels.whatsappTitle
                        : deliveryPreference === 'both'
                          ? messages.deliveryChannels.bothTitle
                          : messages.deliveryChannels.noneTitle}
                  </dd>
                </div>
                <div className="tr-card-muted p-4">
                  <dt className="tr-eyebrow">{copy.reviewTiming}</dt>
                  <dd className="mt-2 text-sm font-bold text-trimry-ink">
                    {String(deliveryHourLocal).padStart(2, '0')}:00 · {timeZone}
                  </dd>
                </div>
              </dl>

              <div>
                <p className="tr-eyebrow mb-3">{copy.reviewPreviewTitle}</p>
                {isAuthenticated ? (
                  <UpcomingEventsFeed
                    feed={reviewFeed}
                    loading={reviewLoading}
                    emptyMessage={copy.reviewPreviewEmpty}
                    compact
                    maxEventsPerDay={4}
                  />
                ) : (
                  <p className="tr-alert-info text-sm">{copy.accountSubtitle}</p>
                )}
              </div>
            </div>
          </>
        ) : null}

        {error && !(step === 3 && !isAuthenticated) ? <p className="tr-alert-error mt-6">{error}</p> : null}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-trimry-line pt-5">
          <button
            type="button"
            onClick={() => goToStep(step - 1)}
            disabled={step === 1}
            className="tr-btn-secondary"
          >
            {messages.common.previous}
          </button>

          {step < TOTAL_STEPS ? (
            step === 3 && !isAuthenticated ? null : (
              <button
                type="button"
                onClick={() => goToStep(step + 1)}
                disabled={!stepIsValid}
                className="tr-btn-primary"
              >
                {messages.common.next}
              </button>
            )
          ) : (
            <div className="text-right">
              <button
                type="button"
                onClick={() => void handleStart()}
                disabled={saving || !isAuthenticated}
                className="tr-btn-primary px-7"
              >
                {saving
                  ? copy.saving
                  : hasLiveSubscription
                    ? copy.savePreferencesCta
                    : copy.startTrialCta}
              </button>
              {!hasLiveSubscription ? (
                <p className="tr-meta mt-2 text-xs">{copy.startTrialHint}</p>
              ) : null}
            </div>
          )}
        </div>
      </section>

      <ProUpgradeSheet
        open={proSheetOpen}
        priceUsd={account?.subscription?.monthlyPriceUsd}
        variant="checkout"
        onUpgrade={() => {
          trackEvent('pro_upgrade_clicked', { source: 'activate' })
          router.push('/checkout/start')
        }}
        onDismiss={() => {
          setProSheetOpen(false)
          choosePlan('free')
        }}
      />
    </div>
  )
}
