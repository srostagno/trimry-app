'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { trackEvent, trackMetaCustomEvent } from '@/lib/analytics'

const START_FLOW_TARGET = '/activate'

type StartFlowButtonProps = {
  children: ReactNode
  className: string
  loadingLabel?: string
  analyticsLocation?: string
  title?: string
}

export function StartFlowButton({
  children,
  className,
  loadingLabel = 'Opening...',
  analyticsLocation = 'unknown',
  title,
}: StartFlowButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    if (loading) {
      return
    }

    setLoading(true)

    trackEvent('start_flow_click', {
      cta_location: analyticsLocation,
      destination: START_FLOW_TARGET,
      resolved_destination: START_FLOW_TARGET,
      resolution: 'direct_activation_flow',
    })
    trackMetaCustomEvent('StartFlowClick', {
      cta_location: analyticsLocation,
      destination: START_FLOW_TARGET,
      resolved_destination: START_FLOW_TARGET,
      resolution: 'direct_activation_flow',
    })

    router.push(START_FLOW_TARGET)
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={className}
      title={title}
    >
      {loading ? loadingLabel : children}
    </button>
  )
}
