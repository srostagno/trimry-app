'use client'

import clsx from 'clsx'
import { useEffect, useMemo, useRef, useState } from 'react'

import { useLanguage } from '@/components/language-provider'
import {
  fetchAdminSendWorkspace,
  runAdminSendCampaignAction,
  saveAdminSendSettings,
  upsertAdminSendTemplate,
  type SendCampaign,
  type SendCampaignChannel,
  type SendTemplate,
  type SendTemplateVariable,
} from '@/lib/admin-send-campaigns'
import { interpolate } from '@/lib/i18n'

const localeByLanguage = {
  en: 'en-US',
  es: 'es-CL',
} as const

const PLACEHOLDER_REGEX = /{{\s*([a-zA-Z0-9_]+)\s*}}/g
const TRIMRY_WEBSITE_URL = 'https://trimry.com'
const TRIMRY_LOGO_URL = `${TRIMRY_WEBSITE_URL}/logo-horizontal.png`
const FULL_HTML_DOCUMENT_REGEX = /<\s*(?:!doctype\s+html|html[\s>])/i

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

function createWeeklyEmailPreset(language: keyof typeof localeByLanguage): WeeklyEmailPreset {
  if (language === 'en') {
    const subjectTemplate =
      'Your Trimry weekly ritual summary: {{week_label}}'
    const htmlBody = `
<p style="margin:0 0 16px 0;">Hi {{first_name}},</p>
<p style="margin:0 0 16px 0;">Here is your weekly ritual outlook with good, challenging, and rare timing for haircut, shave, nails, and release.</p>
<h2 style="margin:22px 0 10px 0;font-size:20px;line-height:1.3;color:#0f172a;">Week {{week_label}}</h2>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 20px 0;border-collapse:collapse;">
  <tr>
    <td style="padding:10px 12px;border:1px solid #dbe3ed;font-weight:700;background:#f8fafc;">Good days</td>
    <td style="padding:10px 12px;border:1px solid #dbe3ed;">{{good_days}}</td>
  </tr>
  <tr>
    <td style="padding:10px 12px;border:1px solid #dbe3ed;font-weight:700;background:#f8fafc;">Challenging days</td>
    <td style="padding:10px 12px;border:1px solid #dbe3ed;">{{bad_days}}</td>
  </tr>
  <tr>
    <td style="padding:10px 12px;border:1px solid #dbe3ed;font-weight:700;background:#f8fafc;">Rare days</td>
    <td style="padding:10px 12px;border:1px solid #dbe3ed;">{{rare_days}}</td>
  </tr>
</table>
<p style="margin:0 0 8px 0;"><strong>Haircut:</strong> {{haircut_summary}}</p>
<p style="margin:0 0 8px 0;"><strong>Shave:</strong> {{shave_summary}}</p>
<p style="margin:0 0 8px 0;"><strong>Nails:</strong> {{nails_summary}}</p>
<p style="margin:0 0 16px 0;"><strong>Release:</strong> {{release_summary}}</p>
<p style="margin:0 0 18px 0;"><strong>Weekly tip:</strong> {{weekly_tip}}</p>
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:18px 0 0 0;">
  <tr>
    <td style="border-radius:999px;background:#0f766e;">
      <a href="${TRIMRY_WEBSITE_URL}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:12px 22px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">Open trimry.com</a>
    </td>
  </tr>
</table>`
    const textTemplate = `Hi {{first_name}},

Weekly Trimry ritual summary for {{week_label}}
- Good days: {{good_days}}
- Challenging days: {{bad_days}}
- Rare days: {{rare_days}}

Haircut: {{haircut_summary}}
Shave: {{shave_summary}}
Nails: {{nails_summary}}
Release: {{release_summary}}

Weekly tip: {{weekly_tip}}

View your full outlook on ${TRIMRY_WEBSITE_URL}`

    return {
      templateName: 'Trimry Weekly Ritual Email',
      templateDescription:
        'Weekly summary with good, challenging, and rare ritual days.',
      subjectTemplate,
      htmlTemplate: ensureFullHtmlDocument({
        language: 'en',
        subject: subjectTemplate,
        htmlBody,
        preheader:
          'Weekly timing for haircut, shave, nails, and release.',
      }),
      textTemplate,
      variableDefaults: {
        first_name: 'there',
        week_label: 'Apr 6 - Apr 12',
        good_days: 'Monday, Thursday',
        bad_days: 'Tuesday',
        rare_days: 'Saturday',
        haircut_summary: 'Wednesday afternoon and Friday morning feel aligned.',
        shave_summary: 'Use caution Tuesday night.',
        nails_summary: 'Thursday morning has smoother momentum.',
        release_summary: 'Sunday before 20:00 is best for symbolic release.',
        weekly_tip: 'Keep rituals simple and consistent for better momentum.',
      },
    }
  }

  const subjectTemplate = 'Tu resumen semanal Trimry: {{week_label}}'
  const htmlBody = `
<p style="margin:0 0 16px 0;">Hola {{first_name}},</p>
<p style="margin:0 0 16px 0;">Este es tu resumen semanal con días buenos, malos y raros para corte, afeitado, uñas y liberación.</p>
<h2 style="margin:22px 0 10px 0;font-size:20px;line-height:1.3;color:#0f172a;">Semana {{week_label}}</h2>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 20px 0;border-collapse:collapse;">
  <tr>
    <td style="padding:10px 12px;border:1px solid #dbe3ed;font-weight:700;background:#f8fafc;">Días buenos</td>
    <td style="padding:10px 12px;border:1px solid #dbe3ed;">{{good_days}}</td>
  </tr>
  <tr>
    <td style="padding:10px 12px;border:1px solid #dbe3ed;font-weight:700;background:#f8fafc;">Días malos</td>
    <td style="padding:10px 12px;border:1px solid #dbe3ed;">{{bad_days}}</td>
  </tr>
  <tr>
    <td style="padding:10px 12px;border:1px solid #dbe3ed;font-weight:700;background:#f8fafc;">Días raros</td>
    <td style="padding:10px 12px;border:1px solid #dbe3ed;">{{rare_days}}</td>
  </tr>
</table>
<p style="margin:0 0 8px 0;"><strong>Corte:</strong> {{haircut_summary}}</p>
<p style="margin:0 0 8px 0;"><strong>Afeitado:</strong> {{shave_summary}}</p>
<p style="margin:0 0 8px 0;"><strong>Uñas:</strong> {{nails_summary}}</p>
<p style="margin:0 0 16px 0;"><strong>Liberación:</strong> {{release_summary}}</p>
<p style="margin:0 0 18px 0;"><strong>Tip semanal:</strong> {{weekly_tip}}</p>
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:18px 0 0 0;">
  <tr>
    <td style="border-radius:999px;background:#0f766e;">
      <a href="${TRIMRY_WEBSITE_URL}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:12px 22px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">Ir a trimry.com</a>
    </td>
  </tr>
</table>`
  const textTemplate = `Hola {{first_name}},

Resumen semanal Trimry para {{week_label}}
- Días buenos: {{good_days}}
- Días malos: {{bad_days}}
- Días raros: {{rare_days}}

Corte: {{haircut_summary}}
Afeitado: {{shave_summary}}
Uñas: {{nails_summary}}
Liberación: {{release_summary}}

Tip semanal: {{weekly_tip}}

Revisa tu detalle completo en ${TRIMRY_WEBSITE_URL}`

  return {
    templateName: 'Resumen Semanal Trimry',
    templateDescription:
      'Resumen semanal con días buenos, malos y raros para rituales.',
    subjectTemplate,
    htmlTemplate: ensureFullHtmlDocument({
      language: 'es',
      subject: subjectTemplate,
      htmlBody,
      preheader:
        'Resumen semanal de corte, afeitado, uñas y liberación.',
    }),
    textTemplate,
    variableDefaults: {
      first_name: 'amigo',
      week_label: '6 al 12 de abril',
      good_days: 'Lunes y jueves',
      bad_days: 'Martes',
      rare_days: 'Sábado',
      haircut_summary: 'Miércoles por la tarde y viernes temprano se ven alineados.',
      shave_summary: 'Conviene evitar martes por la noche.',
      nails_summary: 'Jueves en la mañana trae mejor fluidez.',
      release_summary: 'Domingo antes de las 20:00 favorece cerrar ciclos.',
      weekly_tip: 'Mantén rituales simples y consistentes para sostener el impulso.',
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
      ...toPersistedWhatsappVariables(input.whatsappHeaderVariables).map((value) => ({
        key: value.key,
        source: 'header' as const,
        content: value.content,
      })),
      ...toPersistedWhatsappVariables(input.whatsappBodyVariables).map((value) => ({
        key: value.key,
        source: 'body' as const,
        content: value.content,
      })),
      ...toPersistedWhatsappButtons(input.whatsappButtons).map((button, index) => ({
        key: button.key,
        source: 'button' as const,
        buttonIndex: index,
        content: button.content,
      })),
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

  const [whatsappPhoneNumberId, setWhatsappPhoneNumberId] = useState('')
  const [whatsappGraphApiVersion, setWhatsappGraphApiVersion] = useState('v23.0')
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

  const [whatsappExternalTemplateName, setWhatsappExternalTemplateName] = useState('')
  const [whatsappLanguageCode, setWhatsappLanguageCode] = useState(
    defaultWhatsappLanguage,
  )
  const [whatsappHeaderVariables, setWhatsappHeaderVariables] = useState<
    WhatsappVariableDraft[]
  >([])
  const [whatsappBodyVariables, setWhatsappBodyVariables] = useState<
    WhatsappVariableDraft[]
  >([createWhatsappVariableDraft()])
  const [whatsappButtons, setWhatsappButtons] = useState<WhatsappButtonDraft[]>([])

  const [emailSubjectTemplate, setEmailSubjectTemplate] = useState('')
  const [emailHtmlTemplate, setEmailHtmlTemplate] = useState('')
  const [emailTextTemplate, setEmailTextTemplate] = useState('')
  const [variableValues, setVariableValues] = useState<Record<string, string>>({})
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
      const next = draftVariables.reduce<Record<string, string>>((accumulator, variable) => {
        const draftDefault = variable.content ?? ''
        const currentValue = current[variable.key]

        accumulator[variable.key] =
          currentValue === undefined
            ? draftDefault
            : currentValue === (previousDefaults[variable.key] ?? '')
              ? draftDefault
              : currentValue
        return accumulator
      }, {})

      previousDraftDefaultsRef.current = draftVariables.reduce<Record<string, string>>(
        (accumulator, variable) => {
          accumulator[variable.key] = variable.content ?? ''
          return accumulator
        },
        {},
      )

      return next
    })
  }, [draftVariables])

  const loadWorkspace = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetchAdminSendWorkspace(
        messages.dashboard.sendCampaigns.loadError,
      )
      setCampaigns(response.campaigns)
      setTemplates(response.templates)
      setAudience(response.audience)
      setSettings(response.settings)
      setWhatsappPhoneNumberId(response.settings.whatsapp.phoneNumberId)
      setWhatsappGraphApiVersion(response.settings.whatsapp.graphApiVersion || 'v23.0')
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
      setWhatsappExternalTemplateName(template.whatsapp?.externalTemplateName ?? '')
      setWhatsappLanguageCode(template.whatsapp?.languageCode ?? defaultWhatsappLanguage)
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
      template.variables.reduce<Record<string, string>>((accumulator, variable) => {
        accumulator[variable.key] = variable.content ?? ''
        return accumulator
      }, {}),
    )
  }

  const syncTemplateIntoList = (template: SendTemplate) => {
    setTemplates((current) => {
      const next = [template, ...current.filter((item) => item.id !== template.id)]
      return next.sort(
        (left, right) =>
          new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
      )
    })
  }

  const syncCampaignIntoList = (campaign: SendCampaign) => {
    setCampaigns((current) => {
      const next = [campaign, ...current.filter((item) => item.id !== campaign.id)]
      return next.sort(
        (left, right) =>
          new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
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
          response.campaign.lastError ?? messages.dashboard.sendCampaigns.sendFailed,
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

  const selectedAudienceCount = channel === 'email' ? audience.email : audience.whatsapp

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
                  onChange={(event) => setWhatsappPhoneNumberId(event.target.value)}
                  className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
                />
              </label>
              <label className="cosmic-field-label text-sm font-semibold">
                Graph API version
                <input
                  type="text"
                  value={whatsappGraphApiVersion}
                  onChange={(event) => setWhatsappGraphApiVersion(event.target.value)}
                  className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
                />
              </label>
              <label className="cosmic-field-label text-sm font-semibold">
                Access token
                <input
                  type="password"
                  value={whatsappAccessToken}
                  onChange={(event) => setWhatsappAccessToken(event.target.value)}
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
                  onChange={(event) => setMailersendFromEmail(event.target.value)}
                  className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
                />
              </label>
              <label className="cosmic-field-label text-sm font-semibold">
                From name
                <input
                  type="text"
                  value={mailersendFromName}
                  onChange={(event) => setMailersendFromName(event.target.value)}
                  className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
                />
              </label>
              <label className="cosmic-field-label text-sm font-semibold">
                Reply-to email
                <input
                  type="email"
                  value={mailersendReplyToEmail}
                  onChange={(event) => setMailersendReplyToEmail(event.target.value)}
                  className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
                />
              </label>
              <label className="cosmic-field-label text-sm font-semibold">
                Reply-to name
                <input
                  type="text"
                  value={mailersendReplyToName}
                  onChange={(event) => setMailersendReplyToName(event.target.value)}
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
                  template.id === templateId ? 'cosmic-tab-active' : 'cosmic-tab'
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
                    channel === 'whatsapp' ? 'cosmic-tab-active-alt' : 'cosmic-tab',
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
                    onChange={(event) => setWhatsappLanguageCode(event.target.value)}
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
                              {messages.dashboard.sendCampaigns.variableKeyLabel}
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
                              {messages.dashboard.sendCampaigns.variableContentLabel}
                              <input
                                type="text"
                                value={variable.content}
                                onChange={(event) =>
                                  setWhatsappHeaderVariables((current) =>
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
                              setWhatsappHeaderVariables((current) =>
                                current.filter((item) => item.id !== variable.id),
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
                            {messages.dashboard.sendCampaigns.variableContentLabel}
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
                        setWhatsappButtons((current) => [...current, createButtonDraft()])
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
                              {messages.dashboard.sendCampaigns.variableKeyLabel}
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
                              {messages.dashboard.sendCampaigns.variableContentLabel}
                              <input
                                type="text"
                                value={button.content}
                                onChange={(event) =>
                                  setWhatsappButtons((current) =>
                                    current.map((item) =>
                                      item.id === button.id
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
                    {messages.dashboard.sendCampaigns.emailTemplateGeneratorTitle}
                  </p>
                  <p className="cosmic-shell-meta mt-2 text-xs">
                    {messages.dashboard.sendCampaigns.emailTemplateGeneratorHint}
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
                    onChange={(event) => setEmailSubjectTemplate(event.target.value)}
                    className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
                  />
                </label>

                <label className="cosmic-field-label text-sm font-semibold">
                  {messages.dashboard.sendCampaigns.emailHtmlLabel}
                  <textarea
                    value={emailHtmlTemplate}
                    onChange={(event) => setEmailHtmlTemplate(event.target.value)}
                    rows={8}
                    className="cosmic-input mt-2 block w-full rounded-xl px-4 py-3"
                  />
                </label>

                <label className="cosmic-field-label text-sm font-semibold">
                  {messages.dashboard.sendCampaigns.emailTextLabel}
                  <textarea
                    value={emailTextTemplate}
                    onChange={(event) => setEmailTextTemplate(event.target.value)}
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
                {interpolate(messages.dashboard.sendCampaigns.eligibleRecipients, {
                  count: selectedAudienceCount,
                })}
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
                    : messages.dashboard.sendCampaigns.testingPlaceholderWhatsapp
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
                <p className="mt-2 break-all text-sm text-slate-50">{templateId}</p>
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
          <p className="cosmic-error-box mt-5 rounded-xl px-4 py-3 text-sm">{error}</p>
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
                    <p className="mt-2 text-2xl text-slate-50">{campaign.metrics.recipients}</p>
                  </div>
                  <div className="cosmic-info-box rounded-2xl p-4 text-sm text-slate-100/82">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100/76">
                      {messages.dashboard.sendCampaigns.metricsAccepted}
                    </p>
                    <p className="mt-2 text-2xl text-slate-50">{campaign.metrics.accepted}</p>
                  </div>
                  <div className="cosmic-info-box rounded-2xl p-4 text-sm text-slate-100/82">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100/76">
                      {messages.dashboard.sendCampaigns.metricsFailed}
                    </p>
                    <p className="mt-2 text-2xl text-slate-50">{campaign.metrics.failed}</p>
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
                    {Object.entries(campaign.variableValues).map(([key, value]) => (
                      <div
                        key={key}
                        className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-100/78"
                      >
                        <p className="cosmic-shell-meta text-xs font-semibold uppercase tracking-[0.18em]">
                          {key}
                        </p>
                        <p className="mt-2 text-slate-50">{value}</p>
                      </div>
                    ))}
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
    </div>
  )
}
