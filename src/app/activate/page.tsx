'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { OpenLuckGuruChatButton } from '@/components/open-luck-guru-chat-button'
import { useLanguage } from '@/components/language-provider'
import { trackEvent, trackMetaCustomEvent } from '@/lib/analytics'
import { buildWeeklyFortune, type ActivityTone } from '@/lib/fortune'
import {
  type AccountSnapshot,
  fetchAccountSnapshot,
} from '@/lib/start-flow'

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

export default function ActivationGatewayPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState<AccountSnapshot | null>(null)

  const isSpanish = language.startsWith('es')
  const sampleFortune = useMemo(
    () => buildWeeklyFortune(new Date(), isSpanish ? 'es-CL' : 'en-US').slice(0, 3),
    [isSpanish],
  )

  useEffect(() => {
    let cancelled = false

    const loadAccount = async () => {
      try {
        const currentAccount = await fetchAccountSnapshot()

        if (!currentAccount) {
          router.replace('/account/register')
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

        if (!cancelled) {
          setAccount(currentAccount)
          trackEvent('activate_subscription_view', {
            user_id: currentAccount.user.id,
            subscription_status: status ?? 'none',
          })
          trackMetaCustomEvent('SubscriptionActivationView', {
            user_id: currentAccount.user.id,
            subscription_status: status ?? 'none',
          })
        }
      } catch {
        if (!cancelled) {
          router.replace('/account/register')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadAccount()

    return () => {
      cancelled = true
    }
  }, [router])

  const actionState = useMemo(() => {
    if (!account?.subscription) {
      return {
        href: '/checkout/start',
        label: isSpanish ? 'Desbloquear Trimry' : 'Unlock Trimry',
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
  }, [account?.subscription, isSpanish])

  if (loading) {
    return (
      <section className="cosmic-shell mx-auto max-w-5xl rounded-[2rem] p-6 text-slate-100 sm:p-8">
        <p>{isSpanish ? 'Preparando el ritual...' : 'Preparing the ritual...'}</p>
      </section>
    )
  }

  return (
    <section className="cosmic-shell mx-auto max-w-5xl p-4 sm:p-6">
      <div className="luck-glow cosmic-panel relative overflow-hidden rounded-[2.3rem] p-5 sm:p-7 lg:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(90,243,220,0.22),transparent_30%),radial-gradient(circle_at_86%_0%,rgba(117,173,255,0.18),transparent_32%),radial-gradient(circle_at_70%_82%,rgba(247,221,145,0.12),transparent_30%)]" />
        <div className="relative z-10 grid gap-6 lg:grid-cols-[1.04fr_0.96fr] lg:gap-8">
          <div className="space-y-5">
            <p className="cosmic-badge inline-flex rounded-full px-4 py-1 text-xs font-bold uppercase tracking-[0.24em] text-cyan-100">
              {isSpanish ? 'Desbloqueo' : 'Unlock'}
            </p>
            <h1 className="max-w-2xl text-4xl leading-[1.04] text-slate-50 sm:text-5xl lg:text-6xl">
              {isSpanish
                ? 'El Luck Guru ya dejó lista tu aventura de fortuna.'
                : 'Luck Guru has already prepared your fortune adventure.'}
            </h1>
            <p className="max-w-xl text-base text-slate-100/86 sm:text-lg">
              {isSpanish
                ? 'Después de pagar, eliges cómo quieres recibir Trimry: email, WhatsApp o ambos. También desbloqueas los poderes mágicos completos del Luck Guru en el chat.'
                : 'After payment, you choose how Trimry reaches you: email, WhatsApp, or both. You also unlock Luck Guru’s full magical powers in chat.'}
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                isSpanish ? 'Email primero' : 'Email first',
                isSpanish ? 'WhatsApp opcional' : 'WhatsApp optional',
                isSpanish ? 'Ambos cuando quieras' : 'Both when you want',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-cyan-100/18 bg-cyan-100/8 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-cyan-50"
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="rounded-[1.7rem] border border-cyan-200/18 bg-slate-950/42 p-4 sm:p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100/78">
                {isSpanish ? 'Tu ritual semanal incluye' : 'Your weekly ritual includes'}
              </p>
              <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-100/84">
                <li>
                  {isSpanish
                    ? 'Días buenos, raros y difíciles para cada semana.'
                    : 'Good, rare, and challenging days for every week.'}
                </li>
                <li>
                  {isSpanish
                    ? 'Consejo del Luck Guru con sus poderes completos ya desbloqueados.'
                    : 'Luck Guru guidance with its full powers unlocked.'}
                </li>
                <li>
                  {isSpanish
                    ? 'Informe por correo y canales opcionales después de desbloquear.'
                    : 'Reports by email with optional channels after unlock.'}
                </li>
              </ul>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={actionState.href}
                onClick={() => {
                  trackEvent('activate_subscription_click', {
                    language,
                    destination: actionState.href,
                  })
                  trackMetaCustomEvent('ActivateSubscriptionClick', {
                    language,
                    destination: actionState.href,
                  })
                }}
                className="cosmic-button-primary inline-flex rounded-full px-6 py-3 text-sm font-black uppercase tracking-[0.16em]"
              >
                {actionState.label}
              </Link>
              <OpenLuckGuruChatButton
                analyticsLocation="activation_gate"
                label={isSpanish ? 'Hablar con Luck Guru' : 'Talk to Luck Guru'}
                className="cosmic-button-secondary inline-flex rounded-full px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-cyan-50"
              />
            </div>
          </div>

          <div className="rounded-[2rem] border border-cyan-200/18 bg-slate-950/46 p-4 sm:p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-100/84">
              {isSpanish ? 'Vista previa semanal' : 'Weekly preview'}
            </p>
            <div className="mt-4 grid gap-3">
              {sampleFortune.map((day) => (
                <article
                  key={day.date}
                  className="rounded-2xl border border-cyan-100/16 bg-slate-950/38 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-50">{day.weekday}</p>
                    <span className="rounded-full border border-cyan-100/18 bg-cyan-100/8 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100">
                      {toneLabel(language, day.summary)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-100/82">{day.notes}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
