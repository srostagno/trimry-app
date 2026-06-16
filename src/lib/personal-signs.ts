type PersonalSignLanguage = 'en' | 'es' | 'pt'
type WesternZodiacKey =
  | 'aries'
  | 'taurus'
  | 'gemini'
  | 'cancer'
  | 'leo'
  | 'virgo'
  | 'libra'
  | 'scorpio'
  | 'sagittarius'
  | 'capricorn'
  | 'aquarius'
  | 'pisces'
type ChineseAnimalKey =
  | 'rat'
  | 'ox'
  | 'tiger'
  | 'rabbit'
  | 'dragon'
  | 'snake'
  | 'horse'
  | 'goat'
  | 'monkey'
  | 'rooster'
  | 'dog'
  | 'pig'
type ChineseElementKey = 'wood' | 'fire' | 'earth' | 'metal' | 'water'
type ProjectionTone = 'good' | 'bad' | 'rare'

const WESTERN_ZODIAC: Array<{
  key: WesternZodiacKey
  starts: [number, number]
  names: Record<PersonalSignLanguage, string>
  element: Record<PersonalSignLanguage, string>
  summary: Record<PersonalSignLanguage, string>
}> = [
  {
    key: 'capricorn',
    starts: [12, 22],
    names: { en: 'Capricorn', es: 'Capricornio', pt: 'Capricórnio' },
    element: { en: 'earth', es: 'tierra', pt: 'terra' },
    summary: {
      en: 'Your luck strengthens when ambition becomes a clean ritual.',
      es: 'Tu suerte se fortalece cuando la ambición se vuelve un ritual claro.',
      pt: 'Sua sorte se fortalece quando a ambição vira um ritual claro.',
    },
  },
  {
    key: 'aquarius',
    starts: [1, 20],
    names: { en: 'Aquarius', es: 'Acuario', pt: 'Aquário' },
    element: { en: 'air', es: 'aire', pt: 'ar' },
    summary: {
      en: 'Your luck opens through ideas, networks, and unusual timing.',
      es: 'Tu suerte se abre con ideas, redes y timings poco comunes.',
      pt: 'Sua sorte se abre com ideias, redes e timings incomuns.',
    },
  },
  {
    key: 'pisces',
    starts: [2, 19],
    names: { en: 'Pisces', es: 'Piscis', pt: 'Peixes' },
    element: { en: 'water', es: 'agua', pt: 'água' },
    summary: {
      en: 'Your luck flows when intuition is paired with a gentle boundary.',
      es: 'Tu suerte fluye cuando la intuición se une a un límite amable.',
      pt: 'Sua sorte flui quando a intuição se une a um limite gentil.',
    },
  },
  {
    key: 'aries',
    starts: [3, 21],
    names: { en: 'Aries', es: 'Aries', pt: 'Áries' },
    element: { en: 'fire', es: 'fuego', pt: 'fogo' },
    summary: {
      en: 'Your luck moves through courage, speed, and the first clean step.',
      es: 'Tu suerte se mueve con valentía, velocidad y el primer paso claro.',
      pt: 'Sua sorte se move com coragem, velocidade e o primeiro passo claro.',
    },
  },
  {
    key: 'taurus',
    starts: [4, 20],
    names: { en: 'Taurus', es: 'Tauro', pt: 'Touro' },
    element: { en: 'earth', es: 'tierra', pt: 'terra' },
    summary: {
      en: 'Your luck grows through patience, beauty, and material stability.',
      es: 'Tu suerte crece con paciencia, belleza y estabilidad material.',
      pt: 'Sua sorte cresce com paciência, beleza e estabilidade material.',
    },
  },
  {
    key: 'gemini',
    starts: [5, 21],
    names: { en: 'Gemini', es: 'Géminis', pt: 'Gêmeos' },
    element: { en: 'air', es: 'aire', pt: 'ar' },
    summary: {
      en: 'Your luck arrives through conversation, curiosity, and fast signals.',
      es: 'Tu suerte llega por conversaciones, curiosidad y señales rápidas.',
      pt: 'Sua sorte chega por conversas, curiosidade e sinais rápidos.',
    },
  },
  {
    key: 'cancer',
    starts: [6, 21],
    names: { en: 'Cancer', es: 'Cáncer', pt: 'Câncer' },
    element: { en: 'water', es: 'agua', pt: 'água' },
    summary: {
      en: 'Your luck protects what feels emotionally true and worth nurturing.',
      es: 'Tu suerte protege lo que se siente verdadero y digno de cuidado.',
      pt: 'Sua sorte protege o que parece emocionalmente verdadeiro e digno de cuidado.',
    },
  },
  {
    key: 'leo',
    starts: [7, 23],
    names: { en: 'Leo', es: 'Leo', pt: 'Leão' },
    element: { en: 'fire', es: 'fuego', pt: 'fogo' },
    summary: {
      en: 'Your luck expands when you let confidence become visible.',
      es: 'Tu suerte se expande cuando dejas que tu confianza sea visible.',
      pt: 'Sua sorte se expande quando você deixa a confiança ficar visível.',
    },
  },
  {
    key: 'virgo',
    starts: [8, 23],
    names: { en: 'Virgo', es: 'Virgo', pt: 'Virgem' },
    element: { en: 'earth', es: 'tierra', pt: 'terra' },
    summary: {
      en: 'Your luck sharpens when the details are clean and useful.',
      es: 'Tu suerte se afina cuando los detalles están limpios y son útiles.',
      pt: 'Sua sorte se afia quando os detalhes estão limpos e úteis.',
    },
  },
  {
    key: 'libra',
    starts: [9, 23],
    names: { en: 'Libra', es: 'Libra', pt: 'Libra' },
    element: { en: 'air', es: 'aire', pt: 'ar' },
    summary: {
      en: 'Your luck rises through harmony, charm, and the right alliance.',
      es: 'Tu suerte sube con armonía, encanto y la alianza correcta.',
      pt: 'Sua sorte sobe com harmonia, charme e a aliança certa.',
    },
  },
  {
    key: 'scorpio',
    starts: [10, 23],
    names: { en: 'Scorpio', es: 'Escorpio', pt: 'Escorpião' },
    element: { en: 'water', es: 'agua', pt: 'água' },
    summary: {
      en: 'Your luck intensifies when you release what has gone stale.',
      es: 'Tu suerte se intensifica cuando sueltas lo que ya perdió vida.',
      pt: 'Sua sorte se intensifica quando você solta o que já perdeu vida.',
    },
  },
  {
    key: 'sagittarius',
    starts: [11, 22],
    names: { en: 'Sagittarius', es: 'Sagitario', pt: 'Sagitário' },
    element: { en: 'fire', es: 'fuego', pt: 'fogo' },
    summary: {
      en: 'Your luck widens through movement, faith, and a bigger horizon.',
      es: 'Tu suerte se amplía con movimiento, fe y un horizonte más grande.',
      pt: 'Sua sorte se amplia com movimento, fé e um horizonte maior.',
    },
  },
]

