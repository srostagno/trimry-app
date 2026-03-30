import { apiFetch, readApiError } from '@/lib/api-client'

export type SendCampaignChannel = 'whatsapp' | 'email'
export type SendCampaignStatus = 'draft' | 'sent' | 'partially_sent' | 'failed'

export type SendTemplateWhatsappVariable = {
  key: string
  content: string
}

export type SendTemplateWhatsappButton = {
  type: 'url'
  key: string
  content: string
}

export type SendTemplateVariable = {
  key: string
  source: 'header' | 'body' | 'button' | 'subject' | 'html' | 'text'
  buttonIndex?: number
  content?: string
}

export type SendTemplate = {
  id: string
  name: string
  channel: SendCampaignChannel
  description: string
  status: 'active' | 'archived'
  variables: SendTemplateVariable[]
  whatsapp: {
    externalTemplateName: string
    languageCode: string
    header: SendTemplateWhatsappVariable[]
    body: SendTemplateWhatsappVariable[]
    buttons: SendTemplateWhatsappButton[]
  } | null
  email: {
    subjectTemplate: string
    htmlTemplate: string
    textTemplate: string
  } | null
  createdAt: string
  updatedAt: string
}

export type SendCampaign = {
  id: string
  name: string
  channel: SendCampaignChannel
  audience: 'active_subscribers'
  status: SendCampaignStatus
  templateId: string | null
  templateSnapshot: {
    templateId: string | null
    templateName: string
    channel: SendCampaignChannel
    whatsapp: SendTemplate['whatsapp']
    email: SendTemplate['email']
  }
  variableValues: Record<string, string>
  metrics: {
    recipients: number
    accepted: number
    failed: number
  }
  sentAt: string | null
  lastError: string | null
  lastTestedAt: string | null
  lastTestStatus: 'success' | 'failed' | null
  lastTestRecipient: string | null
  lastTestError: string | null
  createdAt: string
  updatedAt: string
}

export type SendWorkspaceResponse = {
  campaigns: SendCampaign[]
  templates: SendTemplate[]
  audience: {
    email: number
    whatsapp: number
  }
  settings: {
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
  }
}

export async function fetchAdminSendWorkspace(fallbackMessage: string) {
  const response = await apiFetch('/admin/send-workspace', { cache: 'no-store' })

  if (!response.ok) {
    throw new Error(await readApiError(response, fallbackMessage))
  }

  return (await response.json()) as SendWorkspaceResponse
}

export async function saveAdminSendSettings(
  payload:
    | {
        provider: 'whatsapp'
        phoneNumberId?: string
        graphApiVersion?: string
        accessToken?: string
      }
    | {
        provider: 'mailersend'
        fromEmail?: string
        fromName?: string
        replyToEmail?: string
        replyToName?: string
        apiKey?: string
      },
  fallbackMessage: string,
) {
  const response = await apiFetch('/admin/send-settings', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(await readApiError(response, fallbackMessage))
  }

  return (await response.json()) as {
    settings: SendWorkspaceResponse['settings']
  }
}

export async function upsertAdminSendTemplate(
  payload:
    | {
        templateId?: string | null
        name: string
        description?: string
        channel: 'whatsapp'
        whatsapp: NonNullable<SendTemplate['whatsapp']>
      }
    | {
        templateId?: string | null
        name: string
        description?: string
        channel: 'email'
        email: NonNullable<SendTemplate['email']>
      },
  fallbackMessage: string,
) {
  const response = await apiFetch('/admin/send-templates', {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      templateId: payload.templateId ?? undefined,
    }),
  })

  if (!response.ok) {
    throw new Error(await readApiError(response, fallbackMessage))
  }

  return (await response.json()) as {
    template: SendTemplate
  }
}

export async function runAdminSendCampaignAction(
  payload: {
    action: 'save' | 'test' | 'send'
    campaignId?: string | null
    templateId: string
    name: string
    channel: SendCampaignChannel
    testRecipient?: string
    variableValues: Record<string, string>
  },
  fallbackMessage: string,
) {
  const response = await apiFetch('/admin/send-campaigns', {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      campaignId: payload.campaignId ?? undefined,
    }),
  })

  if (!response.ok) {
    throw new Error(await readApiError(response, fallbackMessage))
  }

  return (await response.json()) as {
    campaign: SendCampaign
  }
}
