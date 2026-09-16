'use client'

import clsx from 'clsx'
import { useState } from 'react'

import { useLanguage } from '@/components/language-provider'
import { trackEvent } from '@/lib/analytics'
import { interpolate } from '@/lib/i18n'
import { MAX_SHARE_DAYS, packAgendaDays } from '@/lib/agenda-share'
import type { UpcomingFeed } from '@/lib/sports'

// Turns the agenda on screen into a branded PNG and hands it to whatever the
// device does best: the native share sheet on phones, the clipboard on desktop,
// a download as a last resort.
export function ShareAgendaButton({
  feed,
  className,
  source,
}: {
  feed: UpcomingFeed | null
  className?: string
  source: string
}) {
  const { messages } = useLanguage()
  const copy = messages.agenda
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState('')

  const eventTitle = (event: UpcomingFeed['days'][number]['events'][number]) =>
    event.homeTeamName && event.awayTeamName
      ? `${event.homeTeamName} vs ${event.awayTeamName}`
      : event.name

  const buildPayload = () => {
    const { days: shown, shownCount } = packAgendaDays(
      (feed?.days ?? []).slice(0, MAX_SHARE_DAYS).map((day) => ({
        label: day.isToday ? `${copy.today} · ${day.label}` : day.label,
        events: day.events.map((event) => ({
          time: event.localTimeLabel,
          title: eventTitle(event),
          league: event.leagueName,
          sport: event.sport,
          emoji: event.sportEmoji,
        })),
      })),
    )
    const hidden = (feed?.totalEvents ?? 0) - shownCount

    return {
      heading: copy.shareHeading,
      subheading: interpolate(copy.shareSubheading, {
        count: feed?.totalEvents ?? 0,
        zone: feed?.timeZone ?? '',
      }),
      footer: copy.shareFooter,
      moreLabel: hidden > 0 ? interpolate(copy.shareMore, { count: hidden }) : null,
      days: shown,
    }
  }

  const handleClick = async () => {
    if (!feed || feed.totalEvents === 0 || busy) return

    setBusy(true)
    setNote('')

    try {
      const response = await fetch('/api/agenda-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      })

      if (!response.ok) {
        throw new Error('image request failed')
      }

      const blob = await response.blob()
      const file = new File([blob], 'trimry-agenda.png', { type: 'image/png' })

      if (navigator.canShare?.({ files: [file] }) && navigator.share) {
        await navigator.share({ files: [file], text: copy.shareText })
        trackEvent('agenda_shared', { method: 'share_sheet', source, events: feed.totalEvents })
        return
      }

      if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
        setNote(copy.shareCopied)
        trackEvent('agenda_shared', { method: 'clipboard', source, events: feed.totalEvents })
        return
      }

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'trimry-agenda.png'
      link.click()
      URL.revokeObjectURL(url)
      trackEvent('agenda_shared', { method: 'download', source, events: feed.totalEvents })
    } catch (error) {
      // A cancelled share sheet throws AbortError; that is not a failure.
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }

      setNote(copy.shareError)
    } finally {
      setBusy(false)
    }
  }

  if (!feed || feed.totalEvents === 0) {
    return null
  }

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <button
        type="button"
        onClick={() => void handleClick()}
        disabled={busy}
        className={clsx('tr-btn-secondary tr-btn-sm', className)}
      >
        {busy ? copy.sharePreparing : copy.shareCta}
      </button>
      {note ? <p className="tr-meta text-xs">{note}</p> : null}
    </div>
  )
}
