import { disabledLocalApiRoute } from '@/app/api/_disabled-local-api'

export const dynamic = 'force-dynamic'

export async function POST() {
  return disabledLocalApiRoute()
}
