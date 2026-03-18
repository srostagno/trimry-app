'use client'

import Link from 'next/link'

import { useLanguage } from '@/components/language-provider'

export default function NotFound() {
  const { messages } = useLanguage()

  return (
    <section className="mx-auto max-w-xl rounded-[2rem] border border-amber-100/20 bg-black/30 p-8 text-center">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-100/70">404</p>
      <h1 className="mt-3 text-3xl text-amber-50">{messages.notFound.title}</h1>
      <p className="mt-3 text-amber-100/85">{messages.notFound.description}</p>
      <Link
        href="/"
        className="mt-6 inline-flex rounded-full bg-amber-200 px-5 py-3 text-xs font-black uppercase tracking-[0.15em] text-amber-950"
      >
        {messages.notFound.cta}
      </Link>
    </section>
  )
}
