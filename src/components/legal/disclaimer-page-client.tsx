'use client'

import { useLanguage } from '@/components/language-provider'

export function DisclaimerPageClient() {
  const { messages } = useLanguage()

  return (
    <section className="mx-auto max-w-4xl rounded-[2rem] border border-amber-100/20 bg-black/30 p-8 sm:p-10">
      <h1 className="text-3xl text-amber-50 sm:text-4xl">{messages.legal.disclaimer}</h1>
      <p className="mt-3 text-sm text-amber-100/75">{messages.legal.englishNotice}</p>

      <div className="mt-8 space-y-7 text-amber-100/90">
        {messages.legal.disclaimerSections.map((section) => (
          <section key={section.title}>
            <h2 className="text-2xl text-amber-50">{section.title}</h2>
            <p className="mt-2">{section.body}</p>
          </section>
        ))}
      </div>
    </section>
  )
}
