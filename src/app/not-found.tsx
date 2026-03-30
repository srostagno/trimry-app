'use client'

import Link from 'next/link'

import { useLanguage } from '@/components/language-provider'

export default function NotFound() {
  const { messages } = useLanguage()

  return (
    <section className="cosmic-shell mx-auto max-w-xl rounded-[2rem] p-8 text-center">
      <p className="cosmic-shell-meta text-xs font-black uppercase tracking-[0.2em]">404</p>
      <h1 className="cosmic-shell-title mt-3 text-3xl">{messages.notFound.title}</h1>
      <p className="cosmic-shell-copy mt-3">{messages.notFound.description}</p>
      <Link
        href="/"
        className="cosmic-button-primary mt-6 inline-flex rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.15em]"
      >
        {messages.notFound.cta}
      </Link>
    </section>
  )
}
