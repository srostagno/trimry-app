import Image from 'next/image'

import { Container } from '@/components/Container'
import backgroundImage from '@/images/background-faqs.jpg'

const faqs = [
  [
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
  ],
  [
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
      question: 'How can I get support if I face issues?',
      answer:
        'For any support-related queries, you can reach out to us at support@trimry.com. We\'re here to help!',
    },
  ],
  [
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
  ],
]


export function Faqs() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="relative overflow-hidden bg-slate-50 py-20 sm:py-32"
    >
      <Image
        className="absolute left-1/2 top-0 max-w-none -translate-y-1/4 translate-x-[-30%]"
        src={backgroundImage}
        alt=""
        width={1558}
        height={946}
        unoptimized
      />
      <Container className="relative">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2
            id="faq-title"
            className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl"
          >
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg tracking-tight text-slate-700">
            If you can’t find what you’re looking for, email our support team
            at support@trimry.com.
          </p>
        </div>
        <ul
          role="list"
          className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3"
        >
          {faqs.map((column, columnIndex) => (
            <li key={columnIndex}>
              <ul role="list" className="flex flex-col gap-y-8">
                {column.map((faq, faqIndex) => (
                  <li key={faqIndex}>
                    <h3 className="font-display text-lg leading-7 text-slate-900">
                      {faq.question}
                    </h3>
                    <p className="mt-4 text-sm text-slate-700">{faq.answer}</p>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
