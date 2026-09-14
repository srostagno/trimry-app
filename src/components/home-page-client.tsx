'use client'

import { Disclosure } from '@headlessui/react'
import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

import { useLanguage } from '@/components/language-provider'
import { openScoutChat } from '@/components/scout-chat-widget'
import { useSportsCatalog } from '@/components/sports-preferences-editor'
import { StartFlowButton } from '@/components/start-flow-button'
import { UpcomingEventsFeed } from '@/components/upcoming-events-feed'
import { trackEvent } from '@/lib/analytics'
import { detectBrowserTimeZone } from '@/lib/schedule'
import { fetchEventsPreview, type SportKey, type UpcomingFeed } from '@/lib/sports'

const PREVIEW_SPORTS: SportKey[] = [
  'soccer',
  'basketball',
  'american_football',
  'motorsport',
  'fighting',
  'tennis',
]

function LivePreview() {
  const { language, messages } = useLanguage()
  const { catalog } = useSportsCatalog()
  const [sport, setSport] = useState<SportKey>('soccer')
  const [feed, setFeed] = useState<UpcomingFeed | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [timeZone, setTimeZone] = useState('UTC')

  useEffect(() => {
    setTimeZone(detectBrowserTimeZone())
  }, [])

  useEffect(() => {
    let cancelled = false

    setLoading(true)
    setError('')

    fetchEventsPreview({ sport, days: 7, language, timeZone })
      .then((payload) => {
        if (!cancelled) {
          setFeed(payload)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(messages.home.previewError)
          setFeed(null)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [language, messages.home.previewError, sport, timeZone])

  const chips = useMemo(
    () =>
      PREVIEW_SPORTS.map((key) => {
        const entry = catalog.find((item) => item.key === key)
        return { key, label: entry?.label ?? key, emoji: entry?.emoji ?? '🏟️' }
      }),
    [catalog],
  )

  return (
    <div className="tr-shell min-w-0 overflow-hidden p-4 sm:p-6">
      <div className="tr-chip-strip">
        {chips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={() => {
              setSport(chip.key)
              trackEvent('home_preview_sport_selected', { sport: chip.key })
            }}
            className={clsx('tr-chip text-xs', chip.key === sport && 'tr-chip-active')}
          >
            <span aria-hidden="true">{chip.emoji}</span>
            {chip.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        <UpcomingEventsFeed
          feed={feed}
          loading={loading}
          error={error}
          emptyMessage={messages.home.previewEmpty}
          compact
          maxEventsPerDay={4}
        />
      </div>
    </div>
  )
}

export function HomePageClient() {
  const { messages } = useLanguage()

  return (
    <div className="space-y-20 pb-8">
      <section className="tr-hero px-5 py-10 sm:px-10 sm:py-16 lg:px-14">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="tr-fade-up min-w-0">
            <p className="tr-badge tr-badge-blue">{messages.home.badge}</p>
            <h1 className="mt-5 break-words text-[2.5rem] leading-[1.05] sm:text-5xl lg:text-6xl">
              {messages.home.title}{' '}
              <span className="tr-gradient-text">{messages.home.titleHighlight}</span>
            </h1>
            <p className="tr-copy mt-5 max-w-xl text-lg">{messages.home.subtitle}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <StartFlowButton className="tr-btn-primary px-7" analyticsLocation="hero">
                {messages.home.primaryCta}
              </StartFlowButton>
              <Link href="#how-it-works" className="tr-btn-secondary">
                {messages.home.secondaryCta}
              </Link>
            </div>
            <p className="tr-meta mt-4 text-xs">{messages.home.trustLine}</p>
          </div>

          <div className="tr-fade-up-delay relative min-w-0">
            <div className="tr-float absolute -left-6 -top-8 hidden lg:block">
              <Image
                src="/brand/trimry-icon-rounded-256.png"
                alt=""
                width={88}
                height={88}
                priority
                className="h-22 w-22 rounded-3xl shadow-glow"
              />
            </div>
            <p className="tr-eyebrow mb-3">{messages.home.previewEyebrow}</p>
            <h2 className="text-2xl">{messages.home.previewTitle}</h2>
            <p className="tr-meta mt-1 mb-4">{messages.home.previewSubtitle}</p>
            <LivePreview />
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-24">
        <p className="tr-eyebrow">{messages.home.stepsEyebrow}</p>
        <h2 className="mt-2 text-3xl sm:text-4xl">{messages.home.stepsTitle}</h2>
        <ol className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {messages.home.steps.map((step, index) => (
            <li key={step.title} className="tr-card p-6">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-sm font-black text-white">
                {index + 1}
              </span>
              <h3 className="mt-4 text-lg">{step.title}</h3>
              <p className="tr-copy mt-2 text-sm leading-6">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="sports" className="scroll-mt-24">
        <p className="tr-eyebrow">{messages.home.channelsEyebrow}</p>
        <h2 className="mt-2 text-3xl sm:text-4xl">{messages.home.channelsTitle}</h2>
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {messages.home.channels.map((channel, index) => (
            <div key={channel.title} className="tr-card-muted p-6">
              <span className="text-2xl" aria-hidden="true">
                {index === 0 ? '✉️' : index === 1 ? '💬' : '📱'}
              </span>
              <h3 className="mt-3 text-lg">{channel.title}</h3>
              <p className="tr-copy mt-2 text-sm leading-6">{channel.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="tr-gradient-panel px-5 py-10 sm:px-10 sm:py-14">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div className="min-w-0">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-white/80">
              {messages.home.scoutEyebrow}
            </p>
            <h2 className="mt-2 text-3xl text-white sm:text-4xl">{messages.home.scoutTitle}</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/90">{messages.home.scoutText}</p>
            <button
              type="button"
              onClick={() => {
                trackEvent('scout_cta_click', { cta_location: 'home_scout_section' })
                openScoutChat()
              }}
              className="tr-btn mt-6 bg-white text-trimry-ink hover:bg-white/90"
            >
              {messages.home.scoutCta}
            </button>
          </div>
          <ul className="min-w-0 space-y-3">
            {messages.home.scoutBullets.map((bullet, index) => (
              <li
                key={bullet}
                className={clsx(
                  'max-w-sm break-words rounded-2xl px-4 py-3 text-sm font-semibold shadow-card',
                  index % 2 === 0
                    ? 'ml-auto rounded-tr-md bg-trimry-ink text-white'
                    : 'rounded-tl-md bg-white text-trimry-ink',
                )}
              >
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="pricing" className="scroll-mt-24">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="tr-eyebrow">{messages.pricing.eyebrow}</p>
            <h2 className="mt-2 text-3xl sm:text-4xl">{messages.pricing.title}</h2>
            <p className="tr-copy mt-3 max-w-md">{messages.pricing.subtitle}</p>
          </div>
          <div className="tr-shell min-w-0 p-6 sm:p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <h3 className="text-xl">{messages.pricing.planTitle}</h3>
              <p className="text-2xl font-extrabold text-trimry-ink">{messages.pricing.billing}</p>
            </div>
            <p className="tr-meta mt-1">{messages.pricing.trialNote}</p>
            <ul className="mt-5 space-y-2.5">
              {messages.pricing.includes.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-trimry-slate">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-trimry-green/15 text-[11px] font-black text-emerald-700">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <StartFlowButton className="tr-btn-primary mt-6 w-full" analyticsLocation="pricing">
              {messages.pricing.cta}
            </StartFlowButton>
            <p className="tr-meta mt-3 text-xs">{messages.pricing.cancelNote}</p>
          </div>
        </div>
      </section>

      <section id="faq" className="scroll-mt-24">
        <h2 className="text-3xl sm:text-4xl">{messages.faq.title}</h2>
        <div className="mt-6 divide-y divide-trimry-line rounded-3xl border border-trimry-line bg-white">
          {messages.faq.items.map((item) => (
            <Disclosure key={item.question} as="div" className="px-5 py-4">
              {({ open }) => (
                <>
                  <Disclosure.Button className="flex w-full items-center justify-between gap-4 text-left">
                    <span className="text-base font-bold text-trimry-ink">{item.question}</span>
                    <span
                      className={clsx(
                        'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-trimry-surface text-trimry-blue transition',
                        open && 'rotate-45',
                      )}
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </Disclosure.Button>
                  <Disclosure.Panel className="tr-copy mt-3 text-sm leading-6">
                    {item.answer}
                  </Disclosure.Panel>
                </>
              )}
            </Disclosure>
          ))}
        </div>
      </section>

      <section className="tr-hero px-5 py-12 text-center sm:px-10">
        <h2 className="text-3xl sm:text-4xl">{messages.home.finalTitle}</h2>
        <p className="tr-copy mt-3">{messages.home.finalSubtitle}</p>
        <div className="mt-6 flex justify-center">
          <StartFlowButton className="tr-btn-primary px-8" analyticsLocation="footer_cta">
            {messages.home.primaryCta}
          </StartFlowButton>
        </div>
      </section>
    </div>
  )
}
