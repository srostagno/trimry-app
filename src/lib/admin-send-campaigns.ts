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
  deliveryAutomation: DailyDeliveryAutomationSettings
}

export type WeeklyDispatchJobStatus =
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed'

export type DailyDeliveryAutomationSettings = {
  enabled: boolean
  createdAt: string | null
  updatedAt: string | null
  updatedByUserId: string | null
  lastTriggeredAt: string | null
  lastCompletedAt: string | null
  lastJobId: string | null
  lastRunStatus: WeeklyDispatchJobStatus | 'skipped' | null
  lastRunMessage: string | null
}

export type WeeklyDispatchJob = {
  id: string
  status: WeeklyDispatchJobStatus
  dryRun: boolean
  limit: number
  createdAt: string
  updatedAt: string
  startedAt: string | null
  completedAt: string | null
  dueCount: number
  processedCount: number
  failedCount: number
  currentSubscriptionId: string | null
  currentUserId: string | null
  currentDeliveryPreference: 'email' | 'whatsapp' | 'both' | null
  currentChannel: 'email' | 'whatsapp' | 'both' | null
  currentRecipientLabel: string | null
  message: string | null
  result: {
    now: string
    dryRun: boolean
    dueCount: number
    processedCount: number
    failedCount: number
  } | null
  error: string | null
}

export async function fetchAdminSendWorkspace(fallbackMessage: string) {
  const response = await apiFetch('/admin/send-workspace', {
    cache: 'no-store',
  })

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

export async function updateAdminDailyDeliveryAutomation(
  payload: {
    enabled: boolean
  },
  fallbackMessage: string,
) {
  const response = await apiFetch('/admin/send-daily-delivery-automation', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(await readApiError(response, fallbackMessage))
  }

  return (await response.json()) as {
    ok: true
    deliveryAutomation: DailyDeliveryAutomationSettings
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

export async function triggerAdminWelcomeFlowTest(fallbackMessage: string) {
  const response = await apiFetch('/admin/subscriptions/trigger-welcome-flow', {
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error(await readApiError(response, fallbackMessage))
  }

  return (await response.json()) as {
    ok: true
    subscriptionId: string
    greetingsTemplateSent: boolean
    greetingsTemplateError: string | null
    whatsappProjectionSent: boolean
    emailProjectionSent: boolean
  }
}

export async function sendAdminDailyProjectionTemplateTest(
  payload: {
    recipient: string
    externalTemplateName: string
    languageCode: string
  },
  fallbackMessage: string,
) {
  const response = await apiFetch(
    '/admin/send-daily-projection-template-test',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  )

  if (!response.ok) {
    throw new Error(await readApiError(response, fallbackMessage))
  }

  return (await response.json()) as {
    ok: true
    providerMessageId: string | null
    templateName: string
    languageCode: string
    dayKey: string
    usedFallbackBirthDate: boolean
    variableValues: Record<string, string>
  }
}

export async function startAdminWeeklyDispatch(
  fallbackMessage: string,
  payload: {
    dryRun?: boolean
    limit?: number
  } = {},
) {
  const response = await apiFetch('/admin/subscriptions/run-weekly-dispatch', {
    method: 'POST',
    body: JSON.stringify({
      dryRun: payload.dryRun,
      limit: payload.limit,
    }),
  })

  if (!response.ok) {
    throw new Error(await readApiError(response, fallbackMessage))
  }

  return (await response.json()) as {
    ok: true
    reused: boolean
    job: WeeklyDispatchJob
  }
}

export async function fetchAdminWeeklyDispatchJob(
  jobId: string,
  fallbackMessage: string,
) {
  const response = await apiFetch(
    `/admin/subscriptions/run-weekly-dispatch/${jobId}`,
    {
      cache: 'no-store',
    },
  )

  if (!response.ok) {
    throw new Error(await readApiError(response, fallbackMessage))
  }

  return (await response.json()) as {
    ok: true
    job: WeeklyDispatchJob
  }
}
