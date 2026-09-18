'use client'

import { useEffect, useRef } from 'react'

import { useLanguage } from '@/components/language-provider'
import { SUBSCRIPTION_PLAN } from '@/lib/company'
import { interpolate } from '@/lib/i18n'

type ProUpgradeSheetProps = {
  open: boolean
  // Chosen Pro: the caller decides what that means (pick the channel here,
  // send them to checkout from the dashboard).
  onUpgrade: () => void
  onDismiss: () => void
  priceUsd?: number
  // Kept for callers; Pro is bought at checkout, there is no trial any more.
  variant?: 'trial' | 'checkout'
}

// The paywall is an offer, not a wall. It opens when someone reaches for
// WhatsApp without Pro, and it always leaves with a way to keep the free plan:
// a dead end here costs a signup, and the free tier is still worth having.
export function ProUpgradeSheet({
  open,
  onUpgrade,
  onDismiss,
  priceUsd = SUBSCRIPTION_PLAN.monthlyPriceUsd,
  variant = 'trial',
}: ProUpgradeSheetProps) {
  const { messages } = useLanguage()
  const copy = messages.pro
  const upgradeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    upgradeRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onDismiss()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onDismiss, open])

  if (!open) {
    return null
  }

  const price = `US${priceUsd.toFixed(2)}`
  void variant
  const body = copy.sheetBody
  const cta = copy.sheetCta
  const finePrint = copy.sheetFinePrint

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-trimry-ink/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onDismiss}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={copy.sheetTitle}
        className="tr-card w-full max-w-md rounded-b-none p-6 sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <span className="tr-badge tr-badge-blue">{copy.badge}</span>
        <h2 className="mt-3 text-xl font-extrabold text-trimry-ink">{copy.sheetTitle}</h2>
        <p className="tr-copy mt-2 text-sm">{body}</p>

        <ul className="mt-4 space-y-2">
          {copy.proFeatures.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm text-trimry-ink">
              <span aria-hidden="true" className="mt-0.5 font-bold text-trimry-blue">
                ✓
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <button
          ref={upgradeRef}
          type="button"
          onClick={onUpgrade}
          className="tr-btn-primary mt-6 w-full"
        >
          {cta}
        </button>
        <button type="button" onClick={onDismiss} className="tr-btn-ghost mt-2 w-full">
          {copy.sheetDismiss}
        </button>
        <p className="tr-meta mt-3 text-center text-xs">
          {interpolate(finePrint, { price })}
        </p>
      </div>
    </div>
  )
}
