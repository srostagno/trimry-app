'use client'

import {
  DEFAULT_WEEKLY_DELIVERY_HOUR,
  formatDeliveryHourLabel,
} from '@/lib/schedule'

type DeliveryHourSelectProps = {
  id?: string
  value: number
  onChange: (value: number) => void
  className?: string
  locale?: string
}

export function DeliveryHourSelect({
  id,
  value,
  onChange,
  className,
  locale,
}: DeliveryHourSelectProps) {
  const currentValue =
    Number.isInteger(value) && value >= 0 && value <= 23
      ? value
      : DEFAULT_WEEKLY_DELIVERY_HOUR

  return (
    <select
      id={id}
      value={String(currentValue)}
      onChange={(event) => onChange(Number.parseInt(event.target.value, 10))}
      className={className}
    >
      {Array.from({ length: 24 }, (_, hour) => (
        <option key={hour} value={String(hour)}>
          {formatDeliveryHourLabel(hour, locale)}
        </option>
      ))}
    </select>
  )
}
