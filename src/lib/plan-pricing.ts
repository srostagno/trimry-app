import { SUBSCRIPTION_PLAN } from '@/lib/company'
import { interpolate, type LanguageCode } from '@/lib/i18n'

type BillingInterval = 'day' | 'week' | 'month' | 'year'

export type CheckoutPlanPricing = {
  priceId: string
  amount: number
  amountMinor: number
  currency: string
  interval: BillingInterval | null
  intervalCount: number | null
  cadence: string
}

export type PricingTemplateValues = {
  billingInline: string
  billingCompact: string
  billingLegal: string
}

type NormalizedCheckoutPlanPricing = Omit<
  CheckoutPlanPricing,
  'interval' | 'intervalCount'
> & {
  interval: BillingInterval
  intervalCount: number
}

const DEFAULT_CHECKOUT_PLAN_PRICING: NormalizedCheckoutPlanPricing = {
  priceId: '',
  amount: SUBSCRIPTION_PLAN.monthlyPriceUsd,
  amountMinor: Math.round(SUBSCRIPTION_PLAN.monthlyPriceUsd * 100),
  currency: SUBSCRIPTION_PLAN.currency,
  interval: 'month',
  intervalCount: 1,
  cadence: SUBSCRIPTION_PLAN.cadence,
}

function languageLocale(language: LanguageCode) {
  return language === 'es' ? 'es-CL' : 'en-US'
}

function intervalLabel(
  language: LanguageCode,
  interval: BillingInterval,
  intervalCount: number,
) {
  if (language === 'es') {
    if (interval === 'day') {
      return intervalCount === 1 ? 'día' : `${intervalCount} días`
    }

    if (interval === 'week') {
      return intervalCount === 1 ? 'semana' : `${intervalCount} semanas`
    }

    if (interval === 'month') {
      return intervalCount === 1 ? 'mes' : `${intervalCount} meses`
    }

    return intervalCount === 1 ? 'año' : `${intervalCount} años`
  }

  if (interval === 'day') {
    return intervalCount === 1 ? 'day' : `${intervalCount} days`
  }

  if (interval === 'week') {
    return intervalCount === 1 ? 'week' : `${intervalCount} weeks`
  }

  if (interval === 'month') {
    return intervalCount === 1 ? 'month' : `${intervalCount} months`
  }

  return intervalCount === 1 ? 'year' : `${intervalCount} years`
}

function legalCadenceLabel(
  language: LanguageCode,
  interval: BillingInterval,
  intervalCount: number,
) {
  if (language === 'es') {
    if (intervalCount === 1) {
      if (interval === 'day') {
        return 'por día'
      }

      if (interval === 'week') {
        return 'por semana'
      }

      if (interval === 'month') {
        return 'por mes'
      }

      return 'por año'
    }

    return `cada ${intervalLabel(language, interval, intervalCount)}`
  }

  if (intervalCount === 1) {
    return `per ${intervalLabel(language, interval, intervalCount)}`
  }

  return `every ${intervalLabel(language, interval, intervalCount)}`
}

function currencyAmount(
  language: LanguageCode,
  amount: number,
  currency: string,
) {
  try {
    return new Intl.NumberFormat(languageLocale(language), {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
    }).format(amount)
  } catch {
    return `$${amount.toFixed(2)}`
  }
}