const CHINESE_ANIMALS: Array<{
  key: ChineseAnimalKey
  names: Record<PersonalSignLanguage, string>
  summary: Record<PersonalSignLanguage, string>
}> = [
  {
    key: 'rat',
    names: { en: 'Rat', es: 'Rata', pt: 'Rato' },
    summary: {
      en: 'resourcefulness, quick timing, and smart openings',
      es: 'recursos, timing rápido y oportunidades inteligentes',
      pt: 'recursos, timing rápido e oportunidades inteligentes',
    },
  },
  {
    key: 'ox',
    names: { en: 'Ox', es: 'Buey', pt: 'Boi' },
    summary: {
      en: 'endurance, loyal effort, and steady gains',
      es: 'resistencia, esfuerzo leal y avances constantes',
      pt: 'resistência, esforço leal e ganhos constantes',
    },
  },
  {
    key: 'tiger',
    names: { en: 'Tiger', es: 'Tigre', pt: 'Tigre' },
    summary: {
      en: 'bold action, protection, and magnetic force',
      es: 'acción audaz, protección y fuerza magnética',
      pt: 'ação ousada, proteção e força magnética',
    },
  },
  {
    key: 'rabbit',
    names: { en: 'Rabbit', es: 'Conejo', pt: 'Coelho' },
    summary: {
      en: 'soft power, diplomacy, and graceful luck',
      es: 'poder suave, diplomacia y suerte elegante',
      pt: 'poder suave, diplomacia e sorte elegante',
    },
  },
  {
    key: 'dragon',
    names: { en: 'Dragon', es: 'Dragón', pt: 'Dragão' },
    summary: {
      en: 'visibility, ambition, and abundant expansion',
      es: 'visibilidad, ambición y expansión abundante',
      pt: 'visibilidade, ambição e expansão abundante',
    },
  },
  {
    key: 'snake',
    names: { en: 'Snake', es: 'Serpiente', pt: 'Serpente' },
    summary: {
      en: 'intuition, strategy, and quiet transformation',
      es: 'intuición, estrategia y transformación silenciosa',
      pt: 'intuição, estratégia e transformação silenciosa',
    },
  },
  {
    key: 'horse',
    names: { en: 'Horse', es: 'Caballo', pt: 'Cavalo' },
    summary: {
      en: 'movement, independence, and fast momentum',
      es: 'movimiento, independencia e impulso veloz',
      pt: 'movimento, independência e impulso veloz',
    },
  },
  {
    key: 'goat',
    names: { en: 'Goat', es: 'Cabra', pt: 'Cabra' },
    summary: {
      en: 'beauty, sensitivity, and creative prosperity',
      es: 'belleza, sensibilidad y prosperidad creativa',
      pt: 'beleza, sensibilidade e prosperidade criativa',
    },
  },
  {
    key: 'monkey',
    names: { en: 'Monkey', es: 'Mono', pt: 'Macaco' },
    summary: {
      en: 'wit, invention, and unexpected solutions',
      es: 'ingenio, invención y soluciones inesperadas',
      pt: 'engenho, invenção e soluções inesperadas',
    },
  },
  {
    key: 'rooster',
    names: { en: 'Rooster', es: 'Gallo', pt: 'Galo' },
    summary: {
      en: 'precision, presentation, and disciplined luck',
      es: 'precisión, presencia y suerte disciplinada',
      pt: 'precisão, presença e sorte disciplinada',
    },
  },
  {
    key: 'dog',
    names: { en: 'Dog', es: 'Perro', pt: 'Cão' },
    summary: {
      en: 'loyalty, protection, and honest alliances',
      es: 'lealtad, protección y alianzas honestas',
      pt: 'lealdade, proteção e alianças honestas',
    },
  },
  {
    key: 'pig',
    names: { en: 'Pig', es: 'Cerdo', pt: 'Porco' },
    summary: {
      en: 'generosity, pleasure, and generous fortune',
      es: 'generosidad, placer y fortuna abundante',
      pt: 'generosidade, prazer e fortuna abundante',
    },
  },
]

