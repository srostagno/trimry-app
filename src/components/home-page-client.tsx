'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

import { LuckBeliefCarousel } from '@/components/luck-belief-carousel'
import { StartFlowButton } from '@/components/start-flow-button'
import { useLanguage } from '@/components/language-provider'
import { trackEvent } from '@/lib/analytics'
import { GOOD_BAD_GUIDE_PATH } from '@/lib/seo'

type OracleTone = 'good' | 'bad' | 'rare'
const OPEN_LUCK_GURU_CHAT_EVENT = 'trimry:open-luck-guru-chat'

function toneClasses(tone: OracleTone) {
  return tone === 'good'
    ? 'oracle-tone-badge oracle-tone-badge-good'
    : tone === 'bad'
      ? 'oracle-tone-badge oracle-tone-badge-bad'
      : 'oracle-tone-badge oracle-tone-badge-rare'
}

export function HomePageClient() {
  const { language, messages } = useLanguage()

  const rotatingPredictions = useMemo(() => messages.home.predictions, [messages.home.predictions])

  const [activePredictionIndex, setActivePredictionIndex] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActivePredictionIndex((current) => (current + 1) % rotatingPredictions.length)
    }, 10000)

    return () => window.clearInterval(interval)
  }, [rotatingPredictions.length])

  const goToPreviousPrediction = () => {
    setActivePredictionIndex((current) =>
      current === 0 ? rotatingPredictions.length - 1 : current - 1,
    )
  }

  const goToNextPrediction = () => {
    setActivePredictionIndex((current) => (current + 1) % rotatingPredictions.length)
  }

  const activePrediction = rotatingPredictions[activePredictionIndex]
  const toneLabel =
    activePrediction.tone === 'good'
      ? messages.weekly.good.toUpperCase()
      : activePrediction.tone === 'bad'
        ? messages.weekly.bad.toUpperCase()
        : messages.weekly.rare.toUpperCase()
  const toneGlyph =
    activePrediction.tone === 'good'
      ? '↑'
      : activePrediction.tone === 'bad'
        ? '!'
        : '✦'
  const heroImages = [
    {
      src: '/hero-1.jpg',
      objectPosition: 'object-[50%_24%]',
    },
    {
      src: '/hero-2.jpg',
      objectPosition: 'object-center',
    },
    {
      src: '/hero-3.jpg',
      objectPosition: 'object-[50%_76%]',
    },
  ]
  const luckGuruCardCopy =
    language === 'es'
      ? {
          eyebrow: 'Luck Guru está despierto',
          title: 'Habla con tu guía de suerte.',
          text:
            'Cuéntale qué quieres atraer esta semana. Puede ayudarte a convertir intención, cortes simbólicos y positivismo en una rutina que se sienta personal.',
          button: 'Abrir conversación',
          note: 'Crea cuenta para que recuerde tu historia.',
        }
      : {
          eyebrow: 'Luck Guru is awake',
          title: 'Talk with your luck guide.',
          text:
            'Tell him what you want to attract this week. He can help turn intention, symbolic release, and optimism into a ritual that feels personal.',
          button: 'Open conversation',
          note: 'Create an account so he remembers your story.',
        }

  const openLuckGuruChat = () => {
    trackEvent('home_luck_guru_card_click', {
      language,
      destination: 'luck_guru_web_chat',
    })
    window.dispatchEvent(new CustomEvent(OPEN_LUCK_GURU_CHAT_EVENT))
  }

  return (
    <div className="space-y-20 pb-12">
      <section className="luck-glow cosmic-panel pulse-soft relative overflow-hidden rounded-[2.2rem] p-8 sm:p-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(90,243,220,0.24),transparent_33%),radial-gradient(circle_at_86%_0%,rgba(117,173,255,0.26),transparent_34%),radial-gradient(circle_at_70%_82%,rgba(247,221,145,0.14),transparent_32%)]" />
        <div className="pointer-events-none absolute -right-10 top-6 hidden h-56 w-56 rounded-full border border-cyan-200/35 md:block">
          <div className="orbit-ring absolute inset-3 rounded-full border border-cyan-200/30" />
          <div className="orbit-ring absolute inset-10 rounded-full border border-cyan-200/25 [animation-duration:24s]" />
          <span className="twinkle absolute left-2 top-5 text-2xl text-cyan-100">✦</span>
          <span className="twinkle-delay absolute bottom-4 right-6 text-xl text-amber-100">✧</span>
        </div>

        <div className="relative z-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="cosmic-badge slide-up inline-flex rounded-full px-4 py-1 text-xs font-bold uppercase tracking-[0.25em] text-cyan-100">
              {messages.hero.badge}
            </p>
            <h1 className="slide-up-delay mt-6 max-w-4xl text-4xl leading-[1.05] text-slate-50 sm:text-6xl lg:text-7xl">
              {messages.hero.title}
            </h1>
            <p className="slide-up mt-6 max-w-3xl text-lg text-slate-100/88 sm:text-xl">
              {messages.hero.subtitle}
            </p>
            <div className="slide-up mt-8 flex flex-wrap gap-4">
              <StartFlowButton
                analyticsLocation="home_hero_primary"
                className="cosmic-button-primary rounded-full px-7 py-3 text-sm font-black uppercase tracking-[0.17em] transition"
              >
                {messages.hero.primary}
              </StartFlowButton>
              <a
                href="#daily-oracle"
                onClick={() =>
                  trackEvent('home_teaser_click', {
                    cta_location: 'home_hero_secondary',
                    destination: '#daily-oracle',
                  })
                }
                className="cosmic-button-secondary rounded-full px-7 py-3 text-sm font-black uppercase tracking-[0.17em] text-cyan-50 transition hover:bg-cyan-300/14"
              >
                {messages.hero.secondary}
              </a>
            </div>
          </div>

          <aside className="cosmic-card relative overflow-hidden rounded-3xl p-4">
            <div className="overflow-hidden rounded-[1.5rem] border border-cyan-200/18 bg-slate-950/30 p-3">
              <div
                role="img"
                aria-label={messages.home.releaseImageAlt}
                className="grid aspect-[24/23] grid-cols-[1.15fr_0.85fr] gap-3"
              >
                {heroImages.map((image, index) => (
                  <div
                    key={`${image.src}-${index}`}
                    className={`relative overflow-hidden rounded-[1.2rem] border border-cyan-100/10 bg-slate-900/60 ${index === 0 ? 'row-span-2 min-h-[19rem]' : 'min-h-[9.25rem]'
                      }`}
                  >
                    <Image
                      src={image.src}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 28vw, (min-width: 640px) 42vw, 92vw"
                      className={`object-cover ${image.objectPosition}`}
                      priority={index === 0}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(6,17,29,0.02),rgba(6,17,29,0.2))]" />
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-5 rounded-2xl border border-cyan-200/18 bg-slate-950/35 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-100/78">
                {messages.home.releaseBadge}
              </p>
              <p className="mt-3 text-sm text-slate-100/84">{messages.home.releaseText}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.15em] text-cyan-100/72">
                {messages.home.releaseChannels}
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="cosmic-card relative overflow-hidden rounded-[2rem] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_30%,rgba(247,223,161,0.17),transparent_28%),radial-gradient(circle_at_90%_10%,rgba(121,242,255,0.12),transparent_28%),linear-gradient(135deg,rgba(17,23,61,0.22),transparent)]" />
        <div className="relative z-10 grid items-center gap-6 md:grid-cols-[auto_1fr_auto]">
          <div className="relative aspect-[1000/772] w-full overflow-hidden rounded-[2rem] border border-amber-200/32 bg-slate-950 shadow-[0_22px_60px_rgba(0,0,0,0.34),0_0_42px_rgba(247,223,161,0.16)] md:aspect-auto md:h-44 md:w-56 lg:h-48 lg:w-64">
            <Image
              src="/luck-guru-card.webp"
              alt="Luck Guru"
              fill
              sizes="(min-width: 1024px) 256px, (min-width: 768px) 224px, 92vw"
              className="object-cover object-center"
            />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_52%_28%,transparent_38%,rgba(3,7,19,0.34)_100%)]" />
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-100/82">
              {luckGuruCardCopy.eyebrow}
            </p>
            <h2 className="mt-2 text-3xl leading-tight text-slate-50 sm:text-4xl">
              {luckGuruCardCopy.title}
            </h2>
            <p className="mt-3 max-w-3xl text-slate-100/84">
              {luckGuruCardCopy.text}
            </p>
            <p className="mt-3 text-sm font-semibold text-cyan-100/78">
              {luckGuruCardCopy.note}
            </p>
          </div>

          <button
            type="button"
            onClick={openLuckGuruChat}
            className="cosmic-button-primary inline-flex justify-center rounded-full px-6 py-3 text-sm font-black uppercase tracking-[0.16em] transition hover:-translate-y-0.5"
          >
            {luckGuruCardCopy.button}
          </button>
        </div>
      </section>

      <LuckBeliefCarousel
        badge={messages.home.beliefBadge}
        title={messages.home.beliefTitle}
        subtitle={messages.home.beliefSubtitle}
      />

      <section id="how-it-works" className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: messages.story.card1Title,
            text: messages.story.card1Text,
            symbol: '☉',
          },
          {
            title: messages.story.card2Title,
            text: messages.story.card2Text,
            symbol: '✶',
          },
          {
            title: messages.story.card3Title,
            text: messages.story.card3Text,
            symbol: '☽',
          },
        ].map((card, index) => (
          <article
            key={card.title}
            className="cosmic-card relative overflow-hidden rounded-3xl p-6 slide-up"
            style={{ animationDelay: `${index * 90}ms` }}
          >
            <span className="absolute right-4 top-3 text-3xl text-cyan-100/55">{card.symbol}</span>
            <h2 className="text-2xl text-slate-50">{card.title}</h2>
            <p className="mt-3 text-slate-100/84">{card.text}</p>
          </article>
        ))}
      </section>

      <section id="daily-oracle" className="space-y-6">
        <div>
          <h2 className="text-3xl text-slate-50 sm:text-5xl">{messages.weekly.title}</h2>
          <p className="mt-2 max-w-3xl text-slate-100/84">{messages.weekly.subtitle}</p>
        </div>
        <article className="cosmic-card relative overflow-hidden rounded-3xl p-6 sm:p-8">
          <span className="twinkle absolute right-5 top-4 text-xl text-cyan-100">✶</span>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-100/75">
            {messages.home.teaserEyebrow}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-2xl text-slate-50 sm:text-3xl">{messages.home.couldBe}</span>
            <span className={toneClasses(activePrediction.tone)}>
              <span aria-hidden="true" className="oracle-tone-badge-icon">
                {toneGlyph}
              </span>
              {toneLabel}
            </span>
          </div>
          <p key={activePredictionIndex} className="mt-4 max-w-3xl text-lg text-slate-100/90 slide-up">
            {activePrediction.text}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={goToPreviousPrediction}
              className="rounded-full border border-cyan-200/30 bg-cyan-200/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-cyan-100"
            >
              {messages.common.previous}
            </button>
            <button
              type="button"
              onClick={goToNextPrediction}
              className="rounded-full border border-cyan-200/30 bg-cyan-200/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-cyan-100"
            >
              {messages.common.next}
            </button>
          </div>
          <p className="mt-5 text-sm text-cyan-100/82">{messages.home.teaserNote}</p>
          <StartFlowButton
            analyticsLocation="home_daily_oracle"
            className="cosmic-button-primary mt-6 inline-flex rounded-full px-5 py-3 text-sm font-black uppercase tracking-[0.15em] transition"
          >
            {messages.home.teaserButton}
          </StartFlowButton>
        </article>
      </section>

      <section className="cosmic-card rounded-3xl p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-100/78">
          {messages.home.seoGuideBadge}
        </p>
        <h2 className="mt-3 text-3xl text-slate-50 sm:text-4xl">{messages.home.seoGuideTitle}</h2>
        <p className="mt-3 max-w-3xl text-slate-100/84">{messages.home.seoGuideSubtitle}</p>
        <Link
          href={GOOD_BAD_GUIDE_PATH}
          className="cosmic-button-secondary mt-6 inline-flex rounded-full px-6 py-3 text-sm font-black uppercase tracking-[0.15em] text-cyan-50 transition hover:bg-cyan-300/14"
        >
          {messages.home.seoGuideButton}
        </Link>
      </section>

      <section id="pricing" className="cosmic-panel relative overflow-hidden rounded-[2rem] p-8 sm:p-10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full border border-cyan-200/20" />
        <h2 className="text-3xl text-slate-50 sm:text-5xl">{messages.pricing.title}</h2>
        <p className="mt-3 text-slate-100/84">{messages.pricing.subtitle}</p>
        <div className="cosmic-card mt-6 max-w-xl rounded-3xl p-6">
          <h3 className="text-2xl text-slate-50">{messages.pricing.planTitle}</h3>
          <p className="mt-2 text-lg font-bold text-cyan-100">{messages.pricing.billing}</p>
          <ul className="mt-5 space-y-2 text-slate-100/88">
            <li>{messages.pricing.include1}</li>
            <li>{messages.pricing.include2}</li>
            <li>{messages.pricing.include3}</li>
          </ul>
          <StartFlowButton
            analyticsLocation="home_pricing"
            className="cosmic-button-primary mt-6 inline-flex rounded-full px-5 py-3 text-sm font-black uppercase tracking-[0.15em] transition"
          >
            {messages.pricing.cta}
          </StartFlowButton>
        </div>
      </section>

      <section id="faq">
        <h2 className="text-3xl text-slate-50 sm:text-5xl">{messages.faq.title}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {[
            { q: messages.faq.q1, a: messages.faq.a1 },
            { q: messages.faq.q2, a: messages.faq.a2 },
            { q: messages.faq.q3, a: messages.faq.a3 },
            { q: messages.faq.q4, a: messages.faq.a4 },
          ].map((faq) => (
            <article key={faq.q} className="cosmic-card rounded-2xl p-5">
              <h3 className="text-lg text-slate-50">{faq.q}</h3>
              <p className="mt-2 text-slate-100/82">{faq.a}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="luck-glow cosmic-cta relative overflow-hidden rounded-[2rem] border border-cyan-200/28 p-8 text-center sm:p-12">
        <span className="twinkle absolute left-8 top-6 text-xl text-cyan-100">✶</span>
        <span className="twinkle-delay absolute bottom-8 right-10 text-xl text-amber-100">✦</span>
        <h2 className="text-3xl text-slate-50 sm:text-6xl">{messages.cta.title}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-slate-100/88">{messages.cta.subtitle}</p>
        <StartFlowButton
          analyticsLocation="home_final_cta"
          className="cosmic-button-primary mt-8 inline-flex rounded-full px-8 py-3 text-sm font-black uppercase tracking-[0.17em] transition"
        >
          {messages.cta.button}
        </StartFlowButton>
      </section>
    </div>
  )
}