function currencyAmountPlain(language: LanguageCode, amount: number) {
  return new Intl.NumberFormat(languageLocale(language), {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function normalizePricing(
  pricing: CheckoutPlanPricing | null | undefined,
): NormalizedCheckoutPlanPricing {
  if (!pricing) {
    return DEFAULT_CHECKOUT_PLAN_PRICING
  }

  const amount =
    typeof pricing.amount === 'number' && Number.isFinite(pricing.amount)
      ? pricing.amount
      : DEFAULT_CHECKOUT_PLAN_PRICING.amount
  const amountMinor =
    typeof pricing.amountMinor === 'number' &&
    Number.isFinite(pricing.amountMinor) &&
    Number.isInteger(pricing.amountMinor)
      ? pricing.amountMinor
      : DEFAULT_CHECKOUT_PLAN_PRICING.amountMinor
  const interval: BillingInterval =
    pricing.interval === 'day' ||
    pricing.interval === 'week' ||
    pricing.interval === 'month' ||
    pricing.interval === 'year'
      ? pricing.interval
      : 'month'
  const intervalCount =
    typeof pricing.intervalCount === 'number' &&
    Number.isFinite(pricing.intervalCount) &&
    Number.isInteger(pricing.intervalCount) &&
    pricing.intervalCount > 0
      ? pricing.intervalCount
      : 1

  return {
    priceId: pricing.priceId,
    amount,
    amountMinor,
    currency: pricing.currency.toUpperCase(),
    interval,
    intervalCount,
    cadence: pricing.cadence,
  }
}

export function resolvePricingTemplateValues(
  pricing: CheckoutPlanPricing | null | undefined,
  language: LanguageCode,
): PricingTemplateValues {
  const normalized = normalizePricing(pricing)
  const amountWithSymbol = currencyAmount(language, normalized.amount, normalized.currency)
  const plainAmount = currencyAmountPlain(language, normalized.amount)
  const slashCadence = intervalLabel(language, normalized.interval, normalized.intervalCount)
  const legalCadence = legalCadenceLabel(
    language,
    normalized.interval,
    normalized.intervalCount,
  )

  return {
    billingInline: `${amountWithSymbol} ${normalized.currency} / ${slashCadence}`,
    billingCompact: `${amountWithSymbol}/${slashCadence}`,
    billingLegal: `${normalized.currency} ${plainAmount} ${legalCadence}`,
  }
}

export function applyPricingTemplateValues<T>(
  value: T,
  values: PricingTemplateValues,
): T {
  if (typeof value === 'string') {
    return interpolate(value, values) as T
  }

  if (Array.isArray(value)) {
    return value.map((entry) =>
      applyPricingTemplateValues(entry, values),
    ) as T
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).map(
      ([key, entryValue]) => [
        key,
        applyPricingTemplateValues(entryValue, values),
      ],
    )

    return Object.fromEntries(entries) as T
  }

  return value
}

export function parseCheckoutPlanPricing(payload: unknown): CheckoutPlanPricing | null {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  const candidate = payload as Record<string, unknown>
  const currency =
    typeof candidate.currency === 'string' && candidate.currency.trim().length > 0
      ? candidate.currency.trim().toUpperCase()
      : null
  const amount =
    typeof candidate.amount === 'number' && Number.isFinite(candidate.amount)
      ? candidate.amount
      : null
  const amountMinor =
    typeof candidate.amountMinor === 'number' &&
    Number.isFinite(candidate.amountMinor) &&
    Number.isInteger(candidate.amountMinor)
      ? candidate.amountMinor
      : null
  const interval =
    candidate.interval === null ||
    candidate.interval === 'day' ||
    candidate.interval === 'week' ||
    candidate.interval === 'month' ||
    candidate.interval === 'year'
      ? candidate.interval
      : null
  const intervalCount =
    candidate.intervalCount === null ||
    (typeof candidate.intervalCount === 'number' &&
      Number.isFinite(candidate.intervalCount) &&
      Number.isInteger(candidate.intervalCount) &&
      candidate.intervalCount > 0)
      ? candidate.intervalCount
      : null
  const priceId = typeof candidate.priceId === 'string' ? candidate.priceId : ''
  const cadence = typeof candidate.cadence === 'string' ? candidate.cadence : ''

  if (!currency || amount === null || amountMinor === null) {
    return null
  }

  return {
    priceId,
    amount,
    amountMinor,
    currency,
    interval,
    intervalCount,
    cadence,
  }
}
