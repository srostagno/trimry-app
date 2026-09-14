'use client'

import clsx from 'clsx'

import { useLanguage } from '@/components/language-provider'
import { interpolate } from '@/lib/i18n'
import type { FeedEvent, UpcomingFeed } from '@/lib/sports'

type UpcomingEventsFeedProps = {
  feed: UpcomingFeed | null
  loading?: boolean
  error?: string
  emptyMessage?: string
  compact?: boolean
  maxEventsPerDay?: number
  showHighlights?: boolean
}

function eventTitle(event: FeedEvent) {
  if (event.homeTeamName && event.awayTeamName) {
    return `${event.homeTeamName} vs ${event.awayTeamName}`
  }

  return event.name
}

function ReasonBadge({ event }: { event: FeedEvent }) {
  const { messages } = useLanguage()

  if (event.matchReasons.includes('team')) {
    return <span className="tr-badge tr-badge-green">{messages.agenda.followedTeam}</span>
  }

  if (event.matchReasons.includes('league')) {
    return <span className="tr-badge tr-badge-blue">{messages.agenda.followedLeague}</span>
  }

  return null
}

export function EventRow({ event, compact = false }: { event: FeedEvent; compact?: boolean }) {
  const { messages } = useLanguage()
  const isLive = event.status === 'live'
  const isOff = event.status === 'postponed' || event.status === 'canceled'
  const meta = [event.leagueName, event.round, event.venue].filter(Boolean).join(' · ')

  return (
    <li className={clsx('tr-event-row', compact && 'p-3', isOff && 'opacity-60')}>
      <div className="tr-event-time">
        {isLive ? (
          <span className="tr-badge bg-rose-100 text-rose-700">Live</span>
        ) : event.localTimeLabel ? (
          event.localTimeLabel
        ) : (
          <span className="text-trimry-muted" aria-label={messages.agenda.timeTbc}>
            —
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p
          className={clsx(
            'break-words font-bold leading-snug text-trimry-ink',
            compact ? 'text-sm' : 'text-[15px]',
          )}
        >
          <span className="mr-1.5" aria-hidden="true">
            {event.sportEmoji}
          </span>
          {eventTitle(event)}
        </p>
        <p className="mt-0.5 truncate text-xs text-trimry-muted">
          {meta}
          {!event.localTimeLabel && !isLive ? ` · ${messages.agenda.timeTbc}` : ''}
          {isOff ? ` · ${event.status}` : ''}
        </p>
        <div className="mt-1.5 sm:hidden">
          <ReasonBadge event={event} />
        </div>
      </div>
      <div className="hidden sm:block">
        <ReasonBadge event={event} />
      </div>
    </li>
  )
}

export function UpcomingEventsFeed({
  feed,
  loading = false,
  error = '',
  emptyMessage,
  compact = false,
  maxEventsPerDay,
  showHighlights = false,
}: UpcomingEventsFeedProps) {
  const { messages } = useLanguage()

  if (loading && !feed) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((index) => (
          <div key={index} className="h-16 animate-pulse rounded-2xl bg-trimry-surface" />
        ))}
      </div>
    )
  }

  if (error && !feed) {
    return <p className="tr-alert-error">{error}</p>
  }

  if (!feed || feed.totalEvents === 0) {
    return (
      <div className="tr-card-muted p-6 text-center text-sm text-trimry-slate">
        {emptyMessage ?? messages.agenda.empty}
      </div>
    )
  }

  return (
    <div className={clsx('space-y-6', loading && 'opacity-70 transition')}>
      {showHighlights && feed.highlights.length > 0 ? (
        <section>
          <p className="tr-eyebrow mb-3">{messages.agenda.highlightsTitle}</p>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {feed.highlights.slice(0, 4).map((event) => (
              <li key={`highlight-${event.id}`} className="tr-gradient-panel min-w-0 overflow-hidden p-4 text-white">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/80">
                  {event.localDateLabel}
                  {event.localTimeLabel ? ` · ${event.localTimeLabel}` : ''}
                </p>
                <p className="mt-1.5 break-words text-base font-extrabold leading-tight">
                  <span className="mr-1.5" aria-hidden="true">
                    {event.sportEmoji}
                  </span>
                  {eventTitle(event)}
                </p>
                <p className="mt-1 truncate text-xs text-white/85">{event.leagueName}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {feed.days.map((day) => {
        const events = maxEventsPerDay ? day.events.slice(0, maxEventsPerDay) : day.events
        const hidden = day.events.length - events.length

        return (
          <section key={day.dateKey}>
            <div className="mb-2 flex min-w-0 items-baseline justify-between gap-3">
              <h3 className={clsx('min-w-0 truncate font-extrabold text-trimry-ink', compact ? 'text-sm' : 'text-base')}>
                {day.isToday ? messages.agenda.today : day.label}
                {day.isToday ? (
                  <span className="ml-2 text-xs font-semibold text-trimry-muted">{day.label}</span>
                ) : null}
              </h3>
              <span className="tr-meta shrink-0 whitespace-nowrap text-xs">
                {day.events.length === 1
                  ? messages.agenda.countLabelOne
                  : interpolate(messages.agenda.countLabel, { count: day.events.length })}
              </span>
            </div>
            <ul className="space-y-2">
              {events.map((event) => (
                <EventRow key={event.id} event={event} compact={compact} />
              ))}
            </ul>
            {hidden > 0 ? (
              <p className="tr-meta mt-2 text-xs">+{hidden}</p>
            ) : null}
          </section>
        )
      })}

      <p className="tr-meta text-xs">
        {interpolate(messages.agenda.timeZoneNote, { zone: feed.timeZone })}
      </p>
    </div>
  )
}
