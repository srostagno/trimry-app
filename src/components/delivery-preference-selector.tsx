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
                ? 'border-[rgba(255,255,255,0.36)] bg-[linear-gradient(140deg,rgba(16,40,88,0.68),rgba(41,31,102,0.52))] text-slate-50 shadow-[0_16px_36px_rgba(17,38,84,0.24)]'
                : 'border-[rgba(128,178,255,0.18)] bg-[linear-gradient(145deg,rgba(7,15,36,0.72),rgba(16,18,54,0.42))] text-slate-100/78 hover:border-[rgba(157,212,255,0.28)]'
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
                <p className="mt-2 text-sm text-[color:var(--cosmic-copy)]">{option.description}</p>
              </div>
              <span
                className={`mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border ${
                  active
                    ? 'border-white/50 bg-[linear-gradient(135deg,#f6fff5,#9cf6ff_42%,#8175ff)] text-slate-950'
                    : 'border-[rgba(160,220,255,0.35)] text-transparent'
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
