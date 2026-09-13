'use client'

import clsx from 'clsx'
import { useEffect, useMemo, useRef, useState } from 'react'

import { useLanguage } from '@/components/language-provider'
import {
  fetchAdminSendWorkspace,
  fetchAdminWeeklyDispatchJob,
  fetchAdminWeeklyDispatchJobs,
  revertInternalTrialFromAdmin,
  runAdminSendCampaignAction,
  sendAdminSportsDigestTemplateTest,
  startAdminWeeklyDispatch,
  saveAdminSendSettings,
  triggerAdminWelcomeFlowTest,
  updateAdminDailyDeliveryAutomation,
  upsertAdminSendTemplate,
  type DailyDeliveryAutomationSettings,
  type SendCampaign,
  type SendCampaignChannel,
  type SendTemplate,
  type SendTemplateVariable,
  type WeeklyDispatchJob,
  type WeeklyDispatchJobResultItem,
} from '@/lib/admin-send-campaigns'
import { interpolate } from '@/lib/i18n'

const localeByLanguage = {
  en: 'en-US',
  es: 'es-CL',
  pt: 'pt-BR',
} as const

const PLACEHOLDER_REGEX = /{{\s*([a-zA-Z0-9_]+)\s*}}/g
const TRIMRY_WEBSITE_URL = 'https://trimry.com'
const TRIMRY_LOGO_URL = `${TRIMRY_WEBSITE_URL}/brand/trimry-icon-192.png`
const FULL_HTML_DOCUMENT_REGEX = /<\s*(?:!doctype\s+html|html[\s>])/i

function dispatchItemHasFailure(item: WeeklyDispatchJobResultItem) {
  return (
    item.status === 'failed' ||
    item.errors.length > 0 ||
    Object.values(item.channelResults).some((status) => status === 'failed')
  )
}

function failedDispatchChannels(item: WeeklyDispatchJobResultItem) {
  return Object.entries(item.channelResults)
    .filter(([, status]) => status === 'failed')
    .map(([channel]) =>
      channel === 'whatsappTemplate'
        ? 'WhatsApp'
        : channel === 'whatsappDetails'
          ? 'WhatsApp details'
          : 'Email',
    )
}

type WhatsappVariableDraft = {
  id: string
  key: string
  content: string
}

type WhatsappButtonDraft = {
  id: string
  key: string
  content: string
}

type WeeklyEmailPreset = {
  templateName: string
  templateDescription: string
  subjectTemplate: string
  htmlTemplate: string
  textTemplate: string
  variableDefaults: Record<string, string>
}

function extractPlaceholders(value: string) {
  return Array.from(value.matchAll(PLACEHOLDER_REGEX))
    .map((match) => match[1]?.trim() ?? '')
    .filter(Boolean)
}

function uniqueVariables(values: SendTemplateVariable[]) {
  const seen = new Set<string>()

  return values.filter((value) => {
    if (seen.has(value.key)) {
      return false
    }

    seen.add(value.key)
    return true
  })
}

function createDraftId() {
  return Math.random().toString(36).slice(2)
}

function createWhatsappVariableDraft(
  value?: Partial<Omit<WhatsappVariableDraft, 'id'>>,
): WhatsappVariableDraft {
  return {
    id: createDraftId(),
    key: value?.key ?? '',
    content: value?.content ?? '',
  }
}

