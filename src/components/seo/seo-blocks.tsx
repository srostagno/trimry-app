import Link from 'next/link'

import { JsonLd } from '@/components/json-ld'
import { UpcomingEventsFeed } from '@/components/upcoming-events-feed'
import type { FeedEvent, UpcomingFeed } from '@/lib/sports'
import { absoluteUrl } from '@/lib/seo'
import { eventTitle, formatLongDate } from '@/lib/seo-copy'

// Server-rendered building blocks shared by the programmatic pages.

export function Breadcrumbs({ items }: { items: Array<{ href: string; label: string }> }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="tr-meta flex flex-wrap items-center gap-1 text-xs">
        {items.map((item, index) => (
          <span key={item.href} className="flex items-center gap-1">
            {index > 0 ? <span aria-hidden="true">›</span> : null}
            {index === items.length - 1 ? (
              <span className="text-trimry-ink">{item.label}</span>
            ) : (
              <Link href={item.href} className="hover:text-trimry-ink">
                {item.label}
              </Link>
            )}
          </span>
        ))}
      </nav>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.label,
            item: absoluteUrl(item.href),
          })),
        }}
      />
    </>
  )
}

export function NextEventCard({
  event,
  timeZoneLabel,
  eyebrow,
}: {
  event: FeedEvent | null
  timeZoneLabel: string
  eyebrow: string
}) {
  if (!event) {
    return (
      <div className="tr-card-muted p-6">
        <p className="tr-eyebrow">{eyebrow}</p>
        <p className="mt-2 text-lg font-bold text-trimry-ink">
          Sin partidos confirmados en los próximos 14 días.
        </p>
        <p className="tr-meta mt-1">
          Actualizamos el calendario varias veces al día; activa las alertas y te avisamos apenas se
          publique la fecha.
        </p>
      </div>
    )
  }

  return (
    <div className="tr-gradient-panel p-6 sm:p-8">
      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-white/80">{eyebrow}</p>
      <p className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">
        {event.localTimeLabel ?? 'Hora por confirmar'}
        <span className="ml-3 text-base font-semibold text-white/85">{timeZoneLabel}</span>
      </p>
      <p className="mt-3 text-xl font-bold">
        {event.sportEmoji} {eventTitle(event)}
      </p>
      <p className="mt-1 text-sm text-white/90">
        {formatLongDate(event.localDateKey)} · {event.leagueName}
        {event.round ? ` · ${event.round}` : ''}
        {event.venue ? ` · ${event.venue}` : ''}
      </p>
    </div>
  )
}

export function EventsSection({ title, feed, empty }: { title: string; feed: UpcomingFeed | null; empty: string }) {
  return (
    <section className="tr-shell p-6 sm:p-8">
      <h2 className="text-2xl">{title}</h2>
      <div className="mt-5">
        <UpcomingEventsFeed feed={feed} emptyMessage={empty} compact maxEventsPerDay={8} />
      </div>
    </section>
  )
}

export function FaqSection({ items }: { items: Array<{ question: string; answer: string }> }) {
  return (
    <section className="tr-shell p-6 sm:p-8">
      <h2 className="text-2xl">Preguntas frecuentes</h2>
      <dl className="mt-5 divide-y divide-trimry-line">
        {items.map((item) => (
          <div key={item.question} className="py-4">
            <dt className="text-base font-bold text-trimry-ink">{item.question}</dt>
            <dd className="tr-copy mt-1.5 text-sm leading-6">{item.answer}</dd>
          </div>
        ))}
      </dl>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: items.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: { '@type': 'Answer', text: item.answer },
          })),
        }}
      />
    </section>
  )
}

export function AlertsCta({ title, text, href }: { title: string; text: string; href: string }) {
  return (
    <section className="tr-hero px-6 py-8 sm:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="tr-eyebrow">Trimry</p>
          <h2 className="mt-2 text-2xl">{title}</h2>
          <p className="tr-copy mt-2 max-w-xl text-sm">{text}</p>
        </div>
        <Link href={href} className="tr-btn-primary shrink-0 px-7">
          Avísame por WhatsApp →
        </Link>
      </div>
    </section>
  )
}

export function LinkGrid({ title, links }: { title: string; links: Array<{ href: string; label: string }> }) {
  if (links.length === 0) return null

  return (
    <section>
      <h2 className="text-lg">{title}</h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="tr-chip text-xs">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function eventsJsonLd(events: FeedEvent[], pageUrl: string) {
  return events.slice(0, 10).map((event) => ({
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: eventTitle(event),
    startDate: event.startsAt,
    eventStatus:
      event.status === 'postponed'
        ? 'https://schema.org/EventPostponed'
        : event.status === 'canceled'
          ? 'https://schema.org/EventCancelled'
          : 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    ...(event.venue
      ? {
          location: {
            '@type': 'Place',
            name: event.venue,
            ...(event.city || event.country
              ? { address: [event.city, event.country].filter(Boolean).join(', ') }
              : {}),
          },
        }
      : {}),
    ...(event.homeTeamName && event.awayTeamName
      ? {
          homeTeam: { '@type': 'SportsTeam', name: event.homeTeamName },
          awayTeam: { '@type': 'SportsTeam', name: event.awayTeamName },
          competitor: [
            { '@type': 'SportsTeam', name: event.homeTeamName },
            { '@type': 'SportsTeam', name: event.awayTeamName },
          ],
        }
      : {}),
    organizer: { '@type': 'Organization', name: event.leagueName },
    url: pageUrl,
  }))
}
