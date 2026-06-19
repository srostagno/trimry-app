'use client'

import clsx from 'clsx'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { useLanguage } from '@/components/language-provider'
import { trackEvent, trackMetaCustomEvent } from '@/lib/analytics'
import { apiFetch, readApiError } from '@/lib/api-client'
import { SUBSCRIPTION_PLAN } from '@/lib/company'
import { buildFortuneDay, type ActivityTone } from '@/lib/fortune'
import { languageToIntlLocale, normalizeLanguageCode, type LanguageCode } from '@/lib/i18n'
import { buildPersonalSignProfile } from '@/lib/personal-signs'
import { DEFAULT_WEEKLY_DELIVERY_HOUR } from '@/lib/schedule'
import {
  type AccountSnapshot,
  fetchAccountSnapshot,
} from '@/lib/start-flow'

type TodayPreview = {
  dayKey: string
  date: string
  weekday: string
  summary: ActivityTone
  summaryLabel: string
  headline: string
  unlockLine: string
  luckScore: number
  notes: string
  activities: {
    haircut: ActivityTone
    shave: ActivityTone
    nails: ActivityTone
    release: ActivityTone
  }
}

type CalendarPreviewDay = {
  dayKey: string
  date: string
  weekday: string
  summary: ActivityTone
  notes: string
  locked: boolean
}

type ActivationFlowCopy = {
  title: string
  subtitle: string
  stepTitles: [string, string, string, string]
  step1: {
    badge: string
    title: string
    body: string
    bullets: [string, string, string]
    videoBadge: string
  }
  step2: {
    badge: string
    title: string
    body: string
    previewBadge: string
    strongPrefix: string
    avoidPrefix: string
    personalSignal: string
    zodiac: string
    chineseCalendar: string
    pendingPersonalTitle: string
    pendingPersonalBody: string
    nextLabel: string
  }
  step3: {
    badge: string
    title: string
    body: string
    nextWeekLocked: string
    unlockLine: string
  }
  step4: {
    badge: string
    title: string
    body: string
    benefits: [string, string, string]
    trialBadge: string
    unsubscribeTitle: string
    unsubscribeBody: string
    cta: string
  }
  nav: {
    back: string
    next: string
    continueTo: string
    stepLabel: string
  }
}

const TOTAL_STEPS = 4