function createButtonDraft(
  value?: Partial<Omit<WhatsappButtonDraft, 'id'>>,
): WhatsappButtonDraft {
  return {
    id: createDraftId(),
    key: value?.key ?? '',
    content: value?.content ?? '',
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildTrimryEmailBaseHtml(input: {
  language: keyof typeof localeByLanguage
  subject: string
  htmlBody: string
  preheader: string
}) {
  const visitLabel = input.language === 'en' ? 'Visit' : 'Visita'
  const footerHint =
    input.language === 'en'
      ? 'to view your full outlook.'
      : 'para ver tu detalle completo.'

  return `<!doctype html>
<html lang="${input.language}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="x-ua-compatible" content="ie=edge" />
    <title>${escapeHtml(input.subject)}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f2f4f7;">
    <div style="display:none;max-height:0;max-width:0;opacity:0;overflow:hidden;font-size:1px;line-height:1px;color:#f2f4f7;">
      ${escapeHtml(input.preheader)}
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background-color:#f2f4f7;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:18px;overflow:hidden;">
            <tr>
              <td align="center" style="padding:24px 32px 16px 32px;border-bottom:1px solid #eef2f7;">
                <a href="${TRIMRY_WEBSITE_URL}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;">
                  <img src="${TRIMRY_LOGO_URL}" alt="Trimry" width="156" style="display:block;width:156px;max-width:100%;height:auto;border:0;" />
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px 24px 32px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.62;color:#111827;">
                ${input.htmlBody}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px 28px 32px;border-top:1px solid #eef2f7;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#6b7280;">
                <p style="margin:0 0 8px 0;">Trimry weekly ritual forecast.</p>
                <p style="margin:0;">
                  ${visitLabel}
                  <a href="${TRIMRY_WEBSITE_URL}" target="_blank" rel="noopener noreferrer" style="color:#0f766e;text-decoration:underline;">trimry.com</a>
                  ${footerHint}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

function ensureFullHtmlDocument(input: {
  language: keyof typeof localeByLanguage
  subject: string
  htmlBody: string
  preheader: string
}) {
  const htmlBody = input.htmlBody.trim()

  if (!htmlBody) {
    return ''
  }

  if (FULL_HTML_DOCUMENT_REGEX.test(htmlBody)) {
    return htmlBody
  }

  return buildTrimryEmailBaseHtml({
    language: input.language,
    subject: input.subject.trim(),
    htmlBody,
    preheader: input.preheader.trim(),
  })
}

function createWeeklyEmailPreset(
  language: keyof typeof localeByLanguage,
): WeeklyEmailPreset {
  const copy =
    language === 'es'
      ? {
          subject: 'Tu agenda deportiva Trimry: {{period_label}}',
          greeting: 'Hola {{first_name}},',
          intro:
            'Esta es tu agenda con los próximos partidos, carreras y peleas de los equipos y ligas que sigues.',
          heading: 'Agenda {{period_label}}',
          highlights: 'Destacados',
          agenda: 'Agenda completa',
          tip: 'Tip',
          cta: 'Abrir mi agenda',
          footer: 'Horarios en tu zona horaria. Cambia equipos, ritmo o canal desde tu panel.',
        }
      : language === 'pt'
        ? {
            subject: 'Sua agenda esportiva Trimry: {{period_label}}',
            greeting: 'Olá {{first_name}},',
            intro:
              'Esta é sua agenda com os próximos jogos, corridas e lutas dos times e ligas que você acompanha.',
            heading: 'Agenda {{period_label}}',
            highlights: 'Destaques',
            agenda: 'Agenda completa',
            tip: 'Dica',
            cta: 'Abrir minha agenda',
            footer: 'Horários no seu fuso. Mude times, ritmo ou canal pelo painel.',
          }
        : {
            subject: 'Your Trimry sports agenda: {{period_label}}',
            greeting: 'Hi {{first_name}},',
            intro:
              'Here is your agenda with the upcoming matches, races and fights from the teams and leagues you follow.',
            heading: 'Agenda {{period_label}}',
            highlights: 'Highlights',
            agenda: 'Full agenda',
            tip: 'Tip',
            cta: 'Open my agenda',
            footer: 'Times in your time zone. Change teams, rhythm or channel from your dashboard.',
          }

  const htmlBody = `
<p style="margin:0 0 16px 0;">${copy.greeting}</p>
<p style="margin:0 0 16px 0;">${copy.intro}</p>
<h2 style="margin:22px 0 10px 0;font-size:20px;line-height:1.3;color:#0b1220;">${copy.heading}</h2>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 20px 0;border-collapse:collapse;">
  <tr>
    <td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:700;background:#f5f8fc;">${copy.highlights}</td>
    <td style="padding:10px 12px;border:1px solid #e2e8f0;">{{highlights}}</td>
  </tr>
  <tr>
    <td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:700;background:#f5f8fc;">${copy.agenda}</td>
    <td style="padding:10px 12px;border:1px solid #e2e8f0;">{{agenda}}</td>
  </tr>
</table>
<p style="margin:0 0 18px 0;"><strong>${copy.tip}:</strong> {{tip}}</p>
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:18px 0 0 0;">
  <tr>
    <td style="border-radius:999px;background:linear-gradient(135deg,#2b2fb8,#2f7bff 38%,#35d2e5 72%,#2fc56c);">
      <a href="${TRIMRY_WEBSITE_URL}/dashboard" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:12px 22px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">${copy.cta}</a>
    </td>
  </tr>
</table>
<p style="margin:18px 0 0 0;font-size:12px;color:#64748b;">${copy.footer}</p>`
  const textTemplate = `${copy.greeting}

${copy.intro}

${copy.heading}
${copy.highlights}: {{highlights}}
${copy.agenda}: {{agenda}}

${copy.tip}: {{tip}}

${copy.cta}: ${TRIMRY_WEBSITE_URL}/dashboard
${copy.footer}`

  return {
    templateName:
      language === 'es'
        ? 'Agenda deportiva Trimry'
        : language === 'pt'
          ? 'Agenda esportiva Trimry'
          : 'Trimry sports agenda',
    templateDescription:
      language === 'es'
        ? 'Email con destacados, agenda completa y tip. Variables: first_name, period_label, highlights, agenda, tip.'
        : language === 'pt'
          ? 'Email com destaques, agenda completa e dica. Variáveis: first_name, period_label, highlights, agenda, tip.'
          : 'Email with highlights, full agenda and a tip. Variables: first_name, period_label, highlights, agenda, tip.',
    subjectTemplate: copy.subject,
    htmlTemplate: ensureFullHtmlDocument({
      language,
      subject: copy.subject,
      htmlBody,
      preheader: copy.intro,
    }),
    textTemplate,
    variableDefaults: {
      first_name: language === 'es' ? 'Silvio' : language === 'pt' ? 'Silvio' : 'Alex',
      period_label:
        language === 'es'
          ? 'de esta semana'
          : language === 'pt'
            ? 'desta semana'
            : 'this week',
      highlights:
        language === 'es'
          ? 'Sáb 21:00 Real Madrid vs Barcelona (La Liga) · Dom 15:30 Lakers vs Celtics (NBA)'
          : language === 'pt'
            ? 'Sáb 21:00 Real Madrid x Barcelona (La Liga) · Dom 15:30 Lakers x Celtics (NBA)'
            : 'Sat 21:00 Real Madrid vs Barcelona (La Liga) · Sun 15:30 Lakers vs Celtics (NBA)',
      agenda:
        language === 'es'
          ? 'Lun: Arsenal vs Chelsea 21:00 · Mié: Champions League, 4 partidos · Dom: GP de Monza 15:00'
          : language === 'pt'
            ? 'Seg: Arsenal x Chelsea 21:00 · Qua: Champions League, 4 jogos · Dom: GP de Monza 15:00'
            : 'Mon: Arsenal vs Chelsea 21:00 · Wed: Champions League, 4 matches · Sun: Monza GP 15:00',
      tip:
        language === 'es'
          ? 'Responde "agenda" a Scout en WhatsApp para ver lo de hoy.'
          : language === 'pt'
            ? 'Responda "agenda" ao Scout no WhatsApp para ver o de hoje.'
            : 'Reply "agenda" to Scout on WhatsApp to see today\'s events.',
    },
  }
}

function toPersistedWhatsappVariables(values: WhatsappVariableDraft[]) {
  return values
    .filter((value) => value.key.trim() || value.content.trim())
    .map((value) => ({
      key: value.key.trim(),
      content: value.content.trim(),
    }))
}

function toPersistedWhatsappButtons(values: WhatsappButtonDraft[]) {
  return values
    .filter((value) => value.key.trim() || value.content.trim())
    .map((value) => ({
      type: 'url' as const,
      key: value.key.trim(),
      content: value.content.trim(),
    }))
}

function describeDraftVariables(input: {
  channel: SendCampaignChannel
  whatsappHeaderVariables: WhatsappVariableDraft[]
  whatsappBodyVariables: WhatsappVariableDraft[]
  whatsappButtons: WhatsappButtonDraft[]
  emailSubjectTemplate: string
  emailHtmlTemplate: string
  emailTextTemplate: string
}) {
  if (input.channel === 'whatsapp') {
    return uniqueVariables([
      ...toPersistedWhatsappVariables(input.whatsappHeaderVariables).map(
        (value) => ({
          key: value.key,
          source: 'header' as const,
          content: value.content,
        }),
      ),
      ...toPersistedWhatsappVariables(input.whatsappBodyVariables).map(
        (value) => ({
          key: value.key,
          source: 'body' as const,
          content: value.content,
        }),
      ),
      ...toPersistedWhatsappButtons(input.whatsappButtons).map(
        (button, index) => ({
          key: button.key,
          source: 'button' as const,
          buttonIndex: index,
          content: button.content,
        }),
      ),
    ])
  }

  return uniqueVariables([
    ...extractPlaceholders(input.emailSubjectTemplate).map((key) => ({
      key,
      source: 'subject' as const,
    })),
    ...extractPlaceholders(input.emailHtmlTemplate).map((key) => ({
      key,
      source: 'html' as const,
    })),
    ...extractPlaceholders(input.emailTextTemplate).map((key) => ({
      key,
      source: 'text' as const,
    })),
  ])
}

export function AdminSendCampaigns() {
  const { language, messages } = useLanguage()
  const locale = localeByLanguage[language] ?? 'en-US'
  const defaultWhatsappLanguage = 'en'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busyAction, setBusyAction] = useState<string | null>(null)
  const [campaigns, setCampaigns] = useState<SendCampaign[]>([])
  const [templates, setTemplates] = useState<SendTemplate[]>([])
  const [audience, setAudience] = useState({ email: 0, whatsapp: 0 })
  const [settings, setSettings] = useState<{
    whatsapp: {
      phoneNumberId: string
      graphApiVersion: string
      hasAccessToken: boolean
      updatedAt: string | null
      source: 'database' | 'environment' | 'missing'
    }
    mailersend: {
      fromEmail: string
      fromName: string
      replyToEmail: string
      replyToName: string
      hasApiKey: boolean
      updatedAt: string | null
      source: 'database' | 'environment' | 'missing'
    }
  } | null>(null)
  const [deliveryAutomation, setDeliveryAutomation] =
    useState<DailyDeliveryAutomationSettings | null>(null)

  const [whatsappPhoneNumberId, setWhatsappPhoneNumberId] = useState('')
  const [whatsappGraphApiVersion, setWhatsappGraphApiVersion] =
    useState('v25.0')
  const [whatsappAccessToken, setWhatsappAccessToken] = useState('')
  const [mailersendFromEmail, setMailersendFromEmail] = useState('')
  const [mailersendFromName, setMailersendFromName] = useState('')
  const [mailersendReplyToEmail, setMailersendReplyToEmail] = useState('')
  const [mailersendReplyToName, setMailersendReplyToName] = useState('')
  const [mailersendApiKey, setMailersendApiKey] = useState('')

  const [channel, setChannel] = useState<SendCampaignChannel>('whatsapp')
  const [templateId, setTemplateId] = useState<string | null>(null)
  const [campaignId, setCampaignId] = useState<string | null>(null)
  const [templateName, setTemplateName] = useState('')
  const [templateDescription, setTemplateDescription] = useState('')
  const [campaignName, setCampaignName] = useState('')
  const [testRecipient, setTestRecipient] = useState('')
  const [digestTestRecipient, setDigestTestRecipient] = useState('')
  const [digestTemplateName, setDigestTemplateName] = useState('')
  const [digestTemplateLanguage, setDigestTemplateLanguage] = useState('')
  const [revertInternalTrialEmail, setRevertInternalTrialEmail] = useState('')
  const [weeklyDispatchJob, setWeeklyDispatchJob] =
    useState<WeeklyDispatchJob | null>(null)
  const [weeklyDispatchJobs, setWeeklyDispatchJobs] = useState<
    WeeklyDispatchJob[]
  >([])
  const [weeklyDispatchPollingError, setWeeklyDispatchPollingError] =
    useState('')
  const [weeklyDispatchJobsError, setWeeklyDispatchJobsError] = useState('')

  const [whatsappExternalTemplateName, setWhatsappExternalTemplateName] =
    useState('')
  const [whatsappLanguageCode, setWhatsappLanguageCode] = useState(
    defaultWhatsappLanguage,
  )
  const [whatsappHeaderVariables, setWhatsappHeaderVariables] = useState<
    WhatsappVariableDraft[]
  >([])
  const [whatsappBodyVariables, setWhatsappBodyVariables] = useState<
    WhatsappVariableDraft[]
  >([createWhatsappVariableDraft()])
  const [whatsappButtons, setWhatsappButtons] = useState<WhatsappButtonDraft[]>(
    [],
  )

  const [emailSubjectTemplate, setEmailSubjectTemplate] = useState('')
  const [emailHtmlTemplate, setEmailHtmlTemplate] = useState('')
  const [emailTextTemplate, setEmailTextTemplate] = useState('')
  const [variableValues, setVariableValues] = useState<Record<string, string>>(
    {},
  )
  const previousDraftDefaultsRef = useRef<Record<string, string>>({})

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    [locale],
  )

  const draftVariables = useMemo(
    () =>
      describeDraftVariables({
        channel,
        whatsappHeaderVariables,
        whatsappBodyVariables,
        whatsappButtons,
        emailSubjectTemplate,
        emailHtmlTemplate,
        emailTextTemplate,
      }),
    [
      channel,
      emailHtmlTemplate,
      emailSubjectTemplate,
      emailTextTemplate,
      whatsappBodyVariables,
      whatsappButtons,
      whatsappHeaderVariables,
    ],
  )

  useEffect(() => {
    setVariableValues((current) => {
      const previousDefaults = previousDraftDefaultsRef.current
      const next = draftVariables.reduce<Record<string, string>>(
        (accumulator, variable) => {
          const draftDefault = variable.content ?? ''
          const currentValue = current[variable.key]

          accumulator[variable.key] =
            currentValue === undefined
              ? draftDefault
              : currentValue === (previousDefaults[variable.key] ?? '')
                ? draftDefault
                : currentValue
          return accumulator
        },
        {},
      )

      previousDraftDefaultsRef.current = draftVariables.reduce<
        Record<string, string>
      >((accumulator, variable) => {
        accumulator[variable.key] = variable.content ?? ''
        return accumulator
      }, {})

      return next
    })
  }, [draftVariables])

  const loadWorkspace = async () => {
    setLoading(true)
    setError('')
    setWeeklyDispatchJobsError('')

    try {
      const [response, dispatchJobsResponse] = await Promise.all([
        fetchAdminSendWorkspace(messages.dashboard.sendCampaigns.loadError),
        fetchAdminWeeklyDispatchJobs(
          messages.dashboard.sendCampaigns.loadError,
        ).catch((nextError) => {
          setWeeklyDispatchJobsError(
            nextError instanceof Error
              ? nextError.message
              : messages.dashboard.sendCampaigns.loadError,
          )
          return null
        }),
      ])
      setCampaigns(response.campaigns)
      setTemplates(response.templates)
      setAudience(response.audience)
      setSettings(response.settings)
      setDeliveryAutomation(response.deliveryAutomation)
      setWeeklyDispatchJobs(dispatchJobsResponse?.jobs ?? [])
      setWhatsappPhoneNumberId(response.settings.whatsapp.phoneNumberId)
      setWhatsappGraphApiVersion(
        response.settings.whatsapp.graphApiVersion || 'v25.0',
      )
      setMailersendFromEmail(response.settings.mailersend.fromEmail)
      setMailersendFromName(response.settings.mailersend.fromName)
      setMailersendReplyToEmail(response.settings.mailersend.replyToEmail)
      setMailersendReplyToName(response.settings.mailersend.replyToName)
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : messages.dashboard.sendCampaigns.loadError,
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadWorkspace()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const weeklyDispatchJobId = weeklyDispatchJob?.id ?? null
  const weeklyDispatchJobStatus = weeklyDispatchJob?.status ?? null

  useEffect(() => {
    if (!weeklyDispatchJobId) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [weeklyDispatchJobId])

  useEffect(() => {
    if (
      !weeklyDispatchJobId ||
      (weeklyDispatchJobStatus !== 'queued' &&
        weeklyDispatchJobStatus !== 'running')
    ) {
      return
    }

    let cancelled = false
    let timeoutId: number | null = null

    const pollJob = async () => {
      if (cancelled) {
        return
      }

      try {
        const response = await fetchAdminWeeklyDispatchJob(
          weeklyDispatchJobId,
          messages.dashboard.sendCampaigns.loadError,
        )

        if (cancelled) {
          return
        }

        setWeeklyDispatchJob(response.job)
        setWeeklyDispatchPollingError('')

        if (
          response.job.status === 'queued' ||
          response.job.status === 'running'
        ) {
          timeoutId = window.setTimeout(() => {
            void pollJob()
          }, 1500)
        } else if (response.job.status === 'completed') {
          void fetchAdminWeeklyDispatchJobs(
            messages.dashboard.sendCampaigns.loadError,
          )
            .then((jobsResponse) => {
              setWeeklyDispatchJobs(jobsResponse.jobs)
              setWeeklyDispatchJobsError('')
            })
            .catch((nextError) => {
              setWeeklyDispatchJobsError(
                nextError instanceof Error
                  ? nextError.message
                  : messages.dashboard.sendCampaigns.loadError,
              )
            })
          setSuccess(
            language === 'es'
              ? `Envío diario completado: ${response.job.processedCount} procesados y ${response.job.failedCount} fallidos.`
              : `Daily dispatch completed: ${response.job.processedCount} processed and ${response.job.failedCount} failed.`,
          )
        } else if (response.job.status === 'failed') {
          void fetchAdminWeeklyDispatchJobs(
            messages.dashboard.sendCampaigns.loadError,
          )
            .then((jobsResponse) => {
              setWeeklyDispatchJobs(jobsResponse.jobs)
              setWeeklyDispatchJobsError('')
            })
            .catch((nextError) => {
              setWeeklyDispatchJobsError(
                nextError instanceof Error
                  ? nextError.message
                  : messages.dashboard.sendCampaigns.loadError,
              )
            })
          setError(
            response.job.error ??
              (language === 'es'
                ? 'El envío diario falló.'
                : 'Daily dispatch failed.'),
          )
        }
      } catch (nextError) {
        if (cancelled) {
          return
        }

        setWeeklyDispatchPollingError(
          nextError instanceof Error
            ? nextError.message
            : messages.dashboard.sendCampaigns.loadError,
        )
        timeoutId = window.setTimeout(() => {
          void pollJob()
        }, 3000)
      }
    }

    void pollJob()

    return () => {
      cancelled = true
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [
    language,
    messages.dashboard.sendCampaigns.loadError,
    weeklyDispatchJobId,
    weeklyDispatchJobStatus,
  ])

  const resetEditor = () => {
    setTemplateId(null)
    setCampaignId(null)
    setTemplateName('')
    setTemplateDescription('')
    setCampaignName('')
    setTestRecipient('')
    setWhatsappExternalTemplateName('')
    setWhatsappLanguageCode(defaultWhatsappLanguage)
    setWhatsappHeaderVariables([])
    setWhatsappBodyVariables([createWhatsappVariableDraft()])
    setWhatsappButtons([])
    setEmailSubjectTemplate('')
    setEmailHtmlTemplate('')
    setEmailTextTemplate('')
    setVariableValues({})
    setError('')
    setSuccess('')
  }

  const loadTemplateIntoEditor = (template: SendTemplate) => {
    setTemplateId(template.id)
    setCampaignId(null)
    setChannel(template.channel)
    setTemplateName(template.name)
    setTemplateDescription(template.description)
    setCampaignName(template.name)
    setTestRecipient('')

    if (template.channel === 'whatsapp') {
      setWhatsappExternalTemplateName(
        template.whatsapp?.externalTemplateName ?? '',
      )
      setWhatsappLanguageCode(
        template.whatsapp?.languageCode ?? defaultWhatsappLanguage,
      )
      setWhatsappHeaderVariables(
        template.whatsapp?.header?.length
          ? template.whatsapp.header.map((variable) =>
              createWhatsappVariableDraft(variable),
            )
          : [],
      )
      setWhatsappBodyVariables(
        template.whatsapp?.body?.length
          ? template.whatsapp.body.map((variable) =>
              createWhatsappVariableDraft(variable),
            )
          : [createWhatsappVariableDraft()],
      )
      setWhatsappButtons(
        template.whatsapp?.buttons.length
          ? template.whatsapp.buttons.map((button) => createButtonDraft(button))
          : [],
      )
      setEmailSubjectTemplate('')
      setEmailHtmlTemplate('')
      setEmailTextTemplate('')
    } else {
      setWhatsappExternalTemplateName('')
      setWhatsappLanguageCode(defaultWhatsappLanguage)
      setWhatsappHeaderVariables([])
      setWhatsappBodyVariables([createWhatsappVariableDraft()])
      setWhatsappButtons([])
      setEmailSubjectTemplate(template.email?.subjectTemplate ?? '')
      setEmailHtmlTemplate(template.email?.htmlTemplate ?? '')
      setEmailTextTemplate(template.email?.textTemplate ?? '')
    }

    setVariableValues(
      template.variables.reduce<Record<string, string>>(
        (accumulator, variable) => {
          accumulator[variable.key] = variable.content ?? ''
          return accumulator
        },
        {},
      ),
    )
  }

  const syncTemplateIntoList = (template: SendTemplate) => {
    setTemplates((current) => {
      const next = [
        template,
        ...current.filter((item) => item.id !== template.id),
      ]
      return next.sort(
        (left, right) =>
          new Date(right.updatedAt).getTime() -
          new Date(left.updatedAt).getTime(),
      )
    })
  }

  const syncCampaignIntoList = (campaign: SendCampaign) => {
    setCampaigns((current) => {
      const next = [
        campaign,
        ...current.filter((item) => item.id !== campaign.id),
      ]
      return next.sort(
        (left, right) =>
          new Date(right.updatedAt).getTime() -
          new Date(left.updatedAt).getTime(),
      )
    })
  }

  const saveTemplate = async (showSuccessMessage = true) => {
    const response =
      channel === 'whatsapp'
        ? await upsertAdminSendTemplate(
            {
              templateId,
              name: resolvedTemplateName,
              description: templateDescription,
              channel,
              whatsapp: {
                externalTemplateName: whatsappExternalTemplateName,
                languageCode: whatsappLanguageCode,
                header: toPersistedWhatsappVariables(whatsappHeaderVariables),
                body: toPersistedWhatsappVariables(whatsappBodyVariables),
                buttons: toPersistedWhatsappButtons(whatsappButtons),
              },
            },
            messages.dashboard.sendCampaigns.loadError,
          )
        : await upsertAdminSendTemplate(
            {
              templateId,
              name: resolvedTemplateName,
              description: templateDescription,
              channel,
              email: {
                subjectTemplate: emailSubjectTemplate,
                htmlTemplate: emailHtmlTemplate,
                textTemplate: emailTextTemplate,
              },
            },
            messages.dashboard.sendCampaigns.loadError,
          )

    setTemplateId(response.template.id)
    syncTemplateIntoList(response.template)

    if (!campaignName.trim()) {
      setCampaignName(response.template.name)
    }

    if (showSuccessMessage) {
      setSuccess(messages.dashboard.sendCampaigns.templateSaved)
    }

    return response.template
  }

  const saveSettings = async (provider: 'whatsapp' | 'mailersend') => {
    setBusyAction(`settings-${provider}`)
    setError('')
    setSuccess('')

    try {
      const response =
        provider === 'whatsapp'
          ? await saveAdminSendSettings(
              {
                provider,
                phoneNumberId: whatsappPhoneNumberId,
                graphApiVersion: whatsappGraphApiVersion,
                accessToken: whatsappAccessToken,
              },
              messages.dashboard.sendCampaigns.loadError,
            )
          : await saveAdminSendSettings(
              {
                provider,
                fromEmail: mailersendFromEmail,
                fromName: mailersendFromName,
                replyToEmail: mailersendReplyToEmail,
                replyToName: mailersendReplyToName,
                apiKey: mailersendApiKey,
              },
              messages.dashboard.sendCampaigns.loadError,
            )

      setSettings(response.settings)
      setWhatsappAccessToken('')
      setMailersendApiKey('')
      setSuccess(messages.dashboard.sendCampaigns.settingsSaved)
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : messages.dashboard.sendCampaigns.loadError,
      )
    } finally {
      setBusyAction(null)
    }
  }

  const toggleDailyDeliveryAutomation = async () => {
    const nextEnabled = !deliveryAutomation?.enabled
    setBusyAction('delivery-automation')
    setError('')
    setSuccess('')

    try {
      const response = await updateAdminDailyDeliveryAutomation(
        {
          enabled: nextEnabled,
        },
        messages.dashboard.sendCampaigns.loadError,
      )

      setDeliveryAutomation(response.deliveryAutomation)
      setSuccess(
        nextEnabled
          ? language === 'es'
            ? 'Automatización diaria activada.'
            : 'Daily delivery automation enabled.'
          : language === 'es'
            ? 'Automatización diaria desactivada.'
            : 'Daily delivery automation disabled.',
      )
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : messages.dashboard.sendCampaigns.loadError,
      )
    } finally {
      setBusyAction(null)
    }
  }

  const runCampaignAction = async (action: 'save' | 'test' | 'send') => {
    setBusyAction(action)
    setError('')
    setSuccess('')

    try {
      const savedTemplate = await saveTemplate(false)
      const response = await runAdminSendCampaignAction(
        {
          action,
          campaignId,
          templateId: savedTemplate.id,
          name: campaignName || savedTemplate.name,
          channel,
          testRecipient,
          variableValues,
        },
        messages.dashboard.sendCampaigns.loadError,
      )

      setCampaignId(response.campaign.id)
      syncCampaignIntoList(response.campaign)

      if (action === 'save') {
        setSuccess(messages.dashboard.sendCampaigns.saveSuccess)
      } else if (action === 'test') {
        if (response.campaign.lastTestStatus === 'failed') {
          setError(
            response.campaign.lastTestError ??
              messages.dashboard.sendCampaigns.loadError,
          )
        } else {
          setSuccess(messages.dashboard.sendCampaigns.testSuccess)
        }
      } else if (response.campaign.status === 'failed') {
        setError(
          response.campaign.lastError ??
            messages.dashboard.sendCampaigns.sendFailed,
        )
      } else if (response.campaign.status === 'partially_sent') {
        setSuccess(messages.dashboard.sendCampaigns.sendPartial)
      } else {
        setSuccess(messages.dashboard.sendCampaigns.sendSuccess)
      }

      await loadWorkspace()
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : messages.dashboard.sendCampaigns.loadError,
      )
    } finally {
      setBusyAction(null)
    }
  }

  const selectedAudienceCount =
    channel === 'email' ? audience.email : audience.whatsapp

  const campaignStatusLabel = (status: SendCampaign['status']) => {
    if (status === 'sent') {
      return messages.dashboard.sendCampaigns.sentStatus
    }

    if (status === 'partially_sent') {
      return messages.dashboard.sendCampaigns.partiallySentStatus
    }

    if (status === 'failed') {
      return messages.dashboard.sendCampaigns.failedStatus
    }

    return messages.dashboard.sendCampaigns.draftStatus
  }

  const formatDate = (value: string | null) =>
    value ? dateFormatter.format(new Date(value)) : null
  const deliveryAutomationStatusLabel = deliveryAutomation?.enabled
    ? language === 'es'
      ? 'Activo'
      : 'Active'
    : language === 'es'
      ? 'Pausado'
      : 'Paused'
  const deliveryAutomationLastRunLabel =
    formatDate(deliveryAutomation?.lastCompletedAt ?? null) ??
    (language === 'es' ? 'Sin ejecuciones registradas' : 'No recorded runs yet')
  const deliveryAutomationLastMessage =
    deliveryAutomation?.lastRunMessage ??
    (deliveryAutomation?.enabled
      ? language === 'es'
        ? 'El próximo cron enviará los digests pendientes.'
        : 'The next cron run will send due digests.'
      : language === 'es'
        ? 'El cron queda bloqueado mientras el proceso esté pausado.'
        : 'Cron calls are blocked while automation is paused.')

  const resolvedTemplateName =
    channel === 'whatsapp'
      ? templateName.trim() || whatsappExternalTemplateName.trim()
      : templateName

  const applyWeeklyEmailTemplate = () => {
    const preset = createWeeklyEmailPreset(language)

    setChannel('email')
    setTemplateName((current) => current.trim() || preset.templateName)
    setTemplateDescription(
      (current) => current.trim() || preset.templateDescription,
    )
    setCampaignName((current) => current.trim() || preset.templateName)
    setEmailSubjectTemplate(preset.subjectTemplate)
    setEmailHtmlTemplate(preset.htmlTemplate)
    setEmailTextTemplate(preset.textTemplate)
    setVariableValues(preset.variableDefaults)
    setError('')
    setSuccess(messages.dashboard.sendCampaigns.emailTemplateGenerated)
  }

  const runWelcomeFlowTest = async () => {
    setBusyAction('welcome-flow-test')
    setError('')
    setSuccess('')

    try {
      const response = await triggerAdminWelcomeFlowTest(
        messages.dashboard.sendCampaigns.loadError,
      )
      const successMessage =
        language === 'es'
          ? `Flujo de bienvenida ejecutado para la suscripción ${response.subscriptionId}. Greetings: ${
              response.greetingsTemplateSent ? 'enviado' : 'falló'
            }. Digest WhatsApp: ${
              response.whatsappDigestSent ? 'enviado' : 'omitido'
            }. Email: ${response.emailDigestSent ? 'enviado' : 'omitido'}.${
              response.greetingsTemplateError
                ? ` Error greetings: ${response.greetingsTemplateError}`
                : ''
            }`
          : `Welcome flow triggered for subscription ${response.subscriptionId}. Greetings: ${
              response.greetingsTemplateSent ? 'sent' : 'failed'
            }. WhatsApp digest: ${
              response.whatsappDigestSent ? 'sent' : 'skipped'
            }. Email: ${response.emailDigestSent ? 'sent' : 'skipped'}.${
              response.greetingsTemplateError
                ? ` Greetings error: ${response.greetingsTemplateError}`
                : ''
            }`

      setSuccess(successMessage)
      await loadWorkspace()
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : messages.dashboard.sendCampaigns.loadError,
      )
    } finally {
      setBusyAction(null)
    }
  }

  const runRevertInternalTrial = async () => {
    setBusyAction('revert-internal-trial')
    setError('')
    setSuccess('')

    const normalizedEmail = revertInternalTrialEmail.trim().toLowerCase()

    if (!normalizedEmail) {
      setError(
        language === 'es'
          ? 'Ingresa el email del usuario a revertir.'
          : 'Enter the user email to revert.',
      )
      setBusyAction(null)
      return
    }

    try {
      const response = await revertInternalTrialFromAdmin(
        { email: normalizedEmail },
        messages.dashboard.sendCampaigns.loadError,
      )
      setSuccess(
        language === 'es'
          ? `Trial interno revertido para ${response.email}. La suscripción ${response.subscriptionId} quedó en pending_checkout con ${response.stripeTrialPeriodDays} días de trial en Stripe.`
          : `Internal trial reverted for ${response.email}. Subscription ${response.subscriptionId} is now pending_checkout with ${response.stripeTrialPeriodDays} Stripe trial days.`,
      )
      await loadWorkspace()
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : messages.dashboard.sendCampaigns.loadError,
      )
    } finally {
      setBusyAction(null)
    }
  }

  const runDigestTemplateTest = async () => {
    setBusyAction('digest-template-test')
    setError('')
    setSuccess('')

    try {
      const digestTestFallback =
        language === 'es'
          ? 'No se pudo enviar el test del digest por WhatsApp.'
          : 'Unable to send the WhatsApp digest test.'
      const response = await sendAdminSportsDigestTemplateTest(
        {
          recipient: digestTestRecipient,
          externalTemplateName: digestTemplateName,
          languageCode: digestTemplateLanguage,
        },
        digestTestFallback,
      )
      const languageHint =
        response.requestedLanguageCode &&
        response.requestedLanguageCode !== response.languageCode
          ? language === 'es'
            ? ` Idioma usado: ${response.languageCode}.`
            : ` Language used: ${response.languageCode}.`
          : ''
      const successMessage =
        language === 'es'
          ? `Template ${response.templateName} enviado como test para ${response.dayKey} con ${response.eventCount} eventos. Meta message id: ${
              response.providerMessageId ?? 'pendiente'
            }.${languageHint}`
          : `Template ${response.templateName} test sent for ${response.dayKey} with ${response.eventCount} events. Meta message id: ${
              response.providerMessageId ?? 'pending'
            }.${languageHint}`

      setSuccess(successMessage)
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : messages.dashboard.sendCampaigns.loadError,
      )
    } finally {
      setBusyAction(null)
    }
  }

  const runWeeklyDispatchNow = async () => {
    setBusyAction('weekly-dispatch')
    setError('')
    setSuccess('')
    setWeeklyDispatchPollingError('')

    try {
      const response = await startAdminWeeklyDispatch(
        messages.dashboard.sendCampaigns.loadError,
      )

      setWeeklyDispatchJob(response.job)
      setWeeklyDispatchJobs((currentJobs) => [
        response.job,
        ...currentJobs.filter((job) => job.id !== response.job.id),
      ])
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : messages.dashboard.sendCampaigns.loadError,
      )
    } finally {
      setBusyAction(null)
    }
  }

  const weeklyDispatchCompletedCount = weeklyDispatchJob
    ? weeklyDispatchJob.processedCount + weeklyDispatchJob.failedCount
    : 0
  const weeklyDispatchProgressPercent = weeklyDispatchJob
    ? weeklyDispatchJob.dueCount > 0
      ? Math.min(
          100,
          Math.round(
            (weeklyDispatchCompletedCount / weeklyDispatchJob.dueCount) * 100,
          ),
        )
      : 100
    : 0
  const weeklyDispatchIsActive =
    weeklyDispatchJobStatus === 'queued' ||
    weeklyDispatchJobStatus === 'running'
  const weeklyDispatchStatusLabel = weeklyDispatchJob
    ? weeklyDispatchJobStatus === 'queued'
      ? language === 'es'
        ? 'En cola'
        : 'Queued'
      : weeklyDispatchJobStatus === 'running'
        ? language === 'es'
          ? 'En curso'
          : 'Running'
        : weeklyDispatchJobStatus === 'completed'
          ? language === 'es'
            ? 'Completado'
            : 'Completed'
          : language === 'es'
            ? 'Fallido'
            : 'Failed'
    : ''
  const weeklyDispatchChannelLabel = weeklyDispatchJob
    ? weeklyDispatchJob.currentChannel === 'both'
      ? language === 'es'
        ? 'Email y WhatsApp'
        : 'Email and WhatsApp'
      : weeklyDispatchJob.currentChannel === 'email'
        ? 'Email'
        : weeklyDispatchJob.currentChannel === 'whatsapp'
          ? 'WhatsApp'
          : ''
    : ''
  const recentWeeklyDispatchJobs = weeklyDispatchJobs.slice(0, 8)
  const closeWeeklyDispatchModal = () => {
    if (!weeklyDispatchIsActive) {
      setWeeklyDispatchJob(null)
      setWeeklyDispatchPollingError('')
    }
  }

  if (loading) {
    return (
      <section className="cosmic-shell cosmic-shell-copy rounded-[2rem] p-8">
        {messages.dashboard.loading}
      </section>
    )
  }

  return (
    <div className="space-y-6">
      <section className="cosmic-shell rounded-[2rem] p-8">
        <h2 className="cosmic-shell-title text-2xl">
          {messages.dashboard.sendCampaigns.settingsTitle}
        </h2>
        <p className="cosmic-shell-copy mt-2">
          {messages.dashboard.sendCampaigns.settingsSubtitle}
        </p>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-[1.75rem] border border-white/12 bg-black/18 p-5">
            <h3 className="text-xl font-semibold text-slate-50">
              {messages.dashboard.sendCampaigns.settingsWhatsappTitle}
            </h3>
            <p className="cosmic-shell-meta mt-2 text-sm">
              {settings?.whatsapp.hasAccessToken
                ? messages.dashboard.sendCampaigns.settingsStored
                : messages.dashboard.sendCampaigns.settingsMissing}{' '}
              · {settings?.whatsapp.source ?? 'missing'}
            </p>
            <div className="mt-4 space-y-4">
              <label className="cosmic-field-label text-sm font-semibold">
                Phone number ID
                <input
                  type="text"
                  value={whatsappPhoneNumberId}
                  onChange={(event) =>
                    setWhatsappPhoneNumberId(event.target.value)
                  }
                  className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
                />
              </label>
              <label className="cosmic-field-label text-sm font-semibold">
                Graph API version
                <input
                  type="text"
                  value={whatsappGraphApiVersion}
                  onChange={(event) =>
                    setWhatsappGraphApiVersion(event.target.value)
                  }
                  className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
                />
              </label>
              <label className="cosmic-field-label text-sm font-semibold">
                Access token
                <input
                  type="password"
                  value={whatsappAccessToken}
                  onChange={(event) =>
                    setWhatsappAccessToken(event.target.value)
                  }
                  placeholder="Leave blank to keep the current token"
                  className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
                />
              </label>
              <button
                type="button"
                onClick={() => void saveSettings('whatsapp')}
                disabled={busyAction !== null}
                className="cosmic-outline-button rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.14em] disabled:opacity-60"
              >
                {busyAction === 'settings-whatsapp'
                  ? messages.common.saving
                  : messages.dashboard.sendCampaigns.settingsSave}
              </button>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/12 bg-black/18 p-5">
            <h3 className="text-xl font-semibold text-slate-50">
              {messages.dashboard.sendCampaigns.settingsMailersendTitle}
            </h3>
            <p className="cosmic-shell-meta mt-2 text-sm">
              {settings?.mailersend.hasApiKey
                ? messages.dashboard.sendCampaigns.settingsStored
                : messages.dashboard.sendCampaigns.settingsMissing}{' '}
              · {settings?.mailersend.source ?? 'missing'}
            </p>
            <div className="mt-4 space-y-4">
              <label className="cosmic-field-label text-sm font-semibold">
                From email
                <input
                  type="email"
                  value={mailersendFromEmail}
                  onChange={(event) =>
                    setMailersendFromEmail(event.target.value)
                  }
                  className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
                />
              </label>
              <label className="cosmic-field-label text-sm font-semibold">
                From name
                <input
                  type="text"
                  value={mailersendFromName}
                  onChange={(event) =>
                    setMailersendFromName(event.target.value)
                  }
                  className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
                />
              </label>
              <label className="cosmic-field-label text-sm font-semibold">
                Reply-to email
                <input
                  type="email"
                  value={mailersendReplyToEmail}
                  onChange={(event) =>
                    setMailersendReplyToEmail(event.target.value)
                  }
                  className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
                />
              </label>
              <label className="cosmic-field-label text-sm font-semibold">
                Reply-to name
                <input
                  type="text"
                  value={mailersendReplyToName}
                  onChange={(event) =>
                    setMailersendReplyToName(event.target.value)
                  }
                  className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
                />
              </label>
              <label className="cosmic-field-label text-sm font-semibold">
                API key
                <input
                  type="password"
                  value={mailersendApiKey}
                  onChange={(event) => setMailersendApiKey(event.target.value)}
                  placeholder="Leave blank to keep the current API key"
                  className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
                />
              </label>
              <button
                type="button"
                onClick={() => void saveSettings('mailersend')}
                disabled={busyAction !== null}
                className="cosmic-outline-button rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.14em] disabled:opacity-60"
              >
                {busyAction === 'settings-mailersend'
                  ? messages.common.saving
                  : messages.dashboard.sendCampaigns.settingsSave}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[1.75rem] border border-white/12 bg-black/18 p-5">
          <h3 className="text-xl font-semibold text-slate-50">
            {language === 'es'
              ? 'Prueba de flujo de bienvenida'
              : 'Welcome flow test'}
          </h3>
          <p className="cosmic-shell-meta mt-2 text-sm">
            {language === 'es'
              ? 'Dispara desde tu cuenta admin el flujo completo: template greetings de WhatsApp, digest de bienvenida por WhatsApp y correo de bienvenida con tu agenda.'
              : 'Trigger the full welcome flow from your admin account: WhatsApp greetings template, WhatsApp welcome digest, and welcome email with your agenda.'}
          </p>
          <button
            type="button"
            onClick={() => void runWelcomeFlowTest()}
            disabled={busyAction !== null}
            className="cosmic-outline-button mt-4 rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.14em] disabled:opacity-60"
          >
            {busyAction === 'welcome-flow-test'
              ? language === 'es'
                ? 'Ejecutando'
                : 'Running'
              : language === 'es'
                ? 'Ejecutar flujo de bienvenida'
                : 'Trigger welcome flow'}
          </button>
        </div>

        <div className="mt-6 rounded-[1.75rem] border border-amber-300/24 bg-black/18 p-5">
          <h3 className="text-xl font-semibold text-slate-50">
            {language === 'es'
              ? 'Revertir trial interno'
              : 'Revert internal trial'}
          </h3>
          <p className="cosmic-shell-meta mt-2 text-sm">
            {language === 'es'
              ? 'Quita una cuenta del trial interno. El usuario pasa a pending_checkout y recupera 7 días de trial en Stripe para su próximo checkout.'
              : 'Remove one account from internal trial. The user moves to pending_checkout and gets back a 7-day Stripe trial for the next checkout.'}
          </p>
          <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-end">
            <label className="cosmic-field-label text-sm font-semibold lg:min-w-[340px]">
              {language === 'es' ? 'Email del usuario' : 'User email'}
              <input
                type="email"
                value={revertInternalTrialEmail}
                onChange={(event) =>
                  setRevertInternalTrialEmail(event.target.value)
                }
                placeholder="user@example.com"
                className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
              />
            </label>
            <button
              type="button"
              onClick={() => void runRevertInternalTrial()}
              disabled={busyAction !== null}
              className="cosmic-outline-button rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.14em] disabled:opacity-60"
            >
              {busyAction === 'revert-internal-trial'
                ? language === 'es'
                  ? 'Revirtiendo'
                  : 'Reverting'
                : language === 'es'
                  ? 'Revertir a trial Stripe'
                  : 'Revert to Stripe trial'}
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-[1.75rem] border border-violet-300/18 bg-black/18 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-100/76">
                {language === 'es' ? 'Template aprobado' : 'Approved template'}
              </p>
              <h3 className="mt-2 text-xl font-semibold text-slate-50">
                Trimry Sports Digest
              </h3>
              <p className="cosmic-shell-meta mt-2 text-sm">
                {language === 'es'
                  ? 'Envía un test real por WhatsApp Cloud API con la agenda deportiva de tu cuenta admin. Variables: {{1}} nombre, {{2}} periodo, {{3}} titular, {{4}} resumen, {{5}} cantidad de eventos.'
                  : 'Send a real WhatsApp Cloud API test with the sports agenda of your admin account. Variables: {{1}} first name, {{2}} period, {{3}} headline, {{4}} summary, {{5}} event count.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void runDigestTemplateTest()}
              disabled={busyAction !== null}
              className="cosmic-button-primary rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.14em] disabled:opacity-60"
            >
              {busyAction === 'digest-template-test'
                ? language === 'es'
                  ? 'Enviando test'
                  : 'Sending test'
                : language === 'es'
                  ? 'Enviar test del digest'
                  : 'Send digest test'}
            </button>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr_0.55fr]">
            <label className="cosmic-field-label text-sm font-semibold">
              {language === 'es'
                ? 'Destino WhatsApp de test'
                : 'WhatsApp test recipient'}
              <input
                type="tel"
                value={digestTestRecipient}
                onChange={(event) => setDigestTestRecipient(event.target.value)}
                placeholder={
                  language === 'es'
                    ? messages.dashboard.sendCampaigns
                        .testingPlaceholderWhatsapp
                    : '+14155550123'
                }
                className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
              />
            </label>
            <label className="cosmic-field-label text-sm font-semibold">
              {messages.dashboard.sendCampaigns.externalTemplateNameLabel}
              <input
                type="text"
                value={digestTemplateName}
                onChange={(event) => setDigestTemplateName(event.target.value)}
                placeholder={
                  language === 'es'
                    ? 'Vacío = WHATSAPP_SPORTS_DIGEST_TEMPLATE_NAME'
                    : 'Empty = WHATSAPP_SPORTS_DIGEST_TEMPLATE_NAME'
                }
                className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
              />
            </label>
            <label className="cosmic-field-label text-sm font-semibold">
              {messages.dashboard.sendCampaigns.whatsappLanguageLabel}
              <input
                type="text"
                value={digestTemplateLanguage}
                onChange={(event) => setDigestTemplateLanguage(event.target.value)}
                placeholder="en"
                className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
              />
            </label>
          </div>

          <p className="cosmic-shell-meta mt-3 text-xs">
            {language === 'es'
              ? 'Si dejas el nombre vacío se usa WHATSAPP_SPORTS_DIGEST_TEMPLATE_NAME del API. Mientras Meta no apruebe la plantilla, los digests por WhatsApp quedan marcados como template_pending y solo sale el email.'
              : 'Leave the name empty to use WHATSAPP_SPORTS_DIGEST_TEMPLATE_NAME from the API. Until Meta approves the template, WhatsApp digests are marked template_pending and only the email goes out.'}
          </p>
        </div>

        <div className="mt-6 rounded-[1.75rem] border border-emerald-300/18 bg-black/18 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-100/76">
                {language === 'es'
                  ? 'Automatización productiva'
                  : 'Production automation'}
              </p>
              <h3 className="mt-2 text-xl font-semibold text-slate-50">
                {language === 'es'
                  ? 'Proceso diario de Email y WhatsApp'
                  : 'Daily Email and WhatsApp process'}
              </h3>
              <p className="cosmic-shell-meta mt-2 text-sm">
                {language === 'es'
                  ? 'Controla si el cron de producción puede enviar digests a suscripciones activas. Si está pausado, el endpoint responde sin enviar mensajes.'
                  : 'Controls whether the production cron can send digests to active subscriptions. When paused, the endpoint returns without sending messages.'}
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={deliveryAutomation?.enabled ?? false}
              onClick={() => void toggleDailyDeliveryAutomation()}
              disabled={busyAction !== null}
              className={clsx(
                'flex min-w-[158px] items-center justify-between gap-3 rounded-full border px-4 py-3 text-xs font-black uppercase tracking-[0.14em] transition disabled:opacity-60',
                deliveryAutomation?.enabled
                  ? 'border-emerald-200/45 bg-emerald-300/16 text-emerald-50'
                  : 'border-white/14 bg-white/7 text-slate-300',
              )}
            >
              <span>{deliveryAutomationStatusLabel}</span>
              <span
                className={clsx(
                  'relative h-6 w-11 rounded-full border transition',
                  deliveryAutomation?.enabled
                    ? 'border-emerald-100/50 bg-emerald-300/35'
                    : 'border-white/16 bg-black/30',
                )}
                aria-hidden="true"
              >
                <span
                  className={clsx(
                    'absolute top-1 h-4 w-4 rounded-full bg-white shadow-lg transition',
                    deliveryAutomation?.enabled ? 'left-6' : 'left-1',
                  )}
                />
              </span>
            </button>
          </div>

          <dl className="mt-5 grid gap-3 text-sm md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <dt className="cosmic-shell-meta text-xs uppercase tracking-[0.14em]">
                {language === 'es' ? 'Última ejecución' : 'Last run'}
              </dt>
              <dd className="mt-2 font-semibold text-slate-100">
                {deliveryAutomationLastRunLabel}
              </dd>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <dt className="cosmic-shell-meta text-xs uppercase tracking-[0.14em]">
                {language === 'es' ? 'Último trigger' : 'Last trigger'}
              </dt>
              <dd className="mt-2 font-semibold text-slate-100">
                {formatDate(deliveryAutomation?.lastTriggeredAt ?? null) ??
                  (language === 'es' ? 'Sin trigger' : 'No trigger yet')}
              </dd>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <dt className="cosmic-shell-meta text-xs uppercase tracking-[0.14em]">
                {language === 'es' ? 'Estado' : 'Status'}
              </dt>
              <dd className="mt-2 font-semibold text-slate-100">
                {deliveryAutomation?.lastRunStatus ??
                  deliveryAutomationStatusLabel}
              </dd>
            </div>
          </dl>

          <p className="cosmic-shell-meta mt-4 text-sm">
            {deliveryAutomationLastMessage}
          </p>
        </div>

        <div className="mt-6 rounded-[1.75rem] border border-cyan-300/18 bg-black/18 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100/76">
                {language === 'es' ? 'Envío diario' : 'Daily dispatch'}
              </p>
              <h3 className="mt-2 text-xl font-semibold text-slate-50">
                {language === 'es'
                  ? 'Enviar el digest a todos los suscriptores con entrega pendiente'
                  : 'Send the digest to every subscriber with a due delivery'}
              </h3>
              <p className="cosmic-shell-meta mt-2 text-sm">
                {language === 'es'
                  ? 'Respeta la preferencia de entrega de cada suscripción: email, WhatsApp o ambos. El progreso se mostrará en un modal mientras se envían los mensajes.'
                  : 'Respects each subscription delivery preference: email, WhatsApp, or both. Progress will appear in a modal while messages are sent.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void runWeeklyDispatchNow()}
              disabled={busyAction !== null || weeklyDispatchIsActive}
              className="cosmic-button-primary rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.14em] disabled:opacity-60"
            >
              {busyAction === 'weekly-dispatch'
                ? language === 'es'
                  ? 'Iniciando'
                  : 'Starting'
                : language === 'es'
                  ? 'Enviar digest'
                  : 'Send digest'}
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-black/18 p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100/76">
                {language === 'es' ? 'Monitoreo' : 'Monitoring'}
              </p>
              <h3 className="mt-2 text-xl font-semibold text-slate-50">
                {language === 'es'
                  ? 'Últimas corridas diarias'
                  : 'Recent daily runs'}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => void loadWorkspace()}
              disabled={busyAction !== null}
              className="cosmic-outline-button rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.14em] disabled:opacity-60"
            >
              {language === 'es' ? 'Actualizar' : 'Refresh'}
            </button>
          </div>

          {weeklyDispatchJobsError ? (
            <p className="cosmic-error-box mt-4 rounded-xl px-4 py-3 text-sm">
              {weeklyDispatchJobsError}
            </p>
          ) : null}

          {recentWeeklyDispatchJobs.length === 0 ? (
            <p className="cosmic-shell-meta mt-4 text-sm">
              {language === 'es'
                ? 'Todavía no hay corridas registradas.'
                : 'No runs have been recorded yet.'}
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {recentWeeklyDispatchJobs.map((job) => {
                const failedItems = (job.result?.items ?? []).filter(
                  dispatchItemHasFailure,
                )

                return (
                  <article
                    key={job.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={clsx(
                              'rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em]',
                              job.status === 'completed'
                                ? 'bg-emerald-400/20 text-emerald-100'
                                : job.status === 'failed'
                                  ? 'bg-rose-400/18 text-rose-100'
                                  : 'bg-cyan-400/18 text-cyan-100',
                            )}
                          >
                            {job.status}
                          </span>
                          <span className="cosmic-shell-meta text-xs uppercase tracking-[0.16em]">
                            {job.dryRun
                              ? language === 'es'
                                ? 'Prueba'
                                : 'Dry run'
                              : language === 'es'
                                ? 'Real'
                                : 'Live'}
                          </span>
                        </div>
                        <p className="mt-3 text-sm font-semibold text-slate-50">
                          {formatDate(job.createdAt) ?? job.createdAt}
                        </p>
                        <p className="mt-1 break-all text-xs text-slate-100/55">
                          {job.id}
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-sm">
                        <div className="rounded-xl bg-black/20 px-3 py-2">
                          <p className="text-[10px] uppercase tracking-[0.14em] text-slate-100/55">
                            {language === 'es' ? 'Total' : 'Total'}
                          </p>
                          <p className="mt-1 font-semibold text-slate-50">
                            {job.dueCount}
                          </p>
                        </div>
                        <div className="rounded-xl bg-black/20 px-3 py-2">
                          <p className="text-[10px] uppercase tracking-[0.14em] text-slate-100/55">
                            {language === 'es' ? 'OK' : 'OK'}
                          </p>
                          <p className="mt-1 font-semibold text-emerald-100">
                            {job.processedCount}
                          </p>
                        </div>
                        <div className="rounded-xl bg-black/20 px-3 py-2">
                          <p className="text-[10px] uppercase tracking-[0.14em] text-slate-100/55">
                            {language === 'es' ? 'Fail' : 'Fail'}
                          </p>
                          <p className="mt-1 font-semibold text-rose-100">
                            {job.failedCount}
                          </p>
                        </div>
                      </div>
                    </div>

                    {failedItems.length > 0 ? (
                      <div className="mt-4 space-y-2">
                        {failedItems.slice(0, 5).map((item) => {
                          const failedChannels = failedDispatchChannels(item)

                          return (
                            <div
                              key={`${job.id}-${item.subscriptionId}`}
                              className="rounded-xl border border-rose-300/18 bg-rose-300/8 px-3 py-3 text-sm text-rose-50"
                            >
                              <p className="font-semibold">
                                {item.recipientLabel ??
                                  item.subscriptionId.slice(-8)}
                                {failedChannels.length > 0
                                  ? ` · ${failedChannels.join(', ')}`
                                  : ''}
                              </p>
                              <p className="mt-1 break-all text-xs text-rose-50/70">
                                {item.subscriptionId}
                              </p>
                              {item.errors.length > 0 ? (
                                <ul className="mt-2 space-y-1 text-sm">
                                  {item.errors.map((itemError) => (
                                    <li key={itemError}>{itemError}</li>
                                  ))}
                                </ul>
                              ) : null}
                            </div>
                          )
                        })}
                      </div>
                    ) : job.result ? (
                      <p className="mt-4 text-sm text-emerald-100/82">
                        {language === 'es'
                          ? 'Sin fallas registradas en esta corrida.'
                          : 'No failures recorded for this run.'}
                      </p>
                    ) : null}
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <section className="cosmic-shell rounded-[2rem] p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="cosmic-shell-title text-2xl">
              {messages.dashboard.sendCampaigns.templateEditorTitle}
            </h2>
            <p className="cosmic-shell-copy mt-2 max-w-3xl">
              {messages.dashboard.sendCampaigns.templateEditorSubtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={resetEditor}
            className="cosmic-outline-button rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.14em]"
          >
            {messages.dashboard.sendCampaigns.createNew}
          </button>
        </div>

        {templates.length > 0 ? (
          <div className="mt-6 flex flex-wrap gap-3">
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => loadTemplateIntoEditor(template)}
                className={`rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.14em] ${
                  template.id === templateId
                    ? 'cosmic-tab-active'
                    : 'cosmic-tab'
                }`}
              >
                {template.name}
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <label className="cosmic-field-label text-sm font-semibold">
              {channel === 'whatsapp'
                ? messages.dashboard.sendCampaigns.whatsappReferenceNameLabel
                : messages.dashboard.sendCampaigns.nameLabel}
              <input
                type="text"
                value={templateName}
                onChange={(event) => setTemplateName(event.target.value)}
                className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
              />
            </label>

            <label className="cosmic-field-label text-sm font-semibold">
              {messages.dashboard.sendCampaigns.templateDescriptionLabel}
              <textarea
                value={templateDescription}
                onChange={(event) => setTemplateDescription(event.target.value)}
                rows={3}
                className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
              />
            </label>

            <div>
              <p className="cosmic-field-label text-sm font-semibold">
                {messages.dashboard.sendCampaigns.channelLabel}
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setChannel('whatsapp')}
                  className={clsx(
                    'rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.14em]',
                    channel === 'whatsapp'
                      ? 'cosmic-tab-active-alt'
                      : 'cosmic-tab',
                  )}
                >
                  {messages.dashboard.sendCampaigns.channelWhatsapp}
                </button>
                <button
                  type="button"
                  onClick={() => setChannel('email')}
                  className={clsx(
                    'rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.14em]',
                    channel === 'email' ? 'cosmic-tab-active' : 'cosmic-tab',
                  )}
                >
                  {messages.dashboard.sendCampaigns.channelEmail}
                </button>
              </div>
            </div>

            {channel === 'whatsapp' ? (
              <div className="space-y-4">
                <label className="cosmic-field-label text-sm font-semibold">
                  {messages.dashboard.sendCampaigns.externalTemplateNameLabel}
                  <input
                    type="text"
                    value={whatsappExternalTemplateName}
                    onChange={(event) =>
                      setWhatsappExternalTemplateName(event.target.value)
                    }
                    className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
                  />
                  <span className="cosmic-shell-meta mt-2 block text-xs">
                    {messages.dashboard.sendCampaigns.externalTemplateNameHint}
                  </span>
                </label>

                <label className="cosmic-field-label text-sm font-semibold">
                  {messages.dashboard.sendCampaigns.whatsappLanguageLabel}
                  <input
                    type="text"
                    value={whatsappLanguageCode}
                    onChange={(event) =>
                      setWhatsappLanguageCode(event.target.value)
                    }
                    className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
                  />
                </label>

                <div className="rounded-[1.5rem] border border-white/12 bg-black/18 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-50">
                        {messages.dashboard.sendCampaigns.headerTextLabel}
                      </p>
                      <p className="cosmic-shell-meta mt-1 text-xs">
                        {messages.dashboard.sendCampaigns.whatsappSectionHint}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setWhatsappHeaderVariables((current) => [
                          ...current,
                          createWhatsappVariableDraft(),
                        ])
                      }
                      className="cosmic-outline-button rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em]"
                    >
                      {messages.dashboard.sendCampaigns.addVariable}
                    </button>
                  </div>

                  <div className="mt-4 grid gap-4">
                    {whatsappHeaderVariables.length === 0 ? (
                      <p className="text-sm text-slate-100/72">
                        {messages.dashboard.sendCampaigns.noVariables}
                      </p>
                    ) : (
                      whatsappHeaderVariables.map((variable) => (
                        <div
                          key={variable.id}
                          className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                        >
                          <div className="grid gap-3 sm:grid-cols-[0.78fr_auto_1.22fr] sm:items-end">
                            <label className="cosmic-field-label text-sm font-semibold">
                              {
                                messages.dashboard.sendCampaigns
                                  .variableKeyLabel
                              }
                              <input
                                type="text"
                                value={variable.key}
                                onChange={(event) =>
                                  setWhatsappHeaderVariables((current) =>
                                    current.map((item) =>
                                      item.id === variable.id
                                        ? { ...item, key: event.target.value }
                                        : item,
                                    ),
                                  )
                                }
                                className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
                              />
                            </label>
                            <span className="hidden pb-3 text-center text-xl font-black text-slate-200/48 sm:block">
                              :
                            </span>
                            <label className="cosmic-field-label text-sm font-semibold">
                              {
                                messages.dashboard.sendCampaigns
                                  .variableContentLabel
                              }
                              <input
                                type="text"
                                value={variable.content}
                                onChange={(event) =>
                                  setWhatsappHeaderVariables((current) =>
                                    current.map((item) =>
                                      item.id === variable.id
                                        ? {
                                            ...item,
                                            content: event.target.value,
                                          }
                                        : item,
                                    ),
                                  )
                                }
                                className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
                              />
                            </label>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setWhatsappHeaderVariables((current) =>
                                current.filter(
                                  (item) => item.id !== variable.id,
                                ),
                              )
                            }
                            className="cosmic-danger-button mt-4 rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em]"
                          >
                            {messages.dashboard.sendCampaigns.removeVariable}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-white/12 bg-black/18 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-50">
                        {messages.dashboard.sendCampaigns.bodyTextLabel}
                      </p>
                      <p className="cosmic-shell-meta mt-1 text-xs">
                        {messages.dashboard.sendCampaigns.whatsappSectionHint}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setWhatsappBodyVariables((current) => [
                          ...current,
                          createWhatsappVariableDraft(),
                        ])
                      }
                      className="cosmic-outline-button rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em]"
                    >
                      {messages.dashboard.sendCampaigns.addVariable}
                    </button>
                  </div>

                  <div className="mt-4 grid gap-4">
                    {whatsappBodyVariables.map((variable) => (
                      <div
                        key={variable.id}
                        className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                      >
                        <div className="grid gap-3 sm:grid-cols-[0.78fr_auto_1.22fr] sm:items-end">
                          <label className="cosmic-field-label text-sm font-semibold">
                            {messages.dashboard.sendCampaigns.variableKeyLabel}
                            <input
                              type="text"
                              value={variable.key}
                              onChange={(event) =>
                                setWhatsappBodyVariables((current) =>
                                  current.map((item) =>
                                    item.id === variable.id
                                      ? { ...item, key: event.target.value }
                                      : item,
                                  ),
                                )
                              }
                              className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
                            />
                          </label>
                          <span className="hidden pb-3 text-center text-xl font-black text-slate-200/48 sm:block">
                            :
                          </span>
                          <label className="cosmic-field-label text-sm font-semibold">
                            {
                              messages.dashboard.sendCampaigns
                                .variableContentLabel
                            }
                            <input
                              type="text"
                              value={variable.content}
                              onChange={(event) =>
                                setWhatsappBodyVariables((current) =>
                                  current.map((item) =>
                                    item.id === variable.id
                                      ? { ...item, content: event.target.value }
                                      : item,
                                  ),
                                )
                              }
                              className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
                            />
                          </label>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setWhatsappBodyVariables((current) =>
                              current.filter((item) => item.id !== variable.id),
                            )
                          }
                          className="cosmic-danger-button mt-4 rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em]"
                        >
                          {messages.dashboard.sendCampaigns.removeVariable}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-white/12 bg-black/18 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-50">
                        {messages.dashboard.sendCampaigns.buttonsTitle}
                      </p>
                      <p className="cosmic-shell-meta mt-1 text-xs">
                        {messages.dashboard.sendCampaigns.whatsappButtonHint}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setWhatsappButtons((current) => [
                          ...current,
                          createButtonDraft(),
                        ])
                      }
                      className="cosmic-outline-button rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em]"
                    >
                      {messages.dashboard.sendCampaigns.addButton}
                    </button>
                  </div>

                  <div className="mt-4 grid gap-4">
                    {whatsappButtons.length === 0 ? (
                      <p className="text-sm text-slate-100/72">
                        {messages.dashboard.sendCampaigns.noVariables}
                      </p>
                    ) : (
                      whatsappButtons.map((button) => (
                        <div
                          key={button.id}
                          className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                        >
                          <div className="grid gap-3 sm:grid-cols-[0.78fr_auto_1.22fr] sm:items-end">
                            <label className="cosmic-field-label text-sm font-semibold">
                              {
                                messages.dashboard.sendCampaigns
                                  .variableKeyLabel
                              }
                              <input
                                type="text"
                                value={button.key}
                                onChange={(event) =>
                                  setWhatsappButtons((current) =>
                                    current.map((item) =>
                                      item.id === button.id
                                        ? { ...item, key: event.target.value }
                                        : item,
                                    ),
                                  )
                                }
                                className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
                              />
                            </label>
                            <span className="hidden pb-3 text-center text-xl font-black text-slate-200/48 sm:block">
                              :
                            </span>
                            <label className="cosmic-field-label text-sm font-semibold">
                              {
                                messages.dashboard.sendCampaigns
                                  .variableContentLabel
                              }
                              <input
                                type="text"
                                value={button.content}
                                onChange={(event) =>
                                  setWhatsappButtons((current) =>
                                    current.map((item) =>
                                      item.id === button.id
                                        ? {
                                            ...item,
                                            content: event.target.value,
                                          }
                                        : item,
                                    ),
                                  )
                                }
                                className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
                              />
                            </label>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setWhatsappButtons((current) =>
                                current.filter((item) => item.id !== button.id),
                              )
                            }
                            className="cosmic-danger-button mt-4 rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em]"
                          >
                            {messages.dashboard.sendCampaigns.removeButton}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-[1.5rem] border border-white/12 bg-black/18 p-4">
                  <p className="text-sm font-semibold text-slate-50">
                    {
                      messages.dashboard.sendCampaigns
                        .emailTemplateGeneratorTitle
                    }
                  </p>
                  <p className="cosmic-shell-meta mt-2 text-xs">
                    {
                      messages.dashboard.sendCampaigns
                        .emailTemplateGeneratorHint
                    }
                  </p>
                  <button
                    type="button"
                    onClick={applyWeeklyEmailTemplate}
                    disabled={busyAction !== null}
                    className="cosmic-outline-button mt-4 rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] disabled:opacity-60"
                  >
                    {messages.dashboard.sendCampaigns.emailGenerateTemplate}
                  </button>
                </div>

                <label className="cosmic-field-label text-sm font-semibold">
                  {messages.dashboard.sendCampaigns.emailSubjectLabel}
                  <input
                    type="text"
                    value={emailSubjectTemplate}
                    onChange={(event) =>
                      setEmailSubjectTemplate(event.target.value)
                    }
                    className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
                  />
                </label>

                <label className="cosmic-field-label text-sm font-semibold">
                  {messages.dashboard.sendCampaigns.emailHtmlLabel}
                  <textarea
                    value={emailHtmlTemplate}
                    onChange={(event) =>
                      setEmailHtmlTemplate(event.target.value)
                    }
                    rows={8}
                    className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
                  />
                </label>

                <label className="cosmic-field-label text-sm font-semibold">
                  {messages.dashboard.sendCampaigns.emailTextLabel}
                  <textarea
                    value={emailTextTemplate}
                    onChange={(event) =>
                      setEmailTextTemplate(event.target.value)
                    }
                    rows={6}
                    className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
                  />
                </label>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="cosmic-info-box rounded-[1.75rem] p-5 text-sm text-slate-100/82">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100/76">
                {messages.dashboard.sendCampaigns.variableValuesTitle}
              </p>
              <p className="mt-3 text-sm text-slate-100/76">
                {messages.dashboard.sendCampaigns.variableValuesSubtitle}
              </p>
              <div className="mt-4 grid gap-3">
                {draftVariables.length === 0 ? (
                  <p className="text-sm text-slate-100/72">
                    {messages.dashboard.sendCampaigns.noVariables}
                  </p>
                ) : (
                  draftVariables.map((variable) => (
                    <label
                      key={`${variable.source}-${variable.key}-${variable.buttonIndex ?? 'plain'}`}
                      className="cosmic-field-label text-sm font-semibold"
                    >
                      <span className="flex flex-wrap items-center gap-2">
                        <span>{variable.key}</span>
                        <span className="cosmic-shell-meta text-[11px] uppercase tracking-[0.16em]">
                          {variable.source}
                        </span>
                      </span>
                      <input
                        type="text"
                        value={variableValues[variable.key] ?? ''}
                        onChange={(event) =>
                          setVariableValues((current) => ({
                            ...current,
                            [variable.key]: event.target.value,
                          }))
                        }
                        className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
                      />
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="cosmic-info-box rounded-[1.75rem] p-5 text-sm text-slate-100/82">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100/76">
                {messages.dashboard.sendCampaigns.audienceTitle}
              </p>
              <p className="mt-3 text-base text-slate-50">
                {interpolate(
                  messages.dashboard.sendCampaigns.eligibleRecipients,
                  {
                    count: selectedAudienceCount,
                  },
                )}
              </p>
              <p className="mt-2 text-sm text-slate-100/76">
                {messages.dashboard.sendCampaigns.audienceHint}
              </p>
            </div>

            <label className="cosmic-field-label text-sm font-semibold">
              {messages.dashboard.sendCampaigns.campaignNameLabel}
              <input
                type="text"
                value={campaignName}
                onChange={(event) => setCampaignName(event.target.value)}
                className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
              />
            </label>

            <div className="cosmic-shell rounded-[1.75rem] p-5">
              <p className="cosmic-field-label text-sm font-semibold">
                {messages.dashboard.sendCampaigns.testingLabel}
              </p>
              <input
                type={channel === 'email' ? 'email' : 'tel'}
                value={testRecipient}
                onChange={(event) => setTestRecipient(event.target.value)}
                placeholder={
                  channel === 'email'
                    ? messages.dashboard.sendCampaigns.testingPlaceholderEmail
                    : messages.dashboard.sendCampaigns
                        .testingPlaceholderWhatsapp
                }
                className="cosmic-input mt-3 block w-full rounded-xl px-4 py-3"
              />
              <p className="cosmic-shell-meta mt-2 text-xs">
                {channel === 'email'
                  ? messages.dashboard.sendCampaigns.testingHintEmail
                  : messages.dashboard.sendCampaigns.testingHintWhatsapp}
              </p>
            </div>

            {templateId ? (
              <div className="cosmic-info-box rounded-[1.75rem] p-5 text-sm text-slate-100/82">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100/76">
                  {messages.dashboard.sendCampaigns.currentDraft}
                </p>
                <p className="mt-2 break-all text-sm text-slate-50">
                  {templateId}
                </p>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setBusyAction('template-save')
                  setError('')
                  setSuccess('')
                  void saveTemplate()
                    .catch((nextError) => {
                      setError(
                        nextError instanceof Error
                          ? nextError.message
                          : messages.dashboard.sendCampaigns.loadError,
                      )
                    })
                    .finally(() => setBusyAction(null))
                }}
                disabled={busyAction !== null}
                className="cosmic-outline-button rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.14em] disabled:opacity-60"
              >
                {busyAction === 'template-save'
                  ? messages.dashboard.sendCampaigns.templateSaveBusy
                  : messages.dashboard.sendCampaigns.templateSave}
              </button>
              <button
                type="button"
                onClick={() => void runCampaignAction('save')}
                disabled={busyAction !== null}
                className="cosmic-outline-button rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.14em] disabled:opacity-60"
              >
                {busyAction === 'save'
                  ? messages.dashboard.sendCampaigns.saveDraftBusy
                  : messages.dashboard.sendCampaigns.saveDraft}
              </button>
              <button
                type="button"
                onClick={() => void runCampaignAction('test')}
                disabled={busyAction !== null}
                className="cosmic-outline-button rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.14em] disabled:opacity-60"
              >
                {busyAction === 'test'
                  ? messages.dashboard.sendCampaigns.sendTestBusy
                  : messages.dashboard.sendCampaigns.sendTest}
              </button>
              <button
                type="button"
                onClick={() => void runCampaignAction('send')}
                disabled={busyAction !== null}
                className="cosmic-button-primary rounded-full px-6 py-3 text-xs font-black uppercase tracking-[0.14em] disabled:opacity-60"
              >
                {busyAction === 'send'
                  ? messages.dashboard.sendCampaigns.sendCampaignBusy
                  : messages.dashboard.sendCampaigns.sendCampaign}
              </button>
            </div>
          </div>
        </div>

        {error ? (
          <p className="cosmic-error-box mt-5 rounded-xl px-4 py-3 text-sm">
            {error}
          </p>
        ) : null}

        {success ? (
          <p className="cosmic-success-box mt-5 rounded-xl px-4 py-3 text-sm">
            {success}
          </p>
        ) : null}
      </section>

      <section className="cosmic-shell rounded-[2rem] p-8">
        <h3 className="cosmic-shell-title text-2xl">
          {messages.dashboard.sendCampaigns.historyTitle}
        </h3>
        <p className="cosmic-shell-copy mt-2">
          {messages.dashboard.sendCampaigns.historySubtitle}
        </p>

        {campaigns.length === 0 ? (
          <p className="cosmic-shell-copy mt-6">
            {messages.dashboard.sendCampaigns.emptyState}
          </p>
        ) : (
          <div className="mt-6 grid gap-4">
            {campaigns.map((campaign) => (
              <article
                key={campaign.id}
                className="rounded-[1.75rem] border border-white/12 bg-black/18 p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="cosmic-shell-meta text-xs font-semibold uppercase tracking-[0.18em]">
                        {campaign.channel === 'email'
                          ? messages.dashboard.sendCampaigns.channelEmail
                          : messages.dashboard.sendCampaigns.channelWhatsapp}
                      </span>
                      <span
                        className={clsx(
                          'rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em]',
                          campaign.status === 'sent'
                            ? 'bg-emerald-400/20 text-emerald-100'
                            : campaign.status === 'partially_sent'
                              ? 'bg-amber-400/18 text-amber-100'
                              : campaign.status === 'failed'
                                ? 'bg-rose-400/18 text-rose-100'
                                : 'bg-cyan-400/18 text-cyan-100',
                        )}
                      >
                        {campaignStatusLabel(campaign.status)}
                      </span>
                    </div>
                    <h4 className="mt-3 text-xl font-semibold text-slate-50">
                      {campaign.name}
                    </h4>
                    <p className="cosmic-shell-meta mt-2 text-sm">
                      {campaign.templateSnapshot.templateName}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="cosmic-info-box rounded-2xl p-4 text-sm text-slate-100/82">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100/76">
                      {messages.dashboard.sendCampaigns.metricsRecipients}
                    </p>
                    <p className="mt-2 text-2xl text-slate-50">
                      {campaign.metrics.recipients}
                    </p>
                  </div>
                  <div className="cosmic-info-box rounded-2xl p-4 text-sm text-slate-100/82">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100/76">
                      {messages.dashboard.sendCampaigns.metricsAccepted}
                    </p>
                    <p className="mt-2 text-2xl text-slate-50">
                      {campaign.metrics.accepted}
                    </p>
                  </div>
                  <div className="cosmic-info-box rounded-2xl p-4 text-sm text-slate-100/82">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100/76">
                      {messages.dashboard.sendCampaigns.metricsFailed}
                    </p>
                    <p className="mt-2 text-2xl text-slate-50">
                      {campaign.metrics.failed}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 text-sm text-slate-100/78 lg:grid-cols-2">
                  <p>
                    <span className="font-semibold text-slate-50">
                      {messages.dashboard.sendCampaigns.sentAt}:
                    </span>{' '}
                    {formatDate(campaign.sentAt) ??
                      messages.dashboard.sendCampaigns.notSentYet}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-50">
                      {messages.dashboard.sendCampaigns.updatedAt}:
                    </span>{' '}
                    {formatDate(campaign.updatedAt) ??
                      messages.dashboard.sendCampaigns.notSentYet}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-50">
                      {messages.dashboard.sendCampaigns.lastTestedAt}:
                    </span>{' '}
                    {formatDate(campaign.lastTestedAt) ??
                      messages.dashboard.sendCampaigns.neverTested}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-50">
                      {messages.dashboard.sendCampaigns.lastTestRecipient}:
                    </span>{' '}
                    {campaign.lastTestRecipient ??
                      messages.dashboard.sendCampaigns.neverTested}
                  </p>
                </div>

                {Object.keys(campaign.variableValues).length > 0 ? (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {Object.entries(campaign.variableValues).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-100/78"
                        >
                          <p className="cosmic-shell-meta text-xs font-semibold uppercase tracking-[0.18em]">
                            {key}
                          </p>
                          <p className="mt-2 text-slate-50">{value}</p>
                        </div>
                      ),
                    )}
                  </div>
                ) : null}

                {campaign.lastError ? (
                  <p className="cosmic-error-box mt-5 rounded-xl px-4 py-3 text-sm">
                    {campaign.lastError}
                  </p>
                ) : null}

                {!campaign.lastError && campaign.lastTestError ? (
                  <p className="cosmic-error-box mt-5 rounded-xl px-4 py-3 text-sm">
                    {campaign.lastTestError}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>

      {weeklyDispatchJob ? (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-3 backdrop-blur-[10px] sm:items-center sm:p-6">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="weekly-dispatch-title"
            className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/12 bg-[#071325]/96 shadow-[0_30px_100px_rgba(0,0,0,0.55)]"
          >
            <div className="border-b border-white/10 bg-white/[0.03] px-5 py-4 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100/80">
                    {language === 'es' ? 'Modal de progreso' : 'Progress modal'}
                  </p>
                  <h3
                    id="weekly-dispatch-title"
                    className="mt-2 text-2xl font-semibold text-slate-50"
                  >
                    {language === 'es'
                      ? 'Enviando digest'
                      : 'Sending digest'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={closeWeeklyDispatchModal}
                  disabled={weeklyDispatchIsActive}
                  className="cosmic-outline-button rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {weeklyDispatchIsActive
                    ? language === 'es'
                      ? 'En curso'
                      : 'Running'
                    : language === 'es'
                      ? 'Cerrar'
                      : 'Close'}
                </button>
              </div>
            </div>

            <div className="space-y-5 px-5 py-5 sm:px-6">
              <div className="rounded-[1.5rem] border border-white/12 bg-black/18 p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={clsx(
                      'rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em]',
                      weeklyDispatchJob.status === 'completed'
                        ? 'bg-emerald-400/20 text-emerald-100'
                        : weeklyDispatchJob.status === 'failed'
                          ? 'bg-rose-400/18 text-rose-100'
                          : weeklyDispatchJob.status === 'running'
                            ? 'bg-cyan-400/18 text-cyan-100'
                            : 'bg-slate-400/18 text-slate-100',
                    )}
                  >
                    {weeklyDispatchStatusLabel}
                  </span>
                  <span className="cosmic-shell-meta text-xs uppercase tracking-[0.18em]">
                    {weeklyDispatchJob.dryRun
                      ? language === 'es'
                        ? 'Prueba'
                        : 'Dry run'
                      : language === 'es'
                        ? 'Envío real'
                        : 'Live send'}
                  </span>
                </div>

                <p className="mt-4 text-sm text-slate-100/80">
                  {weeklyDispatchJob.message ??
                    (language === 'es'
                      ? 'Preparando el envío diario.'
                      : 'Preparing the daily dispatch.')}
                </p>

                <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/8">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-200 via-sky-300 to-violet-300 transition-[width] duration-500 ease-out"
                    style={{ width: `${weeklyDispatchProgressPercent}%` }}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-100/72">
                  <span>{weeklyDispatchCompletedCount}</span>
                  <span>{weeklyDispatchJob.dueCount}</span>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="cosmic-info-box rounded-2xl p-4 text-sm text-slate-100/82">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100/76">
                    {language === 'es' ? 'Procesados' : 'Processed'}
                  </p>
                  <p className="mt-2 text-2xl text-slate-50">
                    {weeklyDispatchJob.processedCount}
                  </p>
                </div>
                <div className="cosmic-info-box rounded-2xl p-4 text-sm text-slate-100/82">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100/76">
                    {language === 'es' ? 'Fallidos' : 'Failed'}
                  </p>
                  <p className="mt-2 text-2xl text-slate-50">
                    {weeklyDispatchJob.failedCount}
                  </p>
                </div>
                <div className="cosmic-info-box rounded-2xl p-4 text-sm text-slate-100/82">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100/76">
                    {language === 'es' ? 'Total' : 'Total'}
                  </p>
                  <p className="mt-2 text-2xl text-slate-50">
                    {weeklyDispatchJob.dueCount}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-white/12 bg-black/18 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100/76">
                    {language === 'es'
                      ? 'Suscriptor actual'
                      : 'Current subscriber'}
                  </p>
                  <p className="mt-2 text-sm text-slate-50">
                    {weeklyDispatchJob.currentRecipientLabel ??
                      (language === 'es'
                        ? 'Esperando el siguiente envío.'
                        : 'Waiting for the next send.')}
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-white/12 bg-black/18 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100/76">
                    {language === 'es' ? 'Canal' : 'Channel'}
                  </p>
                  <p className="mt-2 text-sm text-slate-50">
                    {weeklyDispatchChannelLabel ||
                      (language === 'es'
                        ? 'Se detectará automáticamente según la suscripción.'
                        : 'Detected automatically from each subscription.')}
                  </p>
                </div>
              </div>

              {weeklyDispatchPollingError ? (
                <p className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-50">
                  {weeklyDispatchPollingError}
                </p>
              ) : null}

              {weeklyDispatchJob.error ? (
                <p className="rounded-2xl border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-50">
                  {weeklyDispatchJob.error}
                </p>
              ) : null}

              {weeklyDispatchJob.result ? (
                <div className="rounded-[1.5rem] border border-emerald-300/18 bg-emerald-300/8 p-4 text-sm text-emerald-50">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-100/80">
                    {language === 'es' ? 'Resultado final' : 'Final result'}
                  </p>
                  <p className="mt-2">
                    {language === 'es'
                      ? `Procesados ${weeklyDispatchJob.result.processedCount} de ${weeklyDispatchJob.result.dueCount}. Fallidos: ${weeklyDispatchJob.result.failedCount}.`
                      : `Processed ${weeklyDispatchJob.result.processedCount} of ${weeklyDispatchJob.result.dueCount}. Failed: ${weeklyDispatchJob.result.failedCount}.`}
                  </p>
                </div>
              ) : null}

              <div className="flex flex-wrap justify-end gap-3">
                {!weeklyDispatchIsActive ? (
                  <button
                    type="button"
                    onClick={closeWeeklyDispatchModal}
                    className="cosmic-outline-button rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.14em]"
                  >
                    {language === 'es' ? 'Cerrar' : 'Close'}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
