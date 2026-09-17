'use client'

import clsx from 'clsx'

import { useLanguage } from '@/components/language-provider'
import { requiresWhatsappDelivery, type DeliveryPreference } from '@/lib/start-flow'

type DeliveryPreferenceSelectorProps = {
  value: DeliveryPreference
  onChange: (value: DeliveryPreference) => void
  includeNone?: boolean
  // Icon + title only, in one row: for short signup forms.
  compact?: boolean
  // A free account still sees the WhatsApp options, badged and fully
  // clickable: a disabled control is a dead end, a badge that opens the offer
  // is a way into checkout.
  lockedForPro?: boolean
  onProRequired?: (value: DeliveryPreference) => void
}

export function DeliveryPreferenceSelector({
  value,
  onChange,
  includeNone = true,
  compact = false,
  lockedForPro = false,
  onProRequired,
}: DeliveryPreferenceSelectorProps) {
  const { messages } = useLanguage()
  const select = (next: DeliveryPreference) => {
    if (lockedForPro && requiresWhatsappDelivery(next)) {
      onProRequired?.(next)
      return
    }

    onChange(next)
  }
  const deliveryOptions: Array<{
    value: DeliveryPreference
    title: string
    description: string
    icon: string
  }> = [
    {
      value: 'email',
      title: messages.deliveryChannels.emailTitle,
      description: messages.deliveryChannels.emailDescription,
      icon: '✉️',
    },
    {
      value: 'whatsapp',
      title: messages.deliveryChannels.whatsappTitle,
      description: messages.deliveryChannels.whatsappDescription,
      icon: '💬',
    },
    {
      value: 'both',
      title: messages.deliveryChannels.bothTitle,
      description: messages.deliveryChannels.bothDescription,
      icon: '⚡',
    },
    ...(includeNone
      ? [
          {
            value: 'none' as const,
            title: messages.deliveryChannels.noneTitle,
            description: messages.deliveryChannels.noneDescription,
            icon: '🖥️',
          },
        ]
      : []),
  ]

  return (
    <div className={clsx('grid gap-3', compact ? 'grid-cols-3 gap-2' : 'grid-cols-1 sm:grid-cols-2')}>
      {deliveryOptions.map((option) => {
        const active = option.value === value

        if (compact) {
          return (
            <label
              key={option.value}
              className={clsx(
                'flex cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border px-2 py-3 text-center transition',
                active
                  ? 'border-trimry-blue bg-trimry-blue/5 shadow-card ring-2 ring-trimry-blue/20'
                  : 'border-trimry-line bg-white hover:border-trimry-blue/40',
              )}
            >
              <input
                type="radio"
                name="delivery-preference"
                value={option.value}
                checked={active}
                onChange={() => select(option.value)}
                className="sr-only"
              />
              <span className="text-xl leading-none" aria-hidden="true">
                {option.icon}
              </span>
              <span className="text-xs font-extrabold leading-tight text-trimry-ink">{option.title}</span>
              {lockedForPro && requiresWhatsappDelivery(option.value) ? (
                <span className="tr-badge tr-badge-blue px-1.5 py-0.5 text-[9px]">
                  {messages.pro.badge}
                </span>
              ) : null}
            </label>
          )
        }

        return (
          <label
            key={option.value}
            className={clsx(
              'cursor-pointer rounded-2xl border p-4 transition',
              active
                ? 'border-trimry-blue bg-trimry-blue/5 shadow-card ring-2 ring-trimry-blue/20'
                : 'border-trimry-line bg-white hover:border-trimry-blue/40',
            )}
          >
            <input
              type="radio"
              name="delivery-preference"
              value={option.value}
              checked={active}
              onChange={() => select(option.value)}
              className="sr-only"
            />
            <div className="flex items-start gap-3">
              <span className="text-xl leading-none" aria-hidden="true">
                {option.icon}
              </span>
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 text-sm font-extrabold text-trimry-ink">
                  {option.title}
                  {lockedForPro && requiresWhatsappDelivery(option.value) ? (
                    <span className="tr-badge tr-badge-blue">{messages.pro.badge}</span>
                  ) : null}
                </p>
                <p className="mt-1 text-sm text-trimry-slate">{option.description}</p>
              </div>
            </div>
          </label>
        )
      })}
    </div>
  )
}
