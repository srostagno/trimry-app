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
  applyPricingTemplateValues,
  parseCheckoutPlanPricing,
  resolvePricingTemplateValues,
  type CheckoutPlanPricing,
} from '@/lib/plan-pricing'
import {
  DEFAULT_LANGUAGE,
  getMessages,
  languageFromLocale,
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

type InitialLanguageSource = 'viewer' | 'stored' | 'detected' | 'default'

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
)

export function LanguageProvider({
  children,
  initialLanguage = DEFAULT_LANGUAGE,
  initialLanguageSource = 'default',
}: {
  children: ReactNode
  initialLanguage?: LanguageCode
  initialLanguageSource?: InitialLanguageSource
}) {
  const [language, setLanguageState] = useState<LanguageCode>(initialLanguage)
  const [planPricing, setPlanPricing] = useState<CheckoutPlanPricing | null>(null)

  useEffect(() => {
    if (initialLanguageSource === 'viewer') {
      window.localStorage.setItem('trimry-language', initialLanguage)
      return
    }

    const storedLanguage = languageFromLocale(
      window.localStorage.getItem('trimry-language'),
    )

    if (storedLanguage) {
      setLanguageState(storedLanguage)
    }
  }, [initialLanguage, initialLanguageSource])

  useEffect(() => {
    document.documentElement.lang = language
    window.localStorage.setItem('trimry-language', language)
    document.cookie = `trimry-language=${language}; path=/; max-age=31536000; samesite=lax`
    setAnalyticsUserProperties({
      preferred_language: language,
    })
  }, [language])

  useEffect(() => {
    let cancelled = false

    const loadPlanPricing = async () => {
      try {
        const response = await apiFetch(
          '/billing/plan',
          { cache: 'no-store' },
          { retryUnauthorized: false },
        )

        if (!response.ok) {
          return
        }

        const parsed = parseCheckoutPlanPricing(await response.json())

        if (!parsed || cancelled) {
          return
        }

        setPlanPricing(parsed)
      } catch {
        return
      }
    }

    void loadPlanPricing()

    return () => {
      cancelled = true
    }
  }, [])

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

  const messages = useMemo(() => {
    const baseMessages = getMessages(language)
    const pricingTemplateValues = resolvePricingTemplateValues(planPricing, language)

    return applyPricingTemplateValues(baseMessages, pricingTemplateValues)
  }, [language, planPricing])

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
