import { proxyBillingPost } from '@/app/api/billing/_proxy'

export const dynamic = 'force-dynamic'

export async function POST() {
  return proxyBillingPost('/billing/checkout-session')
}
