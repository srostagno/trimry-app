import { ObjectId, type WithId } from 'mongodb'

import { getDb } from '@/lib/mongodb'
import { SUBSCRIPTION_PLAN } from '@/lib/company'
import {
  DEFAULT_TIME_ZONE,
  DEFAULT_WEEKLY_DELIVERY_HOUR,
  nextWeeklyDeliveryAt,
  normalizeTimeZone,
} from '@/lib/schedule'

export type SubscriptionStatus =
  | 'pending_checkout'
  | 'active'
  | 'past_due'
  | 'paused'
  | 'canceled'

export type DeliveryPreference = 'email' | 'whatsapp' | 'both'

export type UserRecord = {
  name: string
  email: string
  passwordHash: string
  locale: string
  timeZone: string
  createdAt: Date
  updatedAt: Date
}

export type UserDocument = WithId<UserRecord>

export type SubscriptionRecord = {
  userId: ObjectId
  planId: string
  status: SubscriptionStatus
  deliveryPreference: DeliveryPreference
  deliveryHourLocal: number
  whatsappNumber: string
  monthlyPriceUsd: number
  currency: string
  cadence: string
  nextMessageAt: Date
  createdAt: Date
  updatedAt: Date
}

export type SubscriptionDocument = WithId<SubscriptionRecord>

export async function usersCollection() {
  const db = await getDb()
  const collection = db.collection<UserRecord>('users')
  await collection.createIndex({ email: 1 }, { unique: true })
  return collection
}

export async function subscriptionsCollection() {
  const db = await getDb()
  const collection = db.collection<SubscriptionRecord>('subscriptions')
  await collection.createIndex({ userId: 1 }, { unique: true })
  return collection
}

export async function findUserByEmail(email: string) {
  const users = await usersCollection()
  return users.findOne({ email: email.toLowerCase().trim() })
}

export async function findUserById(userId: string) {
  if (!ObjectId.isValid(userId)) {
    return null
  }

  const users = await usersCollection()
  return users.findOne({ _id: new ObjectId(userId) })
}

export async function createUser(input: {
  name: string
  email: string
  passwordHash: string
  locale: string
  timeZone: string
}) {
  const users = await usersCollection()
  const now = new Date()

  const user: UserRecord = {
    name: input.name.trim(),
    email: input.email.toLowerCase().trim(),
    passwordHash: input.passwordHash,
    locale: input.locale,
    timeZone: normalizeTimeZone(input.timeZone),
    createdAt: now,
    updatedAt: now,
  }

  const result = await users.insertOne(user)

  return {
    _id: result.insertedId,
    ...user,
  }
}

export async function getUserSubscription(userId: string) {
  if (!ObjectId.isValid(userId)) {
    return null
  }

  const subscriptions = await subscriptionsCollection()
  return subscriptions.findOne({ userId: new ObjectId(userId) })
}

export async function upsertSubscription(input: {
  userId: string
  whatsappNumber: string
  deliveryPreference: DeliveryPreference
  deliveryHourLocal: number
  timeZone: string
  status: SubscriptionStatus
}) {
  if (!ObjectId.isValid(input.userId)) {
    throw new Error('Invalid user id')
  }

  const subscriptions = await subscriptionsCollection()
  const now = new Date()
  const nextMessageAt = nextWeeklyDeliveryAt({
    referenceDate: now,
    timeZone: normalizeTimeZone(input.timeZone),
    deliveryHourLocal: input.deliveryHourLocal,
  })

  await subscriptions.updateOne(
    { userId: new ObjectId(input.userId) },
    {
      $set: {
        planId: SUBSCRIPTION_PLAN.id,
        status: input.status,
        deliveryPreference: input.deliveryPreference,
        deliveryHourLocal: input.deliveryHourLocal,
        whatsappNumber: input.whatsappNumber.trim(),
        monthlyPriceUsd: SUBSCRIPTION_PLAN.monthlyPriceUsd,
        currency: SUBSCRIPTION_PLAN.currency,
        cadence: SUBSCRIPTION_PLAN.cadence,
        nextMessageAt,
        updatedAt: now,
      },
      $setOnInsert: {
        userId: new ObjectId(input.userId),
        createdAt: now,
      },
    },
    { upsert: true },
  )

  return getUserSubscription(input.userId)
}

export async function updateSubscription(input: {
  userId: string
  deliveryPreference?: DeliveryPreference
  deliveryHourLocal?: number
  timeZone?: string
  whatsappNumber?: string
  status?: SubscriptionStatus
}) {
  if (!ObjectId.isValid(input.userId)) {
    throw new Error('Invalid user id')
  }

  const subscriptions = await subscriptionsCollection()
  const patch: Partial<SubscriptionRecord> = {
    updatedAt: new Date(),
  }

  if (input.whatsappNumber !== undefined) {
    patch.whatsappNumber = input.whatsappNumber.trim()
  }

  if (input.deliveryPreference) {
    patch.deliveryPreference = input.deliveryPreference
  }

  if (input.deliveryHourLocal !== undefined) {
    patch.deliveryHourLocal = input.deliveryHourLocal
  }

  if (input.status) {
    patch.status = input.status
  }

  if (input.timeZone || input.deliveryHourLocal !== undefined) {
    const currentSubscription = await getUserSubscription(input.userId)
    patch.nextMessageAt = nextWeeklyDeliveryAt({
      timeZone: normalizeTimeZone(input.timeZone ?? DEFAULT_TIME_ZONE),
      deliveryHourLocal:
        input.deliveryHourLocal ??
        currentSubscription?.deliveryHourLocal ??
        DEFAULT_WEEKLY_DELIVERY_HOUR,
    })
  }

  await subscriptions.updateOne(
    { userId: new ObjectId(input.userId) },
    { $set: patch },
  )

  return getUserSubscription(input.userId)
}
