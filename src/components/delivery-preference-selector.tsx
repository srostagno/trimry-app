'use client'

import { useLanguage } from '@/components/language-provider'
import type { DeliveryPreference } from '@/lib/start-flow'

type DeliveryPreferenceSelectorProps = {
  value: DeliveryPreference
  onChange: (value: DeliveryPreference) => void
}

export function DeliveryPreferenceSelector({
  value,
  onChange,
}: DeliveryPreferenceSelectorProps) {
  const { messages } = useLanguage()
  const deliveryOptions: Array<{
    value: DeliveryPreference
    title: string
    description: string
  }> = [
    {
      value: 'both',
      title: messages.deliveryChannels.bothTitle,
      description: messages.deliveryChannels.bothDescription,
    },
    {
      value: 'email',
      title: messages.deliveryChannels.emailTitle,
      description: messages.deliveryChannels.emailDescription,
    },
    {
      value: 'whatsapp',
      title: messages.deliveryChannels.whatsappTitle,
      description: messages.deliveryChannels.whatsappDescription,
    },
  ]

  return (
    <div className="grid gap-3">
      {deliveryOptions.map((option) => {
        const active = option.value === value

        return (
          <label
            key={option.value}
            className={`cursor-pointer rounded-2xl border px-4 py-4 transition ${
              active
                ? 'border-cyan-200/45 bg-cyan-300/14 text-slate-50'
                : 'border-cyan-200/16 bg-slate-950/32 text-slate-100/78'
            }`}
          >
            <input
              type="radio"
              name="delivery-preference"
              value={option.value}
              checked={active}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.16em]">
                  {option.title}
                </p>
                <p className="mt-2 text-sm text-slate-100/76">{option.description}</p>
              </div>
              <span
                className={`mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border ${
                  active
                    ? 'border-cyan-100 bg-cyan-100 text-slate-950'
                    : 'border-cyan-100/35 text-transparent'
                }`}
              >
                •
              </span>
            </div>
          </label>
        )
      })}
    </div>
  )
}
