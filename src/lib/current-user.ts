import { getSession } from '@/lib/session'
import { findUserById } from '@/lib/data'
import { DEFAULT_TIME_ZONE } from '@/lib/schedule'

export async function getCurrentUser() {
  const session = await getSession()

  if (!session?.userId) {
    return null
  }

  const user = await findUserById(session.userId)

  if (!user) {
    return null
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    locale: user.locale,
    timeZone: user.timeZone ?? DEFAULT_TIME_ZONE,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}
