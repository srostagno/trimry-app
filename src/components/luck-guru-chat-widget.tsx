'use client'

import clsx from 'clsx'
import Link from 'next/link'
import Image from 'next/image'
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useLanguage } from '@/components/language-provider'
import { apiFetch } from '@/lib/api-client'
import {
  trackEvent,
  trackMetaCustomEvent,
  trackMetaStandardEvent,
} from '@/lib/analytics'
import { normalizeLanguageCode, type LanguageCode } from '@/lib/i18n'

const LUCK_GURU_WHATSAPP_NUMBER = '34689269278'
const OPEN_LUCK_GURU_CHAT_EVENT = 'trimry:open-luck-guru-chat'
const STORAGE_KEY = 'trimry-luck-guru-web-chat-v1'
const VISITOR_ID_KEY = 'trimry-luck-guru-visitor-id'
const MAX_LOCAL_MESSAGES = 28

type ChatRole = 'user' | 'assistant'

type ChatMessage = {
  id: string
  role: ChatRole
  text: string
  createdAt: string
}

type ServerChatMessage = {
  role: ChatRole
  text: string
  createdAt: string
}

type ChatState = {
  authenticated: boolean
  hasActiveSubscription: boolean
  subscriptionStatus: string | null
  memoryMode: 'account' | 'temporary'
}

type ChatResponse = ChatState & {
  reply: ServerChatMessage
  ctas: {
    createAccountUrl: string | null
    subscribeUrl: string | null
    whatsappUrl: string
  }
}

type ChatSnapshotResponse = ChatState & {
  firstName?: string | null
  memorySummary: string | null
  history: ServerChatMessage[]
}

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function getVisitorId() {
  if (typeof window === 'undefined') {
    return createId('visitor')
  }

  const existing = window.localStorage.getItem(VISITOR_ID_KEY)

  if (existing) {
    return existing
  }

  const next = createId('visitor')
  window.localStorage.setItem(VISITOR_ID_KEY, next)
  return next
}

function toServerHistory(messages: ChatMessage[]) {
  return messages
    .filter((message) => message.text.trim().length > 0)
    .slice(-18)
    .map((message) => ({
      role: message.role,
      text: message.text,
      createdAt: message.createdAt,
    }))
}

function fromServerMessage(message: ServerChatMessage): ChatMessage {
  return {
    id: createId(message.role),
    role: message.role,
    text: sanitizeChatText(message.text),
    createdAt: message.createdAt,
  }
}

function sanitizeChatText(text: string) {
  return text
    .replace(/https?:\/\/\S+/gi, 'Use the button below when you are ready.')
    .replace(/\btrimry\.com\/\S+/gi, 'Use the button below when you are ready.')
    .replace(/\s+Use the button below when you are ready\.\s+Use the button below when you are ready\./g, ' Use the button below when you are ready.')
    .trim()
}

