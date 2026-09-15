'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { useLanguage } from '@/components/language-provider'
import { apiFetch } from '@/lib/api-client'

// Digest CTA target: exchanges the signed token for a session and lands on the
// agenda, so the reader never meets a login screen.
export default function AgendaLinkPage({ params }: { params: { token: string } }) {
  const router = useRouter()
  const { messages } = useLanguage()

  useEffect(() => {
    let cancelled = false

    apiFetch(
      '/auth/agenda-link',
      { method: 'POST', body: JSON.stringify({ token: params.token }) },
      { retryUnauthorized: false },
    )
      .then((response) => {
        if (cancelled) return
        router.replace(response.ok ? '/agenda' : '/account/login?redirect=/agenda')
      })
      .catch(() => {
        if (!cancelled) router.replace('/account/login?redirect=/agenda')
      })

    return () => {
      cancelled = true
    }
  }, [params.token, router])

  return (
    <section className="tr-shell mx-auto max-w-md p-8 text-center">
      <p className="tr-eyebrow">Trimry</p>
      <p className="tr-copy mt-3">{messages.common.loading}</p>
    </section>
  )
}
