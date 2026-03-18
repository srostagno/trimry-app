'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { apiFetch } from '@/lib/api-client'
import {
  setAnalyticsUserProperties,
  trackEvent,
} from '@/lib/analytics'
import {
  DEFAULT_LANGUAGE,
  getMessages,
  isLanguageCode,
  type LanguageCode,
} from '@/lib/i18n'

type SetLanguageOptions = {
  persist?: boolean
  track?: boolean
}

type LanguageContextValue = {
  language: LanguageCode
  setLanguage: (language: LanguageCode, options?: SetLanguageOptions) => void
  messages: ReturnType<typeof getMessages>
}

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
)

export function LanguageProvider({
  children,
  initialLanguage = DEFAULT_LANGUAGE,
}: {
  children: ReactNode
  initialLanguage?: LanguageCode
}) {
  const [language, setLanguageState] = useState<LanguageCode>(initialLanguage)

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem('trimry-language')

    if (storedLanguage && isLanguageCode(storedLanguage)) {
      setLanguageState(storedLanguage)
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = language
    window.localStorage.setItem('trimry-language', language)
    document.cookie = `trimry-language=${language}; path=/; max-age=31536000; samesite=lax`
    setAnalyticsUserProperties({
      preferred_language: language,
    })
  }, [language])

  const setLanguage = (value: LanguageCode, options?: SetLanguageOptions) => {
    if (value === language) {
      return
    }

    setLanguageState(value)
    window.localStorage.setItem('trimry-language', value)

    if (options?.track !== false) {
      trackEvent('language_change', {
        previous_language: language,
        selected_language: value,
      })
    }

    if (options?.persist === false) {
      return
    }

    void apiFetch(
      '/users/me/preferences',
      {
        method: 'PATCH',
        body: JSON.stringify({ locale: value }),
      },
      { retryUnauthorized: false },
    ).catch(() => {
      return
    })
  }

  const messages = useMemo(() => getMessages(language), [language])

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, messages }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)

  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider.')
  }

  return context
}