function getLuckGuruChatCopy(language: LanguageCode) {
  if (language === 'es') {
    return {
      initial:
        '🍀 Luck Guru está aquí. Hoy trae una energía inusual. ¿Para qué quieres guía: cabello, dinero, relaciones o energía?',
      introActive:
        '🍀 Luck Guru está aquí. Tus poderes están desbloqueados. Dime qué quieres alinear esta semana: suerte, fortuna, riqueza, timing o un nuevo comienzo.',
      introAccount:
        '🍀 Luck Guru está aquí. Puedo recordarte, pero mis poderes completos siguen bloqueados hasta que te suscribas. Al desbloquearlos, puedo ayudarte con suerte, fortuna y timing de riqueza.',
      introAnonymous:
        '🍀 Luck Guru está aquí. Mis poderes completos están bloqueados hasta que crees una cuenta y te suscribas. Desbloquea Trimry para generar suerte, fortuna y timing de riqueza conmigo.',
      whatsappMessage:
        'Hola Luck Guru, quiero seguir esta conversación sobre mi suerte.',
      prompts: [
        'Quiero una guía para cabello.',
        'Necesito más suerte con dinero.',
        '¿Cómo viene mi energía hoy?',
      ],
      dashboardLabel: 'Ir al dashboard',
      dashboardDetail: 'Poderes desbloqueados',
      unlockLabel: 'Desbloquear poderes',
      unlockDetail: 'Activa la suscripción',
      createLabel: 'Crear cuenta',
      createDetail: 'Desbloquear poderes',
      issue:
        'Soy Luck Guru ✨ Tuve un problema temporal en el canal web. Puedes seguir conmigo por WhatsApp o intentar de nuevo en unos segundos.',
      launcherLabel: 'Chat con Luck Guru',
      launcherSubLabel: 'Ritual de suerte',
      title: 'Tu ritual empieza aquí',
      close: 'Cerrar',
      memorySaved: 'Memoria guardada',
      temporaryMemory: 'Memoria temporal',
      accountGuidance: 'Guía basada en tu cuenta',
      createAccountToSave: 'Crea una cuenta para guardarla',
      powersUnlocked: 'Poderes desbloqueados',
      powersLocked: 'Poderes bloqueados',
      powersUnlockedDetail: 'Timing de suerte, fortuna y riqueza',
      subscribeToUnlock:
        'Suscríbete para desbloquear suerte, fortuna y riqueza',
      createThenSubscribe:
        'Crea una cuenta y luego suscríbete para desbloquear poderes',
      typing: 'Luck Guru está leyendo las señales',
      placeholder: 'Escribe tu intención...',
      send: 'Enviar',
      fullUnlocked: 'Ritual completo de fortuna desbloqueado 🍀',
    }
  }

  if (language === 'pt') {
    return {
      initial:
        '🍀 Luck Guru está aqui. Hoje carrega uma energia incomum. Para que você quer orientação: cabelo, dinheiro, relacionamentos ou energia?',
      introActive:
        '🍀 Luck Guru está aqui. Seus poderes completos estão desbloqueados. Diga o que você quer alinhar esta semana: sorte, fortuna, riqueza, timing ou um novo começo.',
      introAccount:
        '🍀 Luck Guru está aqui. Posso lembrar de você, mas meus poderes completos ainda estão bloqueados até você assinar. Depois disso, posso ajudar com sorte, fortuna e timing de riqueza.',
      introAnonymous:
        '🍀 Luck Guru está aqui. Meus poderes completos estão bloqueados até você criar uma conta e assinar. Desbloqueie a Trimry para gerar sorte, fortuna e timing de riqueza comigo.',
      whatsappMessage:
        'Olá Luck Guru, quero continuar esta conversa sobre minha sorte.',
      prompts: [
        'Quero orientação para cabelo.',
        'Preciso de mais sorte com dinheiro.',
        'Como está minha energia hoje?',
      ],
      dashboardLabel: 'Abrir painel',
      dashboardDetail: 'Poderes desbloqueados',
      unlockLabel: 'Desbloquear poderes',
      unlockDetail: 'Ativar assinatura',
      createLabel: 'Criar conta',
      createDetail: 'Desbloquear poderes',
      issue:
        'Sou Luck Guru ✨ Tive um problema temporário no canal web. Você pode continuar comigo no WhatsApp ou tentar de novo em alguns segundos.',
      launcherLabel: 'Chat com Luck Guru',
      launcherSubLabel: 'Ritual de sorte',
      title: 'Seu ritual começa aqui',
      close: 'Fechar',
      memorySaved: 'Memória salva',
      temporaryMemory: 'Memória temporária',
      accountGuidance: 'Orientação baseada na conta',
      createAccountToSave: 'Crie uma conta para salvar',
      powersUnlocked: 'Poderes desbloqueados',
      powersLocked: 'Poderes bloqueados',
      powersUnlockedDetail: 'Timing de sorte, fortuna e riqueza',
      subscribeToUnlock:
        'Assine para desbloquear sorte, fortuna e riqueza',
      createThenSubscribe:
        'Crie uma conta e depois assine para desbloquear poderes',
      typing: 'Luck Guru está lendo os sinais',
      placeholder: 'Escreva sua intenção...',
      send: 'Enviar',
      fullUnlocked: 'Ritual completo de fortuna desbloqueado 🍀',
    }
  }

  return {
    initial:
      '🍀 The Luck Guru is here. Today carries unusual energy. What would you like guidance for? Hair, money, relationships, or energy.',
    introActive:
      '🍀 Luck Guru is here. Your full powers are unlocked. Tell me what you want to align this week: luck, fortune, riches, timing, or a fresh start.',
    introAccount:
      '🍀 Luck Guru is here. I can remember you, but my full powers are still locked until you subscribe. Once unlocked, I can help generate luck, fortune, and riches timing.',
    introAnonymous:
      '🍀 Luck Guru is here. My full powers are locked until you create an account and subscribe. Unlock Trimry to generate luck, fortune, and riches timing with me.',
    whatsappMessage:
      'Hi Luck Guru, I want to continue this conversation about my luck.',
    prompts: [
      'I want guidance for hair.',
      'I need more luck with money.',
      'How is my energy today?',
    ],
    dashboardLabel: 'Open dashboard',
    dashboardDetail: 'Full powers unlocked',
    unlockLabel: 'Unlock powers',
    unlockDetail: 'Start the subscription',
    createLabel: 'Create account',
    createDetail: 'Unlock powers',
    issue:
      'I am Luck Guru ✨ I had a temporary issue in the web channel. You can keep going with me on WhatsApp, or try again in a few seconds.',
    launcherLabel: 'Chat with Luck Guru',
    launcherSubLabel: 'Luck ritual',
    title: 'Your ritual starts here',
    close: 'Close',
    memorySaved: 'Memory saved',
    temporaryMemory: 'Temporary memory',
    accountGuidance: 'Account-based guidance',
    createAccountToSave: 'Create an account to save it',
    powersUnlocked: 'Powers unlocked',
    powersLocked: 'Powers locked',
    powersUnlockedDetail: 'Luck, fortune, and riches timing',
    subscribeToUnlock: 'Subscribe to unlock luck, fortune, and riches',
    createThenSubscribe:
      'Create an account, then subscribe to unlock powers',
    typing: 'Luck Guru is reading the signs',
    placeholder: 'Write your intention...',
    send: 'Send',
    fullUnlocked: 'Full fortune ritual unlocked 🍀',
  }
}

