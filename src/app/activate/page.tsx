'use client'

import clsx from 'clsx'
import Link from 'next/link'
import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { DateOfBirthPicker } from '@/components/date-of-birth-picker'
import { useLanguage } from '@/components/language-provider'
import { trackEvent, trackMetaCustomEvent } from '@/lib/analytics'
import { apiFetch, readApiError } from '@/lib/api-client'
import { SUBSCRIPTION_PLAN } from '@/lib/company'
import { buildFortuneDay, type ActivityTone } from '@/lib/fortune'
import { languageToIntlLocale, normalizeLanguageCode, type LanguageCode } from '@/lib/i18n'
import { buildPersonalSignProfile } from '@/lib/personal-signs'
import { DEFAULT_WEEKLY_DELIVERY_HOUR, detectBrowserTimeZone } from '@/lib/schedule'
import {
  type AccountSnapshot,
  fetchAccountSnapshot,
  saveActivationFunnelStep,
} from '@/lib/start-flow'

type TodayPreview = {
  dayKey: string
  date: string
  weekday: string
  summary: ActivityTone
  summaryLabel: string
  headline: string
  unlockLine: string
  luckScore: number
  notes: string
  activities: {
    haircut: ActivityTone
    shave: ActivityTone
    nails: ActivityTone
    release: ActivityTone
  }
}

type CalendarPreviewDay = {
  dayKey: string
  date: string
  weekday: string
  summary: ActivityTone
  notes: string
  locked: boolean
  blurred: boolean
}

type ActivationFlowCopy = {
  title: string
  subtitle: string
  stepTitles: [string, string, string, string, string, string]
  step1: {
    badge: string
    title: string
    body: string
    bullets: string[]
    videoBadge: string
  }
  step2: {
    badge: string
    title: string
    body: string
    birthDateLabel: string
    birthHint: string
    missingBirthDate: string
    fortuneCode: string
    signsRevealReady: string
    signsRevealPending: string
    zodiac: string
    chineseCalendar: string
    identityTitle: string
    identityBody: string
    nextLabel: string
  }
  step3: {
    badge: string
    title: string
    body: string
    wishFocusTitle: string
    wishFocusBody: string
    wishLabel: string
    wishPlaceholder: string
    wishHint: string
    skipWish: string
    emailLabel: string
    emailPlaceholder: string
    emailHint: string
    invalidEmail: string
    registerError: string
    wishSignal: string
    unlockButton: string
    unlockingButton: string
    continueLockedLabel: string
  }
  step4: {
    badge: string
    title: string
    body: string
    nextFortuneLead: string
    nextFortuneDateLabel: string
    previewBadge: string
    strongPrefix: string
    avoidPrefix: string
    personalSignal: string
    zodiac: string
    chineseCalendar: string
    pendingPersonalTitle: string
    pendingPersonalBody: string
    nextLabel: string
  }
  step5: {
    badge: string
    title: string
    body: string
    nextWeekLocked: string
    unlockLine: string
  }
  step6: {
    badge: string
    title: string
    body: string
    featureIntro: string
    wishTitle: string
    wishBody: string
    emptyWish: string
    benefits: [string, string, string]
    trialBadge: string
    unsubscribeTitle: string
    unsubscribeBody: string
    cta: string
  }
  nav: {
    back: string
    next: string
    continueTo: string
    stepLabel: string
  }
}

const TOTAL_STEPS = 6
const EMAIL_CONTACT_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function collectRegistrationClientMetadata(timeZone: string) {
  if (typeof window === 'undefined') {
    return {
      timeZone,
    }
  }

  return {
    browserLocale: navigator.language || null,
    browserLanguages: Array.from(navigator.languages ?? []).slice(0, 12),
    timeZone,
    timeZoneOffsetMinutes: new Date().getTimezoneOffset(),
    platform: navigator.platform || null,
    referrer: document.referrer || null,
    landingUrl: window.location.href,
    screen: {
      width: window.screen?.width ?? null,
      height: window.screen?.height ?? null,
      pixelRatio: window.devicePixelRatio ?? null,
    },
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
  }
}

