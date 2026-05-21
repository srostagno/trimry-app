import { NextResponse } from 'next/server'

export function disabledLocalApiRoute() {
  return NextResponse.json(
    {
      message:
        'This endpoint is served by the Trimry API service. Use the configured API base URL.',
    },
    { status: 410 },
  )
}
