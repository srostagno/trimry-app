import { redirect } from 'next/navigation'

import { API_BASE_URL } from '@/lib/api-client'

// The digest CTA lands here and bounces straight to the API, which sets the
// session cookie and redirects on to the agenda.
//
// This has to be a real navigation rather than a fetch. WhatsApp's in-app
// browser on iOS drops cookies that come back on the response to a
// cross-origin XHR, so the previous version signed nobody in and left readers
// staring at a login screen. Handing the token over during a top-level
// navigation makes the cookie first-party for the API's own origin, which no
// browser blocks.
export default function AgendaLinkPage({ params }: { params: { token: string } }) {
  redirect(`${API_BASE_URL}/auth/agenda-link?token=${encodeURIComponent(params.token)}`)
}
