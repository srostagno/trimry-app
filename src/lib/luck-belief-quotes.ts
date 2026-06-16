import type { LanguageCode } from '@/lib/i18n'

export type LuckBeliefQuote = {
  quote: string
  author: string
  context: string
}

const QUOTES: Record<LanguageCode, LuckBeliefQuote[]> = {
  en: [
    {
      quote:
        'Believe that life is worth living, and your belief will help create the fact.',
      author: 'William James',
      context: 'Psychologist and philosopher',
    },
    {
      quote: 'Optimism is the faith that leads to achievement.',
      author: 'Helen Keller',
      context: 'Author and lecturer',
    },
    {
      quote:
        'Shallow men believe in luck, believe in circumstances. Strong men believe in cause and effect.',
      author: 'Ralph Waldo Emerson',
      context: 'Essayist',
    },
    {
      quote: 'They can because they think they can.',
      author: 'Virgil',
      context: 'Poet',
    },
    {
      quote:
        'Our doubts are traitors, and make us lose the good we oft might win by fearing to attempt.',
      author: 'William Shakespeare',
      context: 'Playwright',
    },
    {
      quote: 'A man is literally what he thinks.',
      author: 'James Allen',
      context: 'Writer',
    },
    {
      quote: 'Every day, in every way, I am getting better and better.',
      author: 'Emile Coue',
      context: 'Psychologist and pharmacist',
    },
    {
      quote:
        'Men are disturbed, not by things, but by the principles and notions which they form concerning things.',
      author: 'Epictetus',
      context: 'Stoic philosopher',
    },
    {
      quote:
        'Success is to be measured not so much by the position that one has reached in life as by the obstacles which he has overcome.',
      author: 'Booker T. Washington',
      context: 'Educator and author',
    },
    {
      quote: 'You may have a fresh start any moment you choose.',
      author: 'Mary Pickford',
      context: 'Actor and producer',
    },
  ],
  es: [
    {
      quote:
        'Cree que la vida vale la pena, y esa creencia ayudara a crear el hecho.',
      author: 'William James',
      context: 'Psicologo y filosofo',
    },
    {
      quote: 'El optimismo es la fe que conduce al logro.',
      author: 'Helen Keller',
      context: 'Autora y conferencista',
    },
    {
      quote:
        'Los hombres superficiales creen en la suerte y en las circunstancias. Los fuertes creen en causa y efecto.',
      author: 'Ralph Waldo Emerson',
      context: 'Ensayista',
    },
    {
      quote: 'Pueden porque creen que pueden.',
      author: 'Virgilio',
      context: 'Poeta',
    },
    {
      quote:
        'Nuestras dudas son traidoras y nos hacen perder el bien que podriamos ganar por miedo a intentarlo.',
      author: 'William Shakespeare',
      context: 'Dramaturgo',
    },
    {
      quote: 'Una persona es literalmente lo que piensa.',
      author: 'James Allen',
      context: 'Escritor',
    },
    {
      quote: 'Cada dia, en todo sentido, estoy mejor y mejor.',
      author: 'Emile Coue',
      context: 'Psicologo y farmaceutico',
    },
    {
      quote:
        'Las personas no se alteran por las cosas, sino por las ideas que forman acerca de esas cosas.',
      author: 'Epicteto',
      context: 'Filosofo estoico',
    },
    {
      quote:
        'El exito no debe medirse tanto por la posicion alcanzada como por los obstaculos que una persona ha superado.',
      author: 'Booker T. Washington',
      context: 'Educador y autor',
    },
    {
      quote: 'Puedes tener un nuevo comienzo en el momento que elijas.',
      author: 'Mary Pickford',
      context: 'Actriz y productora',
    },
  ],
  pt: [
    {
      quote:
        'Acredite que a vida vale a pena, e sua crença ajudará a criar esse fato.',
      author: 'William James',
      context: 'Psicólogo e filósofo',
    },
    {
      quote: 'O otimismo é a fé que leva à realização.',
      author: 'Helen Keller',
      context: 'Autora e palestrante',
    },
    {
      quote:
        'Pessoas superficiais acreditam na sorte e nas circunstâncias. Pessoas fortes acreditam em causa e efeito.',
      author: 'Ralph Waldo Emerson',
      context: 'Ensaísta',
    },
    {
      quote: 'Eles conseguem porque acreditam que conseguem.',
      author: 'Virgílio',
      context: 'Poeta',
    },
    {
      quote:
        'Nossas dúvidas são traidoras e nos fazem perder o bem que poderíamos ganhar por medo de tentar.',
      author: 'William Shakespeare',
      context: 'Dramaturgo',
    },
    {
      quote: 'Uma pessoa é literalmente aquilo que pensa.',
      author: 'James Allen',
      context: 'Escritor',
    },
    {
      quote: 'Todos os dias, em todos os sentidos, estou cada vez melhor.',
      author: 'Emile Coue',
      context: 'Psicólogo e farmacêutico',
    },
    {
      quote:
        'As pessoas não se perturbam pelas coisas, mas pelas ideias que formam sobre elas.',
      author: 'Epicteto',
      context: 'Filósofo estoico',
    },
    {
      quote:
        'O sucesso deve ser medido menos pela posição alcançada e mais pelos obstáculos superados.',
      author: 'Booker T. Washington',
      context: 'Educador e autor',
    },
    {
      quote: 'Você pode ter um novo começo no momento que escolher.',
      author: 'Mary Pickford',
      context: 'Atriz e produtora',
    },
  ],
}

export function getLuckBeliefQuotes(language: LanguageCode) {
  return QUOTES[language] ?? QUOTES.en
}
