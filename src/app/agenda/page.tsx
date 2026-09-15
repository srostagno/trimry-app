'use client'

import clsx from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useLanguage } from '@/components/language-provider'
import { ShareAgendaButton } from '@/components/share-agenda-button'
import { EventRow, UpcomingEventsFeed } from '@/components/upcoming-events-feed'
import { trackEvent } from '@/lib/analytics'
import { interpolate } from '@/lib/i18n'
import { fetchMemberUpcomingEvents, type MemberUpcomingFeed, type SportKey } from '@/lib/sports'
import { fetchAccountSnapshot, type AccountSnapshot } from '@/lib/start-flow'
import { useSportsCatalog } from '@/components/sports-preferences-editor'

// Standalone agenda, and the destination of every digest CTA: the reader lands
// here on their own events instead of a dashboard tab.
export default function AgendaPage() {
  const { messages, language } = useLanguage()
  const copy = messages.agenda
  const router = useRouter()
  const { catalog } = useSportsCatalog()

  const [account, setAccount] = useState<AccountSnapshot | null>(null)
  const [feed, setFeed] = useState<MemberUpcomingFeed | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [days, setDays] = useState<number | null>(null)
  const [sport, setSport] = useState<SportKey | 'all'>('all')

  const load = useCallback(
    async (nextDays?: number) => {
      setLoading(true)
      setError('')

      try {
        const snapshot = await fetchAccountSnapshot()

        if (!snapshot) {
          router.replace('/account/login?redirect=/agenda')
          return
        }

        setAccount(snapshot)
        setFeed(await fetchMemberUpcomingEvents({ language, days: nextDays, refresh: false }))
      } catch {
        setError(copy.loadError)
      } finally {
        setLoading(false)
      }
    },
    [copy.loadError, language, router],
  )

  useEffect(() => {
    void load()
    trackEvent('agenda_page_viewed', {})
  }, [load])

  const sportsPresent = useMemo(() => {
    const seen = new Set<SportKey>()
    for (const day of feed?.days ?? []) {
      for (const event of day.events) {
        seen.add(event.sport)
      }
    }
    return Array.from(seen)
  }, [feed])

  // Client-side filter so switching sports is instant and costs no request.
  const visibleFeed = useMemo(() => {
    if (!feed || sport === 'all') return feed
    const filteredDays = feed.days
      .map((day) => ({ ...day, events: day.events.filter((event) => event.sport === sport) }))
      .filter((day) => day.events.length > 0)
    return {
      ...feed,
      days: filteredDays,
      highlights: feed.highlights.filter((event) => event.sport === sport),
      totalEvents: filteredDays.reduce((sum, day) => sum + day.events.length, 0),
    }
  }, [feed, sport])

  const nextEvent = useMemo(() => {
    for (const day of visibleFeed?.days ?? []) {
      const event = day.events.find((entry) => entry.status !== 'finished' && entry.status !== 'canceled')
      if (event) return event
    }
    return null
  }, [visibleFeed])

  const subscription = account?.subscription ?? null
  const trialDaysLeft =
    subscription?.status === 'active' && subscription.trialSource === 'internal' && subscription.internalTrialEndsAt
      ? Math.max(0, Math.ceil((new Date(subscription.internalTrialEndsAt).getTime() - Date.now()) / 86_400_000))
      : null
  const lookahead = days ?? feed?.lookaheadDays ?? 14

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="tr-shell min-w-0 overflow-hidden p-5 sm:p-8">
        <p className="tr-eyebrow">Trimry</p>
        <h1 className="mt-2 text-3xl sm:text-4xl">{copy.pageHeadline}</h1>
        {feed ? (
          <p className="tr-copy mt-3 max-w-2xl text-sm sm:text-base">
            {interpolate(copy.pageIntro, { zone: feed.timeZone })}
          </p>
        ) : null}
        {visibleFeed ? (
          <p className="tr-meta mt-2 text-xs">
            {interpolate(copy.eventsTotal, { count: visibleFeed.totalEvents, days: lookahead })}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <ShareAgendaButton feed={visibleFeed} source="agenda" className="tr-btn-primary" />
          <Link href="/dashboard?tab=preferences" className="tr-btn-secondary tr-btn-sm">
            {copy.manageCta}
          </Link>
          <Link href="/dashboard" className="tr-link text-xs">
            {copy.homeCta}
          </Link>
        </div>
      </header>

      {trialDaysLeft !== null ? (
        <div className="tr-card-muted flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-extrabold text-trimry-ink">
              {trialDaysLeft <= 1
                ? messages.dashboard.trialLastDay
                : interpolate(messages.dashboard.trialDaysLeft, { days: trialDaysLeft })}
            </p>
            <p className="tr-meta mt-0.5 text-xs">{messages.dashboard.trialNote}</p>
          </div>
          <Link href="/checkout/start" className="tr-btn-primary tr-btn-sm shrink-0">
            {interpolate(messages.dashboard.trialCta, { price: subscription?.monthlyPriceUsd ?? 2.99 })}
          </Link>
        </div>
      ) : null}

      {nextEvent ? (
        <section>
          <p className="tr-eyebrow mb-2">{copy.nextUp}</p>
          <ul className="space-y-2">
            <EventRow event={nextEvent} />
          </ul>
        </section>
      ) : null}

      {sportsPresent.length > 1 ? (
        <div className="tr-chip-strip">
          <button
            type="button"
            onClick={() => setSport('all')}
            className={clsx('tr-chip text-xs', sport === 'all' && 'tr-chip-active')}
          >
            {copy.allSports}
          </button>
          {sportsPresent.map((key) => {
            const entry = catalog.find((item) => item.key === key)
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setSport(key)
                  trackEvent('agenda_sport_filtered', { sport: key })
                }}
                className={clsx('tr-chip text-xs', sport === key && 'tr-chip-active')}
              >
                {entry?.emoji ?? '🏟️'} {entry?.label ?? key}
              </button>
            )
          })}
        </div>
      ) : null}

      <section className="tr-shell min-w-0 overflow-hidden p-5 sm:p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl">{copy.title}</h2>
          <label className="tr-meta flex items-center gap-2 text-xs">
            {copy.lookahead}
            <select
              value={lookahead}
              onChange={(event) => {
                const next = Number.parseInt(event.target.value, 10)
                setDays(next)
                void load(next)
              }}
              className="rounded-full border border-trimry-line bg-white px-3 py-1.5 text-xs font-bold text-trimry-ink"
            >
              {[3, 7, 14, 21].map((value) => (
                <option key={value} value={value}>
                  {value} {copy.days}
                </option>
              ))}
            </select>
          </label>
        </div>

        <UpcomingEventsFeed
          feed={visibleFeed}
          loading={loading}
          error={error}
          emptyMessage={feed?.hasPreferences === false ? copy.emptyNoPreferences : copy.empty}
          showHighlights
        />

        {feed?.hasPreferences === false ? (
          <Link href="/dashboard?tab=preferences" className="tr-btn-primary mt-5">
            {copy.emptyCta}
          </Link>
        ) : null}
      </section>
    </div>
  )
}
