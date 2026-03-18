import { apiFetch, readApiError } from '@/lib/api-client'

type BillingSessionPayload = {
  url?: string
  message?: string
}

export async function createBillingSession(
  path: '/billing/checkout-session' | '/billing/portal-session',
  fallbackMessage: string,
) {
  const response = await apiFetch(path, {
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error(await readApiError(response, fallbackMessage))
  }

  const payload = (await response.json()) as BillingSessionPayload

  if (!payload.url) {
    throw new Error(fallbackMessage)
  }

  return payload.url
}