const CHINESE_ELEMENTS: Record<
  ChineseElementKey,
  {
    names: Record<PersonalSignLanguage, string>
    summary: Record<PersonalSignLanguage, string>
  }
> = {
  wood: {
    names: { en: 'Wood', es: 'Madera', pt: 'Madeira' },
    summary: {
      en: 'growth, renewal, and long-term abundance',
      es: 'crecimiento, renovación y abundancia de largo plazo',
      pt: 'crescimento, renovação e abundância de longo prazo',
    },
  },
  fire: {
    names: { en: 'Fire', es: 'Fuego', pt: 'Fogo' },
    summary: {
      en: 'visibility, courage, and magnetic action',
      es: 'visibilidad, valentía y acción magnética',
      pt: 'visibilidade, coragem e ação magnética',
    },
  },
  earth: {
    names: { en: 'Earth', es: 'Tierra', pt: 'Terra' },
    summary: {
      en: 'stability, nourishment, and practical prosperity',
      es: 'estabilidad, nutrición y prosperidad práctica',
      pt: 'estabilidade, nutrição e prosperidade prática',
    },
  },
  metal: {
    names: { en: 'Metal', es: 'Metal', pt: 'Metal' },
    summary: {
      en: 'focus, refinement, and decisive release',
      es: 'foco, refinamiento y liberación decidida',
      pt: 'foco, refinamento e liberação decidida',
    },
  },
  water: {
    names: { en: 'Water', es: 'Agua', pt: 'Água' },
    summary: {
      en: 'intuition, flow, and hidden opportunity',
      es: 'intuición, flujo y oportunidad oculta',
      pt: 'intuição, fluxo e oportunidade oculta',
    },
  },
}

function resolveLanguage(language: string): PersonalSignLanguage {
  const normalized = language.trim().toLowerCase()

  if (normalized.startsWith('es')) {
    return 'es'
  }

  if (normalized.startsWith('pt')) {
    return 'pt'
  }

  return 'en'
}

function parseBirthDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)

  if (!match) {
    return null
  }

  const year = Number.parseInt(match[1] ?? '', 10)
  const month = Number.parseInt(match[2] ?? '', 10)
  const day = Number.parseInt(match[3] ?? '', 10)
  const date = new Date(Date.UTC(year, month - 1, day, 12))

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null
  }

  return { year, month, day }
}

function resolveWesternZodiac(month: number, day: number) {
  const capricorn = WESTERN_ZODIAC.find((sign) => sign.key === 'capricorn')

  if (!capricorn) {
    return WESTERN_ZODIAC[0]
  }

  if ((month === 12 && day >= 22) || (month === 1 && day < 20)) {
    return capricorn
  }

  let current = capricorn

  for (const sign of WESTERN_ZODIAC) {
    if (sign.key === 'capricorn') {
      continue
    }

    const [startMonth, startDay] = sign.starts

    if (month > startMonth || (month === startMonth && day >= startDay)) {
      current = sign
    }
  }

  return current
}

