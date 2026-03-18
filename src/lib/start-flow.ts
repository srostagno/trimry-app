import { apiFetch } from '@/lib/api-client'

export type SubscriptionStatus =
  | 'pending_checkout'
  | 'active'
  | 'past_due'
  | 'paused'
  | 'canceled'

export type DeliveryPreference = 'email' | 'whatsapp' | 'both'

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
    locale: string
    timeZone: string
  }
  subscription: {
    id: string
    status: SubscriptionStatus
    deliveryPreference: DeliveryPreference
    deliveryHourLocal: number
    whatsappNumber: string
    monthlyPriceUsd: number
    currency: string
    cadence: string
    nextMessageAt: string
    planId: string
    canManageBilling: boolean
    createdAt: string
    updatedAt: string
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

export function getStartFlowDestination(account: AccountSnapshot | null) {
  if (!account) {
    return '/account/register'
  }

  if (!account.subscription) {
    return '/account/delivery'
  }

  const whatsappNumber = account.subscription.whatsappNumber?.trim()

  if (
    requiresWhatsappDelivery(account.subscription.deliveryPreference) &&
    !whatsappNumber
  ) {
    return '/account/delivery'
  }

  if (account.subscription?.status === 'pending_checkout') {
    return '/activate'
  }

  return '/dashboard'
}
