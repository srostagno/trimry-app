'use client'

import clsx from 'clsx'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

import { OpenLuckGuruChatButton } from '@/components/open-luck-guru-chat-button'
import { useLanguage } from '@/components/language-provider'
import { trackEvent, trackMetaCustomEvent } from '@/lib/analytics'
import { apiFetch } from '@/lib/api-client'
import { buildFortuneDay, type ActivityTone } from '@/lib/fortune'
import {
  languageToIntlLocale,
  normalizeLanguageCode,
  type LanguageCode,
} from '@/lib/i18n'
import { buildPersonalSignProfile } from '@/lib/personal-signs'
import {
  fetchAccountSnapshot,
  type AccountSnapshot,
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
  isOverridden: boolean
}

function toUtcDayKey(date: Date) {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function toneLabel(language: string, tone: ActivityTone) {
  const resolvedLanguage = normalizeLanguageCode(language)

  if (tone === 'good') {
    return resolvedLanguage === 'es'
      ? 'BUENO'
      : resolvedLanguage === 'pt'
        ? 'BOM'
        : 'GOOD'
  }

  if (tone === 'bad') {
    return resolvedLanguage === 'es'
      ? 'MALO'
      : resolvedLanguage === 'pt'
        ? 'RUIM'
        : 'BAD'
  }

  return resolvedLanguage === 'es'
    ? 'RARO'
    : resolvedLanguage === 'pt'
      ? 'RARO'
      : 'RARE'
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

function buildHeadline(language: string, tone: ActivityTone) {
  const resolvedLanguage = normalizeLanguageCode(language)

  if (tone === 'good') {
    return resolvedLanguage === 'es'
      ? 'Hoy favorece el movimiento, la claridad y los cambios limpios.'
      : resolvedLanguage === 'pt'
        ? 'Hoje favorece movimento, clareza e mudanças limpas.'
      : 'Today favors movement, clarity, and clean changes.'
  }

  if (tone === 'bad') {
    return resolvedLanguage === 'es'
      ? 'Hoy pide paciencia, mantenimiento y cero presión.'
      : resolvedLanguage === 'pt'
        ? 'Hoje pede paciência, manutenção e zero pressão.'
      : 'Today asks for patience, maintenance, and no pressure.'
  }

  return resolvedLanguage === 'es'
    ? 'Hoy se abre de forma extraña. Mantente atento a una oportunidad.'
    : resolvedLanguage === 'pt'
      ? 'Hoje se abre de um jeito incomum. Fique atento a uma oportunidade.'
    : 'Today bends in an unusual way. Stay alert for an opening.'
}

function buildUnlockLine(language: string) {
  const resolvedLanguage = normalizeLanguageCode(language)

  return resolvedLanguage === 'es'
    ? 'Desbloquea Trimry para recibir tu proyección diaria por email, WhatsApp o ambos, abrir el calendario mensual y activar los poderes de Luck Guru.'
    : resolvedLanguage === 'pt'
      ? 'Desbloqueie a Trimry para receber sua projeção diária por email, WhatsApp ou ambos, abrir o calendário mensal e ativar os poderes de Luck Guru.'
    : 'Unlock Trimry to receive your daily projection by email, WhatsApp, or both, open the monthly calendar, and unlock Luck Guru’s full powers.'
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

function buildStrongAndCautionLabels(
  language: string,
  activities: TodayPreview['activities'],
) {
  const strong = Object.entries(activities)
    .filter(([, tone]) => tone === 'good')
    .map(([activity]) => activity)

  const caution = Object.entries(activities)
    .filter(([, tone]) => tone === 'bad')
    .map(([activity]) => activity)

  const resolvedLanguage = normalizeLanguageCode(language)
  const labelMap = resolvedLanguage === 'es'
    ? {
        haircut: 'cabello',
        shave: 'afeitado',
        nails: 'uñas',
        release: 'soltar',
      }
    : resolvedLanguage === 'pt'
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

function createPreviewFromFortune(language: string, date: Date) {
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
    isOverridden: false,
  } satisfies TodayPreview
}

function emptyActionLabel(language: string) {
  const resolvedLanguage = normalizeLanguageCode(language)

  if (resolvedLanguage === 'es') {
    return 'Desbloquear Trimry'
  }

  if (resolvedLanguage === 'pt') {
    return 'Desbloquear Trimry'
  }

  return 'Unlock Trimry'
}

function getStageCopy(language: string, stage: number, loadingPreview: boolean) {
  const resolvedLanguage = normalizeLanguageCode(language)

  if (loadingPreview || stage < 1) {
    return resolvedLanguage === 'es'
      ? {
          eyebrow: 'Luck Guru esta leyendo',
          title: 'La esfera esta buscando tu senal.',
          body: 'La agenda de hoy se esta alineando antes de revelar el resultado.',
        }
      : resolvedLanguage === 'pt'
        ? {
            eyebrow: 'Luck Guru está lendo',
            title: 'A esfera está buscando seu sinal.',
            body: 'A agenda de hoje está se alinhando antes de revelar o resultado.',
          }
      : {
          eyebrow: 'Luck Guru is reading',
          title: 'The crystal is finding your signal.',
          body: 'Today’s agenda is aligning before the result appears.',
        }
  }

  if (stage < 2) {
    return resolvedLanguage === 'es'
      ? {
          eyebrow: 'Revelacion en curso',
          title: 'La energia esta cambiando.',
          body: 'Mira la esfera. La fortuna del dia esta por abrirse.',
        }
      : resolvedLanguage === 'pt'
        ? {
            eyebrow: 'Revelação em andamento',
            title: 'A energia está mudando.',
            body: 'Observe a esfera. A fortuna do dia está prestes a se abrir.',
          }
      : {
          eyebrow: 'Reveal in progress',
          title: 'The energy is shifting.',
          body: 'Watch the crystal. Today’s fortune is about to open.',
        }
  }

  return resolvedLanguage === 'es'
    ? {
        eyebrow: 'Fortuna revelada',
        title: 'Esta es la senal de hoy.',
        body: 'Desbloquea Trimry para ver el mes completo y activar los poderes de Luck Guru.',
      }
    : resolvedLanguage === 'pt'
      ? {
          eyebrow: 'Fortuna revelada',
          title: 'Este é o sinal de hoje.',
          body: 'Desbloqueie a Trimry para ver o mês completo e ativar os poderes de Luck Guru.',
        }
    : {
        eyebrow: 'Fortune revealed',
        title: 'This is today’s sign.',
        body: 'Unlock Trimry to see the full month and activate Luck Guru’s powers.',
      }
}

function getTodayPageCopy(language: LanguageCode) {
  if (language === 'es') {
    return {
      revealBadge: 'Revelación de hoy',
      title: 'Luck Guru está abriendo tu suerte.',
      subtitle:
        'Primero mira la señal del día. Luego desbloquea el mes completo, tu capa zodiacal y sus poderes en el chat.',
      strongPrefix: 'Fuerte',
      avoidPrefix: 'Evita',
      personalSignal: 'Señal personal',
      zodiac: 'Zodíaco',
      chineseCalendar: 'Calendario chino',
      lockedPersonalSummary:
        'Este es solo el resumen. Suscríbete para abrir el detalle completo y ver todo el mes en calendario.',
      activePersonalSummary:
        'Tu suscripción mantiene esta señal activa junto al calendario mensual y Luck Guru.',
      personalPending: 'Señal personal pendiente',
      personalPendingBody:
        'Agrega tu fecha de nacimiento en el perfil para ver tu zodíaco y calendario chino aquí.',
      signalLocked: 'Señal bloqueada',
      fortunePending: 'La fortuna aún no se revela',
      unlockTitle: 'Al desbloquear Trimry',
      unlockBullets: [
        'Recibes un recordatorio diario por email, WhatsApp o ambos.',
        'Ves días buenos, malos y raros en el calendario mensual.',
        'Tu zodíaco y calendario chino abren una capa personal de lectura.',
      ],
      resumeCheckout: 'Reanudar checkout',
      dashboard: 'Ir al dashboard',
      askLuckGuru: 'Preguntar al Luck Guru',
    }
  }

  if (language === 'pt') {
    return {
      revealBadge: 'Revelação de hoje',
      title: 'Luck Guru está abrindo sua sorte.',
      subtitle:
        'Primeiro veja o sinal do dia. Depois desbloqueie o mês completo, sua camada zodiacal e os poderes no chat.',
      strongPrefix: 'Forte',
      avoidPrefix: 'Evite',
      personalSignal: 'Sinal pessoal',
      zodiac: 'Zodíaco',
      chineseCalendar: 'Calendário chinês',
      lockedPersonalSummary:
        'Este é apenas o resumo. Assine para abrir o detalhe completo e ver todo o mês no calendário.',
      activePersonalSummary:
        'Sua assinatura mantém este sinal ativo junto ao calendário mensal e ao Luck Guru.',
      personalPending: 'Sinal pessoal pendente',
      personalPendingBody:
        'Adicione sua data de nascimento no perfil para ver seu zodíaco e calendário chinês aqui.',
      signalLocked: 'Sinal bloqueado',
      fortunePending: 'A fortuna ainda não foi revelada',
      unlockTitle: 'Ao desbloquear a Trimry',
      unlockBullets: [
        'Você recebe um lembrete diário por email, WhatsApp ou ambos.',
        'Você vê dias bons, ruins e raros no calendário mensal.',
        'Seu zodíaco e calendário chinês abrem uma camada pessoal de leitura.',
      ],
      resumeCheckout: 'Retomar checkout',
      dashboard: 'Ir para o painel',
      askLuckGuru: 'Perguntar ao Luck Guru',
    }
  }

  return {
    revealBadge: 'Today’s reveal',
    title: 'Luck Guru is opening your luck.',
    subtitle:
      'First see today’s sign. Then unlock the full month, your zodiac layer, and his powers in chat.',
    strongPrefix: 'Strong',
    avoidPrefix: 'Avoid',
    personalSignal: 'Personal signal',
    zodiac: 'Zodiac',
    chineseCalendar: 'Chinese calendar',
    lockedPersonalSummary:
      'This is only the summary. Subscribe to open the full detail and see the whole month calendar.',
    activePersonalSummary:
      'Your subscription keeps this signal active with the monthly calendar and Luck Guru.',
    personalPending: 'Personal signal pending',
    personalPendingBody:
      'Add your date of birth in your profile to see your zodiac and Chinese calendar here.',
    signalLocked: 'Signal locked',
    fortunePending: 'Fortune has not revealed yet',
    unlockTitle: 'When Trimry unlocks',
    unlockBullets: [
      'You receive one daily reminder by email, WhatsApp, or both.',
      'You see good, bad, and rare days before they arrive.',
      'Your zodiac and Chinese calendar open a personal reading layer.',
    ],
    resumeCheckout: 'Resume checkout',
    dashboard: 'Go to dashboard',
    askLuckGuru: 'Ask the Luck Guru',
  }
}

function MobileTodayActionBar({
  actionState,
  language,
}: {
  actionState: { href: string; label: string }
  language: string
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <div className="fixed bottom-5 left-3 right-[7.4rem] z-50 sm:hidden">
      <Link
        href={actionState.href}
        onClick={() => {
          trackEvent('today_preview_unlock_click', {
            language,
            destination: actionState.href,
          })
          trackMetaCustomEvent('TodayPreviewUnlockClick', {
            language,
            destination: actionState.href,
          })
        }}
        className="cosmic-button-primary today-mobile-cta inline-flex min-h-[3.4rem] w-full items-center justify-center rounded-full px-4 py-2 text-[11px] font-black uppercase leading-tight tracking-[0.12em] shadow-[0_16px_42px_rgba(3,8,20,0.42)]"
      >
        {actionState.label}
      </Link>
    </div>,
    document.body,
  )
}

export default function TodayLuckPage() {
  const { language } = useLanguage()
  const resolvedLanguage = normalizeLanguageCode(language)
  const todayCopy = useMemo(
    () => getTodayPageCopy(resolvedLanguage),
    [resolvedLanguage],
  )
  const [account, setAccount] = useState<AccountSnapshot | null>(null)
  const [preview, setPreview] = useState<TodayPreview>(() =>
    createPreviewFromFortune(language, new Date()),
  )
  const [stage, setStage] = useState(0)
  const [loadingPreview, setLoadingPreview] = useState(true)

  const locale = languageToIntlLocale(resolvedLanguage)
  const dayKey = toUtcDayKey(new Date())
  const labels = useMemo(
    () => buildStrongAndCautionLabels(language, preview.activities),
    [language, preview.activities],
  )
  const personalSigns = useMemo(
    () => buildPersonalSignProfile(account?.user.birthDate, language, preview.summary),
    [account?.user.birthDate, language, preview.summary],
  )
  const stageCopy = getStageCopy(language, stage, loadingPreview)
  const revealed = stage >= 2
  const hasActiveSubscription =
    account?.subscription?.status === 'active' ||
    account?.subscription?.status === 'past_due'

  const actionState = useMemo(() => {
    if (!account) {
      return {
        href: '/account/register',
        label: emptyActionLabel(language),
      }
    }

    if (!account.subscription) {
      return {
        href: '/activate',
        label: emptyActionLabel(language),
      }
    }

    if (account.subscription.status === 'pending_checkout') {
      return {
        href: '/checkout/start',
        label: todayCopy.resumeCheckout,
      }
    }

    return {
      href: '/dashboard',
      label: todayCopy.dashboard,
    }
  }, [account, language, todayCopy.dashboard, todayCopy.resumeCheckout])

  useEffect(() => {
    trackEvent('today_preview_view', {
      language,
      day_key: dayKey,
    })
    trackMetaCustomEvent('TodayPreviewView', {
      language,
      day_key: dayKey,
    })
  }, [dayKey, language])

  useEffect(() => {
    let cancelled = false
    let stageTimers: number[] = []

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const loadPreview = async () => {
      try {
        const [previewResponse, currentAccount] = await Promise.all([
          apiFetch(
            `/luck-guru/today-preview?date=${encodeURIComponent(dayKey)}&locale=${encodeURIComponent(locale)}`,
            { cache: 'no-store' },
            { retryUnauthorized: false },
          ),
          fetchAccountSnapshot(),
        ])

        if (cancelled) {
          return
        }

        if (currentAccount) {
          setAccount(currentAccount)
        }

        if (previewResponse.ok) {
          const payload = (await previewResponse.json()) as Partial<TodayPreview>

          if (payload.summary && payload.headline && payload.unlockLine) {
            setPreview({
              ...createPreviewFromFortune(language, new Date()),
              ...payload,
            })
          }
        }
      } catch {
        if (!cancelled) {
          setPreview(createPreviewFromFortune(language, new Date()))
        }
      } finally {
        if (!cancelled) {
          setLoadingPreview(false)

          if (prefersReducedMotion) {
            setStage(2)
            return
          }

          stageTimers = [
            window.setTimeout(() => setStage(1), 1200),
            window.setTimeout(() => setStage(2), 4700),
          ]
        }
      }
    }

    void loadPreview()

    return () => {
      cancelled = true
      stageTimers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [dayKey, language, locale])

  return (
    <section className="today-video-reveal relative isolate min-h-[calc(100svh-4.5rem)] overflow-hidden pb-28 text-slate-50 sm:min-h-[calc(100svh-5rem)] sm:pb-10">
      <div className="absolute inset-0 bg-slate-950">
        <video
          aria-hidden="true"
          className={clsx(
            'today-guru-video absolute inset-0 h-full w-full object-cover transition duration-700',
            revealed ? 'scale-105 opacity-0' : 'scale-100 opacity-100',
          )}
          src="/luck-guru-processing.mp4"
          poster="/luck-guru-processing-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
        <video
          aria-hidden="true"
          className={clsx(
            'today-guru-video absolute inset-0 h-full w-full object-cover transition duration-700',
            revealed ? 'scale-100 opacity-100' : 'scale-105 opacity-0',
          )}
          src="/luck-guru-revealed.mp4"
          poster="/luck-guru-revealed-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,7,19,0.18)_0%,rgba(3,7,19,0.28)_30%,rgba(3,7,19,0.78)_82%,rgba(3,7,19,0.92)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,7,19,0.78)_0%,rgba(3,7,19,0.28)_42%,rgba(3,7,19,0.62)_100%)] opacity-85 sm:opacity-100" />
        <div
          className={clsx(
            'today-reveal-flash absolute inset-0 transition-opacity duration-700',
            revealed ? 'opacity-100' : 'opacity-0',
          )}
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-4.5rem)] max-w-6xl flex-col justify-start gap-6 px-4 py-5 sm:min-h-[calc(100svh-5rem)] sm:justify-between sm:gap-8 sm:px-6 sm:py-8 lg:px-8">
        <div className="max-w-xl">
          <p className="cosmic-badge inline-flex rounded-full px-4 py-1 text-xs font-bold uppercase tracking-[0.24em] text-cyan-100">
            {todayCopy.revealBadge}
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl leading-[1.04] text-slate-50 sm:text-5xl lg:text-6xl">
            {todayCopy.title}
          </h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-slate-100/88 sm:text-lg">
            {todayCopy.subtitle}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(19rem,0.58fr)] lg:items-end">
          <div className="today-fortune-panel relative max-w-xl overflow-hidden rounded-[1.6rem] border border-white/18 bg-slate-950/58 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.38)] backdrop-blur-md sm:p-5">
            <div
              aria-hidden="true"
              className={clsx(
                'today-mist-layer absolute inset-0 transition-opacity duration-1000',
                revealed ? 'opacity-0' : 'opacity-100',
              )}
            />
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100/82">
                  {stageCopy.eyebrow}
                </p>
                <p className="mt-2 text-xl leading-tight text-slate-50 sm:text-2xl">
                  {stageCopy.title}
                </p>
              </div>
              {revealed ? (
                <span
                  className={clsx(
                    toneBadgeClass(preview.summary),
                    'today-tone-badge shrink-0 scale-90 sm:scale-100',
                  )}
                >
                  <span aria-hidden="true" className="oracle-tone-badge-icon">
                    {toneGlyph(preview.summary)}
                  </span>
                  {preview.summaryLabel}
                </span>
              ) : (
                <span className="today-sealed-orb shrink-0">
                  <span className="today-sealed-orb-core" />
                </span>
              )}
            </div>

            <div className="mt-5 overflow-hidden rounded-full bg-white/10">
              <div
                className={clsx(
                  'today-reveal-progress h-1.5 rounded-full',
                  revealed ? 'w-full' : 'w-2/3',
                )}
              />
            </div>

            <div
              className={clsx(
                'today-result-details mt-5 transition duration-700',
                revealed ? 'translate-y-0 opacity-100 blur-0' : 'translate-y-2 opacity-100 blur-0',
              )}
            >
              {revealed ? (
                <>
                  <div className="flex items-end gap-3">
                    <p className="text-5xl font-semibold leading-none text-slate-50 sm:text-6xl">
                      {preview.luckScore}
                    </p>
                    <p className="pb-1 text-sm font-black uppercase tracking-[0.22em] text-cyan-100/82">
                      /100
                    </p>
                  </div>
                  <p className="mt-4 text-base leading-7 text-slate-50 sm:text-lg">
                    {preview.headline}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-100/82">
                    {preview.notes}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {labels.strong.slice(0, 2).map((activity) => (
                      <span
                        key={activity}
                        className="rounded-full border border-emerald-200/22 bg-emerald-200/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-100"
                      >
                        {todayCopy.strongPrefix}: {activity}
                      </span>
                    ))}
                    {labels.caution.slice(0, 2).map((activity) => (
                      <span
                        key={activity}
                        className="rounded-full border border-amber-200/24 bg-amber-200/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-amber-100"
                      >
                        {todayCopy.avoidPrefix}: {activity}
                      </span>
                    ))}
                  </div>

                  {personalSigns ? (
                    <div className="mt-5 rounded-[1.35rem] border border-amber-200/24 bg-amber-200/10 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-100/86">
                          {todayCopy.personalSignal}
                        </p>
                        <span className="rounded-full border border-cyan-100/20 bg-cyan-100/8 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-100">
                          {personalSigns.zodiac.name} · {personalSigns.chinese.name}
                        </span>
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <article className="rounded-2xl border border-cyan-100/16 bg-slate-950/34 p-3">
                          <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100/72">
                            {todayCopy.zodiac}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-50">
                            {personalSigns.projection.zodiac}
                          </p>
                        </article>
                        <article className="rounded-2xl border border-cyan-100/16 bg-slate-950/34 p-3">
                          <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100/72">
                            {todayCopy.chineseCalendar}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-50">
                            {personalSigns.projection.chinese}
                          </p>
                        </article>
                      </div>
                      {!hasActiveSubscription ? (
                        <p className="mt-3 text-xs leading-5 text-amber-50/84">
                          {todayCopy.lockedPersonalSummary}
                        </p>
                      ) : (
                        <p className="mt-3 text-xs leading-5 text-amber-50/84">
                          {todayCopy.activePersonalSummary}
                        </p>
                      )}
                    </div>
                  ) : account ? (
                    <div className="mt-5 rounded-[1.35rem] border border-cyan-100/18 bg-cyan-100/8 p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100/80">
                        {todayCopy.personalPending}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-100/82">
                        {todayCopy.personalPendingBody}
                      </p>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="today-sealed-result">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100/78">
                    {todayCopy.signalLocked}
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="today-hidden-score">??</span>
                    <span className="text-xs font-black uppercase leading-5 tracking-[0.18em] text-slate-100/70">
                      {todayCopy.fortunePending}
                    </span>
                  </div>
                  <p className="mt-4 hidden text-base leading-7 text-slate-50 sm:block sm:text-lg">
                    {stageCopy.body}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="hidden rounded-[1.5rem] border border-cyan-100/18 bg-slate-950/48 p-4 backdrop-blur-md lg:block">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100/78">
              {todayCopy.unlockTitle}
            </p>
            <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-100/84">
              {todayCopy.unlockBullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="hidden flex-wrap gap-3 sm:flex">
          <Link
            href={actionState.href}
            onClick={() => {
              trackEvent('today_preview_unlock_click', {
                language,
                destination: actionState.href,
              })
              trackMetaCustomEvent('TodayPreviewUnlockClick', {
                language,
                destination: actionState.href,
              })
            }}
            className="cosmic-button-primary inline-flex rounded-full px-6 py-3 text-sm font-black uppercase tracking-[0.16em]"
          >
            {actionState.label}
          </Link>
          <OpenLuckGuruChatButton
            analyticsLocation="today_preview"
            label={todayCopy.askLuckGuru}
            className="cosmic-button-secondary inline-flex rounded-full px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-cyan-50"
          />
        </div>
      </div>

      <MobileTodayActionBar actionState={actionState} language={language} />
    </section>
  )
}
