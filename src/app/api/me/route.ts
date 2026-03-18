import { NextResponse } from 'next/server'

import { getCurrentUser } from '@/lib/current-user'
import { getUserSubscription } from '@/lib/data'
import { buildWeeklyFortune } from '@/lib/fortune'
import { deriveDeliveryHourLocal } from '@/lib/schedule'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const subscription = await getUserSubscription(user.id)
    const deliveryPreference = subscription?.deliveryPreference ?? 'whatsapp'

    return NextResponse.json({
      user,
      subscription: subscription
        ? {
            id: subscription._id.toString(),
            status: subscription.status,
            deliveryPreference,
            deliveryHourLocal:
              subscription.deliveryHourLocal ??
              deriveDeliveryHourLocal(subscription.nextMessageAt, user.timeZone),
            whatsappNumber: subscription.whatsappNumber,
            monthlyPriceUsd: subscription.monthlyPriceUsd,
            currency: subscription.currency,
            cadence: subscription.cadence,
            nextMessageAt: subscription.nextMessageAt.toISOString(),
            planId: subscription.planId,
            canManageBilling: false,
            createdAt: subscription.createdAt.toISOString(),
            updatedAt: subscription.updatedAt.toISOString(),
          }
        : null,
      weeklyFortune: buildWeeklyFortune(),
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: 'Unable to load account data.' },
      { status: 500 },
    )
  }
}