function buildFirstNameFromEmail(email: string) {
  const localPart = email.split('@')[0]?.trim() ?? ''
  const cleaned = localPart
    .replace(/[._+-]+/g, ' ')
    .replace(/[^a-zA-ZÀ-ÿ\s'-]/g, '')
    .trim()

  if (!cleaned) {
    return 'Trimry'
  }

  return cleaned
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

function toUtcDayKey(date: Date) {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function toUtcDateFromKey(dayKey: string) {
  return new Date(`${dayKey}T12:00:00.000Z`)
}

function addUtcDays(referenceDate: Date, days: number) {
  const base = new Date(referenceDate)
  base.setUTCHours(12, 0, 0, 0)
  base.setUTCDate(base.getUTCDate() + days)
  return base
}

function localTodayAsUtcNoon() {
  const today = new Date()

  return new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 12),
  )
}

function toneLabel(language: LanguageCode, tone: ActivityTone) {
  if (tone === 'good') {
    return language === 'es' ? 'BUENO' : language === 'pt' ? 'BOM' : 'GOOD'
  }

  if (tone === 'bad') {
    return language === 'es' ? 'MALO' : language === 'pt' ? 'RUIM' : 'BAD'
  }

  return language === 'en' ? 'RARE' : 'RARO'
}

function toneBadgeClass(tone: ActivityTone) {
  return clsx(
    'oracle-tone-badge',
    tone === 'good'
      ? 'oracle-tone-badge-good'
      : tone === 'bad'
        ? 'oracle-tone-badge-bad'
        : 'oracle-tone-badge-rare',
  )
}

function toneGlyph(tone: ActivityTone) {
  return tone === 'good' ? '↑' : tone === 'bad' ? '!' : '✦'
}

function buildLuckScore(tone: ActivityTone) {
  if (tone === 'good') {
    return 84
  }

  if (tone === 'rare') {
    return 69
  }

  return 43
}

function buildHeadline(language: LanguageCode, tone: ActivityTone) {
  if (tone === 'good') {
    return language === 'es'
      ? 'Hoy favorece el movimiento, la claridad y los cambios limpios.'
      : language === 'pt'
        ? 'Hoje favorece movimento, clareza e mudanças limpas.'
        : 'Today favors movement, clarity, and clean changes.'
  }

  if (tone === 'bad') {
    return language === 'es'
      ? 'Hoy pide paciencia, mantenimiento y cero presión.'
      : language === 'pt'
        ? 'Hoje pede paciência, manutenção e zero pressão.'
        : 'Today asks for patience, maintenance, and no pressure.'
  }

  return language === 'es'
    ? 'Hoy se abre de forma extraña. Mantente atento a una oportunidad.'
    : language === 'pt'
      ? 'Hoje se abre de um jeito incomum. Fique atento a uma oportunidade.'
      : 'Today bends in an unusual way. Stay alert for an opening.'
}

function buildUnlockLine(language: LanguageCode) {
  return language === 'es'
    ? 'Desbloquea Trimry para abrir tu calendario completo de 7 dias. Los updates por email o WhatsApp se configuran despues si quieres.'
    : language === 'pt'
      ? 'Desbloqueie a Trimry para abrir seu calendario completo de 7 dias. Updates por email ou WhatsApp sao configurados depois se voce quiser.'
      : 'Unlock Trimry to open your complete 7-day calendar. Email or WhatsApp updates can be configured later if you want.'
}

function buildStrongAndCautionLabels(
  language: LanguageCode,
  activities: TodayPreview['activities'],
) {
  const strong = Object.entries(activities)
    .filter(([, tone]) => tone === 'good')
    .map(([activity]) => activity)

  const caution = Object.entries(activities)
    .filter(([, tone]) => tone === 'bad')
    .map(([activity]) => activity)

  const labelMap = language === 'es'
    ? {
        haircut: 'cabello',
        shave: 'afeitado',
        nails: 'unas',
        release: 'soltar',
      }
    : language === 'pt'
      ? {
          haircut: 'cabelo',
          shave: 'barba',
          nails: 'unhas',
          release: 'soltar',
        }
      : {
          haircut: 'haircuts',
          shave: 'shaving',
          nails: 'nails',
          release: 'release',
        }

  return {
    strong: strong.map((activity) => labelMap[activity as keyof typeof labelMap]),
    caution: caution.map((activity) => labelMap[activity as keyof typeof labelMap]),
  }
}

function createPreviewFromFortune(language: LanguageCode, date: Date) {
  const fortune = buildFortuneDay(date, languageToIntlLocale(language))

  return {
    dayKey: toUtcDayKey(date),
    date: fortune.date,
    weekday: fortune.weekday,
    summary: fortune.summary,
    summaryLabel: toneLabel(language, fortune.summary),
    headline: buildHeadline(language, fortune.summary),
    unlockLine: buildUnlockLine(language),
    luckScore: buildLuckScore(fortune.summary),
    notes: fortune.notes,
    activities: fortune.activities,
  } satisfies TodayPreview
}

function getActivationFlowCopy(
  language: LanguageCode,
  trialDays: number,
): ActivationFlowCopy {
  if (language === 'es') {
    return {
      title: 'Bienvenido a tu ritual de suerte',
      subtitle:
        'En seis pasos vas a entender como funciona Trimry, revelar tus simbolos, pedir un deseo y desbloquear tu calendario semanal de suerte.',
      stepTitles: [
        'Empieza con suerte',
        'Tus simbolos',
        'Pide un deseo',
        'Proyeccion de hoy',
        'Semana de suerte',
        'Activa tu trial',
      ],
      step1: {
        badge: 'Paso 1',
        title: 'Trimry ayuda a desbloquear el ritmo oculto de tu suerte.',
        body:
          'Analizamos tus simbolos personales y los alineamos con sistemas universales de timing estudiados por monjes tibetanos, para crear un calendario personalizado de lo que podria venir.',
        bullets: [
          'Guia unica de suerte personalizada, inspirada en tu zodiaco, simbolo chino y sutra antiguo.',
          'Puedes configurar updates diarios por email y WhatsApp con tu proyeccion diaria de suerte.',
        ],
        videoBadge: 'Video demo (autoplay)',
      },
      step2: {
        badge: 'Paso 2',
        title: 'Revela tus signos y tu identidad de suerte',
        body:
          'Tu fecha de nacimiento abre tu zodiaco, tu simbolo chino y la capa personal que usaremos para interpretar el calendario.',
        birthDateLabel: 'Fecha de nacimiento',
        birthHint:
          'Usamos tu nacimiento para descubrir los simbolos que marcan tu lectura personal.',
        missingBirthDate: 'Ingresa tu fecha de nacimiento para revelar tus signos.',
        fortuneCode: 'Codigo de fortuna',
        signsRevealReady: 'Signos revelados',
        signsRevealPending: 'Completa tu fecha de nacimiento para revelar tus signos al instante.',
        zodiac: 'Zodiaco',
        chineseCalendar: 'Calendario chino',
        identityTitle: 'Tu identidad esta tomando forma',
        identityBody:
          'Cuando revelas tus simbolos, Trimry puede leer que energia te conviene activar y que dias piden cautela.',
        nextLabel: 'Continuar al deseo',
      },
      step3: {
        badge: 'Paso 3',
        title: 'Pide un deseo para enfocar la manifestacion',
        body:
          'Luck Guru trabaja mejor cuando sabe que quieres atraer. Guarda un deseo para orientar la lectura; si no quieres hacerlo ahora, puedes omitirlo.',
        wishFocusTitle: 'El deseo concentra la energia',
        wishFocusBody:
          'Pedimos tu deseo para enfocar nuestros esfuerzos a que se cumpla y para personalizar los dias donde conviene actuar, esperar o abrir espacio.',
        wishLabel: 'Pide un deseo',
        wishPlaceholder: 'Ej: quiero atraer mas oportunidades de dinero esta semana',
        wishHint:
          'Este deseo queda guardado y puedes cambiarlo despues desde tu cuenta.',
        skipWish: 'Omitir deseo y revelar',
        emailLabel: 'Email',
        emailPlaceholder: 'tu@correo.com',
        emailHint:
          'Usamos tu email para crear tu cuenta y guardar tu calendario. Los updates por email o WhatsApp se configuran despues solo si quieres.',
        invalidEmail: 'Ingresa un correo valido.',
        registerError: 'No pudimos completar tu registro ahora. Intenta nuevamente.',
        wishSignal: 'Deseo activo',
        unlockButton: 'Guardar deseo y revelar proyeccion',
        unlockingButton: 'Abriendo tu proyeccion...',
        continueLockedLabel: 'Ingresa tu email para revelar la proyeccion',
      },
      step4: {
        badge: 'Paso 4',
        title: 'Descubre la proyeccion de hoy',
        body:
          'Ya conocemos tus simbolos. Ahora abrimos una pista base de hoy; para ver toda la semana, desbloquea el calendario de suerte.',
        nextFortuneLead: 'Pero espera, tu proximo dia de fortuna es...',
        nextFortuneDateLabel: 'Proximo dia favorable',
        previewBadge: 'Fortuna revelada',
        strongPrefix: 'Fuerte',
        avoidPrefix: 'Evita',
        personalSignal: 'Senal personal',
        zodiac: 'Zodiaco',
        chineseCalendar: 'Calendario chino',
        pendingPersonalTitle: 'Senal personal pendiente',
        pendingPersonalBody:
          'Agrega tu fecha de nacimiento para desbloquear tu capa zodiacal y calendario chino aqui.',
        nextLabel: 'Seguir al calendario',
      },
      step5: {
        badge: 'Paso 5',
        title: 'Tu semana de suerte esta lista',
        body:
          'Aqui tienes 7 dias desde hoy. Hoy queda abierto como pista base; manana muestra su senal, pero el detalle completo se revela al activar tu trial.',
        nextWeekLocked: 'Dia bloqueado',
        unlockLine: 'Desbloquea el trial para revelar tu semana completa de suerte.',
      },
      step6: {
        badge: 'Paso 6',
        title: 'Desbloquea Trimry y abre tu planificacion de suerte.',
        body:
          'Al suscribirte comienza una aventura de manifestacion: enfocas energia positiva en los dias correctos del calendario de tus simbolos para avanzar hacia el deseo que nombraste.',
        featureIntro: 'Al activar tu trial desbloqueas',
        wishTitle: 'Tu deseo queda en el centro',
        wishBody:
          'Luck Guru lo vera como prioridad y podra asesorarte con timing, cautela, accion y rituales para ayudarte a acercarte a lo que quieres lograr.',
        emptyWish:
          'Si agregas un deseo desde tu cuenta, Luck Guru lo usara como brujula personal.',
        benefits: [
          'Luck Guru completo para asesorarte usando tu deseo como prioridad.',
          'Notificaciones diarias opcionales por email y WhatsApp con tu proyeccion de suerte.',
          'Calendario personalizado para anticipar mejores dias antes de eventos importantes.',
        ],
        trialBadge: String(trialDays) + ' dias gratis',
        unsubscribeTitle: 'Cancelar es facil',
        unsubscribeBody:
          'Puedes desuscribirte en cualquier momento desde tu cuenta, sin friccion y en pocos clics.',
        cta: 'Empezar trial gratis de ' + String(trialDays) + ' dias',
      },
      nav: {
        back: 'Atras',
        next: 'Siguiente',
        continueTo: 'Continuar a',
        stepLabel: 'Paso',
      },
    }
  }

  if (language === 'pt') {
    return {
      title: 'Bem-vindo ao seu ritual de sorte',
      subtitle:
        'Em seis passos voce entende como a Trimry funciona, revela seus simbolos, faz um pedido e desbloqueia seu calendario semanal de sorte.',
      stepTitles: [
        'Comece com sorte',
        'Seus simbolos',
        'Faca um pedido',
        'Projecao de hoje',
        'Semana de sorte',
        'Ativar trial',
      ],
      step1: {
        badge: 'Passo 1',
        title: 'A Trimry ajuda a desbloquear o ritmo oculto da sua sorte.',
        body:
          'Analisamos seus simbolos pessoais e os alinhamos com sistemas universais de timing estudados por monges tibetanos, para criar um calendario personalizado do que pode vir pela frente.',
        bullets: [
          'Guia unico de sorte personalizada, inspirado no seu zodiaco, simbolo chines e sutra antigo.',
          'Voce pode configurar updates diarios por email e WhatsApp com sua projecao diaria de sorte.',
        ],
        videoBadge: 'Video demo (autoplay)',
      },
      step2: {
        badge: 'Passo 2',
        title: 'Revele seus signos e sua identidade de sorte',
        body:
          'Sua data de nascimento abre seu zodiaco, seu simbolo chines e a camada pessoal que usaremos para interpretar o calendario.',
        birthDateLabel: 'Data de nascimento',
        birthHint:
          'Usamos seu nascimento para descobrir os simbolos que marcam sua leitura pessoal.',
        missingBirthDate: 'Digite sua data de nascimento para revelar seus signos.',
        fortuneCode: 'Codigo de fortuna',
        signsRevealReady: 'Signos revelados',
        signsRevealPending: 'Complete sua data de nascimento para revelar seus signos agora.',
        zodiac: 'Zodiaco',
        chineseCalendar: 'Calendario chines',
        identityTitle: 'Sua identidade esta tomando forma',
        identityBody:
          'Quando voce revela seus simbolos, a Trimry pode ler qual energia convem ativar e quais dias pedem cautela.',
        nextLabel: 'Continuar ao pedido',
      },
      step3: {
        badge: 'Passo 3',
        title: 'Faca um pedido para focar a manifestacao',
        body:
          'Luck Guru trabalha melhor quando sabe o que voce quer atrair. Salve um pedido para orientar a leitura; se nao quiser agora, pode pular.',
        wishFocusTitle: 'O pedido concentra a energia',
        wishFocusBody:
          'Pedimos seu pedido para focar nossos esforcos para que ele se cumpra e para personalizar os dias de agir, esperar ou abrir espaco.',
        wishLabel: 'Faca um pedido',
        wishPlaceholder: 'Ex: quero atrair mais oportunidades de dinheiro esta semana',
        wishHint:
          'Esse pedido fica salvo e voce pode mudar depois na sua conta.',
        skipWish: 'Pular pedido e revelar',
        emailLabel: 'Email',
        emailPlaceholder: 'voce@email.com',
        emailHint:
          'Usamos seu email para criar sua conta e salvar seu calendario. Updates por email ou WhatsApp sao configurados depois somente se voce quiser.',
        invalidEmail: 'Digite um email valido.',
        registerError: 'Nao conseguimos concluir seu cadastro agora. Tente novamente.',
        wishSignal: 'Pedido ativo',
        unlockButton: 'Salvar pedido e revelar projecao',
        unlockingButton: 'Abrindo sua projecao...',
        continueLockedLabel: 'Digite seu email para revelar a projecao',
      },
      step4: {
        badge: 'Passo 4',
        title: 'Descubra a projecao de hoje',
        body:
          'Ja conhecemos seus simbolos. Agora abrimos uma pista base de hoje; para ver a semana inteira, desbloqueie o calendario de sorte.',
        nextFortuneLead: 'Mas espere, seu proximo dia de fortuna e...',
        nextFortuneDateLabel: 'Proximo dia favoravel',
        previewBadge: 'Fortuna revelada',
        strongPrefix: 'Forte',
        avoidPrefix: 'Evite',
        personalSignal: 'Sinal pessoal',
        zodiac: 'Zodiaco',
        chineseCalendar: 'Calendario chines',
        pendingPersonalTitle: 'Sinal pessoal pendente',
        pendingPersonalBody:
          'Adicione sua data de nascimento para liberar sua camada zodiacal e chinesa aqui.',
        nextLabel: 'Ir para o calendario',
      },
      step5: {
        badge: 'Passo 5',
        title: 'Sua semana de sorte esta pronta',
        body:
          'Aqui estao 7 dias a partir de hoje. Hoje fica aberto como pista base; amanha mostra seu sinal, mas o detalhe completo se revela ao ativar seu trial.',
        nextWeekLocked: 'Dia bloqueado',
        unlockLine: 'Desbloqueie o trial para revelar sua semana completa de sorte.',
      },
      step6: {
        badge: 'Passo 6',
        title: 'Desbloqueie a Trimry e abra seu planejamento de sorte.',
        body:
          'Ao assinar, comeca uma aventura de manifestacao: voce foca energia positiva nos dias certos do calendario dos seus simbolos para avancar em direcao ao pedido que nomeou.',
        featureIntro: 'Ao ativar seu trial voce desbloqueia',
        wishTitle: 'Seu pedido fica no centro',
        wishBody:
          'Luck Guru vai ve-lo como prioridade e podera orientar voce com timing, cautela, acao e rituais para ajudar a se aproximar do que quer realizar.',
        emptyWish:
          'Se voce adicionar um pedido na sua conta, Luck Guru vai usa-lo como bussola pessoal.',
        benefits: [
          'Luck Guru completo para orientar voce usando seu pedido como prioridade.',
          'Notificacoes diarias opcionais por email e WhatsApp com sua projecao de sorte.',
          'Calendario personalizado para antecipar melhores dias antes de eventos importantes.',
        ],
        trialBadge: String(trialDays) + ' dias gratis',
        unsubscribeTitle: 'Cancelar e simples',
        unsubscribeBody:
          'Voce pode cancelar quando quiser na conta, em poucos cliques.',
        cta: 'Comecar trial gratis de ' + String(trialDays) + ' dias',
      },
      nav: {
        back: 'Voltar',
        next: 'Seguinte',
        continueTo: 'Continuar para',
        stepLabel: 'Passo',
      },
    }
  }

  return {
    title: 'Welcome to your luck alignment ritual',
    subtitle:
      'In six steps you will understand Trimry, reveal your symbols, make a wish, and unlock your weekly luck calendar.',
    stepTitles: [
      'Start being lucky',
      'Your symbols',
      'Make a wish',
      'Today projection',
      'Luck week',
      'Activate trial',
    ],
    step1: {
      badge: 'Step 1',
      title: 'Trimry helps unlock the hidden rhythm of your luck.',
      body:
        'We analyze your personal symbols and align them with universal timing systems studied by Tibetan monks, to create a personalized calendar of what may lie ahead.',
      bullets: [
        'Unique personalized luck guide, inspired in your zodiac, chinese symbol and ancient sutra.',
        'You can setup daily Email and Whatsapp updates with your daily luck proyection.',
      ],
      videoBadge: 'Demo video (autoplay)',
    },
    step2: {
      badge: 'Step 2',
      title: 'Reveal your signs and luck identity',
      body:
        'Your date of birth opens your zodiac, Chinese symbol, and the personal layer we use to interpret the calendar.',
      birthDateLabel: 'Date of birth',
      birthHint:
        'We use your birthday to discover the symbols that shape your personal reading.',
      missingBirthDate: 'Enter your date of birth to reveal your signs.',
      fortuneCode: 'Fortune code',
      signsRevealReady: 'Signs revealed',
      signsRevealPending: 'Complete your date of birth to reveal your signs instantly.',
      zodiac: 'Zodiac',
      chineseCalendar: 'Chinese calendar',
      identityTitle: 'Your identity is taking shape',
      identityBody:
        'Once your symbols are revealed, Trimry can read which energy to activate and which days ask for caution.',
      nextLabel: 'Continue to wish',
    },
    step3: {
      badge: 'Step 3',
      title: 'Make a wish to focus manifestation',
      body:
        'Luck Guru works better when it knows what you want to attract. Save a wish to guide the reading; you can skip this if you want.',
      wishFocusTitle: 'The wish concentrates the energy',
      wishFocusBody:
        'We ask for your wish so we can focus our efforts toward its fulfillment and personalize which days invite action, patience, or openness.',
      wishLabel: 'Make a wish',
      wishPlaceholder: 'Example: I want to attract better money opportunities this week',
      wishHint:
        'This wish is saved and you can change it later from your account.',
      skipWish: 'Skip wish and reveal',
      emailLabel: 'Email',
      emailPlaceholder: 'you@email.com',
      emailHint:
        'We use your email to create your account and save your calendar. Email or WhatsApp updates are configured later only if you want them.',
      invalidEmail: 'Enter a valid email.',
      registerError: 'Unable to complete registration right now. Try again.',
      wishSignal: 'Active wish',
      unlockButton: 'Save wish and reveal projection',
      unlockingButton: 'Opening your projection...',
      continueLockedLabel: 'Enter your email to reveal the projection',
    },
    step4: {
      badge: 'Step 4',
      title: 'Discover today’s projection',
      body:
        'Now we know your symbols. Here is a base hint for today; to see the full week, unlock the luck calendar.',
      nextFortuneLead: 'But wait, your next fortune day is...',
      nextFortuneDateLabel: 'Next favorable day',
      previewBadge: 'Fortune revealed',
      strongPrefix: 'Strong',
      avoidPrefix: 'Avoid',
      personalSignal: 'Personal signal',
      zodiac: 'Zodiac',
      chineseCalendar: 'Chinese calendar',
      pendingPersonalTitle: 'Personal signal pending',
      pendingPersonalBody:
        'Add your date of birth to unlock your zodiac and Chinese calendar layer here.',
      nextLabel: 'Continue to calendar',
    },
    step5: {
      badge: 'Step 5',
      title: 'Your luck week is ready',
      body:
        'Here are 7 days starting today. Today stays open as a base hint; tomorrow shows its signal, but the full detail reveals when you activate your trial.',
      nextWeekLocked: 'Day locked',
      unlockLine: 'Unlock the trial to reveal your full luck week.',
    },
    step6: {
      badge: 'Step 6',
      title: 'Unlock Trimry and open your luck planning calendar.',
      body:
        'After subscribing, your manifestation adventure begins: you focus positive energy on the right days in the calendar of your symbols, moving closer to the wish you named.',
      featureIntro: 'When you activate your trial, you unlock',
      wishTitle: 'Your wish stays at the center',
      wishBody:
        'Luck Guru will treat it as priority context and advise you with timing, caution, action, and rituals to help you move toward what you want.',
      emptyWish:
        'If you add a wish from your account, Luck Guru will use it as your personal compass.',
      benefits: [
        'Full Luck Guru access, advised around your wish as the priority.',
        'Optional daily Email and WhatsApp updates with your luck projection.',
        'Personalized calendar access to anticipate better days before important events.',
      ],
      trialBadge: String(trialDays) + ' days free',
      unsubscribeTitle: 'Easy to unsubscribe',
      unsubscribeBody:
        'Cancel anytime from your account in just a few clicks.',
      cta: 'Start ' + String(trialDays) + '-day free trial',
    },
    nav: {
      back: 'Back',
      next: 'Next',
      continueTo: 'Continue to',
      stepLabel: 'Step',
    },
  }
}

function buildCalendarPreview(language: LanguageCode) {
  const locale = languageToIntlLocale(language)
  const startDate = localTodayAsUtcNoon()

  return Array.from({ length: 7 }, (_, index) => {
    const dayOffset = index
    const targetDate = addUtcDays(startDate, dayOffset)
    const dayKey = toUtcDayKey(targetDate)
    const fallback = buildFortuneDay(targetDate, locale)

    return {
      dayKey,
      date: fallback.date,
      weekday: fallback.weekday,
      summary: fallback.summary,
      notes: fallback.notes,
      locked: index >= 2,
      blurred: index === 1,
    }
  })
}

export default function ActivationGatewayPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { language, messages } = useLanguage()
  const resolvedLanguage = normalizeLanguageCode(language)
  const adminOnboardingPreviewRequested =
    searchParams.get('preview') === 'admin-onboarding'
  const trialDays = SUBSCRIPTION_PLAN.stripeTrialPeriodDays
  const copy = useMemo(
    () => getActivationFlowCopy(resolvedLanguage, trialDays),
    [resolvedLanguage, trialDays],
  )

  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState(false)
  const [flowError, setFlowError] = useState('')
  const [account, setAccount] = useState<AccountSnapshot | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [todayPreview, setTodayPreview] = useState<TodayPreview>(() =>
    createPreviewFromFortune(resolvedLanguage, new Date()),
  )
  const [calendarPreview, setCalendarPreview] = useState<CalendarPreviewDay[]>([])
  const [registrationEmail, setRegistrationEmail] = useState('')
  const [registrationBirthDate, setRegistrationBirthDate] = useState('')
  const [registrationWish, setRegistrationWish] = useState('')
  const [registrationTimeZone, setRegistrationTimeZone] = useState('UTC')
  const [registering, setRegistering] = useState(false)
  const [registerError, setRegisterError] = useState('')
  const persistedMaxStepRef = useRef(0)
  const activeBirthDate = registrationBirthDate || account?.user.birthDate || ''
  const activeWish = registrationWish.trim() || account?.user.manifestationWish || ''
  const activeEmail = registrationEmail.trim() || account?.user.email || ''

  const personalSigns = useMemo(
    () => buildPersonalSignProfile(activeBirthDate, resolvedLanguage, todayPreview.summary),
    [activeBirthDate, resolvedLanguage, todayPreview.summary],
  )
  const todayLabels = useMemo(
    () => buildStrongAndCautionLabels(resolvedLanguage, todayPreview.activities),
    [resolvedLanguage, todayPreview.activities],
  )
  const previewDateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(languageToIntlLocale(resolvedLanguage), {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
      }),
    [resolvedLanguage],
  )
  const nextFortuneDate = useMemo(() => {
    if (todayPreview.summary !== 'bad') {
      return null
    }

    const locale = languageToIntlLocale(resolvedLanguage)

    for (let dayOffset = 1; dayOffset <= 14; dayOffset += 1) {
      const targetDate = addUtcDays(new Date(), dayOffset)
      const forecast = buildFortuneDay(targetDate, locale)

      if (forecast.summary === 'good') {
        return targetDate
      }
    }

    return null
  }, [resolvedLanguage, todayPreview.summary])
  const isProjectionUnlocked = Boolean(account)
  const maxReachableStep = isProjectionUnlocked ? TOTAL_STEPS : 3
  const progressPercent = (currentStep / TOTAL_STEPS) * 100

  useEffect(() => {
    setRegistrationTimeZone(detectBrowserTimeZone())
  }, [])

  useEffect(() => {
    let cancelled = false

    const loadActivationFlow = async () => {
      try {
        const currentAccount = await fetchAccountSnapshot()

        const dayKey = toUtcDayKey(new Date())
        const locale = languageToIntlLocale(resolvedLanguage)

        if (currentAccount) {
          const isAdminOnboardingPreview =
            adminOnboardingPreviewRequested && currentAccount.user.admin
          const status = currentAccount.subscription?.status ?? null

          if (!isAdminOnboardingPreview) {
            if (
              status === 'active' ||
              status === 'past_due' ||
              status === 'paused' ||
              status === 'canceled'
            ) {
              router.replace('/dashboard')
              return
            }

            if (status === 'pending_checkout') {
              router.replace('/checkout/start')
              return
            }
          }

          const storedMaxStep = Math.max(
            0,
            Math.min(
              TOTAL_STEPS,
              currentAccount.user.activationFunnel?.maxStepReached ?? 0,
            ),
          )
          const initialStep = isAdminOnboardingPreview
            ? 1
            : Math.max(1, storedMaxStep || 1)

          if (!cancelled) {
            persistedMaxStepRef.current = storedMaxStep
            setAccount(currentAccount)
            setRegistrationBirthDate(currentAccount.user.birthDate ?? '')
            setRegistrationEmail(currentAccount.user.email ?? '')
            setRegistrationWish(currentAccount.user.manifestationWish ?? '')
            setCurrentStep(initialStep)
            setCalendarPreview(buildCalendarPreview(resolvedLanguage))
          }
        } else if (!cancelled) {
          persistedMaxStepRef.current = 0
          setAccount(null)
          setCurrentStep((current) => Math.max(1, Math.min(3, current)))
          setCalendarPreview(buildCalendarPreview(resolvedLanguage))
        }

        const previewResponse = await apiFetch(
          `/luck-guru/today-preview?date=${encodeURIComponent(dayKey)}&locale=${encodeURIComponent(locale)}`,
          { cache: 'no-store' },
          { retryUnauthorized: false },
        )

        if (cancelled || !previewResponse.ok) {
          return
        }

        const payload = (await previewResponse.json()) as Partial<TodayPreview>

        if (payload.summary && payload.headline && payload.notes) {
          setTodayPreview({
            ...createPreviewFromFortune(resolvedLanguage, new Date()),
            ...payload,
            summaryLabel: toneLabel(resolvedLanguage, payload.summary),
            luckScore: payload.luckScore ?? buildLuckScore(payload.summary),
          })
        }
      } catch {
        if (!cancelled) {
          setFlowError(
            resolvedLanguage === 'es'
              ? 'No pudimos cargar tu onboarding en este momento.'
              : resolvedLanguage === 'pt'
                ? 'Nao conseguimos carregar seu onboarding agora.'
                : 'Unable to load your onboarding right now.',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadActivationFlow()

    return () => {
      cancelled = true
    }
  }, [adminOnboardingPreviewRequested, resolvedLanguage, router])

  useEffect(() => {
    if (loading) {
      return
    }

    trackEvent('activate_flow_step_view', {
      language: resolvedLanguage,
      step: currentStep,
    })
    trackMetaCustomEvent('ActivateFlowStepView', {
      language: resolvedLanguage,
      step: currentStep,
    })
  }, [currentStep, loading, resolvedLanguage])

  useEffect(() => {
    if (
      loading ||
      !account ||
      (account.user.admin && adminOnboardingPreviewRequested)
    ) {
      return
    }

    if (currentStep <= persistedMaxStepRef.current) {
      return
    }

    let cancelled = false

    const syncFunnelStep = async () => {
      try {
        const response = await saveActivationFunnelStep(currentStep, TOTAL_STEPS)

        if (cancelled) {
          return
        }

        const nextMaxStep = response?.activationFunnel?.maxStepReached ?? currentStep
        persistedMaxStepRef.current = Math.max(
          persistedMaxStepRef.current,
          Math.min(TOTAL_STEPS, nextMaxStep),
        )
      } catch {}
    }

    void syncFunnelStep()

    return () => {
      cancelled = true
    }
  }, [account, adminOnboardingPreviewRequested, currentStep, loading])

  const goToStep = (step: number) => {
    if (!isProjectionUnlocked && step > 3) {
      setFlowError(copy.step3.continueLockedLabel)
    } else {
      setFlowError('')
    }

    const normalizedStep = Math.max(1, Math.min(maxReachableStep, step))
    setCurrentStep(normalizedStep)
  }

  const goToNextStep = () => {
    setRegisterError('')

    if (currentStep === 2 && !activeBirthDate) {
      setFlowError(copy.step2.missingBirthDate)
      return
    }

    if (!isProjectionUnlocked && currentStep >= 3) {
      setFlowError(copy.step3.continueLockedLabel)
      return
    }

    setFlowError('')
    setCurrentStep((current) => Math.min(TOTAL_STEPS, current + 1))
  }

  const goToPreviousStep = () => {
    setCurrentStep((current) => Math.max(1, current - 1))
  }

  const submitRegistrationAndUnlockProjection = async (options?: { skipWish?: boolean }) => {
    setRegisterError('')
    setFlowError('')

    const normalizedEmail = registrationEmail.trim().toLowerCase()
    const normalizedWish = options?.skipWish
      ? ''
      : registrationWish.trim().replace(/\s+/g, ' ')

    if (!EMAIL_CONTACT_PATTERN.test(normalizedEmail)) {
      setRegisterError(copy.step3.invalidEmail)
      return
    }

    if (!registrationBirthDate) {
      setRegisterError(copy.step2.missingBirthDate)
      setCurrentStep(2)
      return
    }

    setRegistering(true)

    try {
      const response = await apiFetch(
        '/auth/register',
        {
          method: 'POST',
          body: JSON.stringify({
            firstName: buildFirstNameFromEmail(normalizedEmail),
            birthDate: registrationBirthDate,
            manifestationWish: normalizedWish || null,
            email: normalizedEmail,
            locale: resolvedLanguage,
            timeZone: registrationTimeZone,
            clientMetadata: collectRegistrationClientMetadata(registrationTimeZone),
          }),
        },
        { retryUnauthorized: false },
      )

      if (!response.ok) {
        setRegisterError(await readApiError(response, copy.step3.registerError))
        return
      }

      trackEvent('activate_flow_projection_unlocked', {
        language: resolvedLanguage,
      })
      trackMetaCustomEvent('ActivateFlowProjectionUnlocked', {
        language: resolvedLanguage,
      })

      const refreshedAccount = await fetchAccountSnapshot().catch(() => null)

      if (refreshedAccount) {
        setAccount(refreshedAccount)
        setCurrentStep(4)
        return
      }

      router.refresh()
    } catch {
      setRegisterError(copy.step3.registerError)
    } finally {
      setRegistering(false)
    }
  }

  const registerAndUnlockProjection = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void submitRegistrationAndUnlockProjection()
  }

  const activateInternalTrial = async () => {
    if (!account) {
      setCurrentStep(3)
      setFlowError(copy.step3.continueLockedLabel)
      return
    }

    setActivating(true)
    setFlowError('')

    try {
      const response = await apiFetch(
        '/subscription',
        {
          method: 'POST',
          body: JSON.stringify({
            action: 'subscribe',
            deliveryPreference: 'none',
            deliveryHourLocal: DEFAULT_WEEKLY_DELIVERY_HOUR,
          }),
        },
        { retryUnauthorized: false },
      )

      if (response.status === 401) {
        router.replace('/account/login')
        return
      }

      if (!response.ok) {
        setFlowError(
          await readApiError(
            response,
            resolvedLanguage === 'es'
              ? 'No pudimos iniciar tu trial ahora.'
              : resolvedLanguage === 'pt'
                ? 'Nao conseguimos iniciar seu trial agora.'
                : 'Unable to start your trial right now.',
          ),
        )
        return
      }

      trackEvent('activate_flow_trial_click', {
        language: resolvedLanguage,
        user_id: account.user.id,
      })
      trackMetaCustomEvent('ActivateFlowTrialClick', {
        language: resolvedLanguage,
        user_id: account.user.id,
      })

      router.push('/checkout/start')
      router.refresh()
    } catch {
      setFlowError(
        resolvedLanguage === 'es'
          ? 'No pudimos iniciar tu trial ahora.'
          : resolvedLanguage === 'pt'
            ? 'Nao conseguimos iniciar seu trial agora.'
            : 'Unable to start your trial right now.',
      )
    } finally {
      setActivating(false)
    }
  }

  if (loading) {
    return (
      <section className="cosmic-shell mx-auto max-w-6xl rounded-[2rem] p-6 text-slate-100 sm:p-8">
        <p>{messages.common.loading}</p>
      </section>
    )
  }

  return (
    <section className="cosmic-shell mx-auto max-w-6xl p-4 sm:p-6">
      <div className="luck-glow cosmic-panel relative overflow-hidden rounded-[2.3rem] p-5 sm:p-7 lg:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(90,243,220,0.24),transparent_32%),radial-gradient(circle_at_86%_0%,rgba(117,173,255,0.24),transparent_34%),radial-gradient(circle_at_74%_82%,rgba(247,221,145,0.16),transparent_30%)]" />

        <div className="relative z-10">
          <div className="max-w-4xl">
            <h1 className="text-3xl leading-tight text-slate-50 sm:text-5xl">{copy.title}</h1>
            <p className="mt-3 text-base leading-7 text-slate-100/86 sm:text-lg">
              {copy.subtitle}
            </p>
          </div>

          <div className="mt-6">
            <div className="h-2 overflow-hidden rounded-full bg-cyan-100/12">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#7AF5E5,#B7CAFF,#F6D8A8)] transition-all duration-400"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-6 sm:overflow-visible sm:pb-0">
              {copy.stepTitles.map((title, index) => {
                const stepNumber = index + 1
                const active = stepNumber === currentStep
                const completed = stepNumber < currentStep
                const blocked = stepNumber > maxReachableStep

                return (
                  <button
                    key={title}
                    type="button"
                    disabled={blocked}
                    onClick={() => goToStep(stepNumber)}
                    className={clsx(
                      'min-w-[7.8rem] shrink-0 rounded-xl border px-3 py-2 text-left transition disabled:cursor-not-allowed sm:min-w-0 sm:py-3',
                      blocked && 'opacity-55',
                      active
                        ? 'border-cyan-100/55 bg-cyan-100/16'
                        : completed
                          ? 'border-emerald-200/40 bg-emerald-200/12'
                          : 'border-cyan-100/18 bg-slate-950/26 hover:border-cyan-100/32',
                    )}
                  >
                    <p className="text-[9px] font-black uppercase tracking-[0.14em] text-cyan-100/72 sm:text-[10px] sm:tracking-[0.16em]">
                      {copy.nav.stepLabel} {stepNumber}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-50 sm:text-sm">{title}</p>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-7 min-h-[28rem]">
            {currentStep === 1 ? (
              <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
                <div>
                  <p className="cosmic-badge inline-flex rounded-full px-4 py-1 text-xs font-bold uppercase tracking-[0.24em] text-cyan-100">
                    {copy.step1.badge}
                  </p>
                  <h2 className="mt-4 text-3xl leading-tight text-slate-50 sm:text-4xl">
                    {copy.step1.title}
                  </h2>
                  <p className="mt-4 text-base leading-7 text-slate-100/86">{copy.step1.body}</p>
                  <ul className="mt-5 grid gap-2 text-sm text-cyan-100/88 sm:grid-cols-2">
                    {copy.step1.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="rounded-xl border border-cyan-100/18 bg-cyan-100/8 px-3 py-2"
                      >
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100/78">
                    {copy.step1.videoBadge}
                  </p>
                  <div className="relative mt-3 aspect-square overflow-hidden rounded-[1.4rem] border border-cyan-100/20 bg-slate-950">
                    <video
                      aria-hidden="true"
                      className="absolute inset-0 h-full w-full object-cover"
                      src="/crystal-sphere.mp4"
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="auto"
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {currentStep === 2 ? (
              <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
                <div className="rounded-[1.6rem] border border-cyan-100/20 bg-slate-950/36 p-5 sm:p-6">
                  <p className="cosmic-badge inline-flex rounded-full px-4 py-1 text-xs font-bold uppercase tracking-[0.24em] text-cyan-100">
                    {copy.step2.badge}
                  </p>
                  <h2 className="mt-4 text-3xl leading-tight text-slate-50 sm:text-4xl">
                    {copy.step2.title}
                  </h2>
                  <p className="mt-4 text-base leading-7 text-slate-100/86">{copy.step2.body}</p>

                  <div className="mt-5">
                    <label
                      className="cosmic-field-label block text-sm font-semibold"
                      htmlFor="activate-symbols-birth-month"
                    >
                      {copy.step2.birthDateLabel}
                    </label>
                    <div className="mt-2">
                      <DateOfBirthPicker
                        idPrefix="activate-symbols-birth"
                        value={registrationBirthDate}
                        onChange={(value) => {
                          setFlowError('')
                          setRegistrationBirthDate(value)
                        }}
                        language={resolvedLanguage}
                        required
                      />
                    </div>
                    <span className="cosmic-shell-meta mt-2 block text-xs text-slate-100/74">
                      {copy.step2.birthHint}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={goToNextStep}
                    className="cosmic-button-primary mt-5 inline-flex rounded-full px-6 py-3 text-xs font-black uppercase tracking-[0.16em]"
                  >
                    {copy.step2.nextLabel}
                  </button>
                </div>

                <div className="relative overflow-hidden rounded-[1.6rem] border border-amber-200/24 bg-[radial-gradient(circle_at_18%_18%,rgba(247,223,161,0.18),transparent_32%),linear-gradient(135deg,rgba(5,11,31,0.72),rgba(23,30,72,0.72))] p-5 sm:p-6">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full border border-cyan-100/14" />
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100/78">
                    {personalSigns ? copy.step2.signsRevealReady : copy.step2.fortuneCode}
                  </p>
                  <h3 className="mt-3 text-2xl leading-tight text-slate-50">
                    {copy.step2.identityTitle}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-100/82">
                    {copy.step2.identityBody}
                  </p>

                  {personalSigns ? (
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <article className="rounded-2xl border border-cyan-100/18 bg-slate-950/34 p-4">
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100/72">
                          {copy.step2.zodiac}
                        </p>
                        <p className="mt-2 text-2xl text-slate-50">{personalSigns.zodiac.name}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-100/78">
                          {personalSigns.zodiac.summary}
                        </p>
                      </article>
                      <article className="rounded-2xl border border-cyan-100/18 bg-slate-950/34 p-4">
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100/72">
                          {copy.step2.chineseCalendar}
                        </p>
                        <p className="mt-2 text-2xl text-slate-50">{personalSigns.chinese.name}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-100/78">
                          {personalSigns.chinese.summary}
                        </p>
                      </article>
                    </div>
                  ) : (
                    <div className="mt-5 rounded-2xl border border-cyan-100/18 bg-cyan-100/8 p-4">
                      <p className="text-sm leading-6 text-slate-100/82">
                        {copy.step2.signsRevealPending}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {currentStep === 3 ? (
              <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
                <div className="relative min-h-[28rem] overflow-hidden rounded-[1.8rem] border border-amber-200/24 bg-slate-950/46 p-6">
                  <div className="wish-oracle mx-auto mt-2">
                    <span className="wish-oracle-ring" />
                    <span className="wish-oracle-core" />
                    <span className="wish-oracle-dot wish-oracle-dot-a" />
                    <span className="wish-oracle-dot wish-oracle-dot-b" />
                    <span className="wish-oracle-dot wish-oracle-dot-c" />
                  </div>
                  <div className="relative z-10 mt-8 rounded-[1.4rem] border border-cyan-100/18 bg-slate-950/44 p-5 backdrop-blur-md">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-100/82">
                      {copy.step3.wishFocusTitle}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-100/84">
                      {copy.step3.wishFocusBody}
                    </p>
                    {personalSigns ? (
                      <p className="mt-4 rounded-full border border-cyan-100/18 bg-cyan-100/8 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-cyan-100">
                        {personalSigns.zodiac.name} · {personalSigns.chinese.name}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-[1.6rem] border border-cyan-100/20 bg-slate-950/42 p-5 sm:p-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100/82">
                    {copy.step3.badge}
                  </p>
                  <h2 className="mt-2 text-3xl leading-tight text-slate-50 sm:text-4xl">
                    {copy.step3.title}
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-100/84 sm:text-base">
                    {copy.step3.body}
                  </p>

                  {isProjectionUnlocked ? (
                    <div className="mt-5 space-y-3">
                      <div className="rounded-2xl border border-cyan-100/18 bg-cyan-100/8 p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100/82">
                          {copy.step3.emailLabel}
                        </p>
                        <p className="mt-1 text-sm text-slate-50">{activeEmail}</p>
                      </div>
                      {activeWish ? (
                        <div className="rounded-2xl border border-amber-200/20 bg-amber-200/10 p-4">
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-100/82">
                            {copy.step3.wishSignal}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-50">{activeWish}</p>
                        </div>
                      ) : null}
                      <button
                        type="button"
                        onClick={goToNextStep}
                        className="cosmic-button-primary inline-flex rounded-full px-6 py-3 text-xs font-black uppercase tracking-[0.16em]"
                      >
                        {copy.step4.title}
                      </button>
                    </div>
                  ) : (
                    <form className="mt-5 space-y-4" onSubmit={registerAndUnlockProjection}>
                      <label className="cosmic-field-label block text-sm font-semibold">
                        {copy.step3.wishLabel}
                        <textarea
                          value={registrationWish}
                          onChange={(event) => setRegistrationWish(event.target.value)}
                          maxLength={240}
                          rows={4}
                          className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
                          placeholder={copy.step3.wishPlaceholder}
                        />
                        <span className="cosmic-shell-meta mt-2 block text-xs text-slate-100/74">
                          {copy.step3.wishHint}
                        </span>
                      </label>

                      <label className="cosmic-field-label block text-sm font-semibold">
                        {copy.step3.emailLabel}
                        <input
                          type="email"
                          value={registrationEmail}
                          onChange={(event) => setRegistrationEmail(event.target.value)}
                          required
                          autoComplete="email"
                          className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
                          placeholder={copy.step3.emailPlaceholder}
                        />
                        <span className="cosmic-shell-meta mt-2 block text-xs text-slate-100/74">
                          {copy.step3.emailHint}
                        </span>
                      </label>

                      {registerError ? (
                        <p className="cosmic-error-box rounded-xl px-4 py-3 text-sm">{registerError}</p>
                      ) : null}

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="submit"
                          disabled={registering}
                          className="cosmic-button-primary inline-flex rounded-full px-6 py-3 text-xs font-black uppercase tracking-[0.16em] disabled:opacity-70"
                        >
                          {registering ? copy.step3.unlockingButton : copy.step3.unlockButton}
                        </button>
                        <button
                          type="button"
                          onClick={() => void submitRegistrationAndUnlockProjection({ skipWish: true })}
                          disabled={registering}
                          className="cosmic-button-secondary inline-flex rounded-full px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-cyan-50 disabled:opacity-70"
                        >
                          {copy.step3.skipWish}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            ) : null}

            {currentStep === 4 ? (
              <div className="grid gap-6 lg:grid-cols-[minmax(16rem,20rem)_minmax(0,1fr)] lg:items-start">
                <aside className="relative mx-auto w-full max-w-[20rem] overflow-hidden rounded-[1.4rem] border border-cyan-100/24 bg-slate-950/30 lg:mx-0">
                  <p className="px-4 pt-4 text-xs font-black uppercase tracking-[0.18em] text-cyan-100/78">
                    {copy.step4.badge}
                  </p>
                  <div className="relative mt-3 aspect-square">
                    <video
                      aria-hidden="true"
                      className="absolute inset-0 h-full w-full object-cover"
                      src="/luck-guru-revealed.mp4"
                      poster="/luck-guru-revealed-poster.jpg"
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="auto"
                    />
                  </div>
                </aside>

                <div className="rounded-[1.4rem] border border-cyan-100/20 bg-slate-950/42 p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100/82">
                        {copy.step4.badge}
                      </p>
                      <h2 className="mt-2 text-3xl leading-tight text-slate-50 sm:text-4xl">
                        {copy.step4.title}
                      </h2>
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-100/84 sm:text-base">
                        {copy.step4.body}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={goToNextStep}
                      className="cosmic-button-primary inline-flex rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.15em]"
                    >
                      {copy.step4.nextLabel}
                    </button>
                  </div>

                  <div className="mt-5 border-t border-cyan-100/12 pt-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100/82">
                          {copy.step4.previewBadge}
                        </p>
                        <p className="mt-2 text-xl leading-tight text-slate-50 sm:text-2xl">
                          {todayPreview.headline}
                        </p>
                      </div>
                      <span className={clsx(toneBadgeClass(todayPreview.summary), 'shrink-0')}>
                        <span aria-hidden="true" className="oracle-tone-badge-icon">
                          {toneGlyph(todayPreview.summary)}
                        </span>
                        {todayPreview.summaryLabel}
                      </span>
                    </div>

                    <div className="mt-4 flex items-end gap-3">
                      <p className="text-5xl font-semibold leading-none text-slate-50 sm:text-6xl">
                        {todayPreview.luckScore}
                      </p>
                      <p className="pb-1 text-sm font-black uppercase tracking-[0.2em] text-cyan-100/82">
                        /100
                      </p>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-slate-100/84 sm:text-base">
                      {todayPreview.notes}
                    </p>
                    {nextFortuneDate ? (
                      <div className="mt-4 rounded-xl border border-emerald-200/24 bg-emerald-200/10 p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-100/90">
                          {copy.step4.nextFortuneLead}
                        </p>
                        <p className="mt-2 text-base font-semibold text-slate-50 sm:text-lg">
                          {copy.step4.nextFortuneDateLabel}: {previewDateFormatter.format(nextFortuneDate)}
                        </p>
                      </div>
                    ) : null}
                    {activeWish ? (
                      <div className="mt-4 rounded-xl border border-cyan-100/18 bg-cyan-100/8 p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-100/82">
                          {copy.step3.wishSignal}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-50">
                          {activeWish}
                        </p>
                      </div>
                    ) : null}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {todayLabels.strong.slice(0, 2).map((activity) => (
                        <span
                          key={activity}
                          className="rounded-full border border-emerald-200/22 bg-emerald-200/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-100"
                        >
                          {copy.step4.strongPrefix}: {activity}
                        </span>
                      ))}
                      {todayLabels.caution.slice(0, 2).map((activity) => (
                        <span
                          key={activity}
                          className="rounded-full border border-amber-200/24 bg-amber-200/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-amber-100"
                        >
                          {copy.step4.avoidPrefix}: {activity}
                        </span>
                      ))}
                    </div>

                    {personalSigns ? (
                      <div className="mt-5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100/74">
                            {copy.step4.personalSignal}
                          </p>
                          <span className="rounded-full border border-cyan-100/20 bg-cyan-100/8 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-100">
                            {personalSigns.zodiac.name} · {personalSigns.chinese.name}
                          </span>
                        </div>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <article className="rounded-xl bg-slate-900/36 p-4 ring-1 ring-cyan-100/14">
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100/72">
                              {copy.step4.zodiac}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-slate-50">
                              {personalSigns.projection.zodiac}
                            </p>
                          </article>
                          <article className="rounded-xl bg-slate-900/36 p-4 ring-1 ring-cyan-100/14">
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100/72">
                              {copy.step4.chineseCalendar}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-slate-50">
                              {personalSigns.projection.chinese}
                            </p>
                          </article>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-5 rounded-xl bg-cyan-100/8 p-4 ring-1 ring-cyan-100/18">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100/80">
                          {copy.step4.pendingPersonalTitle}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-100/84">
                          {copy.step4.pendingPersonalBody}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            {currentStep === 5 ? (
              <div>
                <p className="cosmic-badge inline-flex rounded-full px-4 py-1 text-xs font-bold uppercase tracking-[0.24em] text-cyan-100">
                  {copy.step5.badge}
                </p>
                <h2 className="mt-4 text-3xl leading-tight text-slate-50 sm:text-4xl">
                  {copy.step5.title}
                </h2>
                <p className="mt-3 max-w-4xl text-base leading-7 text-slate-100/86">
                  {copy.step5.body}
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
                  {calendarPreview.map((day) => {
                    const dayDate = toUtcDateFromKey(day.dayKey)

                    return (
                      <article
                        key={day.dayKey}
                        className={clsx(
                          'relative overflow-hidden rounded-2xl border p-3',
                          day.locked
                            ? 'border-slate-700/80 bg-slate-900/55'
                            : day.blurred
                              ? 'border-cyan-100/16 bg-slate-950/32'
                              : 'border-cyan-100/20 bg-slate-950/40',
                        )}
                      >
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-100/74">
                          {previewDateFormatter.format(dayDate)}
                        </p>
                        {!day.locked ? (
                          <>
                            <span className={clsx(toneBadgeClass(day.summary), 'mt-2 scale-[0.82] origin-left')}>
                              <span aria-hidden="true" className="oracle-tone-badge-icon">
                                {toneGlyph(day.summary)}
                              </span>
                              {toneLabel(resolvedLanguage, day.summary)}
                            </span>
                            <p className="mt-3 text-sm leading-6 text-slate-100/84">
                              <span
                                className={clsx(
                                  day.blurred &&
                                    'block select-none blur-[4px] text-slate-100/56',
                                )}
                              >
                                {day.notes}
                              </span>
                            </p>
                          </>
                        ) : (
                          <div className="mt-3 rounded-xl border border-cyan-100/14 bg-cyan-100/8 p-3">
                            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100/82">
                              {copy.step5.nextWeekLocked}
                            </p>
                          </div>
                        )}
                      </article>
                    )
                  })}
                </div>

                <p className="mt-4 text-sm leading-6 text-cyan-100/84">
                  {copy.step5.unlockLine}
                </p>
              </div>
            ) : null}

            {currentStep === 6 ? (
              <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
                <div>
                  <p className="cosmic-badge inline-flex rounded-full px-4 py-1 text-xs font-bold uppercase tracking-[0.24em] text-cyan-100">
                    {copy.step6.badge}
                  </p>
                  <h2 className="mt-4 text-3xl leading-tight text-slate-50 sm:text-4xl">
                    {copy.step6.title}
                  </h2>
                  <p className="mt-4 text-base leading-7 text-slate-100/86">{copy.step6.body}</p>
                  <p className="mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-amber-100/82">
                    {copy.step6.featureIntro}
                  </p>
                  <div className="mt-3 grid gap-3">
                    {copy.step6.benefits.map((benefit, index) => (
                      <article
                        key={benefit}
                        className="group relative overflow-hidden rounded-2xl border border-cyan-100/18 bg-slate-950/36 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-100/32"
                      >
                        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-cyan-300/12 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
                        <div className="relative flex gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-200/28 bg-amber-200/12 text-xs font-black text-amber-100">
                            0{index + 1}
                          </span>
                          <p className="text-sm leading-6 text-slate-100/88">{benefit}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-[1.8rem] border border-cyan-100/24 bg-slate-950/46 p-5 backdrop-blur-md sm:p-6">
                  <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-cyan-300/16 blur-3xl" />
                  <div className="pointer-events-none absolute -bottom-16 left-8 h-44 w-44 rounded-full bg-amber-200/14 blur-3xl" />
                  <div className="relative">
                    <div className="wish-oracle mx-auto max-w-[13rem]">
                      <span className="wish-oracle-ring" />
                      <span className="wish-oracle-core" />
                      <span className="wish-oracle-dot wish-oracle-dot-a" />
                      <span className="wish-oracle-dot wish-oracle-dot-b" />
                      <span className="wish-oracle-dot wish-oracle-dot-c" />
                    </div>
                    <div className="mt-5 rounded-2xl border border-amber-200/20 bg-amber-200/10 p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-100/86">
                        {copy.step6.wishTitle}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-50">
                        {activeWish || copy.step6.emptyWish}
                      </p>
                      <p className="mt-3 text-xs leading-5 text-slate-100/72">
                        {copy.step6.wishBody}
                      </p>
                    </div>
                  </div>

                  <div className="relative mt-5 rounded-2xl border border-cyan-100/16 bg-slate-950/44 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-100/86">
                      {copy.step6.trialBadge}
                    </p>
                    <h3 className="mt-3 text-2xl leading-tight text-slate-50">{copy.step6.cta}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      void activateInternalTrial()
                    }}
                    disabled={activating}
                    className="cosmic-button-primary mt-5 inline-flex w-full justify-center rounded-full px-6 py-3 text-sm font-black uppercase tracking-[0.16em] disabled:opacity-70"
                  >
                    {activating ? messages.common.loading : copy.step6.cta}
                  </button>

                  <div className="relative mt-4 rounded-2xl border border-emerald-200/18 bg-emerald-300/10 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-100/86">
                      {copy.step6.unsubscribeTitle}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-100/86">
                      {copy.step6.unsubscribeBody}
                    </p>
                  </div>

                  <div className="relative mt-4">
                    <Link
                      href="/checkout/start"
                      className="cosmic-button-secondary inline-flex w-full justify-center rounded-full px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-cyan-50"
                    >
                      {resolvedLanguage === 'es'
                        ? 'Ya tengo trial, ir a checkout'
                        : resolvedLanguage === 'pt'
                          ? 'Ja tenho trial, ir ao checkout'
                          : 'I already started trial, go to checkout'}
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {flowError ? (
            <p className="cosmic-error-box mt-6 rounded-xl px-4 py-3 text-sm">{flowError}</p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-cyan-100/14 pt-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100/72">
              {copy.nav.stepLabel} {currentStep}/{TOTAL_STEPS}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={goToPreviousStep}
                disabled={currentStep === 1}
                className="cosmic-button-secondary rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-cyan-50 disabled:opacity-45"
              >
                {copy.nav.back}
              </button>

              {currentStep < TOTAL_STEPS ? (
                <button
                  type="button"
                  onClick={goToNextStep}
                  disabled={false}
                  className="cosmic-button-primary rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.14em] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {!isProjectionUnlocked && currentStep === 3
                    ? copy.step3.continueLockedLabel
                    : `${copy.nav.continueTo} ${copy.stepTitles[currentStep]}`}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    void activateInternalTrial()
                  }}
                  disabled={activating}
                  className="cosmic-button-primary rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.14em] disabled:opacity-70"
                >
                  {activating ? messages.common.loading : copy.step6.cta}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
