const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()

export const API_BASE_URL = (
  configuredBaseUrl && configuredBaseUrl.length > 0
    ? configuredBaseUrl
    : 'http://localhost:4000/api/v1'
).replace(/\/+$/, '')

type ApiErrorPayload = {
  message?: string
}

let refreshPromise: Promise<boolean> | null = null

function buildUrl(path: string) {
  if (!path.startsWith('/')) {
    throw new Error(`API path must start with "/". Received: ${path}`)
  }

  return `${API_BASE_URL}${path}`
}

function withDefaultHeaders(init: RequestInit) {
  if (init.body instanceof FormData) {
    return init
  }

  return {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
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
  try {
    const payload = (await response.json()) as ApiErrorPayload
    return payload.message ?? fallback
  } catch {
    return fallback
  }
}