function resolveChineseLunarYear(year: number, month: number, day: number) {
  // Chinese zodiac products commonly use the solar Li Chun boundary around Feb 4.
  // This keeps the sign stable without bundling a large lunar new year table.
  if (month < 2 || (month === 2 && day < 4)) {
    return year - 1
  }

  return year
}

function resolveChineseElement(lunarYear: number): ChineseElementKey {
  const stemIndex = ((lunarYear - 4) % 10 + 10) % 10

  if (stemIndex <= 1) {
    return 'wood'
  }

  if (stemIndex <= 3) {
    return 'fire'
  }

  if (stemIndex <= 5) {
    return 'earth'
  }

  if (stemIndex <= 7) {
    return 'metal'
  }

  return 'water'
}

function tonePhrase(language: PersonalSignLanguage, tone: ProjectionTone) {
  if (tone === 'good') {
    return language === 'es'
      ? 'Hoy la señal está a favor: úsala para abrir una conversación, mover dinero o tomar una acción visible.'
      : language === 'pt'
        ? 'Hoje o sinal está a favor: use-o para abrir uma conversa, movimentar dinheiro ou tomar uma ação visível.'
      : 'Today’s signal is favorable: use it to open a conversation, move money, or take visible action.'
  }

  if (tone === 'rare') {
    return language === 'es'
      ? 'Hoy la señal es rara: observa coincidencias, invitaciones extrañas y cambios de dirección.'
      : language === 'pt'
        ? 'Hoje o sinal é raro: observe coincidências, convites estranhos e mudanças de direção.'
      : 'Today’s signal is rare: watch coincidences, unusual invitations, and sudden redirections.'
  }

  return language === 'es'
    ? 'Hoy la señal pide cautela: protege tu energía y posterga decisiones que puedan nacer de presión.'
    : language === 'pt'
      ? 'Hoje o sinal pede cautela: proteja sua energia e adie decisões que possam nascer da pressão.'
    : 'Today’s signal asks for caution: protect your energy and postpone decisions born from pressure.'
}

export function buildPersonalSignProfile(
  birthDate: string | null | undefined,
  languageCode: string,
  tone: ProjectionTone = 'good',
) {
  if (!birthDate) {
    return null
  }

  const parsed = parseBirthDate(birthDate)

  if (!parsed) {
    return null
  }

  const language = resolveLanguage(languageCode)
  const zodiac = resolveWesternZodiac(parsed.month, parsed.day)
  const lunarYear = resolveChineseLunarYear(parsed.year, parsed.month, parsed.day)
  const animal = CHINESE_ANIMALS[((lunarYear - 4) % 12 + 12) % 12]
  const element = CHINESE_ELEMENTS[resolveChineseElement(lunarYear)]
  const chineseName =
    language === 'es' || language === 'pt'
      ? `${animal.names[language]} de ${element.names[language]}`
      : `${element.names.en} ${animal.names.en}`

  return {
    birthDate,
    zodiac: {
      key: zodiac.key,
      name: zodiac.names[language],
      element: zodiac.element[language],
      summary: zodiac.summary[language],
    },
    chinese: {
      animalKey: animal.key,
      animal: animal.names[language],
      element: element.names[language],
      name: chineseName,
      lunarYear,
      summary:
        language === 'es'
          ? `${animal.summary.es}; ${element.summary.es}.`
          : language === 'pt'
            ? `${animal.summary.pt}; ${element.summary.pt}.`
          : `${animal.summary.en}; ${element.summary.en}.`,
    },
    projection: {
      zodiac:
        language === 'es'
          ? `${zodiac.names.es}: ${zodiac.summary.es} ${tonePhrase(language, tone)}`
          : language === 'pt'
            ? `${zodiac.names.pt}: ${zodiac.summary.pt} ${tonePhrase(language, tone)}`
          : `${zodiac.names.en}: ${zodiac.summary.en} ${tonePhrase(language, tone)}`,
      chinese:
        language === 'es'
          ? `${chineseName}: activa ${animal.summary.es} con ${element.summary.es}.`
          : language === 'pt'
            ? `${chineseName}: ative ${animal.summary.pt} com ${element.summary.pt}.`
          : `${chineseName}: activate ${animal.summary.en} with ${element.summary.en}.`,
    },
  }
}
