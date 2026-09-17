import { apiFetch } from '@/lib/api-client'
import type { SerializedSportsPreferences } from '@/lib/sports'
import { hasAnyPreferences } from '@/lib/sports'

export type SubscriptionStatus =
  | 'pending_checkout'
  | 'active'
  | 'past_due'
  | 'paused'
  | 'canceled'

export type DeliveryPreference = 'none' | 'email' | 'whatsapp' | 'both'

export function requiresWhatsappDelivery(preference: DeliveryPreference) {
  return preference === 'whatsapp' || preference === 'both'
}

// Email is free at any cadence; WhatsApp is what Pro pays for. The API decides
// this for real — everything here only drives what the UI offers and explains.
export type Entitlement = 'pro' | 'free'
export type PlanChoice = 'free' | 'pro'

export function planForPreference(preference: DeliveryPreference): PlanChoice {
  return requiresWhatsappDelivery(preference) ? 'pro' : 'free'
}

export function trialDaysLeft(endsAt: string | null | undefined, now = Date.now()) {
  if (!endsAt) {
    return null
  }

  const remaining = new Date(endsAt).getTime() - now

  return remaining > 0 ? Math.ceil(remaining / 86_400_000) : 0
}

export type AccountSnapshot = {
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    fullName: string
    locale: string
    timeZone: string
    countryCode: string | null
    admin: boolean
    sportsPreferences: SerializedSportsPreferences | null
    activationFunnel: {
      currentStep: number
      maxStepReached: number
      totalSteps: number
      startedAt: string
      lastSeenAt: string
      completedAt: string | null
    } | null
  }
  subscription: {
    id: string
    status: SubscriptionStatus
    entitlement: Entitlement
    deliveryPreference: DeliveryPreference
    // What the account actually receives today, after the entitlement applies.
    effectiveDeliveryPreference: DeliveryPreference
    activatedAt: string | null
    deliveryHourLocal: number
    timeZone: string
    whatsappNumber: string
    monthlyPriceUsd: number
    currency: string
    cadence: string
    nextMessageAt: string
    planId: string
    canManageBilling: boolean
    trialSource: 'internal' | 'stripe' | null
    internalTrialStartedAt: string | null
    internalTrialEndsAt: string | null
    internalTrialEndedAt: string | null
    internalTrialEndNotificationSentAt: string | null
    internalTrialEndNotificationAttemptCount: number
    internalTrialEndNotificationNextAt: string | null
    stripeTrialStartedAt: string | null
    stripeTrialEndsAt: string | null
    sampleDeliverySentAt: string | null
    sampleDeliverySendingAt: string | null
    sampleDeliveryChannel: 'email' | 'whatsapp' | 'both' | null
    sampleDeliveryLastError: string | null
    createdAt: string
    updatedAt: string
  } | null
  lastDigest: {
    kind: 'daily' | 'weekly' | 'sample' | 'welcome'
    channel: 'email' | 'whatsapp'
    sentAt: string
    eventCount: number
  } | null
}

export async function fetchAccountSnapshot() {
  const response = await apiFetch(
    '/me',
    { cache: 'no-store' },
    { retryUnauthorized: false },
  )

  if (response.status === 401) {
    return null
  }

  if (!response.ok) {
    throw new Error('Unable to load account snapshot.')
  }

  return (await response.json()) as AccountSnapshot
}

export async function saveActivationFunnelStep(step: number, totalSteps?: number) {
  const response = await apiFetch(
    '/me/activation-funnel',
    {
      method: 'PATCH',
      body: JSON.stringify({
        step,
        ...(typeof totalSteps === 'number' ? { totalSteps } : {}),
      }),
    },
    { retryUnauthorized: false },
  )

  if (response.status === 401) {
    return null
  }

  if (!response.ok) {
    throw new Error('Unable to save activation funnel progress.')
  }

  return (await response.json()) as {
    activationFunnel: AccountSnapshot['user']['activationFunnel']
  }
}

export function resolveSafeRedirectPath(
  path: string | null | undefined,
  fallback: string,
) {
  const normalizedPath = path?.trim()

  if (!normalizedPath) {
    return fallback
  }

  if (!normalizedPath.startsWith('/') || normalizedPath.startsWith('//')) {
    return fallback
  }

  return normalizedPath
}

export function getStartFlowDestination(account: AccountSnapshot | null) {
  if (!account) {
    return '/activate'
  }

  if (!hasAnyPreferences(account.user.sportsPreferences)) {
    return '/activate'
  }

  if (!account.subscription) {
    return '/activate?step=3'
  }

  if (account.subscription.status === 'pending_checkout') {
    return '/checkout/start'
  }

  const whatsappNumber = account.subscription.whatsappNumber?.trim()

  if (
    requiresWhatsappDelivery(account.subscription.deliveryPreference) &&
    !whatsappNumber
  ) {
    return '/account/delivery?edit=1'
  }

  return '/dashboard'
}
