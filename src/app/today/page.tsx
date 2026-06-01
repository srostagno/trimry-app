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
  const isSpanish = language.startsWith('es')

  if (tone === 'good') {
    return isSpanish ? 'BUENO' : 'GOOD'
  }

  if (tone === 'bad') {
    return isSpanish ? 'MALO' : 'BAD'
  }

  return isSpanish ? 'RARO' : 'RARE'
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
  const isSpanish = language.startsWith('es')

  if (tone === 'good') {
    return isSpanish
      ? 'Hoy favorece el movimiento, la claridad y los cambios limpios.'
      : 'Today favors movement, clarity, and clean changes.'
  }

  if (tone === 'bad') {
    return isSpanish
      ? 'Hoy pide paciencia, mantenimiento y cero presión.'
      : 'Today asks for patience, maintenance, and no pressure.'
  }

  return isSpanish
    ? 'Hoy se abre de forma extraña. Mantente atento a una oportunidad.'
    : 'Today bends in an unusual way. Stay alert for an opening.'
}

function buildUnlockLine(language: string) {
  const isSpanish = language.startsWith('es')

  return isSpanish
    ? 'Desbloquea Trimry para recibir tu ritual semanal por email, WhatsApp o ambos, y activar los poderes magicos de Luck Guru en el chat.'
    : 'Unlock Trimry to receive your weekly ritual by email, WhatsApp, or both, and unlock Luck Guru’s full magical powers in chat.'
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

  const isSpanish = language.startsWith('es')
  const labelMap = isSpanish
    ? {
        haircut: 'cabello',
        shave: 'afeitado',
        nails: 'uñas',
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
  const fortune = buildFortuneDay(date, language.startsWith('es') ? 'es-CL' : 'en-US')

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
  return language.startsWith('es') ? 'Desbloquear Trimry' : 'Unlock Trimry'
}

function getStageCopy(language: string, stage: number, loadingPreview: boolean) {
  const isSpanish = language.startsWith('es')

  if (loadingPreview || stage < 1) {
    return isSpanish
      ? {
          eyebrow: 'Luck Guru esta leyendo',
          title: 'La esfera esta buscando tu senal.',
          body: 'La agenda de hoy se esta alineando antes de revelar el resultado.',
        }
      : {
          eyebrow: 'Luck Guru is reading',
          title: 'The crystal is finding your signal.',
          body: 'Today’s agenda is aligning before the result appears.',
        }
  }

  if (stage < 2) {
    return isSpanish
      ? {
          eyebrow: 'Revelacion en curso',
          title: 'La energia esta cambiando.',
          body: 'Mira la esfera. La fortuna del dia esta por abrirse.',
        }
      : {
          eyebrow: 'Reveal in progress',
          title: 'The energy is shifting.',
          body: 'Watch the crystal. Today’s fortune is about to open.',
        }
  }

  return isSpanish
    ? {
        eyebrow: 'Fortuna revelada',
        title: 'Esta es la senal de hoy.',
        body: 'Desbloquea Trimry para ver la semana completa y activar los poderes de Luck Guru.',
      }
    : {
        eyebrow: 'Fortune revealed',
        title: 'This is today’s sign.',
        body: 'Unlock Trimry to see the full week and activate Luck Guru’s powers.',
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
  const [account, setAccount] = useState<AccountSnapshot | null>(null)
  const [preview, setPreview] = useState<TodayPreview>(() =>
    createPreviewFromFortune(language, new Date()),
  )
  const [stage, setStage] = useState(0)
  const [loadingPreview, setLoadingPreview] = useState(true)

  const isSpanish = language.startsWith('es')
  const locale = isSpanish ? 'es-CL' : 'en-US'
  const dayKey = toUtcDayKey(new Date())
  const labels = useMemo(
    () => buildStrongAndCautionLabels(language, preview.activities),
    [language, preview.activities],
  )
  const stageCopy = getStageCopy(language, stage, loadingPreview)
  const revealed = stage >= 2

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
        label: isSpanish ? 'Reanudar checkout' : 'Resume checkout',
      }
    }

    return {
      href: '/dashboard',
      label: isSpanish ? 'Ir al dashboard' : 'Go to dashboard',
    }
  }, [account, isSpanish, language])

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
            {isSpanish ? 'Revelacion de hoy' : 'Today’s reveal'}
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl leading-[1.04] text-slate-50 sm:text-5xl lg:text-6xl">
            {isSpanish
              ? 'Luck Guru esta abriendo tu suerte.'
              : 'Luck Guru is opening your luck.'}
          </h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-slate-100/88 sm:text-lg">
            {isSpanish
              ? 'Primero mira la senal del dia. Luego desbloquea la semana completa y sus poderes magicos en el chat.'
              : 'First see today’s sign. Then unlock the full week and his magical powers in chat.'}
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
                        {isSpanish ? `Fuerte: ${activity}` : `Strong: ${activity}`}
                      </span>
                    ))}
                    {labels.caution.slice(0, 2).map((activity) => (
                      <span
                        key={activity}
                        className="rounded-full border border-amber-200/24 bg-amber-200/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-amber-100"
                      >
                        {isSpanish ? `Evita: ${activity}` : `Avoid: ${activity}`}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <div className="today-sealed-result">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100/78">
                    {isSpanish ? 'Senal bloqueada' : 'Signal locked'}
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="today-hidden-score">??</span>
                    <span className="text-xs font-black uppercase leading-5 tracking-[0.18em] text-slate-100/70">
                      {isSpanish ? 'La fortuna aun no se revela' : 'Fortune has not revealed yet'}
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
              {isSpanish ? 'Al desbloquear Trimry' : 'When Trimry unlocks'}
            </p>
            <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-100/84">
              <li>
                {isSpanish
                  ? 'Recibes informes semanales por email, WhatsApp o ambos.'
                  : 'You receive weekly reports by email, WhatsApp, or both.'}
              </li>
              <li>
                {isSpanish
                  ? 'Ves dias buenos, malos y raros antes de que lleguen.'
                  : 'You see good, bad, and rare days before they arrive.'}
              </li>
              <li>
                {isSpanish
                  ? 'Luck Guru desbloquea sus poderes completos para hablar contigo.'
                  : 'Luck Guru unlocks his full powers to speak with you.'}
              </li>
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
            label={isSpanish ? 'Preguntar al Luck Guru' : 'Ask the Luck Guru'}
            className="cosmic-button-secondary inline-flex rounded-full px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-cyan-50"
          />
        </div>
      </div>

      <MobileTodayActionBar actionState={actionState} language={language} />
    </section>
  )
}
