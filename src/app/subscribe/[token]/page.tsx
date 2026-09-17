import { redirect } from 'next/navigation'

import { API_BASE_URL } from '@/lib/api-client'

// Landing for the links in trial emails and WhatsApp buttons: hands the token
// to the API, which signs the reader in and continues to Stripe checkout.
//
// Same reason as the agenda link: the exchange happens on a top-level
// navigation because WhatsApp's iOS browser discards cookies set on a
// cross-origin XHR response. This one carries the money, so it matters most.
export default function SubscribeLinkPage({ params }: { params: { token: string } }) {
  redirect(`${API_BASE_URL}/auth/subscribe-link?token=${encodeURIComponent(params.token)}`)
}
