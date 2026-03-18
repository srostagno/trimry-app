import { NextResponse } from 'next/server'

import {
  type DeliveryPreference,
  getUserSubscription,
  upsertSubscription,
  updateSubscription,
} from '@/lib/data'
import { getCurrentUser } from '@/lib/current-user'

export const dynamic = 'force-dynamic'

type SubscriptionAction =
  | 'subscribe'
  | 'update-delivery'

function validWhatsappNumber(input: string) {
  return /^\+?[1-9][0-9]{7,14}$/.test(input)
}

function requiresWhatsappDelivery(preference: DeliveryPreference) {
  return preference === 'whatsapp' || preference === 'both'
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = (await request.json()) as {
      action?: SubscriptionAction
      deliveryPreference?: DeliveryPreference
      deliveryHourLocal?: number
      whatsappNumber?: string
    }

    const action = body.action
    const deliveryPreference = body.deliveryPreference ?? 'both'
    const deliveryHourLocal =
      typeof body.deliveryHourLocal === 'number' &&
      Number.isInteger(body.deliveryHourLocal)
        ? body.deliveryHourLocal
        : 9
    const whatsappNumber = body.whatsappNumber?.trim() ?? ''
    const normalizedWhatsappNumber = requiresWhatsappDelivery(deliveryPreference)
      ? whatsappNumber
      : ''

    if (!action) {
      return NextResponse.json(
        { message: 'Missing action.' },
        { status: 400 },
      )
    }

    if (
      (action === 'subscribe' || action === 'update-delivery') &&
      requiresWhatsappDelivery(deliveryPreference) &&
      !validWhatsappNumber(whatsappNumber)
    ) {
      return NextResponse.json(
        {
          message:
            'Enter a valid WhatsApp number in international format (example: +14155550123).',
        },
        { status: 400 },
      )
    }

    if (action === 'subscribe') {
      const subscription = await upsertSubscription({
        userId: user.id,
        deliveryPreference,
        deliveryHourLocal,
        timeZone: user.timeZone,
        status: 'pending_checkout',
        whatsappNumber: normalizedWhatsappNumber,
      })

      return NextResponse.json({ subscription })
    }

    const currentSubscription = await getUserSubscription(user.id)

    if (!currentSubscription) {
      return NextResponse.json(
        { message: 'No subscription found for this account.' },
        { status: 404 },
      )
    }

    if (action === 'update-delivery') {
      const updated = await updateSubscription({
        userId: user.id,
        deliveryPreference,
        deliveryHourLocal,
        timeZone: user.timeZone,
        whatsappNumber: normalizedWhatsappNumber,
      })
      return NextResponse.json({ subscription: updated })
    }

    return NextResponse.json({ message: 'Unknown action.' }, { status: 400 })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: 'Subscription action failed.' },
      { status: 500 },
    )
  }
}
