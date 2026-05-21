'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

import {
  trackEvent,
  trackMetaCustomEvent,
  trackMetaStandardEvent,
} from '@/lib/analytics'
import {
  fetchAccountSnapshot,
  getStartFlowDestination,
} from '@/lib/start-flow'

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
      const account = await fetchAccountSnapshot()
      const destination = getStartFlowDestination(account)
      trackEvent('start_flow_click', {
        cta_location: analyticsLocation,
        destination,
        auth_state: account ? 'authenticated' : 'guest',
      })
      trackMetaCustomEvent('StartFlowClick', {
        cta_location: analyticsLocation,
        destination,
        auth_state: account ? 'authenticated' : 'guest',
      })

      if (!account) {
        trackEvent('generate_lead', {
          lead_type: 'account_start',
          content_name: 'Start account flow',
          content_category: 'account_intent',
          cta_location: analyticsLocation,
          destination,
        })
        trackMetaStandardEvent('Lead', {
          content_name: 'Start account flow',
          content_category: 'account_intent',
          cta_location: analyticsLocation,
        })
      }

      router.push(destination)
      router.refresh()
    } catch {
      trackEvent('start_flow_click', {
        cta_location: analyticsLocation,
        destination: '/account/register',
        auth_state: 'guest',
        resolution: 'fallback',
      })
      trackMetaCustomEvent('StartFlowClick', {
        cta_location: analyticsLocation,
        destination: '/account/register',
        auth_state: 'guest',
        resolution: 'fallback',
      })
      trackMetaStandardEvent('Lead', {
        content_name: 'Start account flow',
        content_category: 'account_intent',
        cta_location: analyticsLocation,
      })
      trackEvent('generate_lead', {
        lead_type: 'account_start',
        content_name: 'Start account flow',
        content_category: 'account_intent',
        cta_location: analyticsLocation,
        destination: '/account/register',
        resolution: 'fallback',
      })
      router.push('/account/register')
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
