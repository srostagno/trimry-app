'use client'

import { useLanguage } from '@/components/language-provider'

export function DisclaimerPageClient() {
  const { messages } = useLanguage()

  return (
    <section className="cosmic-shell mx-auto max-w-4xl rounded-[2rem] p-8 sm:p-10">
      <h1 className="cosmic-shell-title text-3xl sm:text-4xl">{messages.legal.disclaimer}</h1>
      <p className="cosmic-shell-meta mt-3 text-sm">{messages.legal.englishNotice}</p>

      <div className="cosmic-shell-copy mt-8 space-y-7">
        {messages.legal.disclaimerSections.map((section) => (
          <section key={section.title}>
            <h2 className="text-2xl text-slate-50">{section.title}</h2>
            <p className="mt-2">{section.body}</p>
          </section>
        ))}
      </div>
    </section>
  )
}