function buildConversationIntroMessage(input: {
  authenticated: boolean
  hasActiveSubscription: boolean
  language: LanguageCode
}) {
  const copy = getLuckGuruChatCopy(input.language)

  if (input.hasActiveSubscription) {
    return copy.introActive
  }

  if (input.authenticated) {
    return copy.introAccount
  }

  return copy.introAnonymous
}

function buildWhatsappUrl(message: string) {
  return `https://wa.me/${LUCK_GURU_WHATSAPP_NUMBER}?text=${encodeURIComponent(
    message,
  )}`
}

function initialAssistantMessage(language: LanguageCode) {
  const copy = getLuckGuruChatCopy(language)

  return {
    id: createId('assistant'),
    role: 'assistant' as const,
    text: copy.initial,
    createdAt: new Date().toISOString(),
  }
}

function loadStoredMessages(language: LanguageCode) {
  if (typeof window === 'undefined') {
    return [initialAssistantMessage(language)]
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return [initialAssistantMessage(language)]
    }

    const parsed = JSON.parse(raw) as ChatMessage[]
    const messages = parsed
      .filter(
        (message) =>
          (message.role === 'user' || message.role === 'assistant') &&
          typeof message.text === 'string' &&
          typeof message.createdAt === 'string',
      )
      .map((message) => ({
        ...message,
        text:
          message.role === 'assistant'
            ? sanitizeChatText(message.text)
            : message.text,
      }))
      .slice(-MAX_LOCAL_MESSAGES)

    return messages.length > 0 ? messages : [initialAssistantMessage(language)]
  } catch {
    return [initialAssistantMessage(language)]
  }
}

