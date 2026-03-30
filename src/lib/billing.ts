import { readApiError } from '@/lib/api-client'

type BillingSessionPayload = {
  url?: string
  message?: string
}

export class BillingSessionError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'BillingSessionError'
    this.status = status
  }
}

export async function createBillingSession(
  path: '/billing/checkout-session' | '/billing/portal-session',
  fallbackMessage: string,
) {
  const proxyPath =
    path === '/billing/checkout-session'
      ? '/api/billing/checkout-session'
      : '/api/billing/portal-session'

  const response = await fetch(proxyPath, {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new BillingSessionError(
      response.status,
      await readApiError(response, fallbackMessage),
    )
  }

  const payload = (await response.json()) as BillingSessionPayload

  if (!payload.url) {
    throw new Error(fallbackMessage)
  }

  return payload.url
}
