'use client'

import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'

import { StartFlowButton } from '@/components/start-flow-button'
import { useLanguage } from '@/components/language-provider'
import { trackEvent } from '@/lib/analytics'
import { SUBSCRIPTION_PLAN } from '@/lib/company'

type OracleTone = 'good' | 'bad' | 'rare'
const OPEN_LUCK_GURU_CHAT_EVENT = 'trimry:open-luck-guru-chat'
const LANDING_LAST_VISIT_KEY = 'trimry:landing-last-visit'
const LUCK_GURU_WHATSAPP_NUMBER = '34689269278'

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
  const trialPeriodDays = SUBSCRIPTION_PLAN.trialPeriodDays

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
          title: 'Trimry, tu guía de suerte',
          subtitle:
            `Empieza con ${trialPeriodDays} días gratis. Todos los días recibes tu proyección por email o WhatsApp, y en la web ves el calendario completo del mes para mantenerte alineado con la suerte.`,
          points: [`${trialPeriodDays} días gratis`, 'recordatorio diario', 'calendario mensual', 'Luck Guru con IA'],
          primary: `Comenzar ${trialPeriodDays} días gratis`,
          secondary: 'Preguntar al Luck Guru',
        }
      : language === 'pt'
        ? {
            title: 'Trimry, seu guia de sorte',
            subtitle:
              `Comece com ${trialPeriodDays} dias grátis. Todos os dias você recebe sua projeção por email ou WhatsApp, e na web vê o calendário completo do mês para se manter alinhado com a sorte.`,
            points: [`${trialPeriodDays} dias grátis`, 'lembrete diário', 'calendário mensal', 'Luck Guru com IA'],
            primary: `Começar ${trialPeriodDays} dias grátis`,
            secondary: 'Perguntar ao Luck Guru',
          }
      : {
          title: 'Trimry, Your Luck Guide',
          subtitle:
            `Start with ${trialPeriodDays} days free. Every day, receive your projection by email or WhatsApp, and use the web calendar to see the full month of fortune signals ahead.`,
          points: [`${trialPeriodDays} days free`, 'daily reminder', 'monthly calendar', 'AI Luck Guru'],
          primary: `Start ${trialPeriodDays} Days Free`,
          secondary: 'Ask The Luck Guru',
        }
  const teaserCopy =
    language === 'es'
      ? {
          badge: 'Lectura instantánea',
          title: 'Abre la señal de hoy y deja que Trimry ordene tu suerte.',
          line1: 'Tu guía cruza timing ritual, zodíaco, calendario chino y señales de abundancia.',
          line2: `Activa ${trialPeriodDays} días gratis para recibir el recordatorio diario por el canal que acordemos.`,
          cta: `Quiero ${trialPeriodDays} días gratis`,
        }
      : language === 'pt'
        ? {
            badge: 'Leitura instantânea',
            title: 'Abra o sinal de hoje e deixe a Trimry organizar sua sorte.',
            line1: 'Seu guia combina timing ritual, zodíaco, calendário chinês e sinais de abundância.',
            line2: `Ative ${trialPeriodDays} dias grátis para receber o lembrete diário pelo canal que combinarmos.`,
            cta: `Quero ${trialPeriodDays} dias grátis`,
          }
      : {
          badge: 'Instant reading',
          title: 'Open today’s signal and let Trimry organize your luck.',
          line1: 'Your guide blends ritual timing, zodiac, Chinese calendar, and abundance signals.',
          line2: `Start ${trialPeriodDays} days free to receive the daily reminder through the channel we agree.`,
          cta: `Start ${trialPeriodDays} Days Free`,
        }
  const luckGuruCardCopy =
    language === 'es'
      ? {
          eyebrow: '🍀 El Luck Guru está aquí',
          title: 'Tu suerte tiene señales. Nosotros las seguimos por ti.',
          text: 'Pregunta por dinero, relaciones, energía o por el mejor momento para soltar algo.',
          button: 'Preguntar al Luck Guru',
          note: 'Cabello · Dinero · Relaciones · Energía',
          topics: ['Cabello', 'Dinero', 'Relaciones', 'Energía'],
          whatsapp: 'Abrir WhatsApp',
        }
      : language === 'pt'
        ? {
            eyebrow: '🍀 O Luck Guru está aqui',
            title: 'Sua sorte tem sinais. Nós acompanhamos por você.',
            text: 'Pergunte sobre dinheiro, relacionamentos, energia ou o melhor momento para soltar algo.',
            button: 'Perguntar ao Luck Guru',
            note: 'Cabelo · Dinheiro · Relacionamentos · Energia',
            topics: ['Cabelo', 'Dinheiro', 'Relacionamentos', 'Energia'],
            whatsapp: 'Abrir WhatsApp',
          }
      : {
          eyebrow: '🍀 The Luck Guru is here',
          title: 'Your luck has signals. We track them for you.',
          text: 'Ask about money, relationships, energy, or the best moment to release something.',
          button: 'Ask The Luck Guru',
          note: 'Hair · Money · Relationships · Energy',
          topics: ['Hair', 'Money', 'Relationships', 'Energy'],
          whatsapp: 'Open WhatsApp',
        }

  const whatsappUrl = `https://wa.me/${LUCK_GURU_WHATSAPP_NUMBER}?text=${encodeURIComponent(
    language === 'es'
      ? 'Hola Luck Guru, quiero una guía rápida para hoy.'
      : language === 'pt'
        ? 'Olá Luck Guru, quero uma orientação rápida para hoje.'
      : 'Hi Luck Guru, I want quick guidance for today.',
  )}`

  const openLuckGuruChat = (location: string) => {
    trackEvent('ask_luck_guru_click', {
      language,
      location,
    })
    trackEvent('home_luck_guru_card_click', {
      language,
      destination: 'luck_guru_web_chat',
      location,
    })
    window.dispatchEvent(new CustomEvent(OPEN_LUCK_GURU_CHAT_EVENT))
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
            <ul className="mt-3 grid max-w-xs grid-cols-2 gap-2 text-sm text-cyan-100/92 sm:text-base">
              {heroCopy.points.map((point) => (
                <li
                  key={point}
                  className="rounded-xl border border-cyan-100/18 bg-cyan-100/8 px-3 py-2"
                >
                  {point}
                </li>
              ))}
            </ul>
            <div className="slide-up mt-7 flex flex-wrap gap-3">
              <StartFlowButton
                analyticsLocation="home_hero_primary"
                className="cosmic-button-primary rounded-full px-6 py-3 text-sm font-black uppercase tracking-[0.15em] transition"
              >
                {heroCopy.primary}
              </StartFlowButton>
              <button
                type="button"
                onClick={() => openLuckGuruChat('home_hero_secondary')}
                className="cosmic-button-secondary rounded-full px-6 py-3 text-sm font-black uppercase tracking-[0.15em] text-cyan-50 transition hover:bg-cyan-300/14"
              >
                {heroCopy.secondary}
              </button>
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
                    ? 'IA para señales de fortuna'
                    : language === 'pt'
                      ? 'IA para sinais de fortuna'
                      : 'AI fortune signals'}
                </p>
                <p className="mt-2 text-sm text-slate-100/90">
                  {language === 'es'
                    ? 'Haz una pregunta y deja que Luck Guru conecte tus señales.'
                    : language === 'pt'
                      ? 'Faça uma pergunta e deixe Luck Guru conectar seus sinais.'
                    : 'Ask one question and let Luck Guru connect your signals.'}
                </p>
                <button
                  type="button"
                  onClick={() => openLuckGuruChat('home_hero_guru_visual')}
                  className="cosmic-button-secondary mt-3 rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.15em] text-cyan-50"
                >
                  {heroCopy.secondary}
                </button>
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
              >
                {teaserCopy.cta}
              </StartFlowButton>
              <button
                type="button"
                onClick={() => openLuckGuruChat('home_teaser_secondary')}
                className="cosmic-button-secondary rounded-full px-5 py-3 text-sm font-black uppercase tracking-[0.15em] text-cyan-50"
              >
                {heroCopy.secondary}
              </button>
            </div>
          </div>
          <div className="grid gap-2 text-xs uppercase tracking-[0.16em] text-cyan-100/78 sm:min-w-[13rem]">
            <span className="rounded-2xl border border-cyan-100/18 bg-cyan-100/8 px-3 py-3 text-center">
              {language === 'es'
                ? 'Recordatorio diario'
                : language === 'pt'
                  ? 'Lembrete diário'
                  : 'Daily reminder'}
            </span>
            <span className="rounded-2xl border border-cyan-100/18 bg-cyan-100/8 px-3 py-3 text-center">
              {language === 'es'
                ? 'Email o WhatsApp'
                : language === 'pt'
                  ? 'Email ou WhatsApp'
                  : 'Email or WhatsApp'}
            </span>
            <span className="rounded-2xl border border-cyan-100/18 bg-cyan-100/8 px-3 py-3 text-center">
              {language === 'es'
                ? 'Mes completo'
                : language === 'pt'
                  ? 'Mês completo'
                  : 'Full month'}
            </span>
          </div>
        </div>
      </section>

      <section className="cosmic-panel relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_18%,rgba(247,223,161,0.18),transparent_30%),radial-gradient(circle_at_84%_8%,rgba(121,242,255,0.16),transparent_28%),linear-gradient(135deg,rgba(13,18,46,0.25),transparent)]" />
        <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="guru-aura relative mx-auto w-full max-w-[16rem] rounded-[2rem] border border-amber-200/36 bg-slate-950/45 p-3">
            <div className="guru-crystal-pulse relative aspect-[1/1] overflow-hidden rounded-[1.5rem] border border-amber-100/34">
              <Image
                src="/luck-guru-avatar.webp"
                alt="Luck Guru"
                fill
                sizes="(min-width: 1024px) 280px, 70vw"
                className="object-cover object-center"
              />
              <span className="guru-eye-glow pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(247,223,161,0.35),transparent_28%),radial-gradient(circle_at_52%_44%,transparent_42%,rgba(2,7,20,0.46)_100%)]" />
            </div>
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
            <p className="mt-3 text-sm font-semibold text-cyan-100/78">{luckGuruCardCopy.note}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {luckGuruCardCopy.topics.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() =>
                    openLuckGuruChat(
                      `home_guru_topic_${topic.toLowerCase().replace(/\s+/g, '_')}`,
                    )
                  }
                  className="rounded-full border border-cyan-100/20 bg-cyan-100/8 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-cyan-50 transition hover:bg-cyan-100/14"
                >
                  {topic}
                </button>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => openLuckGuruChat('home_guru_primary')}
                className="cosmic-button-primary inline-flex justify-center rounded-full px-6 py-3 text-sm font-black uppercase tracking-[0.16em] transition hover:-translate-y-0.5"
              >
                {luckGuruCardCopy.button}
              </button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() =>
                  trackEvent('whatsapp_open', {
                    language,
                    location: 'home_guru_section',
                  })
                }
                className="cosmic-button-secondary inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-cyan-50"
              >
                {luckGuruCardCopy.whatsapp}
              </a>
            </div>
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