function GuruGlyph({ size = 'header' }: { size?: 'header' | 'launcher' }) {
  return (
    <div
      className={clsx(
        'relative flex shrink-0 overflow-hidden border border-amber-200/50 bg-slate-950 shadow-[0_18px_44px_rgba(0,0,0,0.38),0_0_40px_rgba(247,223,161,0.26)]',
        size === 'launcher'
          ? 'h-[4.5rem] w-[4.5rem] rounded-[1.7rem] sm:h-[5.25rem] sm:w-[5.25rem] sm:rounded-[2rem]'
          : 'h-[4.5rem] w-[4.5rem] rounded-[1.55rem] sm:h-20 sm:w-20 sm:rounded-[1.8rem]',
      )}
    >
      <Image
        src="/luck-guru-avatar.webp"
        alt=""
        width={176}
        height={176}
        aria-hidden="true"
        className="h-full w-full object-cover"
        sizes={
          size === 'launcher'
            ? '(min-width: 640px) 92px, 88px'
            : '(min-width: 640px) 80px, 72px'
        }
      />
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,transparent_52%,rgba(3,7,19,0.32)_100%)]" />
    </div>
  )
}

function WhatsAppIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      className="h-4 w-4 fill-current"
    >
      <path d="M16 3.2A12.6 12.6 0 0 0 5.1 22.1L3.6 28.8l6.8-1.7A12.6 12.6 0 1 0 16 3.2Zm0 2.4a10.2 10.2 0 0 1 8.6 15.8 10.2 10.2 0 0 1-13.5 3.2l-.4-.2-3.7.9.8-3.6-.3-.4A10.2 10.2 0 0 1 16 5.6Zm-4.1 5.2c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.2 3.5 5.5 4.7 2.7 1.1 3.3.9 3.9.8.6-.1 2-.8 2.3-1.6.3-.8.3-1.5.2-1.6-.1-.2-.3-.3-.7-.5l-2.3-1.1c-.3-.1-.6-.2-.8.2-.2.3-.9 1.1-1.1 1.3-.2.2-.4.2-.8.1-.4-.2-1.5-.6-2.8-1.7-1-1-1.7-2.1-1.9-2.5-.2-.4 0-.6.2-.8l.5-.6c.2-.2.2-.4.4-.6.1-.2.1-.5 0-.7l-1-2.5c-.2-.6-.5-.6-.8-.6h-.2Z" />
    </svg>
  )
}

