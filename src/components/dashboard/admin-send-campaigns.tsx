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
