'use client'

import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'

import { StartFlowButton } from '@/components/start-flow-button'
import { useLanguage } from '@/components/language-provider'
import { trackEvent } from '@/lib/analytics'

type OracleTone = 'good' | 'bad' | 'rare'
const LANDING_LAST_VISIT_KEY = 'trimry:landing-last-visit'

function toneClasses(tone: OracleTone) {
  return tone === 'good'
    ? 'oracle-tone-badge oracle-tone-badge-good'
    : tone === 'bad'
      ? 'oracle-tone-badge oracle-tone-badge-bad'
      : 'oracle-tone-badge oracle-tone-badge-rare'
}

function toDayKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function calculateDayDiff(from: string, to: string) {
  const fromDate = new Date(`${from}T00:00:00`)
  const toDate = new Date(`${to}T00:00:00`)

  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    return 0
  }

  const msPerDay = 24 * 60 * 60 * 1000
  return Math.round((toDate.getTime() - fromDate.getTime()) / msPerDay)
}

export function HomePageClient() {
  const { language, messages } = useLanguage()
  const startNowCopy =
    language === 'es'
      ? {
          label: 'Empieza ahora',
          title: 'Empieza a tener más suerte ahora haciendo clic en el botón.',
          loadingLabel: 'Abriendo...',
        }
      : language === 'pt'
        ? {
            label: 'Comece agora',
            title: 'Comece a ter mais sorte agora clicando no botão.',
            loadingLabel: 'Abrindo...',
          }
        : {
            label: 'Start Now',
            title: 'Start being luckier now by clicking the above button.',
            loadingLabel: 'Opening...',
          }

  const rotatingPredictions = useMemo(() => messages.home.predictions, [messages.home.predictions])
  const teaserRef = useRef<HTMLElement | null>(null)
  const trackedScrollHalfRef = useRef(false)
  const trackedTeaserViewRef = useRef(false)

  const [activePredictionIndex, setActivePredictionIndex] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActivePredictionIndex((current) => (current + 1) % rotatingPredictions.length)
    }, 10000)

    return () => window.clearInterval(interval)
  }, [rotatingPredictions.length])

  useEffect(() => {
    trackEvent('landing_page_view', {
      language,
      page: 'home',
    })

    if (typeof window === 'undefined') {
      return
    }

    const todayKey = toDayKey(new Date())
    const previousVisit = window.localStorage.getItem(LANDING_LAST_VISIT_KEY)

    if (previousVisit) {
      const dayDiff = calculateDayDiff(previousVisit, todayKey)

      if (dayDiff >= 1) {
        trackEvent('return_next_day', {
          language,
          day_diff: dayDiff,
        })
      }
    }

    window.localStorage.setItem(LANDING_LAST_VISIT_KEY, todayKey)
  }, [language])

  useEffect(() => {
    const handleScroll = () => {
      if (trackedScrollHalfRef.current) {
        return
      }

      const documentHeight = document.documentElement.scrollHeight
      const progress = (window.scrollY + window.innerHeight) / documentHeight

      if (progress >= 0.5) {
        trackedScrollHalfRef.current = true
        trackEvent('scroll_50', { language })
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [language])

  useEffect(() => {
    const element = teaserRef.current

    if (!element || trackedTeaserViewRef.current) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]

        if (!entry || !entry.isIntersecting || trackedTeaserViewRef.current) {
          return
        }

        trackedTeaserViewRef.current = true
        trackEvent('teaser_view', {
          language,
          placement: 'home_post_hero',
        })
        observer.disconnect()
      },
      {
        threshold: 0.35,
      },
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [language])

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
  const luckScoreByPrediction = [78, 83, 76, 69, 88, 81, 84, 66, 90]
  const luckScore = luckScoreByPrediction[activePredictionIndex % luckScoreByPrediction.length]
  const heroCopy =
    language === 'es'
      ? {
          title: 'Manifiesta mejor suerte',
          subtitle:
            'Descubre el ritmo oculto de tus símbolos y abre una planificación personalizada para tomar mejores decisiones.',
          primary: 'Empezar ahora',
        }
      : language === 'pt'
        ? {
            title: 'Manifeste mais sorte',
            subtitle:
              'Descubra o ritmo oculto dos seus símbolos e abra um planejamento personalizado para tomar melhores decisões.',
            primary: 'Comece agora',
          }
        : {
            title: 'Manifest Better Luck',
            subtitle:
              'Discover the hidden rhythm of your symbols and open a personalized plan for making better-timed decisions.',
            primary: 'Start Now',
          }
  const teaserCopy =
    language === 'es'
      ? {
          badge: 'Lectura instantánea',
          title: 'Abre la señal de hoy y deja que Trimry ordene tu suerte.',
          line1: 'Tu guía cruza timing ritual, zodíaco, calendario chino y señales de abundancia.',
          line2: 'Empieza el flujo y revela cómo se están alineando tus símbolos personales.',
          cta: 'Empezar ahora',
        }
      : language === 'pt'
        ? {
            badge: 'Leitura instantânea',
            title: 'Abra o sinal de hoje e deixe a Trimry organizar sua sorte.',
            line1: 'Seu guia combina timing ritual, zodíaco, calendário chinês e sinais de abundância.',
            line2: 'Comece o fluxo e revele como seus símbolos pessoais estão se alinhando.',
            cta: 'Comece agora',
          }
      : {
          badge: 'Instant reading',
          title: 'Open today’s signal and let Trimry organize your luck.',
          line1: 'Your guide blends ritual timing, zodiac, Chinese calendar, and abundance signals.',
          line2: 'Start the flow and reveal how your personal symbols are aligning.',
          cta: 'Start Now',
        }

  return (
    <div className="space-y-12 pb-12">
      <section className="luck-glow cosmic-panel pulse-soft relative overflow-hidden rounded-[2.2rem] p-6 sm:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(90,243,220,0.24),transparent_33%),radial-gradient(circle_at_86%_0%,rgba(117,173,255,0.26),transparent_34%),radial-gradient(circle_at_70%_82%,rgba(247,221,145,0.14),transparent_32%)]" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="cosmic-badge slide-up inline-flex rounded-full px-4 py-1 text-xs font-bold uppercase tracking-[0.22em] text-cyan-100">
              {language === 'es'
                ? 'Guía de suerte'
                : language === 'pt'
                  ? 'Guia de sorte'
                  : 'Your Luck Guide'}
            </p>
            <h1 className="slide-up-delay mt-5 max-w-4xl text-4xl leading-[1.04] text-slate-50 sm:text-6xl lg:text-7xl">
              {heroCopy.title}
            </h1>
            <p className="slide-up mt-5 text-base text-slate-100/88 sm:text-lg">
              {heroCopy.subtitle}
            </p>
            <div className="slide-up mt-7 flex flex-wrap gap-3">
              <StartFlowButton
                analyticsLocation="home_hero_primary"
                className="cosmic-button-primary rounded-full px-6 py-3 text-sm font-black uppercase tracking-[0.15em] transition"
                title={startNowCopy.title}
                loadingLabel={startNowCopy.loadingLabel}
              >
                {startNowCopy.label}
              </StartFlowButton>
            </div>
          </div>

          <aside className="guru-aura cosmic-card relative min-h-[26rem] overflow-hidden rounded-3xl sm:min-h-[29rem] lg:min-h-[31rem]">
            <div className="guru-crystal-pulse absolute inset-0">
              <Image
                src="/luck-guru-card.webp"
                alt="Luck Guru"
                fill
                priority
                sizes="(min-width: 1024px) 34vw, (min-width: 640px) 42vw, 96vw"
                className="object-cover object-center"
              />
              <span className="guru-eye-glow pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_52%_24%,rgba(250,236,184,0.34),transparent_28%),linear-gradient(180deg,rgba(3,9,23,0.08)_16%,rgba(3,9,23,0.58)_72%,rgba(3,9,23,0.86)_100%)]" />
            </div>

            <div className="relative z-10 flex h-full flex-col justify-end p-5 sm:p-6">
              <div className="rounded-2xl border border-cyan-100/26 bg-slate-950/42 p-4 backdrop-blur-sm">
                <p className="text-xs font-bold uppercase tracking-[0.17em] text-cyan-100/84">
                  {language === 'es'
                    ? 'Calendario personal'
                    : language === 'pt'
                      ? 'Calendário pessoal'
                      : 'Personal calendar'}
                </p>
                <p className="mt-2 text-sm text-slate-100/90">
                  {language === 'es'
                    ? 'Revela tus símbolos, pide un deseo y descubre cuándo conviene avanzar.'
                    : language === 'pt'
                      ? 'Revele seus símbolos, faça um pedido e descubra quando avançar.'
                    : 'Reveal your symbols, make a wish, and discover when to move.'}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section
        ref={teaserRef}
        id="daily-oracle"
        className="cosmic-card relative overflow-hidden rounded-[2rem] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_30%,rgba(247,223,161,0.17),transparent_28%),radial-gradient(circle_at_90%_10%,rgba(121,242,255,0.12),transparent_28%),linear-gradient(135deg,rgba(17,23,61,0.22),transparent)]" />
        <div className="relative z-10 grid items-start gap-6 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-100/82">
              {teaserCopy.badge}
            </p>
            <h2 className="mt-2 text-3xl leading-tight text-slate-50 sm:text-4xl">
              {teaserCopy.title}
            </h2>
            <p className="mt-3 max-w-3xl text-slate-100/84">{teaserCopy.line1}</p>
            <p className="mt-2 max-w-3xl text-slate-100/84">{teaserCopy.line2}</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="text-2xl text-slate-50 sm:text-3xl">
                {language === 'es'
                  ? 'Podría ser...'
                  : language === 'pt'
                    ? 'Pode ser...'
                    : 'Could be...'}
              </span>
              <span className={toneClasses(activePrediction.tone)}>
                <span aria-hidden="true" className="oracle-tone-badge-icon">
                  {toneGlyph}
                </span>
                {toneLabel}
              </span>
              <span className="rounded-full border border-amber-200/32 bg-amber-200/12 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-amber-50">
                {language === 'es'
                  ? `Suerte hoy: ${luckScore}/100`
                  : language === 'pt'
                    ? `Sorte hoje: ${luckScore}/100`
                  : `Luck score today: ${luckScore}/100`}
              </span>
            </div>
            <p key={activePredictionIndex} className="mt-4 max-w-3xl text-lg text-slate-100/90 slide-up">
              {activePrediction.text}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
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
            <div className="mt-6 flex flex-wrap gap-3">
              <StartFlowButton
                analyticsLocation="home_teaser_primary"
                className="cosmic-button-primary inline-flex rounded-full px-5 py-3 text-sm font-black uppercase tracking-[0.15em] transition"
                title={startNowCopy.title}
                loadingLabel={startNowCopy.loadingLabel}
              >
                {startNowCopy.label}
              </StartFlowButton>
            </div>
          </div>
          <div className="grid gap-2 text-xs uppercase tracking-[0.16em] text-cyan-100/78 sm:min-w-[13rem]">
            <span className="rounded-2xl border border-cyan-100/18 bg-cyan-100/8 px-3 py-3 text-center">
              {language === 'es'
                ? 'Símbolos personales'
                : language === 'pt'
                  ? 'Símbolos pessoais'
                  : 'Personal symbols'}
            </span>
            <span className="rounded-2xl border border-cyan-100/18 bg-cyan-100/8 px-3 py-3 text-center">
              {language === 'es'
                ? 'Timing tibetano'
                : language === 'pt'
                  ? 'Timing tibetano'
                  : 'Tibetan timing'}
            </span>
            <span className="rounded-2xl border border-cyan-100/18 bg-cyan-100/8 px-3 py-3 text-center">
              {language === 'es'
                ? 'Vista de calendario'
                : language === 'pt'
                  ? 'Vista de calendário'
                  : 'Calendar view'}
            </span>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="grid gap-4 md:grid-cols-3">
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
            className="cosmic-card relative overflow-hidden rounded-3xl p-5 slide-up"
            style={{ animationDelay: `${index * 90}ms` }}
          >
            <span className="absolute right-4 top-3 text-3xl text-cyan-100/55">{card.symbol}</span>
            <h2 className="text-xl text-slate-50">{card.title}</h2>
            <p className="mt-2 text-sm text-slate-100/84">{card.text}</p>
          </article>
        ))}
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
            title={startNowCopy.title}
            loadingLabel={startNowCopy.loadingLabel}
          >
            {startNowCopy.label}
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
          title={startNowCopy.title}
          loadingLabel={startNowCopy.loadingLabel}
        >
          {startNowCopy.label}
        </StartFlowButton>
      </section>
    </div>
  )
}
