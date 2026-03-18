'use client'

import { useEffect, useState } from 'react'

import { useLanguage } from '@/components/language-provider'
import {
  getLuckBeliefQuotes,
  type LuckBeliefQuote,
} from '@/lib/luck-belief-quotes'

type LuckBeliefCarouselProps = {
  badge: string
  title: string
  subtitle: string
  quotes?: LuckBeliefQuote[]
  compact?: boolean
}

export function LuckBeliefCarousel({
  badge,
  title,
  subtitle,
  quotes,
  compact = false,
}: LuckBeliefCarouselProps) {
  const { language, messages } = useLanguage()
  const quoteList = quotes ?? getLuckBeliefQuotes(language)
  const [activeIndex, setActiveIndex] = useState(0)
  const activeQuote = quoteList[activeIndex]

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % quoteList.length)
    }, 7600)

    return () => window.clearInterval(intervalId)
  }, [quoteList.length])

  const goToPreviousQuote = () => {
    setActiveIndex((current) => (current === 0 ? quoteList.length - 1 : current - 1))
  }

  const goToNextQuote = () => {
    setActiveIndex((current) => (current + 1) % quoteList.length)
  }

  return (
    <section
      className={`luck-glow cosmic-panel relative overflow-hidden rounded-[2rem] ${
        compact ? 'p-6 sm:p-7' : 'p-8 sm:p-10'
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_14%,rgba(141,255,225,0.16),transparent_26%),radial-gradient(circle_at_100%_0%,rgba(111,163,255,0.18),transparent_30%),radial-gradient(circle_at_60%_100%,rgba(246,217,132,0.12),transparent_30%)]" />
      <div className="relative z-10">
        <p className="cosmic-badge inline-flex rounded-full px-4 py-1 text-xs font-bold uppercase tracking-[0.24em] text-cyan-100">
          {badge}
        </p>
        <h2 className={`mt-5 text-slate-50 ${compact ? 'text-3xl sm:text-4xl' : 'text-4xl sm:text-5xl'}`}>
          {title}
        </h2>
        <p className="mt-3 max-w-3xl text-slate-100/82">{subtitle}</p>

        <div className="mt-7 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="cosmic-card rounded-[1.7rem] p-6 sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-100/72">
              {messages.carousel.proofLabel}
            </p>
            <blockquote
              key={activeIndex}
              className="mt-5 max-w-3xl text-2xl leading-[1.35] text-slate-50 slide-up sm:text-3xl"
            >
              &ldquo;{activeQuote.quote}&rdquo;
            </blockquote>
            <div className="mt-5">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-100">
                {activeQuote.author}
              </p>
              <p className="mt-1 text-sm text-slate-100/72">{activeQuote.context}</p>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={goToPreviousQuote}
                className="rounded-full border border-cyan-200/30 bg-cyan-300/10 px-3 py-1 text-xs font-black uppercase tracking-[0.15em] text-cyan-100"
              >
                {messages.common.previous}
              </button>
              <button
                type="button"
                onClick={goToNextQuote}
                className="rounded-full border border-cyan-200/30 bg-cyan-300/10 px-3 py-1 text-xs font-black uppercase tracking-[0.15em] text-cyan-100"
              >
                {messages.common.next}
              </button>
            </div>
          </article>

          <div className="grid gap-4">
            <div className="cosmic-card rounded-[1.6rem] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-100/72">
                {messages.carousel.whyTitle}
              </p>
              <p className="mt-3 text-slate-100/82">{messages.carousel.whyText}</p>
            </div>
            <div className="cosmic-card rounded-[1.6rem] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-100/72">
                {messages.carousel.effectTitle}
              </p>
              <p className="mt-3 text-slate-100/82">{messages.carousel.effectText}</p>
            </div>
            <div className="rounded-[1.6rem] border border-cyan-200/18 bg-slate-950/35 p-5">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.2em] text-cyan-100/72">
                <span>{messages.carousel.sequenceLabel}</span>
                <span>
                  {activeIndex + 1}/{quoteList.length}
                </span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-900/80">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#d7fff2,#90f7ea_42%,#75d4ff)] transition-all duration-500"
                  style={{ width: `${((activeIndex + 1) / quoteList.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
