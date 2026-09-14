'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { useLanguage } from '@/components/language-provider'
import { apiFetch } from '@/lib/api-client'

// Landing for the links in trial emails and WhatsApp buttons: signs the user
// in with the token and continues to the Stripe checkout.
export default function SubscribeLinkPage({ params }: { params: { token: string } }) {
  const router = useRouter()
  const { messages } = useLanguage()
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false

    apiFetch(
      '/auth/subscribe-link',
      { method: 'POST', body: JSON.stringify({ token: params.token }) },
      { retryUnauthorized: false },
    )
      .then((response) => {
        if (cancelled) return
        if (response.ok) {
          router.replace('/checkout/start')
        } else {
          setFailed(true)
          router.replace('/account/login?redirect=/checkout/start')
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true)
          router.replace('/account/login?redirect=/checkout/start')
        }
      })

    return () => {
      cancelled = true
    }
  }, [params.token, router])

  return (
    <section className="tr-shell mx-auto max-w-md p-8 text-center">
      <p className="tr-eyebrow">Trimry</p>
      <p className="tr-copy mt-3">{failed ? messages.notifications.error : messages.common.loading}</p>
    </section>
  )
}
