'use client'

import Link from 'next/link'

import { useLanguage } from '@/components/language-provider'

export default function NotFound() {
  const { messages } = useLanguage()

  return (
    <section className="tr-shell mx-auto max-w-xl p-8 text-center">
      <p className="tr-eyebrow">404</p>
      <h1 className="mt-3 text-3xl">{messages.notFound.title}</h1>
      <p className="tr-copy mt-3">{messages.notFound.description}</p>
      <Link href="/" className="tr-btn-primary mt-6">
        {messages.notFound.cta}
      </Link>
    </section>
  )
}
