import { apiFetch } from '@/lib/api-client'
import type { ActivityTone } from '@/lib/fortune'

export type SubscriptionStatus =
  | 'pending_checkout'
  | 'active'
  | 'past_due'
  | 'paused'
  | 'canceled'

export type DeliveryPreference = 'none' | 'email' | 'whatsapp' | 'both'

export type ManifestationWishHistoryEntry = {
  id: string
  previousWish: string | null
  nextWish: string | null
  changedAt: string
  source: 'onboarding' | 'account' | 'admin' | 'system'
}

export type WeeklyFortuneDay = {
  date: string
  weekday: string
  summary: ActivityTone
  notes: string
  notesByLanguage: {
    en: string
    es: string
    pt: string
  }
  activities: {
    haircut: ActivityTone
    shave: ActivityTone
    nails: ActivityTone
    release: ActivityTone
  }
}

export function requiresWhatsappDelivery(preference: DeliveryPreference) {
  return preference === 'whatsapp' || preference === 'both'
}

export type AccountSnapshot = {
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    fullName: string
    birthDate: string | null
    manifestationWish: string | null
    manifestationWishHistory: ManifestationWishHistoryEntry[]
    locale: string
    timeZone: string
    admin: boolean
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
    deliveryPreference: DeliveryPreference
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
  weeklyFortune?: WeeklyFortuneDay[]
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

export async function saveActivationFunnelStep(
  step: number,
  totalSteps?: number,
) {
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
    return '/account/register'
  }

  if (!account.subscription) {
    return '/activate'
  }

  if (account.subscription?.status === 'pending_checkout') {
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
