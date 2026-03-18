'use client'

import { useEffect, useState } from 'react'

import { getSupportedTimeZones } from '@/lib/schedule'

type TimeZoneSelectProps = {
  id?: string
  value: string
  onChange: (value: string) => void
  className?: string
}

export function TimeZoneSelect({
  id,
  value,
  onChange,
  className,
}: TimeZoneSelectProps) {
  const [options, setOptions] = useState<string[]>([value])

  useEffect(() => {
    const supported = getSupportedTimeZones()

    setOptions(
      supported.includes(value) ? supported : [value, ...supported],
    )
  }, [value])

  return (
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={className}
    >
      {options.map((timeZone) => (
        <option key={timeZone} value={timeZone}>
          {timeZone}
        </option>
      ))}
    </select>
  )
}
