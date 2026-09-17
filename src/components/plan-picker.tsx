'use client'

import clsx from 'clsx'

import { useLanguage } from '@/components/language-provider'
import { SUBSCRIPTION_PLAN } from '@/lib/company'
import { interpolate } from '@/lib/i18n'
import type { PlanChoice } from '@/lib/start-flow'

type PlanPickerProps = {
  value: PlanChoice
  onChange: (plan: PlanChoice) => void
  priceUsd?: number
}

// Both plans are shown side by side at the moment of choosing, rather than
// hiding Pro behind a later upsell: the free plan is genuinely useful, and
// saying so plainly is what makes the paid one feel like a choice.
export function PlanPicker({
  value,
  onChange,
  priceUsd = SUBSCRIPTION_PLAN.monthlyPriceUsd,
}: PlanPickerProps) {
  const { messages } = useLanguage()
  const copy = messages.pro
  const price = `US$${priceUsd.toFixed(2)}`

  const plans: Array<{
    id: PlanChoice
    title: string
    price: string
    tagline: string
    features: string[]
    ribbon?: string
  }> = [
    {
      id: 'free',
      title: copy.freeTitle,
      price: copy.freePrice,
      tagline: copy.freeTagline,
      features: copy.freeFeatures,
    },
    {
      id: 'pro',
      title: copy.proTitle,
      price: interpolate(copy.proPrice, { price }),
      tagline: copy.proTagline,
      features: copy.proFeatures,
      ribbon: copy.proRibbon,
    },
  ]

  return (
    <div role="radiogroup" aria-label={copy.planPickerLabel} className="grid gap-3 sm:grid-cols-2">
      {plans.map((plan) => {
        const active = plan.id === value

        return (
          <button
            key={plan.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(plan.id)}
            className={clsx(
              'relative rounded-2xl border p-5 text-left transition',
              active
                ? 'border-trimry-blue bg-trimry-blue/5 shadow-card ring-2 ring-trimry-blue/20'
                : 'border-trimry-line bg-white hover:border-trimry-blue/40',
            )}
          >
            {plan.ribbon ? (
              <span className="tr-badge tr-badge-blue absolute right-4 top-4">{plan.ribbon}</span>
            ) : null}

            <span className="block text-lg font-extrabold text-trimry-ink">{plan.title}</span>
            <span
              className={clsx(
                'mt-1 block text-sm font-bold',
                plan.id === 'pro' ? 'tr-gradient-text' : 'text-trimry-ink',
              )}
            >
              {plan.price}
            </span>
            <span className="tr-meta mt-1 block text-xs">{plan.tagline}</span>

            <ul className="mt-4 space-y-1.5">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-xs text-trimry-ink">
                  <span aria-hidden="true" className="mt-0.5 font-bold text-trimry-blue">
                    ✓
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <span
              className={clsx(
                'mt-4 block text-xs font-extrabold uppercase tracking-[0.12em]',
                active ? 'text-trimry-blue' : 'text-slate-400',
              )}
            >
              {active ? copy.chosen : copy.choose}
            </span>
          </button>
        )
      })}
    </div>
  )
}
