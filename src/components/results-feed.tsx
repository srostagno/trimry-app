'use client'

import clsx from 'clsx'
import { useState } from 'react'

import { useLanguage } from '@/components/language-provider'
import { interpolate } from '@/lib/i18n'
import type { ResultEvent, ResultsDay, ResultsFeed as ResultsFeedData } from '@/lib/sports'

// Days shown before the reader asks for the rest: enough to cover a weekend
// without burying the upcoming agenda underneath.
const COLLAPSED_DAYS = 2

function OutcomeBadge({ event }: { event: ResultEvent }) {
  const { messages } = useLanguage()
  const copy = messages.agenda

  if (event.outcome === 'win') {
    return <span className="tr-badge tr-badge-green">{copy.won}</span>
  }

  if (event.outcome === 'loss') {
    return <span className="tr-badge bg-rose-100 text-rose-700">{copy.lost}</span>
  }

  if (event.outcome === 'draw') {
    return <span className="tr-badge tr-badge-slate">{copy.drew}</span>
  }

  if (!event.scoreLabel && event.result.winner) {
    return <span className="tr-badge tr-badge-amber">🏆 {copy.winner}</span>
  }

  return null
}

// The side the reader follows reads heavier, so a glance says who they are.
function sideClass(event: ResultEvent, side: 'home' | 'away') {
  return event.followedSide === side
    ? 'font-extrabold text-trimry-ink'
    : 'font-semibold text-trimry-slate'
}

function Scoreline({ event }: { event: ResultEvent }) {
  if (event.scoreLabel && event.homeTeamName && event.awayTeamName) {
    return (
      <p className="flex min-w-0 flex-wrap items-baseline gap-x-2 text-[15px] leading-snug">
        <span className="mr-0.5" aria-hidden="true">
          {event.sportEmoji}
        </span>
        <span className={clsx('min-w-0 break-words', sideClass(event, 'home'))}>{event.homeTeamName}</span>
        <span className="rounded-lg bg-trimry-ink px-2 py-0.5 text-sm font-extrabold tabular-nums text-white">
          {event.scoreLabel}
        </span>
        <span className={clsx('min-w-0 break-words', sideClass(event, 'away'))}>{event.awayTeamName}</span>
      </p>
    )
  }

  return (
    <p className="break-words text-[15px] font-bold leading-snug text-trimry-ink">
      <span className="mr-1.5" aria-hidden="true">
        {event.sportEmoji}
      </span>
      {event.name}
    </p>
  )
}

function detail(event: ResultEvent) {
  const parts: string[] = []

  if (event.result.scoreText && event.result.scoreText !== event.scoreLabel) {
    parts.push(event.result.scoreText)
  }

  if (!event.scoreLabel && event.result.winner) {
    parts.push(event.result.winner)
  }

  if (event.result.summary && !event.scoreLabel) {
    parts.push(event.result.summary)
  }

  return parts.join(' · ')
}

export function ResultRow({ event }: { event: ResultEvent }) {
  const meta = [event.leagueName, event.round, detail(event) || null].filter(Boolean).join(' · ')

  return (
    <li className="tr-event-row">
      <div className="tr-event-time text-trimry-muted">{event.localTimeLabel ?? '—'}</div>
      <div className="min-w-0">
        <Scoreline event={event} />
        <p className="mt-0.5 break-words text-xs text-trimry-muted">{meta}</p>
        <div className="mt-1.5 sm:hidden">
          <OutcomeBadge event={event} />
        </div>
      </div>
      <div className="hidden sm:block">
        <OutcomeBadge event={event} />
      </div>
    </li>
  )
}

function dayTitle(day: ResultsDay, copy: ReturnType<typeof useLanguage>['messages']['agenda']) {
  if (day.isToday) return copy.today
  if (day.isYesterday) return copy.yesterday
  return day.label
}

export function ResultsFeed({
  results,
  loading = false,
  emptyMessage,
}: {
  results: ResultsFeedData | null
  loading?: boolean
  emptyMessage?: string
}) {
  const { messages } = useLanguage()
  const copy = messages.agenda
  const [expanded, setExpanded] = useState(false)

  if (loading && !results) {
    return (
      <div className="space-y-3">
        {[0, 1].map((index) => (
          <div key={index} className="h-16 animate-pulse rounded-2xl bg-trimry-surface" />
        ))}
      </div>
    )
  }

  if (!results || results.totalResults === 0) {
    return (
      <div className="tr-card-muted p-6 text-center text-sm text-trimry-slate">
        {emptyMessage ?? copy.resultsEmpty}
      </div>
    )
  }

  const days = expanded ? results.days : results.days.slice(0, COLLAPSED_DAYS)
  const shown = days.reduce((sum, day) => sum + day.events.length, 0)
  const hidden = results.totalResults - shown

  return (
    <div className={clsx('space-y-6', loading && 'opacity-70 transition')}>
      {days.map((day) => (
        <section key={day.dateKey}>
          <div className="mb-2 flex min-w-0 items-baseline justify-between gap-3">
            <h3 className="min-w-0 truncate text-base font-extrabold text-trimry-ink">
              {dayTitle(day, copy)}
              {day.isToday || day.isYesterday ? (
                <span className="ml-2 text-xs font-semibold text-trimry-muted">{day.label}</span>
              ) : null}
            </h3>
            <span className="tr-meta shrink-0 whitespace-nowrap text-xs">
              {day.events.length === 1
                ? copy.resultsCountOne
                : interpolate(copy.resultsCount, { count: day.events.length })}
            </span>
          </div>
          <ul className="space-y-2">
            {day.events.map((event) => (
              <ResultRow key={event.id} event={event} />
            ))}
          </ul>
        </section>
      ))}

      {hidden > 0 || expanded ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="tr-btn-secondary tr-btn-sm"
        >
          {expanded
            ? copy.showFewerResults
            : interpolate(copy.showAllResults, { count: results.totalResults })}
        </button>
      ) : null}
    </div>
  )
}
