'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { trackEvent, trackMetaCustomEvent } from '@/lib/analytics'

type StartFlowButtonProps = {
  children: ReactNode
  className: string
  loadingLabel?: string
  analyticsLocation?: string
}

export function StartFlowButton({
  children,
  className,
  loadingLabel = 'Opening...',
  analyticsLocation = 'unknown',
}: StartFlowButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    if (loading) {
      return
    }

    setLoading(true)

    try {
      trackEvent('start_flow_click', {
        cta_location: analyticsLocation,
        destination: '/today',
      })
      trackMetaCustomEvent('StartFlowClick', {
        cta_location: analyticsLocation,
        destination: '/today',
      })

      router.push('/today')
      router.refresh()
    } catch {
      trackEvent('start_flow_click', {
        cta_location: analyticsLocation,
        destination: '/today',
        resolution: 'fallback',
      })
      trackMetaCustomEvent('StartFlowClick', {
        cta_location: analyticsLocation,
        destination: '/today',
        resolution: 'fallback',
      })
      router.push('/today')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={className}
    >
      {loading ? loadingLabel : children}
    </button>
  )
}
