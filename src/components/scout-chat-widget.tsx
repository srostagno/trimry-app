'use client'

import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useLanguage } from '@/components/language-provider'
import { trackEvent } from '@/lib/analytics'
import { apiFetch, readApiError } from '@/lib/api-client'
import { ASSISTANT_NAME } from '@/lib/company'
import { detectBrowserTimeZone } from '@/lib/schedule'

export const SCOUT_PREFERENCES_UPDATED_EVENT = 'trimry:scout-preferences-updated'
export const SCOUT_OPEN_EVENT = 'trimry:scout-open'

const VISITOR_ID_STORAGE_KEY = 'trimry:scout-visitor-id'
const HISTORY_STORAGE_KEY = 'trimry:scout-history'
const MAX_LOCAL_HISTORY = 24
const MAX_MESSAGE_LENGTH = 1_800

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
  createdAt: string
}

type ChatContext = {
  authenticated: boolean
  firstName: string | null
  hasActiveSubscription: boolean
  subscriptionStatus: string | null
  hasPreferences: boolean
  memoryMode: 'account' | 'temporary'
  assistantName: string
}

type ChatSnapshotResponse = ChatContext & {
  memorySummary: string | null
  history: Array<{ role: 'user' | 'assistant'; text: string; createdAt: string }>
}

type ChatReplyResponse = ChatContext & {
  reply: { role: 'assistant'; text: string; createdAt: string }
  preferencesUpdated: boolean
  ctas: {
    createAccountUrl: string | null
    subscribeUrl: string | null
    dashboardUrl: string | null
    whatsappUrl: string
  }
}

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function readVisitorId() {
  if (typeof window === 'undefined') {
    return ''
  }

  const existing = window.localStorage.getItem(VISITOR_ID_STORAGE_KEY)

  if (existing && existing.length >= 8) {
    return existing
  }

  const created = createId().replace(/-/g, '')
  window.localStorage.setItem(VISITOR_ID_STORAGE_KEY, created)
  return created
}

function readLocalHistory(): ChatMessage[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = window.sessionStorage.getItem(HISTORY_STORAGE_KEY)

    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw) as ChatMessage[]
    return Array.isArray(parsed) ? parsed.slice(-MAX_LOCAL_HISTORY) : []
  } catch {
    return []
  }
}

function writeLocalHistory(history: ChatMessage[]) {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.setItem(
    HISTORY_STORAGE_KEY,
    JSON.stringify(history.slice(-MAX_LOCAL_HISTORY)),
  )
}

function toLocalPath(url: string | null) {
  if (!url) {
    return null
  }

  try {
    const parsed = new URL(url)
    return `${parsed.pathname}${parsed.search}`
  } catch {
    return url.startsWith('/') ? url : null
  }
}

function renderText(text: string) {
  return text.split('\n').map((line, index) => (
    <span key={index} className="block min-h-[1.1em]">
      {line}
    </span>
  ))
}

