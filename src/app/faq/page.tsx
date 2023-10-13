'use client';
import { Disclosure } from '@headlessui/react'
import { MinusSmallIcon, PlusSmallIcon } from '@heroicons/react/24/outline'
import { Logo } from '@/components/Logo';

const faqs = [
    {
    question: 'How can I get support if I face issues?',
    answer:
        'For any support-related queries, you can reach out to us at support@trimry.com. We\'re here to help!',
    },
    {
    question: 'What kind of game is Trimry?',
    answer:
        'Trimry is a fast-paced quiz/trivia game with multiple-choice questions. Your score is based on correct answers and the time taken to answer them.',
    },
    {
    question: 'Can I compete with other players in real-time?',
    answer: 'Real-time competition isn\'t available yet, but it\'s on our roadmap. For now, you can submit your scores and compete on the leaderboards.',
    },
    {
    question: 'How can I create my own games in Trimry?',
    answer:
        'Trimry allows users to craft their own games. Plus, with our AI assistance, creating games is faster and more intuitive.',
    },
    {
    question: 'Are there in-game purchases in Trimry?',
    answer:
        'No, Trimry doesn\'t offer in-game purchases. We focus on providing a seamless trivia experience.',
    },
    {
    question: 'In how many languages is Trimry available?',
    answer:
        'Trimry is translated into 7 languages, ensuring a diverse user experience.',
    },
    {
    question: 'Is there a limit to the number of questions a game can have?',
    answer:
        'No, games in Trimry can have an unlimited number of questions. The sky\'s the limit!',
    },
    {
    question: 'What privacy features does Trimry offer?',
    answer:
        'Users can choose to have a private account, opt for private scores, share scores with friends, or submit them for global rankings. You can also follow other users within the platform.',
    },
    {
    question: 'How do I know if I\'m improving in Trimry?',
    answer:
        'Your dashboard provides insights into your achievements, scores, and improvements. Celebrate every milestone and challenge yourself further!',
    },
]

export default function Example() {
  return (
    <div className="bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:py-10 lg:px-8 lg:py-10">
        <div className="mx-auto max-w-4xl">
          <div className="pb-10">
          <Logo className="h-10 w-auto" width={100} height={40} />
          </div>
          <h2 className="text-2xl font-bold leading-10 tracking-tight text-white">Frequently asked questions</h2>
          <dl className="mt-10 space-y-6 divide-y divide-white/10">
            {faqs.map((faq) => (
              <Disclosure as="div" key={faq.question} className="pt-6">
                {({ open }) => (
                  <>
                    <dt>
                      <Disclosure.Button className="flex w-full items-start justify-between text-left text-white">
                        <span className="text-base font-semibold leading-7">{faq.question}</span>
                        <span className="ml-6 flex h-7 items-center">
                          {open ? (
                            <MinusSmallIcon className="h-6 w-6" aria-hidden="true" />
                          ) : (
                            <PlusSmallIcon className="h-6 w-6" aria-hidden="true" />
                          )}
                        </span>
                      </Disclosure.Button>
                    </dt>
                    <Disclosure.Panel as="dd" className="mt-2 pr-12">
                      <p className="text-base leading-7 text-gray-300">{faq.answer}</p>
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}