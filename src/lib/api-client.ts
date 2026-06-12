const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()
const DEFAULT_API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://api.trimry.com/api/v1'
    : 'http://localhost:4000/api/v1'

export const API_BASE_URL = (
  configuredBaseUrl && configuredBaseUrl.length > 0
    ? configuredBaseUrl
    : DEFAULT_API_BASE_URL
).replace(/\/+$/, '')

type ApiErrorPayload = {
  message?: string
  error?: {
    message?: string
  }
}

let refreshPromise: Promise<boolean> | null = null

function buildUrl(path: string) {
  if (!path.startsWith('/')) {
    throw new Error(`API path must start with "/". Received: ${path}`)
  }

  return `${API_BASE_URL}${path}`
}

function withDefaultHeaders(init: RequestInit) {
  const hasBody = init.body !== undefined && init.body !== null

  if (!hasBody || init.body instanceof FormData) {
    return init
  }

  const headers = new Headers(init.headers)

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  return {
    ...init,
    headers,
  }
}

async function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = fetch(buildUrl('/auth/refresh'), {
      method: 'POST',
      credentials: 'include',
    })
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

export async function apiFetch(
  path: string,
  init: RequestInit = {},
  options: { retryUnauthorized?: boolean } = {},
) {
  const retryUnauthorized = options.retryUnauthorized ?? true
  const requestInit = withDefaultHeaders(init)

  const response = await fetch(buildUrl(path), {
    ...requestInit,
    credentials: 'include',
  })

  if (
    response.status === 401 &&
    retryUnauthorized &&
    path !== '/auth/refresh'
  ) {
    const refreshed = await refreshSession()

    if (!refreshed) {
      return response
    }

    return fetch(buildUrl(path), {
      ...requestInit,
      credentials: 'include',
    })
  }

  return response
}

export async function readApiError(
  response: Response,
  fallback: string,
) {
  const statusLabel = `HTTP ${response.status}${
    response.statusText ? ` ${response.statusText}` : ''
  }`

  try {
    const rawBody = await response.text()

    if (!rawBody.trim()) {
      return `${fallback} (${statusLabel})`
    }

    try {
      const payload = JSON.parse(rawBody) as ApiErrorPayload
      const message = payload.message ?? payload.error?.message

      return message?.trim() || `${fallback} (${statusLabel})`
    } catch {
      const preview = rawBody
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 280)

      return preview
        ? `${fallback} (${statusLabel}): ${preview}`
        : `${fallback} (${statusLabel})`
    }
  } catch {
    return `${fallback} (${statusLabel})`
  }
}