export function ScoutChatWidget() {
  const pathname = usePathname()
  const { language, messages } = useLanguage()
  const [open, setOpen] = useState(false)
  const [visitorId, setVisitorId] = useState('')
  const [history, setHistory] = useState<ChatMessage[]>([])
  const [context, setContext] = useState<ChatContext | null>(null)
  const [ctas, setCtas] = useState<ChatReplyResponse['ctas'] | null>(null)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [preferencesFlash, setPreferencesFlash] = useState(false)
  const [snapshotLoaded, setSnapshotLoaded] = useState(false)
  const listRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    setVisitorId(readVisitorId())
    setHistory(readLocalHistory())
  }, [])

  useEffect(() => {
    const handleOpen = () => setOpen(true)
    window.addEventListener(SCOUT_OPEN_EVENT, handleOpen)
    return () => window.removeEventListener(SCOUT_OPEN_EVENT, handleOpen)
  }, [])

  const loadSnapshot = useCallback(async () => {
    if (!visitorId) {
      return
    }

    try {
      const response = await apiFetch(
        `/assistant/chat?visitorId=${encodeURIComponent(visitorId)}`,
        { cache: 'no-store' },
        { retryUnauthorized: false },
      )

      if (!response.ok) {
        return
      }

      const payload = (await response.json()) as ChatSnapshotResponse
      setContext(payload)

      if (payload.history.length > 0) {
        const serverHistory = payload.history.map((message) => ({
          id: createId(),
          role: message.role,
          text: message.text,
          createdAt: message.createdAt,
        }))
        setHistory(serverHistory)
        writeLocalHistory(serverHistory)
      }
    } catch {
      // Snapshot is best-effort; the widget still works with local history.
    } finally {
      setSnapshotLoaded(true)
    }
  }, [visitorId])

  useEffect(() => {
    if (open && !snapshotLoaded) {
      void loadSnapshot()
    }
  }, [loadSnapshot, open, snapshotLoaded])

  useEffect(() => {
    if (!open) {
      return
    }

    const frame = window.requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [history, open, sending])

  useEffect(() => {
    if (!preferencesFlash) {
      return
    }

    const timeout = window.setTimeout(() => setPreferencesFlash(false), 4_000)
    return () => window.clearTimeout(timeout)
  }, [preferencesFlash])

  const intro = useMemo(() => {
    if (context?.hasActiveSubscription) {
      return messages.scout.introActive
    }

    if (context?.authenticated) {
      return messages.scout.introAccount
    }

    return messages.scout.introAnonymous
  }, [context, messages.scout])

  const sendMessage = async (rawText: string) => {
    const text = rawText.trim().slice(0, MAX_MESSAGE_LENGTH)

    if (!text || sending) {
      return
    }

    const userMessage: ChatMessage = {
      id: createId(),
      role: 'user',
      text,
      createdAt: new Date().toISOString(),
    }
    const nextHistory = [...history, userMessage].slice(-MAX_LOCAL_HISTORY)

    setHistory(nextHistory)
    writeLocalHistory(nextHistory)
    setInput('')
    setError('')
    setSending(true)

    trackEvent('scout_message_sent', {
      authenticated: context?.authenticated ?? false,
      page_path: pathname,
    })

    try {
      const response = await apiFetch(
        '/assistant/chat',
        {
          method: 'POST',
          body: JSON.stringify({
            message: text,
            visitorId: visitorId || undefined,
            locale: language,
            timeZone: detectBrowserTimeZone(),
            localHistory: history.slice(-12).map((message) => ({
              role: message.role,
              text: message.text,
              createdAt: message.createdAt,
            })),
          }),
        },
        { retryUnauthorized: true },
      )

      if (!response.ok) {
        setError(await readApiError(response, messages.scout.issue))
        return
      }

      const payload = (await response.json()) as ChatReplyResponse
      const assistantMessage: ChatMessage = {
        id: createId(),
        role: 'assistant',
        text: payload.reply.text,
        createdAt: payload.reply.createdAt,
      }
      const withReply = [...nextHistory, assistantMessage].slice(-MAX_LOCAL_HISTORY)

      setHistory(withReply)
      writeLocalHistory(withReply)
      setContext(payload)
      setCtas(payload.ctas)

      if (payload.preferencesUpdated) {
        setPreferencesFlash(true)
        window.dispatchEvent(new CustomEvent(SCOUT_PREFERENCES_UPDATED_EVENT))
      }
    } catch {
      setError(messages.scout.issue)
    } finally {
      setSending(false)
      window.requestAnimationFrame(() => inputRef.current?.focus())
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void sendMessage(input)
  }

  const createAccountPath = toLocalPath(ctas?.createAccountUrl ?? null)
  const subscribePath = toLocalPath(ctas?.subscribeUrl ?? null)
  const dashboardPath = toLocalPath(ctas?.dashboardUrl ?? null)
  const whatsappUrl = ctas?.whatsappUrl ?? null
  const showPrompts = history.length === 0

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value)
          if (!open) {
            trackEvent('scout_widget_opened', { page_path: pathname })
          }
        }}
        aria-expanded={open}
        aria-label={messages.scout.launcherLabel}
        className={clsx(
          'fixed bottom-5 right-5 z-40 flex items-center gap-3 rounded-full border border-white/60 bg-white/95 py-2 pl-2 pr-4 text-left shadow-glow backdrop-blur transition hover:-translate-y-0.5',
          open && 'lg:opacity-0 lg:pointer-events-none',
        )}
      >
        <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-gradient">
          <Image
            src="/brand/trimry-icon-rounded-128.png"
            alt=""
            width={44}
            height={44}
            className="h-11 w-11 rounded-full"
          />
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-trimry-green" />
        </span>
        <span className="hidden sm:block">
          <span className="block text-sm font-extrabold text-trimry-ink">
            {messages.scout.launcherLabel}
          </span>
          <span className="block text-xs text-trimry-muted">{messages.scout.launcherSubLabel}</span>
        </span>
      </button>

      {open ? (
        <div className="fixed inset-x-0 bottom-0 z-50 sm:inset-auto sm:bottom-5 sm:right-5 sm:w-[26rem]">
          <div className="flex h-[85vh] flex-col overflow-hidden rounded-t-3xl border border-trimry-line bg-white shadow-[0_24px_64px_rgba(11,18,32,0.22)] sm:h-[34rem] sm:rounded-3xl">
            <div className="flex items-center gap-3 border-b border-trimry-line bg-brand-gradient px-4 py-3 text-white">
              <Image
                src="/brand/trimry-icon-rounded-128.png"
                alt=""
                width={36}
                height={36}
                className="h-9 w-9 rounded-full ring-2 ring-white/60"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold leading-tight">
                  {context?.assistantName ?? ASSISTANT_NAME}
                </p>
                <p className="truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80">
                  {context?.memoryMode === 'account'
                    ? messages.scout.memorySaved
                    : messages.scout.temporaryMemory}
                  {context
                    ? ` · ${
                        context.hasActiveSubscription
                          ? messages.scout.alertsActive
                          : messages.scout.alertsInactive
                      }`
                    : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={messages.common.close}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-lg leading-none hover:bg-white/25"
              >
                ×
              </button>
            </div>

            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-trimry-surface px-4 py-4">
              <div className="max-w-[88%] rounded-2xl rounded-tl-md bg-white px-4 py-3 text-sm leading-6 text-trimry-ink shadow-card">
                {renderText(intro)}
              </div>

              {history.map((message) => (
                <div
                  key={message.id}
                  className={clsx(
                    'max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-card',
                    message.role === 'user'
                      ? 'ml-auto rounded-tr-md bg-trimry-ink text-white'
                      : 'rounded-tl-md bg-white text-trimry-ink',
                  )}
                >
                  {renderText(message.text)}
                </div>
              ))}

              {sending ? (
                <div className="max-w-[88%] rounded-2xl rounded-tl-md bg-white px-4 py-3 text-sm text-trimry-muted shadow-card">
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-flex gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-trimry-blue" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-trimry-cyan [animation-delay:120ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-trimry-green [animation-delay:240ms]" />
                    </span>
                    {messages.scout.typing}
                  </span>
                </div>
              ) : null}

              {preferencesFlash ? (
                <p className="tr-alert-success text-xs">{messages.scout.preferencesUpdated}</p>
              ) : null}

              {error ? <p className="tr-alert-error text-xs">{error}</p> : null}

              {showPrompts ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {messages.scout.prompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void sendMessage(prompt)}
                      className="tr-chip text-xs"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              ) : null}

              {ctas ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {createAccountPath ? (
                    <Link href={createAccountPath} className="tr-btn-primary tr-btn-sm">
                      {messages.scout.createAccount}
                    </Link>
                  ) : null}
                  {subscribePath && !createAccountPath ? (
                    <Link href={subscribePath} className="tr-btn-primary tr-btn-sm">
                      {messages.scout.activateAlerts}
                    </Link>
                  ) : null}
                  {dashboardPath ? (
                    <Link href={dashboardPath} className="tr-btn-secondary tr-btn-sm">
                      {messages.scout.openDashboard}
                    </Link>
                  ) : null}
                  {whatsappUrl ? (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tr-btn-secondary tr-btn-sm"
                    >
                      {messages.scout.whatsappCta}
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>

            <form onSubmit={handleSubmit} className="border-t border-trimry-line bg-white p-3">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault()
                      void sendMessage(input)
                    }
                  }}
                  rows={1}
                  maxLength={MAX_MESSAGE_LENGTH}
                  placeholder={messages.scout.placeholder}
                  className="tr-input max-h-32 min-h-[2.75rem] resize-none py-2.5"
                />
                <button
                  type="submit"
                  disabled={sending || input.trim().length === 0}
                  className="tr-btn-primary h-11 shrink-0 px-4"
                >
                  {messages.scout.send}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}

export function openScoutChat() {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new CustomEvent(SCOUT_OPEN_EVENT))
}