export function LuckGuruChatWidget() {
  const { language } = useLanguage()
  const chatLanguage = normalizeLanguageCode(language)
  const copy = useMemo(() => getLuckGuruChatCopy(chatLanguage), [chatLanguage])
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [storageReady, setStorageReady] = useState(false)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [snapshotLoaded, setSnapshotLoaded] = useState(false)
  const [state, setState] = useState<ChatState>({
    authenticated: false,
    hasActiveSubscription: false,
    subscriptionStatus: null,
    memoryMode: 'temporary',
  })
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const whatsappUrl = buildWhatsappUrl(copy.whatsappMessage)
  const suggestedPrompts = copy.prompts
  const ctaCopy = state.hasActiveSubscription
    ? {
        href: '/dashboard',
        label: copy.dashboardLabel,
        detail: copy.dashboardDetail,
      }
    : state.authenticated
      ? {
          href: '/checkout/start',
          label: copy.unlockLabel,
          detail: copy.unlockDetail,
        }
      : {
          href: '/account/register',
          label: copy.createLabel,
          detail: copy.createDetail,
        }
  const latestAssistantMessageId = [...messages]
    .reverse()
    .find((message) => message.role === 'assistant')?.id

  useEffect(() => {
    setMessages(loadStoredMessages(chatLanguage))
    setStorageReady(true)
  }, [chatLanguage])

  useEffect(() => {
    if (typeof window === 'undefined' || !storageReady) {
      return
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(messages.slice(-MAX_LOCAL_MESSAGES)),
    )
  }, [messages, storageReady])

  useEffect(() => {
    if (!open) {
      return
    }

    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, open, sending])

  useEffect(() => {
    if (!open || snapshotLoaded) {
      return
    }

    let cancelled = false

    const loadSnapshot = async () => {
      try {
        const visitorId = getVisitorId()
        const response = await apiFetch(
          `/luck-guru/chat?visitorId=${encodeURIComponent(visitorId)}`,
          {
            cache: 'no-store',
          },
        )

        if (!response.ok) {
          return
        }

        const payload = (await response.json()) as ChatSnapshotResponse

        if (cancelled) {
          return
        }

        setState({
          authenticated: payload.authenticated,
          hasActiveSubscription: payload.hasActiveSubscription,
          subscriptionStatus: payload.subscriptionStatus,
          memoryMode: payload.memoryMode,
        })

        if (payload.history.length > 0) {
          setMessages((current) => {
            const hasUserMessages = current.some((message) => message.role === 'user')

            if (hasUserMessages) {
              return current
            }

            return payload.history.map(fromServerMessage)
          })
        }
      } catch {
        // The chat can still work with local temporary memory if the API snapshot is unavailable.
      } finally {
        if (!cancelled) {
          setSnapshotLoaded(true)
        }
      }
    }

    void loadSnapshot()

    return () => {
      cancelled = true
    }
  }, [open, snapshotLoaded])

  useEffect(() => {
    if (!snapshotLoaded) {
      return
    }

    setMessages((current) => {
      if (current.some((message) => message.role === 'user')) {
        return current
      }

      if (current.length !== 1 || current[0]?.role !== 'assistant') {
        return current
      }

      const introText = buildConversationIntroMessage({
        authenticated: state.authenticated,
        hasActiveSubscription: state.hasActiveSubscription,
        language: chatLanguage,
      })

      if (current[0].text === introText) {
        return current
      }

      return [
        {
          ...current[0],
          text: introText,
        },
      ]
    })
  }, [chatLanguage, snapshotLoaded, state.authenticated, state.hasActiveSubscription])

  const openWidget = useCallback(() => {
    setOpen(true)
    trackEvent('luck_guru_web_chat_open', {
      language,
      authenticated: state.authenticated,
      memory_mode: state.memoryMode,
    })
    trackMetaCustomEvent('LuckGuruWebChatOpen', {
      language,
      memory_mode: state.memoryMode,
    })
    window.setTimeout(() => inputRef.current?.focus(), 100)
  }, [language, state.authenticated, state.memoryMode])

  useEffect(() => {
    window.addEventListener(OPEN_LUCK_GURU_CHAT_EVENT, openWidget)

    return () => {
      window.removeEventListener(OPEN_LUCK_GURU_CHAT_EVENT, openWidget)
    }
  }, [openWidget])

  const sendMessage = async (text: string) => {
    const normalized = text.trim()

    if (!normalized || sending) {
      return
    }

    const previousMessages = messages
    const userMessage: ChatMessage = {
      id: createId('user'),
      role: 'user',
      text: normalized,
      createdAt: new Date().toISOString(),
    }

    setMessages((current) => [...current, userMessage].slice(-MAX_LOCAL_MESSAGES))
    setInput('')
    setSending(true)
    trackEvent('luck_guru_web_chat_message_sent', {
      language,
      authenticated: state.authenticated,
      has_active_subscription: state.hasActiveSubscription,
    })
    trackMetaStandardEvent('Lead', {
      content_name: 'Luck Guru web chat',
      status: state.authenticated ? 'account' : 'anonymous',
    })

    try {
      const response = await apiFetch('/luck-guru/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: normalized,
          visitorId: getVisitorId(),
          locale: language,
          localHistory: toServerHistory(previousMessages),
        }),
      })

      if (!response.ok) {
        throw new Error('Luck Guru request failed.')
      }

      const payload = (await response.json()) as ChatResponse
      const assistantMessage = fromServerMessage(payload.reply)

      setState({
        authenticated: payload.authenticated,
        hasActiveSubscription: payload.hasActiveSubscription,
        subscriptionStatus: payload.subscriptionStatus,
        memoryMode: payload.memoryMode,
      })
      setMessages((current) =>
        [...current, assistantMessage].slice(-MAX_LOCAL_MESSAGES),
      )
    } catch {
      setMessages((current) =>
        [
          ...current,
          {
            id: createId('assistant'),
            role: 'assistant' as const,
            text: copy.issue,
            createdAt: new Date().toISOString(),
          },
        ].slice(-MAX_LOCAL_MESSAGES),
      )
    } finally {
      setSending(false)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void sendMessage(input)
  }

  if (!open) {
    return (
      <button
        type="button"
        aria-label={copy.launcherLabel}
        onClick={() => {
          trackEvent('ask_luck_guru_click', {
            language,
            location: 'floating_chat_widget',
          })
          openWidget()
        }}
        className="group fixed bottom-5 right-5 z-[9999] flex items-center gap-3 rounded-[2.2rem] border border-[rgba(247,223,161,0.52)] bg-[linear-gradient(135deg,rgba(8,18,45,0.96),rgba(16,44,74,0.95)_42%,rgba(95,63,217,0.92))] p-2 text-white shadow-[0_24px_70px_rgba(0,0,0,0.48),0_0_42px_rgba(121,242,255,0.2)] transition hover:-translate-y-0.5 hover:border-amber-200/70 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-offset-2 focus:ring-offset-[#061022] sm:bottom-6 sm:right-6 sm:rounded-full sm:px-4 sm:py-3"
      >
        <GuruGlyph size="launcher" />
        <span className="hidden pr-1 text-left sm:block">
          <span className="block text-sm font-black leading-tight">
            {copy.launcherLabel}
          </span>
          <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100/78">
            {copy.launcherSubLabel}
          </span>
        </span>
      </button>
    )
  }

  return (
    <section className="fixed inset-x-3 bottom-3 top-3 z-[9999] sm:inset-x-auto sm:bottom-6 sm:right-6 sm:top-auto sm:w-[430px]">
      <div className="flex h-full max-h-[calc(100dvh-1.5rem)] flex-col overflow-hidden rounded-[2rem] border border-cyan-200/24 bg-[linear-gradient(150deg,rgba(3,8,22,0.96),rgba(9,25,52,0.96)_48%,rgba(31,25,83,0.96))] shadow-[0_30px_110px_rgba(0,0,0,0.62),0_0_70px_rgba(121,242,255,0.16)] backdrop-blur-2xl sm:max-h-[760px]">
        <div className="relative border-b border-cyan-100/12 p-4">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(247,223,161,0.17),transparent_28%),radial-gradient(circle_at_82%_0%,rgba(121,242,255,0.15),transparent_26%)]" />
          <div className="relative flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <GuruGlyph />
              <div>
                <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-100/86">
                  Luck Guru
                </p>
                <h2 className="mt-1 text-xl leading-none text-slate-50">
                  {copy.title}
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full border border-white/12 bg-white/6 px-3 py-1.5 text-xs font-black text-slate-100 transition hover:bg-white/12"
            >
              {copy.close}
            </button>
          </div>

          <div className="relative mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-2xl border border-cyan-100/14 bg-cyan-100/8 p-3">
              <p className="font-black text-cyan-100">
                {state.memoryMode === 'account'
                  ? copy.memorySaved
                  : copy.temporaryMemory}
              </p>
              <p className="mt-1 text-slate-100/68">
                {state.memoryMode === 'account'
                  ? copy.accountGuidance
                  : copy.createAccountToSave}
            </p>
            </div>
            <div className="rounded-2xl border border-amber-100/14 bg-amber-100/8 p-3">
              <p className="font-black text-amber-100">
                {state.hasActiveSubscription
                  ? copy.powersUnlocked
                  : copy.powersLocked}
              </p>
              <p className="mt-1 text-slate-100/68">
                {state.hasActiveSubscription
                  ? copy.powersUnlockedDetail
                  : state.authenticated
                    ? copy.subscribeToUnlock
                    : copy.createThenSubscribe}
              </p>
            </div>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={clsx(
                'flex',
                message.role === 'user' ? 'justify-end' : 'justify-start',
              )}
            >
              <div
                className={clsx('max-w-[86%]', message.role === 'user' ? '' : 'space-y-2')}
              >
                <div
                  className={clsx(
                    'whitespace-pre-wrap rounded-[1.35rem] px-4 py-3 text-sm leading-relaxed shadow-[0_12px_32px_rgba(0,0,0,0.2)]',
                    message.role === 'user'
                      ? 'rounded-br-md border border-cyan-100/26 bg-[linear-gradient(135deg,rgba(121,242,255,0.28),rgba(120,88,255,0.36))] text-slate-50'
                      : 'rounded-bl-md border border-white/12 bg-white/[0.08] text-slate-100',
                  )}
                >
                  {sanitizeChatText(message.text)}
                </div>

                {message.role === 'assistant' &&
                message.id === latestAssistantMessageId &&
                !state.hasActiveSubscription ? (
                  <Link
                    href={ctaCopy.href}
                    onClick={() => {
                      trackEvent('luck_guru_web_chat_message_cta_click', {
                        destination: ctaCopy.href,
                        authenticated: state.authenticated,
                      })
                      trackMetaCustomEvent('LuckGuruWebChatMessageCtaClick', {
                        destination: ctaCopy.href,
                        authenticated: state.authenticated ? 'true' : 'false',
                      })
                    }}
                    className="inline-flex w-full items-center justify-between gap-3 rounded-2xl border border-amber-100/28 bg-[linear-gradient(135deg,rgba(247,223,161,0.18),rgba(121,242,255,0.1))] px-4 py-3 text-left text-sm font-black text-amber-50 transition hover:-translate-y-0.5 hover:bg-amber-100/18"
                  >
                    <span>{ctaCopy.label}</span>
                    <span className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-amber-100/74">
                      {ctaCopy.detail}
                    </span>
                  </Link>
                ) : null}
              </div>
            </div>
          ))}

          {sending ? (
            <div className="flex justify-start">
              <div className="rounded-[1.35rem] rounded-bl-md border border-white/12 bg-white/[0.08] px-4 py-3 text-sm text-slate-100">
                <span className="mr-2 text-amber-100">{copy.typing}</span>
                <span className="inline-flex gap-1 align-middle">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-100 [animation-delay:-0.2s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-100 [animation-delay:-0.1s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-100" />
                </span>
              </div>
            </div>
          ) : null}
        </div>

        <div className="shrink-0 border-t border-cyan-100/12 p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => void sendMessage(prompt)}
                disabled={sending}
                className="rounded-full border border-cyan-100/16 bg-cyan-100/8 px-3 py-1.5 text-xs font-semibold text-cyan-50/86 transition hover:bg-cyan-100/13 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {prompt}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={
                copy.placeholder
              }
              className="min-w-0 flex-1 rounded-full border border-cyan-100/18 bg-slate-950/70 px-4 py-3 text-sm text-slate-50 outline-none transition placeholder:text-slate-300/42 focus:border-cyan-100/48 focus:ring-2 focus:ring-cyan-100/16"
              maxLength={900}
            />
            <button
              type="submit"
              disabled={sending || input.trim().length === 0}
              className="rounded-full bg-[linear-gradient(135deg,#d8fff6,#7be0ff_48%,#a28fff)] px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {copy.send}
            </button>
          </form>

          <div className="mt-3 grid gap-2">
            {state.hasActiveSubscription ? (
              <div className="rounded-2xl border border-emerald-100/18 bg-emerald-100/10 px-4 py-3 text-sm font-black text-emerald-50">
                {copy.fullUnlocked}
              </div>
            ) : null}

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => {
                trackEvent('whatsapp_open', {
                  language,
                  location: 'luck_guru_widget',
                })
                trackEvent('luck_guru_web_chat_whatsapp_click', {
                  language,
                  authenticated: state.authenticated,
                })
                trackMetaStandardEvent('Contact', {
                  content_name: 'Luck Guru WhatsApp from web chat',
                  channel: 'whatsapp',
                })
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200/22 bg-emerald-400/14 px-4 py-3 text-sm font-black text-emerald-50 transition hover:bg-emerald-400/20"
            >
              <WhatsAppIcon />
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
