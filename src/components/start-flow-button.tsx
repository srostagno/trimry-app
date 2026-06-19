'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { trackEvent, trackMetaCustomEvent } from '@/lib/analytics'
import { fetchAccountSnapshot, getStartFlowDestination } from '@/lib/start-flow'

const START_FLOW_TARGET = '/activate'
const REGISTER_WITH_REDIRECT = `/account/register?redirect=${encodeURIComponent(
  START_FLOW_TARGET,
)}`

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

    try {
      let destination = REGISTER_WITH_REDIRECT
      let resolution = 'requires_registration'

      const account = await fetchAccountSnapshot()

      if (account) {
        destination = getStartFlowDestination(account)
        resolution = destination === '/activate'
          ? 'direct_activation'
          : destination === '/checkout/start'
            ? 'resume_checkout'
            : 'existing_member'
      }

      trackEvent('start_flow_click', {
        cta_location: analyticsLocation,
        destination: START_FLOW_TARGET,
        resolved_destination: destination,
        resolution,
      })
      trackMetaCustomEvent('StartFlowClick', {
        cta_location: analyticsLocation,
        destination: START_FLOW_TARGET,
        resolved_destination: destination,
        resolution,
      })

      router.push(destination)
      router.refresh()
    } catch {
      trackEvent('start_flow_click', {
        cta_location: analyticsLocation,
        destination: START_FLOW_TARGET,
        resolved_destination: REGISTER_WITH_REDIRECT,
        resolution: 'fallback_requires_registration',
      })
      trackMetaCustomEvent('StartFlowClick', {
        cta_location: analyticsLocation,
        destination: START_FLOW_TARGET,
        resolved_destination: REGISTER_WITH_REDIRECT,
        resolution: 'fallback_requires_registration',
      })
      router.push(REGISTER_WITH_REDIRECT)
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
      title={title}
    >
      {loading ? loadingLabel : children}
    </button>
  )
}
