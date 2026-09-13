'use client'

import clsx from 'clsx'

import { useLanguage } from '@/components/language-provider'
import type { DeliveryPreference } from '@/lib/start-flow'

type DeliveryPreferenceSelectorProps = {
  value: DeliveryPreference
  onChange: (value: DeliveryPreference) => void
  includeNone?: boolean
}

export function DeliveryPreferenceSelector({
  value,
  onChange,
  includeNone = true,
}: DeliveryPreferenceSelectorProps) {
  const { messages } = useLanguage()
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
    <div className="grid gap-3 sm:grid-cols-2">
      {deliveryOptions.map((option) => {
        const active = option.value === value

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
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            <div className="flex items-start gap-3">
              <span className="text-xl leading-none" aria-hidden="true">
                {option.icon}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-extrabold text-trimry-ink">{option.title}</p>
                <p className="mt-1 text-sm text-trimry-slate">{option.description}</p>
              </div>
            </div>
          </label>
        )
      })}
    </div>
  )
}