function toUtcDayKey(date: Date) {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function toUtcDateFromKey(dayKey: string) {
  return new Date(`${dayKey}T12:00:00.000Z`)
}

function addUtcDays(referenceDate: Date, days: number) {
  const base = new Date(referenceDate)
  base.setUTCHours(12, 0, 0, 0)
  base.setUTCDate(base.getUTCDate() + days)
  return base
}

function toneLabel(language: LanguageCode, tone: ActivityTone) {
  if (tone === 'good') {
    return language === 'es' ? 'BUENO' : language === 'pt' ? 'BOM' : 'GOOD'
  }

  if (tone === 'bad') {
    return language === 'es' ? 'MALO' : language === 'pt' ? 'RUIM' : 'BAD'
  }

  return language === 'en' ? 'RARE' : 'RARO'
}

function toneBadgeClass(tone: ActivityTone) {
  return clsx(
    'oracle-tone-badge',
    tone === 'good'
      ? 'oracle-tone-badge-good'
      : tone === 'bad'
        ? 'oracle-tone-badge-bad'
        : 'oracle-tone-badge-rare',
  )
}

function toneGlyph(tone: ActivityTone) {
  return tone === 'good' ? '↑' : tone === 'bad' ? '!' : '✦'
}

function buildLuckScore(tone: ActivityTone) {
  if (tone === 'good') {
    return 84
  }

  if (tone === 'rare') {
    return 69
  }

  return 43
}

function buildHeadline(language: LanguageCode, tone: ActivityTone) {
  if (tone === 'good') {
    return language === 'es'
      ? 'Hoy favorece el movimiento, la claridad y los cambios limpios.'
      : language === 'pt'
        ? 'Hoje favorece movimento, clareza e mudanças limpas.'
        : 'Today favors movement, clarity, and clean changes.'
  }

  if (tone === 'bad') {
    return language === 'es'
      ? 'Hoy pide paciencia, mantenimiento y cero presión.'
      : language === 'pt'
        ? 'Hoje pede paciência, manutenção e zero pressão.'
        : 'Today asks for patience, maintenance, and no pressure.'
  }

  return language === 'es'
    ? 'Hoy se abre de forma extraña. Mantente atento a una oportunidad.'
    : language === 'pt'
      ? 'Hoje se abre de um jeito incomum. Fique atento a uma oportunidade.'
      : 'Today bends in an unusual way. Stay alert for an opening.'
}

function buildUnlockLine(language: LanguageCode) {
  return language === 'es'
    ? 'Desbloquea Trimry para recibir tu proyección diaria por email, WhatsApp o ambos, abrir tu calendario mensual y activar Luck Guru.'
    : language === 'pt'
      ? 'Desbloqueie a Trimry para receber sua projeção diária por email, WhatsApp ou ambos, abrir seu calendário mensal e ativar o Luck Guru.'
      : 'Unlock Trimry to receive your daily projection by email, WhatsApp, or both, open your monthly calendar, and activate Luck Guru.'
}

function buildStrongAndCautionLabels(
  language: LanguageCode,
  activities: TodayPreview['activities'],
) {
  const strong = Object.entries(activities)
    .filter(([, tone]) => tone === 'good')
    .map(([activity]) => activity)

  const caution = Object.entries(activities)
    .filter(([, tone]) => tone === 'bad')
    .map(([activity]) => activity)

  const labelMap = language === 'es'
    ? {
        haircut: 'cabello',
        shave: 'afeitado',
        nails: 'unas',
        release: 'soltar',
      }
    : language === 'pt'
      ? {
          haircut: 'cabelo',
          shave: 'barba',
          nails: 'unhas',
          release: 'soltar',
        }
      : {
          haircut: 'haircuts',
          shave: 'shaving',
          nails: 'nails',
          release: 'release',
        }

  return {
    strong: strong.map((activity) => labelMap[activity as keyof typeof labelMap]),
    caution: caution.map((activity) => labelMap[activity as keyof typeof labelMap]),
  }
}

function createPreviewFromFortune(language: LanguageCode, date: Date) {
  const fortune = buildFortuneDay(date, languageToIntlLocale(language))

  return {
    dayKey: toUtcDayKey(date),
    date: fortune.date,
    weekday: fortune.weekday,
    summary: fortune.summary,
    summaryLabel: toneLabel(language, fortune.summary),
    headline: buildHeadline(language, fortune.summary),
    unlockLine: buildUnlockLine(language),
    luckScore: buildLuckScore(fortune.summary),
    notes: fortune.notes,
    activities: fortune.activities,
  } satisfies TodayPreview
}

function getActivationFlowCopy(
  language: LanguageCode,
  trialDays: number,
): ActivationFlowCopy {
  if (language === 'es') {
    return {
      title: 'Bienvenido a tu ritual de suerte',
      subtitle:
        'En cuatro pasos vas a entender como funciona Trimry, ver tu señal de hoy, abrir una vista del calendario y activar tu prueba gratis.',
      stepTitles: [
        'Propuesta de valor',
        'Proyeccion de hoy',
        'Calendario proximo',
        'Activa tu trial',
      ],
      step1: {
        badge: 'Paso 1',
        title: 'Trimry te ayuda a manifestar suerte, fortuna y mas apertura real a oportunidades.',
        body:
          'Te guiamos diariamente mostrando como se alinean tus simbolos personales, los ritmos tibetanos y los alineamientos astrales para que actues con mejor timing.',
        bullets: [
          'Lectura diaria clara para tomar mejores decisiones.',
          'Combinamos zodiaco, calendario chino y capas rituales.',
          'Recibes direccion concreta para sostener positivismo y atraccion.',
        ],
        videoBadge: 'Video demo (autoplay)',
      },
      step2: {
        badge: 'Paso 2',
        title: 'Descubre la proyeccion de hoy',
        body:
          'Luck Guru abre tu suerte del dia. A la izquierda el canal visual; a la derecha la lectura accionable completa.',
        previewBadge: 'Fortuna revelada',
        strongPrefix: 'Fuerte',
        avoidPrefix: 'Evita',
        personalSignal: 'Senal personal',
        zodiac: 'Zodiaco',
        chineseCalendar: 'Calendario chino',
        pendingPersonalTitle: 'Senal personal pendiente',
        pendingPersonalBody:
          'Agrega tu fecha de nacimiento en perfil para desbloquear tu capa zodiacal y calendario chino aqui.',
        nextLabel: 'Seguir al paso 3',
      },
      step3: {
        badge: 'Paso 3',
        title: 'Calendario proximos dias',
        body:
          'Tenemos tu calendario personalizado de la suerte listo. Aqui tienes un preview con los proximos 3 dias y la siguiente semana bloqueada.',
        nextWeekLocked: 'Proxima semana bloqueada',
        unlockLine: 'Desbloquea el trial para abrir el calendario completo con todos los dias.',
      },
      step4: {
        badge: 'Paso 4',
        title: 'El proposito de Trimry es hacerte sentir alineado con la suerte del universo.',
        body:
          'Cuando sostienes este marco de manifestacion, sube el positivismo y la apertura a oportunidades que terminan trayendo mas suerte, fortuna y exito en lo que anhelas.',
        benefits: [
          'Recibes una guia diaria lista para actuar.',
          'Activas recordatorios por email, WhatsApp o ambos.',
          'Tienes acceso al calendario mensual y Luck Guru.',
        ],
        trialBadge: `${trialDays} dias gratis`,
        unsubscribeTitle: 'Cancelar es facil',
        unsubscribeBody:
          'Puedes desuscribirte en cualquier momento desde tu cuenta, sin friccion y en pocos clics.',
        cta: `Empezar trial gratis de ${trialDays} dias`,
      },
      nav: {
        back: 'Atras',
        next: 'Siguiente',
        continueTo: 'Continuar a',
        stepLabel: 'Paso',
      },
    }
  }

  if (language === 'pt') {
    return {
      title: 'Bem-vindo ao seu ritual de sorte',
      subtitle:
        'Em quatro passos voce entende como a Trimry funciona, ve o sinal de hoje, abre um preview do calendario e ativa seu teste gratis.',
      stepTitles: [
        'Proposta de valor',
        'Projecao de hoje',
        'Calendario proximo',
        'Ativar trial',
      ],
      step1: {
        badge: 'Passo 1',
        title: 'A Trimry ajuda voce a manifestar sorte, fortuna e mais abertura a oportunidades.',
        body:
          'Mostramos diariamente como seus simbolos pessoais se alinham aos ritmos tibetanos e alinhamentos astrais para melhorar seu timing.',
        bullets: [
          'Leitura diaria clara para decidir melhor.',
          'Combinamos zodiaco, calendario chines e camadas rituais.',
          'Direcao pratica para reforcar positivismo e atracao.',
        ],
        videoBadge: 'Video demo (autoplay)',
      },
      step2: {
        badge: 'Passo 2',
        title: 'Descubra a projecao de hoje',
        body:
          'Luck Guru abre sua sorte do dia. Visual de um lado; leitura acionavel do outro.',
        previewBadge: 'Fortuna revelada',
        strongPrefix: 'Forte',
        avoidPrefix: 'Evite',
        personalSignal: 'Sinal pessoal',
        zodiac: 'Zodiaco',
        chineseCalendar: 'Calendario chines',
        pendingPersonalTitle: 'Sinal pessoal pendente',
        pendingPersonalBody:
          'Adicione sua data de nascimento no perfil para liberar sua camada zodiacal e chinesa aqui.',
        nextLabel: 'Ir para passo 3',
      },
      step3: {
        badge: 'Passo 3',
        title: 'Calendario dos proximos dias',
        body:
          'Seu calendario personalizado ja esta pronto. Aqui esta um preview dos proximos 3 dias e da proxima semana bloqueada.',
        nextWeekLocked: 'Proxima semana bloqueada',
        unlockLine: 'Desbloqueie o trial para abrir o calendario completo com todos os dias.',
      },
      step4: {
        badge: 'Passo 4',
        title: 'O proposito da Trimry e fazer voce se sentir alinhado com a sorte do universo.',
        body:
          'Com essa base de manifestacao, voce amplia positivismo e abertura a oportunidades que geram mais sorte, fortuna e sucesso.',
        benefits: [
          'Guia diaria pronta para agir.',
          'Lembretes por email, WhatsApp ou ambos.',
          'Calendario mensal completo e Luck Guru.',
        ],
        trialBadge: `${trialDays} dias gratis`,
        unsubscribeTitle: 'Cancelar e simples',
        unsubscribeBody:
          'Voce pode cancelar quando quiser na conta, em poucos cliques.',
        cta: `Comecar trial gratis de ${trialDays} dias`,
      },
      nav: {
        back: 'Voltar',
        next: 'Seguinte',
        continueTo: 'Continuar para',
        stepLabel: 'Passo',
      },
    }
  }

  return {
    title: 'Welcome to your luck alignment ritual',
    subtitle:
      'In four steps you will understand how Trimry works, see today’s projection, preview your calendar, and activate your free trial.',
    stepTitles: [
      'Value proposition',
      'Today projection',
      'Calendar preview',
      'Activate trial',
    ],
    step1: {
      badge: 'Step 1',
      title: 'Trimry helps you manifest luck, fortune, positivity, and magnetic confidence.',
      body:
        'Every day we show how your personal symbols align with Tibetan rhythms and astral alignments so you can move with better timing.',
      bullets: [
        'Daily guidance for sharper choices.',
        'Blend of zodiac, Chinese calendar, and ritual timing.',
        'Practical signals that strengthen optimism and attraction.',
      ],
      videoBadge: 'Demo video (autoplay)',
    },
    step2: {
      badge: 'Step 2',
      title: 'Discover today’s projection',
      body:
        'Luck Guru opens your daily signal. Visual channel on one side, actionable reading on the other.',
      previewBadge: 'Fortune revealed',
      strongPrefix: 'Strong',
      avoidPrefix: 'Avoid',
      personalSignal: 'Personal signal',
      zodiac: 'Zodiac',
      chineseCalendar: 'Chinese calendar',
      pendingPersonalTitle: 'Personal signal pending',
      pendingPersonalBody:
        'Add your birth date in profile to unlock your zodiac and Chinese calendar layer here.',
      nextLabel: 'Continue to step 3',
    },
    step3: {
      badge: 'Step 3',
      title: 'Next days calendar preview',
      body:
        'Your personalized luck calendar is ready. Here is a preview with the next 3 days plus the following week locked.',
      nextWeekLocked: 'Next week locked',
      unlockLine: 'Unlock the trial to open the complete calendar.',
    },
    step4: {
      badge: 'Step 4',
      title: 'Trimry exists to keep you aligned with the luck of the universe.',
      body:
        'This manifestation frame increases positivity and openness to opportunities that often become more luck, fortune, and success in what matters most to you.',
      benefits: [
        'Daily guidance you can act on immediately.',
        'Reminders by email, WhatsApp, or both.',
        'Full monthly calendar and Luck Guru access.',
      ],
      trialBadge: `${trialDays} days free`,
      unsubscribeTitle: 'Easy to unsubscribe',
      unsubscribeBody:
        'Cancel anytime from your account in just a few clicks.',
      cta: `Start ${trialDays}-day free trial`,
    },
    nav: {
      back: 'Back',
      next: 'Next',
      continueTo: 'Continue to',
      stepLabel: 'Step',
    },
  }
}

function buildCalendarPreview(language: LanguageCode) {
  const locale = languageToIntlLocale(language)

  return Array.from({ length: 7 }, (_, index) => {
    const dayOffset = index + 1
    const targetDate = addUtcDays(new Date(), dayOffset)
    const dayKey = toUtcDayKey(targetDate)
    const fallback = buildFortuneDay(targetDate, locale)

    return {
      dayKey,
      date: fallback.date,
      weekday: fallback.weekday,
      summary: fallback.summary,
      notes: fallback.notes,
      locked: index >= 3,
    }
  })
}

export default function ActivationGatewayPage() {
  const router = useRouter()
  const { language, messages } = useLanguage()
  const resolvedLanguage = normalizeLanguageCode(language)
  const trialDays = SUBSCRIPTION_PLAN.stripeTrialPeriodDays
  const copy = useMemo(
    () => getActivationFlowCopy(resolvedLanguage, trialDays),
    [resolvedLanguage, trialDays],
  )

  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState(false)
  const [flowError, setFlowError] = useState('')
  const [account, setAccount] = useState<AccountSnapshot | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [todayPreview, setTodayPreview] = useState<TodayPreview>(() =>
    createPreviewFromFortune(resolvedLanguage, new Date()),
  )
  const [calendarPreview, setCalendarPreview] = useState<CalendarPreviewDay[]>([])

  const personalSigns = useMemo(
    () => buildPersonalSignProfile(account?.user.birthDate, resolvedLanguage, todayPreview.summary),
    [account?.user.birthDate, resolvedLanguage, todayPreview.summary],
  )
  const todayLabels = useMemo(
    () => buildStrongAndCautionLabels(resolvedLanguage, todayPreview.activities),
    [resolvedLanguage, todayPreview.activities],
  )
  const previewDateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(languageToIntlLocale(resolvedLanguage), {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
      }),
    [resolvedLanguage],
  )
  const progressPercent = (currentStep / TOTAL_STEPS) * 100

  useEffect(() => {
    let cancelled = false

    const loadActivationFlow = async () => {
      try {
        const currentAccount = await fetchAccountSnapshot()

        if (!currentAccount) {
          router.replace('/account/login')
          return
        }

        const status = currentAccount.subscription?.status ?? null

        if (
          status === 'active' ||
          status === 'past_due' ||
          status === 'paused' ||
          status === 'canceled'
        ) {
          router.replace('/dashboard')
          return
        }

        if (status === 'pending_checkout') {
          router.replace('/checkout/start')
          return
        }

        const dayKey = toUtcDayKey(new Date())
        const locale = languageToIntlLocale(resolvedLanguage)

        if (!cancelled) {
          setAccount(currentAccount)
          setCalendarPreview(buildCalendarPreview(resolvedLanguage))
        }

        const previewResponse = await apiFetch(
          `/luck-guru/today-preview?date=${encodeURIComponent(dayKey)}&locale=${encodeURIComponent(locale)}`,
          { cache: 'no-store' },
          { retryUnauthorized: false },
        )

        if (cancelled || !previewResponse.ok) {
          return
        }

        const payload = (await previewResponse.json()) as Partial<TodayPreview>

        if (payload.summary && payload.headline && payload.notes) {
          setTodayPreview({
            ...createPreviewFromFortune(resolvedLanguage, new Date()),
            ...payload,
            summaryLabel: toneLabel(resolvedLanguage, payload.summary),
            luckScore: payload.luckScore ?? buildLuckScore(payload.summary),
          })
        }
      } catch {
        if (!cancelled) {
          setFlowError(
            resolvedLanguage === 'es'
              ? 'No pudimos cargar tu onboarding en este momento.'
              : resolvedLanguage === 'pt'
                ? 'Nao conseguimos carregar seu onboarding agora.'
                : 'Unable to load your onboarding right now.',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadActivationFlow()

    return () => {
      cancelled = true
    }
  }, [resolvedLanguage, router])

  useEffect(() => {
    if (loading) {
      return
    }

    trackEvent('activate_flow_step_view', {
      language: resolvedLanguage,
      step: currentStep,
    })
    trackMetaCustomEvent('ActivateFlowStepView', {
      language: resolvedLanguage,
      step: currentStep,
    })
  }, [currentStep, loading, resolvedLanguage])

  const goToStep = (step: number) => {
    const normalizedStep = Math.max(1, Math.min(TOTAL_STEPS, step))
    setCurrentStep(normalizedStep)
  }

  const goToNextStep = () => {
    setCurrentStep((current) => Math.min(TOTAL_STEPS, current + 1))
  }

  const goToPreviousStep = () => {
    setCurrentStep((current) => Math.max(1, current - 1))
  }

  const activateInternalTrial = async () => {
    if (!account) {
      router.replace('/account/login')
      return
    }

    setActivating(true)
    setFlowError('')

    try {
      const response = await apiFetch(
        '/subscription',
        {
          method: 'POST',
          body: JSON.stringify({
            action: 'subscribe',
            deliveryPreference: 'email',
            deliveryHourLocal: DEFAULT_WEEKLY_DELIVERY_HOUR,
          }),
        },
        { retryUnauthorized: false },
      )

      if (response.status === 401) {
        router.replace('/account/login')
        return
      }

      if (!response.ok) {
        setFlowError(
          await readApiError(
            response,
            resolvedLanguage === 'es'
              ? 'No pudimos iniciar tu trial ahora.'
              : resolvedLanguage === 'pt'
                ? 'Nao conseguimos iniciar seu trial agora.'
                : 'Unable to start your trial right now.',
          ),
        )
        return
      }

      trackEvent('activate_flow_trial_click', {
        language: resolvedLanguage,
        user_id: account.user.id,
      })
      trackMetaCustomEvent('ActivateFlowTrialClick', {
        language: resolvedLanguage,
        user_id: account.user.id,
      })

      router.push('/checkout/start')
      router.refresh()
    } catch {
      setFlowError(
        resolvedLanguage === 'es'
          ? 'No pudimos iniciar tu trial ahora.'
          : resolvedLanguage === 'pt'
            ? 'Nao conseguimos iniciar seu trial agora.'
            : 'Unable to start your trial right now.',
      )
    } finally {
      setActivating(false)
    }
  }

  if (loading) {
    return (
      <section className="cosmic-shell mx-auto max-w-6xl rounded-[2rem] p-6 text-slate-100 sm:p-8">
        <p>{messages.common.loading}</p>
      </section>
    )
  }

  return (
    <section className="cosmic-shell mx-auto max-w-6xl p-4 sm:p-6">
      <div className="luck-glow cosmic-panel relative overflow-hidden rounded-[2.3rem] p-5 sm:p-7 lg:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(90,243,220,0.24),transparent_32%),radial-gradient(circle_at_86%_0%,rgba(117,173,255,0.24),transparent_34%),radial-gradient(circle_at_74%_82%,rgba(247,221,145,0.16),transparent_30%)]" />

        <div className="relative z-10">
          <div className="max-w-4xl">
            <h1 className="text-3xl leading-tight text-slate-50 sm:text-5xl">{copy.title}</h1>
            <p className="mt-3 text-base leading-7 text-slate-100/86 sm:text-lg">
              {copy.subtitle}
            </p>
          </div>

          <div className="mt-6">
            <div className="h-2 overflow-hidden rounded-full bg-cyan-100/12">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#7AF5E5,#B7CAFF,#F6D8A8)] transition-all duration-400"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-4 sm:overflow-visible sm:pb-0">
              {copy.stepTitles.map((title, index) => {
                const stepNumber = index + 1
                const active = stepNumber === currentStep
                const completed = stepNumber < currentStep

                return (
                  <button
                    key={title}
                    type="button"
                    onClick={() => goToStep(stepNumber)}
                    className={clsx(
                      'min-w-[9.2rem] shrink-0 rounded-xl border px-3 py-2 text-left transition sm:min-w-0 sm:py-3',
                      active
                        ? 'border-cyan-100/55 bg-cyan-100/16'
                        : completed
                          ? 'border-emerald-200/40 bg-emerald-200/12'
                          : 'border-cyan-100/18 bg-slate-950/26 hover:border-cyan-100/32',
                    )}
                  >
                    <p className="text-[9px] font-black uppercase tracking-[0.14em] text-cyan-100/72 sm:text-[10px] sm:tracking-[0.16em]">
                      {copy.nav.stepLabel} {stepNumber}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-50 sm:text-sm">{title}</p>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-7 min-h-[28rem]">
            {currentStep === 1 ? (
              <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
                <div>
                  <p className="cosmic-badge inline-flex rounded-full px-4 py-1 text-xs font-bold uppercase tracking-[0.24em] text-cyan-100">
                    {copy.step1.badge}
                  </p>
                  <h2 className="mt-4 text-3xl leading-tight text-slate-50 sm:text-4xl">
                    {copy.step1.title}
                  </h2>
                  <p className="mt-4 text-base leading-7 text-slate-100/86">{copy.step1.body}</p>
                  <ul className="mt-5 grid gap-2 text-sm text-cyan-100/88 sm:grid-cols-2">
                    {copy.step1.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="rounded-xl border border-cyan-100/18 bg-cyan-100/8 px-3 py-2"
                      >
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100/78">
                    {copy.step1.videoBadge}
                  </p>
                  <div className="relative mt-3 aspect-square overflow-hidden rounded-[1.4rem] border border-cyan-100/20 bg-slate-950">
                    <video
                      aria-hidden="true"
                      className="absolute inset-0 h-full w-full object-cover"
                      src="/luck-guru-processing.mp4"
                      poster="/luck-guru-processing-poster.jpg"
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="auto"
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {currentStep === 2 ? (
              <div className="grid gap-6 lg:grid-cols-[minmax(16rem,20rem)_minmax(0,1fr)] lg:items-start">
                <aside className="relative mx-auto w-full max-w-[20rem] overflow-hidden rounded-[1.4rem] border border-cyan-100/24 bg-slate-950/30 lg:mx-0">
                  <div className="relative aspect-square sm:aspect-[9/16]">
                    <video
                      aria-hidden="true"
                      className="absolute inset-0 h-full w-full object-cover"
                      src="/luck-guru-revealed.mp4"
                      poster="/luck-guru-revealed-poster.jpg"
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="auto"
                    />
                  </div>
                </aside>

                <div className="rounded-[1.4rem] border border-cyan-100/20 bg-slate-950/42 p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100/82">
                        {copy.step2.badge}
                      </p>
                      <h2 className="mt-2 text-3xl leading-tight text-slate-50 sm:text-4xl">
                        {copy.step2.title}
                      </h2>
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-100/84 sm:text-base">
                        {copy.step2.body}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={goToNextStep}
                      className="cosmic-button-primary inline-flex rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.15em]"
                    >
                      {copy.step2.nextLabel}
                    </button>
                  </div>

                  <div className="mt-5 border-t border-cyan-100/12 pt-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100/82">
                          {copy.step2.previewBadge}
                        </p>
                        <p className="mt-2 text-xl leading-tight text-slate-50 sm:text-2xl">
                          {todayPreview.headline}
                        </p>
                      </div>
                      <span className={clsx(toneBadgeClass(todayPreview.summary), 'shrink-0')}>
                        <span aria-hidden="true" className="oracle-tone-badge-icon">
                          {toneGlyph(todayPreview.summary)}
                        </span>
                        {todayPreview.summaryLabel}
                      </span>
                    </div>

                    <div className="mt-4 flex items-end gap-3">
                      <p className="text-5xl font-semibold leading-none text-slate-50 sm:text-6xl">
                        {todayPreview.luckScore}
                      </p>
                      <p className="pb-1 text-sm font-black uppercase tracking-[0.2em] text-cyan-100/82">
                        /100
                      </p>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-slate-100/84 sm:text-base">
                      {todayPreview.notes}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {todayLabels.strong.slice(0, 2).map((activity) => (
                        <span
                          key={activity}
                          className="rounded-full border border-emerald-200/22 bg-emerald-200/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-100"
                        >
                          {copy.step2.strongPrefix}: {activity}
                        </span>
                      ))}
                      {todayLabels.caution.slice(0, 2).map((activity) => (
                        <span
                          key={activity}
                          className="rounded-full border border-amber-200/24 bg-amber-200/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-amber-100"
                        >
                          {copy.step2.avoidPrefix}: {activity}
                        </span>
                      ))}
                    </div>

                    {personalSigns ? (
                      <div className="mt-5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100/74">
                            {copy.step2.personalSignal}
                          </p>
                          <span className="rounded-full border border-cyan-100/20 bg-cyan-100/8 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-100">
                            {personalSigns.zodiac.name} · {personalSigns.chinese.name}
                          </span>
                        </div>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <article className="rounded-xl bg-slate-900/36 p-4 ring-1 ring-cyan-100/14">
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100/72">
                              {copy.step2.zodiac}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-slate-50">
                              {personalSigns.projection.zodiac}
                            </p>
                          </article>
                          <article className="rounded-xl bg-slate-900/36 p-4 ring-1 ring-cyan-100/14">
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100/72">
                              {copy.step2.chineseCalendar}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-slate-50">
                              {personalSigns.projection.chinese}
                            </p>
                          </article>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-5 rounded-xl bg-cyan-100/8 p-4 ring-1 ring-cyan-100/18">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100/80">
                          {copy.step2.pendingPersonalTitle}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-100/84">
                          {copy.step2.pendingPersonalBody}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            {currentStep === 3 ? (
              <div>
                <p className="cosmic-badge inline-flex rounded-full px-4 py-1 text-xs font-bold uppercase tracking-[0.24em] text-cyan-100">
                  {copy.step3.badge}
                </p>
                <h2 className="mt-4 text-3xl leading-tight text-slate-50 sm:text-4xl">
                  {copy.step3.title}
                </h2>
                <p className="mt-3 max-w-4xl text-base leading-7 text-slate-100/86">
                  {copy.step3.body}
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
                  {calendarPreview.map((day) => {
                    const dayDate = toUtcDateFromKey(day.dayKey)

                    return (
                      <article
                        key={day.dayKey}
                        className={clsx(
                          'relative overflow-hidden rounded-2xl border p-3',
                          day.locked
                            ? 'border-slate-700/80 bg-slate-900/55'
                            : 'border-cyan-100/20 bg-slate-950/40',
                        )}
                      >
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-100/74">
                          {previewDateFormatter.format(dayDate)}
                        </p>
                        {!day.locked ? (
                          <>
                            <span className={clsx(toneBadgeClass(day.summary), 'mt-2 scale-[0.82] origin-left')}>
                              <span aria-hidden="true" className="oracle-tone-badge-icon">
                                {toneGlyph(day.summary)}
                              </span>
                              {toneLabel(resolvedLanguage, day.summary)}
                            </span>
                            <p className="mt-3 text-sm leading-6 text-slate-100/84">
                              {day.notes}
                            </p>
                          </>
                        ) : (
                          <div className="mt-3 rounded-xl border border-cyan-100/14 bg-cyan-100/8 p-3">
                            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100/82">
                              {copy.step3.nextWeekLocked}
                            </p>
                          </div>
                        )}
                      </article>
                    )
                  })}
                </div>

                <p className="mt-4 text-sm leading-6 text-cyan-100/84">
                  {copy.step3.unlockLine}
                </p>
              </div>
            ) : null}

            {currentStep === 4 ? (
              <div className="grid gap-6 lg:grid-cols-[1.06fr_0.94fr] lg:items-start">
                <div>
                  <p className="cosmic-badge inline-flex rounded-full px-4 py-1 text-xs font-bold uppercase tracking-[0.24em] text-cyan-100">
                    {copy.step4.badge}
                  </p>
                  <h2 className="mt-4 text-3xl leading-tight text-slate-50 sm:text-4xl">
                    {copy.step4.title}
                  </h2>
                  <p className="mt-4 text-base leading-7 text-slate-100/86">{copy.step4.body}</p>
                  <ul className="mt-5 grid gap-2 text-sm text-cyan-100/88 sm:grid-cols-2">
                    {copy.step4.benefits.map((benefit) => (
                      <li
                        key={benefit}
                        className="rounded-xl border border-cyan-100/18 bg-cyan-100/8 px-3 py-2"
                      >
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-[1.8rem] border border-cyan-100/24 bg-slate-950/46 p-5 backdrop-blur-md sm:p-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-100/86">
                    {copy.step4.trialBadge}
                  </p>
                  <h3 className="mt-3 text-2xl leading-tight text-slate-50">{copy.step4.cta}</h3>
                  <button
                    type="button"
                    onClick={() => {
                      void activateInternalTrial()
                    }}
                    disabled={activating}
                    className="cosmic-button-primary mt-5 inline-flex w-full justify-center rounded-full px-6 py-3 text-sm font-black uppercase tracking-[0.16em] disabled:opacity-70"
                  >
                    {activating ? messages.common.loading : copy.step4.cta}
                  </button>

                  <div className="mt-4 rounded-2xl border border-emerald-200/18 bg-emerald-300/10 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-100/86">
                      {copy.step4.unsubscribeTitle}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-100/86">
                      {copy.step4.unsubscribeBody}
                    </p>
                  </div>

                  <div className="mt-4">
                    <Link
                      href="/checkout/start"
                      className="cosmic-button-secondary inline-flex w-full justify-center rounded-full px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-cyan-50"
                    >
                      {resolvedLanguage === 'es'
                        ? 'Ya tengo trial, ir a checkout'
                        : resolvedLanguage === 'pt'
                          ? 'Ja tenho trial, ir ao checkout'
                          : 'I already started trial, go to checkout'}
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {flowError ? (
            <p className="cosmic-error-box mt-6 rounded-xl px-4 py-3 text-sm">{flowError}</p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-cyan-100/14 pt-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100/72">
              {copy.nav.stepLabel} {currentStep}/{TOTAL_STEPS}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={goToPreviousStep}
                disabled={currentStep === 1}
                className="cosmic-button-secondary rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-cyan-50 disabled:opacity-45"
              >
                {copy.nav.back}
              </button>

              {currentStep < TOTAL_STEPS ? (
                <button
                  type="button"
                  onClick={goToNextStep}
                  className="cosmic-button-primary rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.14em]"
                >
                  {copy.nav.continueTo} {copy.stepTitles[currentStep]}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    void activateInternalTrial()
                  }}
                  disabled={activating}
                  className="cosmic-button-primary rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.14em] disabled:opacity-70"
                >
                  {activating ? messages.common.loading : copy.step4.cta}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
