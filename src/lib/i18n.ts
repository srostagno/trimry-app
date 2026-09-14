export const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'pt', label: 'Português' },
] as const

export type LanguageCode = (typeof LANGUAGE_OPTIONS)[number]['code']

const SPANISH_SPEAKING_COUNTRY_CODES = new Set([
  'AR', 'BO', 'CL', 'CO', 'CR', 'CU', 'DO', 'EC', 'ES', 'GQ', 'GT', 'HN', 'MX',
  'NI', 'PA', 'PE', 'PR', 'PY', 'SV', 'UY', 'VE',
])

const PORTUGUESE_SPEAKING_COUNTRY_CODES = new Set([
  'AO', 'BR', 'CV', 'GW', 'MO', 'MZ', 'PT', 'ST', 'TL',
])

type LegalSection = {
  title: string
  body: string
}

export type MessageSection = {
  common: {
    loading: string
    saving: string
    previous: string
    next: string
    back: string
    cancel: string
    continue: string
    backToLogin: string
    backToDashboard: string
    tryAgain: string
    returnHome: string
    save: string
    remove: string
    search: string
    close: string
  }
  languageSwitcher: {
    label: string
  }
  nav: {
    home: string
    howItWorks: string
    sports: string
    pricing: string
    faq: string
    login: string
    register: string
    dashboard: string
    profile: string
    logout: string
    startFree: string
  }
  footer: {
    rightsReserved: string
    companyNumber: string
    registeredOffice: string
    operationsOffice: string
    contact: string
    tagline: string
    dataSource: string
  }
  home: {
    badge: string
    title: string
    titleHighlight: string
    subtitle: string
    primaryCta: string
    secondaryCta: string
    trustLine: string
    previewEyebrow: string
    previewTitle: string
    previewSubtitle: string
    previewEmpty: string
    previewWarming: string
    previewLoading: string
    previewError: string
    previewTimeZoneNote: string
    stepsEyebrow: string
    stepsTitle: string
    steps: Array<{ title: string; text: string }>
    channelsEyebrow: string
    channelsTitle: string
    channels: Array<{ title: string; text: string }>
    scoutEyebrow: string
    scoutTitle: string
    scoutText: string
    scoutBullets: string[]
    scoutCta: string
    finalTitle: string
    finalSubtitle: string
  }
  pricing: {
    eyebrow: string
    title: string
    subtitle: string
    planTitle: string
    billing: string
    trialNote: string
    includes: string[]
    cta: string
    cancelNote: string
  }
  faq: {
    title: string
    items: Array<{ question: string; answer: string }>
  }
  auth: {
    registerTitle: string
    registerSubtitle: string
    loginTitle: string
    loginSubtitle: string
    loginWithLinkHint: string
    loginWithLinkButton: string
    loginWithLinkSending: string
    loginWithLinkSent: string
    loginWithLinkConsuming: string
    loginWithLinkInvalid: string
    loginWithLinkDivider: string
    firstNameLabel: string
    lastNameLabel: string
    timeZoneLabel: string
    timeZoneHint: string
    emailLabel: string
    emailHint: string
    passwordLabel: string
    whatsappLabel: string
    passwordHint: string
    registerButton: string
    loginButton: string
    needAccount: string
    alreadyHaveAccount: string
    invalidEmail: string
    termsNotice: string
  }
  onboarding: {
    title: string
    stepLabel: string
    steps: [string, string, string, string]
    sportsTitle: string
    sportsSubtitle: string
    sportsEmpty: string
    teamsTitle: string
    teamsSubtitle: string
    teamsSearchLabel: string
    teamsSearchPlaceholder: string
    teamsSearching: string
    teamsNoResults: string
    teamsFollowing: string
    leaguesTitle: string
    leaguesHint: string
    leaguesLoading: string
    leaguesFilterPlaceholder: string
    featuredLabel: string
    followedLabel: string
    followLabel: string
    unfollowLabel: string
    skipTeamsHint: string
    accountTitle: string
    accountSubtitle: string
    accountExistingHint: string
    deliveryTitle: string
    deliverySubtitle: string
    frequencyLabel: string
    frequencyDaily: string
    frequencyDailyHint: string
    frequencyWeekly: string
    frequencyWeeklyHint: string
    lookaheadLabel: string
    lookaheadHint: string
    lookaheadDays: string
    channelLabel: string
    hourLabel: string
    hourHint: string
    whatsappNumberLabel: string
    whatsappConsentLabel: string
    whatsappConsentHint: string
    whatsappConsentError: string
    reviewTitle: string
    reviewSubtitle: string
    reviewSports: string
    reviewLeagues: string
    reviewTeams: string
    reviewFrequency: string
    reviewChannel: string
    reviewTiming: string
    reviewPreviewTitle: string
    reviewPreviewEmpty: string
    startTrialCta: string
    startTrialHint: string
    savePreferencesCta: string
    saving: string
    saveError: string
    registerError: string
    previewEyebrow: string
  }
  deliveryChannels: {
    noneTitle: string
    noneDescription: string
    bothTitle: string
    bothDescription: string
    emailTitle: string
    emailDescription: string
    whatsappTitle: string
    whatsappDescription: string
    whatsappPendingNote: string
  }
  delivery: {
    badge: string
    title: string
    subtitle: string
    emailLabel: string
    channelLabel: string
    scheduleLabel: string
    consentLabel: string
    consentHint: string
    saveButton: string
    savingButton: string
    backButton: string
    confirmBadge: string
    confirmTitle: string
    confirmSubtitle: string
    confirmBackButton: string
    success: string
    help: string
    editMode: string
    whatsappNumberLabel: string
    whatsappOptional: string
    loadError: string
    consentError: string
    saveError: string
    loading: string
    redirecting: string
  }
  checkout: {
    badge: string
    badgeCancelled: string
    title: string
    titleCancelled: string
    subtitle: string
    subtitleCancelled: string
    openError: string
    resumeTitle: string
    resumeSubtitle: string
    resumeButton: string
    resumeHint: string
    deliveryLabel: string
    timingLabel: string
    helper: string
    unsubscribeHelp: string
    trialHighlights: string[]
  }
  agenda: {
    title: string
    subtitle: string
    refresh: string
    refreshing: string
    empty: string
    emptyNoPreferences: string
    emptyCta: string
    today: string
    tomorrow: string
    timeTbc: string
    followedTeam: string
    followedLeague: string
    sportWide: string
    lookahead: string
    days: string
    timeZoneNote: string
    highlightsTitle: string
    countLabel: string
    lastDigestLabel: string
    lastDigestNever: string
    loadError: string
  }
  dashboard: {
    title: string
    intro: string
    adminBadge: string
    loading: string
    noData: string
    tabs: {
      agenda: string
      preferences: string
      delivery: string
      account: string
      sends: string
      sportsSync: string
    }
    preferencesTitle: string
    preferencesSubtitle: string
    preferencesSaved: string
    preferencesSaveError: string
    status: string
    nextMessage: string
    subscribeButton: string
    noSubscription: string
    noSubscriptionSubtitle: string
    paymentPending: string
    paymentIssue: string
    billingSuccess: string
    profileTitle: string
    profileSubtitle: string
    profileSave: string
    profileTimeZoneHint: string
    passwordTitle: string
    passwordSubtitle: string
    currentPasswordLabel: string
    newPasswordLabel: string
    confirmPasswordLabel: string
    passwordSave: string
    passwordSuccess: string
    passwordMismatchError: string
    passwordDifferentError: string
    passwordSaveError: string
    dangerTitle: string
    dangerSubtitle: string
    deleteButton: string
    deleteLoading: string
    deleteConfirm: string
    deleteError: string
    deliveryHourLabel: string
    deliveryHourHint: string
    emailDeliveryLabel: string
    whatsappOffSetup: string
    whatsappConsentLabel: string
    whatsappConsentHint: string
    whatsappConsentError: string
    pendingTitle: string
    pendingSubtitle: string
    pendingDeliveryPreferenceLabel: string
    pendingEmailDeliveryLabel: string
    pendingTimingLabel: string
    pendingWhatsappLabel: string
    activePlanTitle: string
    canceledPlanTitle: string
    canceledNote: string
    activeNote: string
    deliveryPreferenceLabel: string
    nextMessageIfReactivated: string
    saveDeliverySettings: string
    sendNowButton: string
    sendNowSending: string
    sendNowSuccess: string
    sendNowWhatsappPending: string
    reactivateButton: string
    reactivateLoading: string
    cancelButton: string
    cancelLoading: string
    manageBillingButton: string
    manageBillingLoading: string
    billingFootnoteCanceled: string
    billingFootnoteActive: string
    cancelConfirm: string
    cancelSuccess: string
    cancelError: string
    reactivateError: string
    openBillingError: string
    sportsSync: {
      title: string
      subtitle: string
      runButton: string
      forceButton: string
      running: string
      eventCount: string
      upcomingCount: string
      lastFetched: string
      providerNote: string
      summary: string
      statesTitle: string
      loadError: string
    }
    sendCampaigns: {
      settingsTitle: string
      settingsSubtitle: string
      settingsWhatsappTitle: string
      settingsMailersendTitle: string
      settingsStored: string
      settingsMissing: string
      settingsSave: string
      settingsSaved: string
      title: string
      subtitle: string
      templateEditorTitle: string
      templateEditorSubtitle: string
      templateSave: string
      templateSaveBusy: string
      templateSaved: string
      createNew: string
      currentDraft: string
      nameLabel: string
      whatsappReferenceNameLabel: string
      campaignNameLabel: string
      templateDescriptionLabel: string
      channelLabel: string
      channelWhatsapp: string
      channelEmail: string
      audienceTitle: string
      audienceHint: string
      eligibleRecipients: string
      variableValuesTitle: string
      variableValuesSubtitle: string
      noVariables: string
      testingLabel: string
      testingPlaceholderWhatsapp: string
      testingPlaceholderEmail: string
      testingHintWhatsapp: string
      testingHintEmail: string
      saveDraft: string
      saveDraftBusy: string
      sendTest: string
      sendTestBusy: string
      sendCampaign: string
      sendCampaignBusy: string
      externalTemplateNameLabel: string
      externalTemplateNameHint: string
      whatsappLanguageLabel: string
      headerTextLabel: string
      bodyTextLabel: string
      whatsappSectionHint: string
      whatsappButtonHint: string
      buttonsTitle: string
      addVariable: string
      addButton: string
      removeVariable: string
      removeButton: string
      variableKeyLabel: string
      variableContentLabel: string
      emailSubjectLabel: string
      emailHtmlLabel: string
      emailTextLabel: string
      emailTemplateGeneratorTitle: string
      emailTemplateGeneratorHint: string
      emailGenerateTemplate: string
      emailTemplateGenerated: string
      historyTitle: string
      historySubtitle: string
      emptyState: string
      metricsRecipients: string
      metricsAccepted: string
      metricsFailed: string
      sentAt: string
      updatedAt: string
      lastTestedAt: string
      lastTestRecipient: string
      notSentYet: string
      neverTested: string
      draftStatus: string
      sentStatus: string
      partiallySentStatus: string
      failedStatus: string
      loadError: string
      saveSuccess: string
      testSuccess: string
      sendSuccess: string
      sendPartial: string
      sendFailed: string
    }
  }
  scout: {
    name: string
    launcherLabel: string
    launcherSubLabel: string
    title: string
    introAnonymous: string
    introAccount: string
    introActive: string
    prompts: string[]
    placeholder: string
    send: string
    typing: string
    issue: string
    memorySaved: string
    temporaryMemory: string
    alertsActive: string
    alertsInactive: string
    createAccount: string
    activateAlerts: string
    openDashboard: string
    whatsappCta: string
    preferencesUpdated: string
  }
  statuses: {
    active: string
    paused: string
    canceled: string
  }
  legal: {
    terms: string
    privacy: string
    disclaimer: string
    dataDeletion: string
    englishNotice: string
    termsSections: LegalSection[]
    privacySections: LegalSection[]
    disclaimerSections: LegalSection[]
    dataDeletionSections: LegalSection[]
  }
  cookieConsent: {
    title: string
    description: string
    accept: string
    decline: string
    learnMore: string
  }
  notifications: {
    success: string
    error: string
  }
  notFound: {
    title: string
    description: string
    cta: string
  }
}

const sendCampaignsEn: MessageSection['dashboard']['sendCampaigns'] = {
  settingsTitle: 'Provider settings',
  settingsSubtitle:
    'Store WhatsApp Cloud API and MailerSend credentials in MongoDB. Secret values stay blank in the form unless you want to replace them.',
  settingsWhatsappTitle: 'WhatsApp settings',
  settingsMailersendTitle: 'MailerSend settings',
  settingsStored: 'Stored',
  settingsMissing: 'Missing',
  settingsSave: 'Save settings',
  settingsSaved: 'Provider settings saved.',
  title: 'Admin sends',
  subtitle:
    'Create WhatsApp and email campaigns for active subscribers, run a testing delivery first, then send the live campaign from the dashboard.',
  templateEditorTitle: 'Send setup',
  templateEditorSubtitle:
    'For email you can save the content here. For WhatsApp you do not edit the Meta template here: you only save its exact Meta name, language, and the `key: content` values you want to reuse in testing and sending.',
  templateSave: 'Save setup',
  templateSaveBusy: 'Saving setup',
  templateSaved: 'Setup saved.',
  createNew: 'New campaign',
  currentDraft: 'Current setup',
  nameLabel: 'Internal reference name',
  whatsappReferenceNameLabel: 'Internal reference name (optional)',
  campaignNameLabel: 'Campaign name',
  templateDescriptionLabel: 'Template description',
  channelLabel: 'Channel',
  channelWhatsapp: 'WhatsApp',
  channelEmail: 'Email',
  audienceTitle: 'Audience',
  audienceHint:
    'Live sends target active subscribers who currently have this delivery channel enabled.',
  eligibleRecipients: 'Eligible recipients right now: {count}',
  variableValuesTitle: 'Testing data and variables',
  variableValuesSubtitle:
    'Each template variable appears here. For WhatsApp, the saved content from each section is loaded here first, and you can adjust it before testing or sending.',
  noVariables: 'This template has no dynamic variables.',
  testingLabel: 'Testing recipient',
  testingPlaceholderWhatsapp: '+14155550123',
  testingPlaceholderEmail: 'test@example.com',
  testingHintWhatsapp: 'WhatsApp testing sends the configured template directly to one number.',
  testingHintEmail:
    'Email testing sends the current subject and body to one address through MailerSend.',
  saveDraft: 'Save draft',
  saveDraftBusy: 'Saving draft',
  sendTest: 'Send testing',
  sendTestBusy: 'Sending test',
  sendCampaign: 'Send campaign',
  sendCampaignBusy: 'Sending campaign',
  externalTemplateNameLabel: 'Exact Meta template name (not ID)',
  externalTemplateNameHint:
    'WhatsApp Cloud API sends by template name and language code, not by a template ID.',
  whatsappLanguageLabel: 'Template language',
  headerTextLabel: 'Header variables',
  bodyTextLabel: 'Body variables',
  whatsappSectionHint: 'Store each entry as key and default content.',
  whatsappButtonHint:
    'Store the dynamic button variable key and the sample content you want to test.',
  buttonsTitle: 'Dynamic buttons',
  addVariable: 'Add variable',
  addButton: 'Add button',
  removeVariable: 'Remove variable',
  removeButton: 'Remove button',
  variableKeyLabel: 'Key',
  variableContentLabel: 'Content',
  emailSubjectLabel: 'Email subject',
  emailHtmlLabel: 'HTML body',
  emailTextLabel: 'Plain text body',
  emailTemplateGeneratorTitle: 'Email template generator',
  emailTemplateGeneratorHint:
    'Generate a professional Trimry email with logo, inbox-friendly structure, and a CTA to trimry.com.',
  emailGenerateTemplate: 'Generate template',
  emailTemplateGenerated: 'Email template generated.',
  historyTitle: 'Campaign history',
  historySubtitle:
    'Every saved or sent campaign stays here so you can inspect metrics and the variable values used for the send.',
  emptyState: 'No campaigns yet.',
  metricsRecipients: 'Recipients',
  metricsAccepted: 'Accepted',
  metricsFailed: 'Failed',
  sentAt: 'Sent at',
  updatedAt: 'Updated at',
  lastTestedAt: 'Last test',
  lastTestRecipient: 'Test recipient',
  notSentYet: 'Not sent yet',
  neverTested: 'Never tested',
  draftStatus: 'Draft',
  sentStatus: 'Sent',
  partiallySentStatus: 'Partially sent',
  failedStatus: 'Failed',
  loadError: 'Unable to load the admin sends workspace right now.',
  saveSuccess: 'Campaign draft saved.',
  testSuccess: 'Testing delivery processed.',
  sendSuccess: 'Campaign sent successfully.',
  sendPartial: 'Campaign finished with partial delivery failures.',
  sendFailed: 'Campaign send failed.',
}

const sendCampaignsEs: MessageSection['dashboard']['sendCampaigns'] = {
  settingsTitle: 'Settings de proveedores',
  settingsSubtitle:
    'Guarda en MongoDB las credenciales de WhatsApp Cloud API y MailerSend. Los secretos quedan vacíos en el formulario salvo que quieras reemplazarlos.',
  settingsWhatsappTitle: 'Settings de WhatsApp',
  settingsMailersendTitle: 'Settings de MailerSend',
  settingsStored: 'Guardado',
  settingsMissing: 'Falta',
  settingsSave: 'Guardar settings',
  settingsSaved: 'Settings guardados.',
  title: 'Envíos admin',
  subtitle:
    'Crea campañas de WhatsApp y mailing para suscriptores activos, prueba primero un envío de testing y luego lanza la campaña real desde el dashboard.',
  templateEditorTitle: 'Configuración de envío',
  templateEditorSubtitle:
    'Para mailing puedes guardar el contenido aquí. Para WhatsApp no editas el template de Meta acá: solo guardas su nombre exacto en Meta, el idioma y los valores `key: content` que quieres reutilizar al probar y enviar.',
  templateSave: 'Guardar configuración',
  templateSaveBusy: 'Guardando configuración',
  templateSaved: 'Configuración guardada.',
  createNew: 'Nueva campaña',
  currentDraft: 'Configuración actual',
  nameLabel: 'Nombre interno de referencia',
  whatsappReferenceNameLabel: 'Nombre interno de referencia (opcional)',
  campaignNameLabel: 'Nombre de la campaña',
  templateDescriptionLabel: 'Descripción del template',
  channelLabel: 'Canal',
  channelWhatsapp: 'WhatsApp',
  channelEmail: 'Mailing',
  audienceTitle: 'Audiencia',
  audienceHint:
    'Los envíos reales apuntan a suscriptores activos que hoy tienen este canal habilitado.',
  eligibleRecipients: 'Destinatarios elegibles ahora: {count}',
  variableValuesTitle: 'Datos de testing y variables',
  variableValuesSubtitle:
    'Cada variable del template aparece aquí. En WhatsApp, el content guardado en cada sección se carga primero y luego lo puedes ajustar antes de probar o enviar.',
  noVariables: 'Este template no tiene variables dinámicas.',
  testingLabel: 'Destino de testing',
  testingPlaceholderWhatsapp: '+56912345678',
  testingPlaceholderEmail: 'test@ejemplo.com',
  testingHintWhatsapp: 'El testing de WhatsApp envía la plantilla configurada directo a un número.',
  testingHintEmail:
    'El testing de mailing envía el asunto y contenido actual a una sola casilla por MailerSend.',
  saveDraft: 'Guardar borrador',
  saveDraftBusy: 'Guardando borrador',
  sendTest: 'Enviar testing',
  sendTestBusy: 'Enviando testing',
  sendCampaign: 'Enviar campaña',
  sendCampaignBusy: 'Enviando campaña',
  externalTemplateNameLabel: 'Nombre exacto del template en Meta (no ID)',
  externalTemplateNameHint:
    'WhatsApp Cloud API envía usando el nombre del template y el código de idioma, no un template ID.',
  whatsappLanguageLabel: 'Idioma de plantilla',
  headerTextLabel: 'Variables del header',
  bodyTextLabel: 'Variables del body',
  whatsappSectionHint: 'Guarda cada fila como key y contenido por defecto.',
  whatsappButtonHint:
    'Guarda la key del botón dinámico y el content de ejemplo que quieres usar en testing.',
  buttonsTitle: 'Botones dinámicos',
  addVariable: 'Agregar variable',
  addButton: 'Agregar botón',
  removeVariable: 'Eliminar variable',
  removeButton: 'Eliminar botón',
  variableKeyLabel: 'Key',
  variableContentLabel: 'Content',
  emailSubjectLabel: 'Asunto del email',
  emailHtmlLabel: 'Cuerpo HTML',
  emailTextLabel: 'Cuerpo texto plano',
  emailTemplateGeneratorTitle: 'Generador de plantilla email',
  emailTemplateGeneratorHint:
    'Genera un email profesional de Trimry con logo, estructura amigable para inbox y CTA a trimry.com.',
  emailGenerateTemplate: 'Generar plantilla',
  emailTemplateGenerated: 'Plantilla generada.',
  historyTitle: 'Historial de campañas',
  historySubtitle:
    'Cada campaña guardada o enviada queda aquí para revisar métricas y los valores variables usados en el envío.',
  emptyState: 'Aún no hay campañas.',
  metricsRecipients: 'Destinatarios',
  metricsAccepted: 'Aceptados',
  metricsFailed: 'Fallidos',
  sentAt: 'Enviada el',
  updatedAt: 'Actualizada el',
  lastTestedAt: 'Último test',
  lastTestRecipient: 'Destino de test',
  notSentYet: 'Todavía no enviada',
  neverTested: 'Nunca probada',
  draftStatus: 'Borrador',
  sentStatus: 'Enviada',
  partiallySentStatus: 'Envío parcial',
  failedStatus: 'Fallida',
  loadError: 'No pudimos cargar el espacio admin de envíos en este momento.',
  saveSuccess: 'Borrador guardado.',
  testSuccess: 'El envío de testing fue procesado.',
  sendSuccess: 'La campaña fue enviada correctamente.',
  sendPartial: 'La campaña terminó con fallas parciales de entrega.',
  sendFailed: 'El envío de la campaña falló.',
}

const legalEn: MessageSection['legal'] = {
  terms: 'Terms of Service',
  privacy: 'Privacy Policy',
  disclaimer: 'Data & accuracy notice',
  dataDeletion: 'Data deletion',
  englishNotice: 'The legally binding version of this document is the English version.',
  termsSections: [
    {
      title: '1. Service',
      body: 'Trimry provides a personalized agenda of upcoming sports events (matches, races, fights and tournaments) based on the sports, leagues and teams you choose, delivered through the website, email and WhatsApp, plus a conversational assistant ("Scout").',
    },
    {
      title: '2. Subscription and billing',
      body: 'Alerts by email and WhatsApp require a paid subscription processed by Stripe. Prices are shown before checkout and billed on a recurring basis until canceled. New subscriptions may include a free trial; if you do not cancel before it ends, the subscription renews automatically at the listed price.',
    },
    {
      title: '3. Cancel anytime',
      body: 'You can cancel from the dashboard, from the Stripe billing portal, by replying STOP on WhatsApp or by emailing support@trimry.com. Cancellation stops future charges; the current period stays active until its end date.',
    },
    {
      title: '4. Account responsibilities',
      body: 'Keep your credentials safe and your contact details accurate. You are responsible for activity performed with your account and for having the right to receive messages at the phone number you provide.',
    },
    {
      title: '5. Service limitations',
      body: 'Fixtures, times and venues come from third-party sports data providers and can change without notice (postponements, TV rescheduling, time zone edge cases). Trimry does not guarantee completeness or accuracy and is not liable for missed events, broadcasting availability or decisions taken based on the agenda.',
    },
    {
      title: '6. Acceptable use',
      body: 'Do not abuse the service, scrape the data, resell alerts or use the assistant for unlawful purposes. We may suspend accounts that breach these terms.',
    },
    {
      title: '7. Changes',
      body: 'We may update these terms as the service evolves. Continued use after an update means you accept the new terms.',
    },
  ],
  privacySections: [
    {
      title: 'Data we collect',
      body: 'Account data (name, email, optional WhatsApp number, time zone, language), the sports, leagues and teams you follow, delivery preferences, subscription status, and the messages you exchange with Scout on the web or WhatsApp.',
    },
    {
      title: 'How we use it',
      body: 'To build and deliver your personalized agenda, operate the assistant, process billing, prevent abuse and improve the product. Chat memory summaries help the assistant remember your preferences; they never include payment data.',
    },
    {
      title: 'Third parties',
      body: 'Stripe (billing), MailerSend (email), Meta WhatsApp Cloud API (messaging), OpenAI (assistant, digest copy and schedule lookups through web search; only the conversation and your sports preferences are shared), Google Analytics and Meta Pixel (measurement).',
    },
    {
      title: 'Retention and rights',
      body: 'Data is kept while your account is active and for the legal retention period afterwards. You can export, correct or delete your data from the dashboard or by emailing support@trimry.com.',
    },
    {
      title: 'Cookies',
      body: 'We use essential cookies for authentication and, with your consent, analytics cookies for measurement.',
    },
  ],
  disclaimerSections: [
    {
      title: 'Where the data comes from',
      body: 'Schedules are collected from official league, team and broadcaster websites using AI-assisted web search, cached and refreshed several times a day. Kickoff times are converted to the time zone saved on your account.',
    },
    {
      title: 'Things can change',
      body: 'Postponements, weather, broadcaster changes and late reschedules happen. Always confirm with the official competition or broadcaster before travelling or paying for access.',
    },
    {
      title: 'No betting advice',
      body: 'Trimry does not provide odds, predictions or betting recommendations. Scout only reports scheduled events from tracked sources.',
    },
  ],
  dataDeletionSections: [
    {
      title: 'Delete from the dashboard',
      body: 'Open Dashboard → Account → Danger zone and confirm "Delete account". This cancels any Stripe subscription, revokes sessions, removes your sports preferences and anonymizes your email.',
    },
    {
      title: 'Request by email',
      body: 'Write to support@trimry.com from the email registered on your account. We process deletion requests within 30 days.',
    },
    {
      title: 'What may be retained',
      body: 'Billing records required by law and anonymized delivery logs may be retained for the legally required period.',
    },
  ],
}

const legalEs: MessageSection['legal'] = {
  terms: 'Términos del servicio',
  privacy: 'Política de privacidad',
  disclaimer: 'Aviso de datos y precisión',
  dataDeletion: 'Eliminación de datos',
  englishNotice: 'La versión legalmente vinculante de este documento es la versión en inglés.',
  termsSections: [
    {
      title: '1. Servicio',
      body: 'Trimry entrega una agenda personalizada de eventos deportivos (partidos, carreras, peleas y torneos) según los deportes, ligas y equipos que eliges, a través del sitio web, email y WhatsApp, además de un asistente conversacional ("Scout").',
    },
    {
      title: '2. Suscripción y cobros',
      body: 'Las alertas por email y WhatsApp requieren una suscripción de pago procesada por Stripe. Los precios se muestran antes del checkout y se cobran de forma recurrente hasta que canceles. Las nuevas suscripciones pueden incluir un periodo de prueba gratis; si no cancelas antes de que termine, se renueva automáticamente al precio indicado.',
    },
    {
      title: '3. Cancela cuando quieras',
      body: 'Puedes cancelar desde el panel, desde el portal de facturación de Stripe, respondiendo STOP por WhatsApp o escribiendo a support@trimry.com. La cancelación detiene los cobros futuros; el periodo actual sigue activo hasta su fecha de fin.',
    },
    {
      title: '4. Responsabilidades de la cuenta',
      body: 'Mantén tus credenciales seguras y tus datos de contacto actualizados. Eres responsable de la actividad realizada con tu cuenta y de tener derecho a recibir mensajes en el número que indicas.',
    },
    {
      title: '5. Limitaciones del servicio',
      body: 'Los horarios, fechas y sedes provienen de proveedores de datos deportivos externos y pueden cambiar sin aviso (postergaciones, cambios de TV, casos límite de zona horaria). Trimry no garantiza completitud ni exactitud y no es responsable por eventos perdidos, disponibilidad de transmisiones o decisiones tomadas en base a la agenda.',
    },
    {
      title: '6. Uso aceptable',
      body: 'No abuses del servicio, no extraigas los datos, no revendas alertas ni uses el asistente para fines ilícitos. Podemos suspender cuentas que incumplan estos términos.',
    },
    {
      title: '7. Cambios',
      body: 'Podemos actualizar estos términos a medida que el servicio evoluciona. Seguir usándolo tras una actualización implica aceptar los nuevos términos.',
    },
  ],
  privacySections: [
    {
      title: 'Datos que recopilamos',
      body: 'Datos de cuenta (nombre, email, número de WhatsApp opcional, zona horaria, idioma), los deportes, ligas y equipos que sigues, preferencias de entrega, estado de suscripción y los mensajes que intercambias con Scout en la web o WhatsApp.',
    },
    {
      title: 'Cómo los usamos',
      body: 'Para construir y entregar tu agenda personalizada, operar el asistente, procesar cobros, prevenir abusos y mejorar el producto. Los resúmenes de memoria del chat ayudan al asistente a recordar tus preferencias; nunca incluyen datos de pago.',
    },
    {
      title: 'Terceros',
      body: 'Stripe (cobros), MailerSend (email), Meta WhatsApp Cloud API (mensajería), OpenAI (asistente, redacción del digest y búsqueda de calendarios en la web; solo se comparte la conversación y tus preferencias deportivas), Google Analytics y Meta Pixel (medición).',
    },
    {
      title: 'Retención y derechos',
      body: 'Los datos se conservan mientras tu cuenta esté activa y durante el periodo legal posterior. Puedes exportar, corregir o eliminar tus datos desde el panel o escribiendo a support@trimry.com.',
    },
    {
      title: 'Cookies',
      body: 'Usamos cookies esenciales para autenticación y, con tu consentimiento, cookies de analítica para medición.',
    },
  ],
  disclaimerSections: [
    {
      title: 'De dónde salen los datos',
      body: 'Los calendarios se recopilan desde los sitios oficiales de ligas, equipos y canales mediante búsqueda web asistida por IA, se guardan en caché y se actualizan varias veces al día. Las horas se convierten a la zona horaria guardada en tu cuenta.',
    },
    {
      title: 'Las cosas cambian',
      body: 'Hay postergaciones, clima, cambios de transmisión y reprogramaciones de último minuto. Confirma siempre con la competición o el canal oficial antes de viajar o pagar por un acceso.',
    },
    {
      title: 'Sin consejos de apuestas',
      body: 'Trimry no entrega cuotas, pronósticos ni recomendaciones de apuestas. Scout solo informa eventos programados desde fuentes rastreadas.',
    },
  ],
  dataDeletionSections: [
    {
      title: 'Eliminar desde el panel',
      body: 'Abre Panel → Cuenta → Zona de peligro y confirma "Eliminar cuenta". Esto cancela cualquier suscripción de Stripe, revoca sesiones, borra tus preferencias deportivas y anonimiza tu email.',
    },
    {
      title: 'Solicitar por email',
      body: 'Escribe a support@trimry.com desde el email registrado en tu cuenta. Procesamos las solicitudes de eliminación en un plazo de 30 días.',
    },
    {
      title: 'Qué puede conservarse',
      body: 'Los registros de facturación exigidos por ley y los logs de entrega anonimizados pueden conservarse durante el periodo legal requerido.',
    },
  ],
}

const legalPt: MessageSection['legal'] = {
  terms: 'Termos de serviço',
  privacy: 'Política de privacidade',
  disclaimer: 'Aviso de dados e precisão',
  dataDeletion: 'Exclusão de dados',
  englishNotice: 'A versão legalmente vinculante deste documento é a versão em inglês.',
  termsSections: [
    {
      title: '1. Serviço',
      body: 'A Trimry entrega uma agenda personalizada de eventos esportivos (jogos, corridas, lutas e torneios) com base nos esportes, ligas e times que você escolhe, pelo site, email e WhatsApp, além de um assistente conversacional ("Scout").',
    },
    {
      title: '2. Assinatura e cobrança',
      body: 'Alertas por email e WhatsApp exigem uma assinatura paga processada pela Stripe. Os preços aparecem antes do checkout e são cobrados de forma recorrente até o cancelamento. Novas assinaturas podem incluir um período de teste gratuito; se você não cancelar antes do fim, a assinatura renova automaticamente pelo preço indicado.',
    },
    {
      title: '3. Cancele quando quiser',
      body: 'Você pode cancelar pelo painel, pelo portal de cobrança da Stripe, respondendo STOP no WhatsApp ou escrevendo para support@trimry.com. O cancelamento interrompe cobranças futuras; o período atual continua ativo até a data de término.',
    },
    {
      title: '4. Responsabilidades da conta',
      body: 'Mantenha suas credenciais seguras e seus dados de contato corretos. Você é responsável pela atividade realizada com sua conta e por ter o direito de receber mensagens no número informado.',
    },
    {
      title: '5. Limitações do serviço',
      body: 'Horários, datas e locais vêm de provedores externos de dados esportivos e podem mudar sem aviso (adiamentos, mudanças de TV, casos de fuso horário). A Trimry não garante completude ou exatidão e não se responsabiliza por eventos perdidos, disponibilidade de transmissão ou decisões tomadas com base na agenda.',
    },
    {
      title: '6. Uso aceitável',
      body: 'Não abuse do serviço, não extraia os dados, não revenda alertas nem use o assistente para fins ilícitos. Podemos suspender contas que violem estes termos.',
    },
    {
      title: '7. Alterações',
      body: 'Podemos atualizar estes termos conforme o serviço evolui. Continuar usando após uma atualização significa aceitar os novos termos.',
    },
  ],
  privacySections: [
    {
      title: 'Dados que coletamos',
      body: 'Dados da conta (nome, email, número de WhatsApp opcional, fuso horário, idioma), os esportes, ligas e times que você acompanha, preferências de entrega, status da assinatura e as mensagens trocadas com o Scout na web ou no WhatsApp.',
    },
    {
      title: 'Como usamos',
      body: 'Para montar e entregar sua agenda personalizada, operar o assistente, processar cobranças, prevenir abusos e melhorar o produto. Resumos de memória do chat ajudam o assistente a lembrar suas preferências; nunca incluem dados de pagamento.',
    },
    {
      title: 'Terceiros',
      body: 'Stripe (cobrança), MailerSend (email), Meta WhatsApp Cloud API (mensagens), OpenAI (assistente, texto do digest e busca de calendários na web; apenas a conversa e suas preferências esportivas são compartilhadas), Google Analytics e Meta Pixel (medição).',
    },
    {
      title: 'Retenção e direitos',
      body: 'Os dados são mantidos enquanto sua conta estiver ativa e pelo período legal posterior. Você pode exportar, corrigir ou excluir seus dados pelo painel ou escrevendo para support@trimry.com.',
    },
    {
      title: 'Cookies',
      body: 'Usamos cookies essenciais para autenticação e, com seu consentimento, cookies de analytics para medição.',
    },
  ],
  disclaimerSections: [
    {
      title: 'De onde vêm os dados',
      body: 'Os calendários são coletados dos sites oficiais de ligas, times e emissoras com busca na web assistida por IA, armazenados em cache e atualizados várias vezes ao dia. Os horários são convertidos para o fuso salvo na sua conta.',
    },
    {
      title: 'As coisas mudam',
      body: 'Adiamentos, clima, mudanças de transmissão e remarcações de última hora acontecem. Confirme sempre com a competição ou emissora oficial antes de viajar ou pagar por acesso.',
    },
    {
      title: 'Sem dicas de apostas',
      body: 'A Trimry não fornece odds, previsões nem recomendações de apostas. O Scout só informa eventos agendados a partir de fontes rastreadas.',
    },
  ],
  dataDeletionSections: [
    {
      title: 'Excluir pelo painel',
      body: 'Abra Painel → Conta → Zona de perigo e confirme "Excluir conta". Isso cancela qualquer assinatura Stripe, revoga sessões, remove suas preferências esportivas e anonimiza seu email.',
    },
    {
      title: 'Solicitar por email',
      body: 'Escreva para support@trimry.com a partir do email registrado na sua conta. Processamos pedidos de exclusão em até 30 dias.',
    },
    {
      title: 'O que pode ser mantido',
      body: 'Registros de cobrança exigidos por lei e logs de entrega anonimizados podem ser mantidos pelo período legal necessário.',
    },
  ],
}

const en: MessageSection = {
  common: {
    loading: 'Loading...',
    saving: 'Saving...',
    previous: 'Previous',
    next: 'Next',
    back: 'Back',
    cancel: 'Cancel',
    continue: 'Continue',
    backToLogin: 'Back to login',
    backToDashboard: 'Back to dashboard',
    tryAgain: 'Try again',
    returnHome: 'Return home',
    save: 'Save',
    remove: 'Remove',
    search: 'Search',
    close: 'Close',
  },
  languageSwitcher: { label: 'Lang' },
  nav: {
    home: 'Home',
    howItWorks: 'How it works',
    sports: 'Sports',
    pricing: 'Pricing',
    faq: 'FAQ',
    login: 'Log in',
    register: 'Create account',
    dashboard: 'Dashboard',
    profile: 'My account',
    logout: 'Log out',
    startFree: 'Start free',
  },
  footer: {
    rightsReserved: 'All rights reserved.',
    companyNumber: 'Company number',
    registeredOffice: 'Registered office',
    operationsOffice: 'Operations office',
    contact: 'Contact',
    tagline: 'Your sports events radar.',
    dataSource: 'Schedules verified from official sources with AI web search. Times shown in your time zone.',
  },
  home: {
    badge: 'Sports events radar',
    title: 'Never miss a game',
    titleHighlight: 'again.',
    subtitle:
      'Pick the sports, leagues and teams you follow. Trimry sends you a personal agenda of upcoming matches, races and fights by email and WhatsApp, in your time zone.',
    primaryCta: 'Build my agenda',
    secondaryCta: 'See how it works',
    trustLine: '7-day free trial · Cancel anytime · Soccer, NBA, NFL, F1, UFC and more',
    previewEyebrow: 'Live preview',
    previewTitle: 'What is coming up this week',
    previewSubtitle: 'Pick a sport to see the real upcoming events Trimry tracks right now.',
    previewEmpty: 'No events scheduled in the next two weeks for the featured competitions of this sport.',
    previewWarming: 'Building the calendar for this sport… the first load takes about 30 seconds.',
    previewLoading: 'Loading upcoming events...',
    previewError: 'Unable to load the preview right now.',
    previewTimeZoneNote: 'Times shown in',
    stepsEyebrow: 'How it works',
    stepsTitle: 'Three steps, then it runs on its own',
    steps: [
      {
        title: 'Choose what you follow',
        text: 'Sports, leagues and teams. From the Premier League to the NBA, F1, UFC or your local club.',
      },
      {
        title: 'Pick channel and rhythm',
        text: 'Daily or weekly agenda by email, WhatsApp or both, at the hour you prefer.',
      },
      {
        title: 'Get your agenda',
        text: 'Every upcoming event, sorted by day, in your time zone. Ask Scout when in doubt.',
      },
    ],
    channelsEyebrow: 'Delivery',
    channelsTitle: 'Wherever you check first',
    channels: [
      {
        title: 'Email digest',
        text: 'A clean, scannable agenda for today and the days ahead. Team matches highlighted first.',
      },
      {
        title: 'WhatsApp',
        text: 'The same agenda as a message, plus Scout replying to "what is on tonight?".',
      },
      {
        title: 'Web dashboard',
        text: 'Your live agenda, preferences and delivery settings, always available.',
      },
    ],
    scoutEyebrow: 'Meet Scout',
    scoutTitle: 'An assistant that knows your teams',
    scoutText:
      'Scout searches teams and leagues for you, follows them with one message and answers with real fixtures from the tracked schedules. No made-up games.',
    scoutBullets: [
      '"Follow Real Madrid and the Lakers"',
      '"What is on this weekend?"',
      '"Switch me to a weekly digest on Mondays"',
    ],
    scoutCta: 'Chat with Scout',
    finalTitle: 'Your agenda, delivered.',
    finalSubtitle: 'Set it up in two minutes. Try it free for 7 days.',
  },
  pricing: {
    eyebrow: 'Pricing',
    title: 'One simple plan',
    subtitle: 'Everything included. Start with a free trial and cancel anytime.',
    planTitle: 'Trimry Sports Alerts',
    billing: '{billingInline}',
    trialNote: '{trialPeriodDays}-day free trial, then {billingCompact}.',
    includes: [
      'Unlimited sports, leagues and teams',
      'Daily or weekly agenda by email and WhatsApp',
      'Scout assistant on the web and WhatsApp',
      'Kickoff times in your time zone',
    ],
    cta: 'Start free trial',
    cancelNote: 'Cancel from the dashboard, the Stripe portal or by replying STOP on WhatsApp.',
  },
  faq: {
    title: 'Frequently asked questions',
    items: [
      {
        question: 'Which sports and leagues are supported?',
        answer:
          'Soccer, basketball, American football, baseball, ice hockey, tennis, motorsport, MMA and boxing, rugby, golf, cycling and cricket. Featured leagues include the Premier League, La Liga, Serie A, Bundesliga, Ligue 1, Champions League, MLS, Liga MX, Brasileirão, NBA, NFL, MLB, NHL, Formula 1, MotoGP and UFC, and you can search any team or competition in the catalog.',
      },
      {
        question: 'Where does the schedule data come from?',
        answer:
          'Scout reads the official league, team and broadcaster websites with AI-assisted web search, stores the fixtures in a cache and refreshes them several times a day. Times are converted to the time zone saved on your account. Postponements and late changes can happen, so always confirm with the official broadcaster.',
      },
      {
        question: 'How does the free trial work?',
        answer:
          'Start checkout with Stripe and get 7 days of alerts at no cost. Cancel before the trial ends and you will not be charged.',
      },
      {
        question: 'Can I cancel or change channels later?',
        answer:
          'Yes. Change sports, teams, frequency, hour and channel from the dashboard anytime. Cancel from the dashboard, the Stripe billing portal or by replying STOP on WhatsApp.',
      },
    ],
  },
  auth: {
    registerTitle: 'Create your account',
    registerSubtitle: 'Your name and email are enough. Your teams and delivery settings come next.',
    loginTitle: 'Welcome back',
    loginSubtitle: 'Sign in to manage your agenda and alerts.',
    loginWithLinkHint: 'Prefer passwordless access? We can email you a secure sign-in link.',
    loginWithLinkButton: 'Email me a sign-in link',
    loginWithLinkSending: 'Sending sign-in link...',
    loginWithLinkSent:
      'If this email has an account, we sent a secure sign-in link. Check inbox and spam.',
    loginWithLinkConsuming: 'Validating your secure sign-in link...',
    loginWithLinkInvalid: 'This sign-in link is invalid or expired. Request a new one.',
    loginWithLinkDivider: 'or',
    firstNameLabel: 'First name',
    lastNameLabel: 'Last name',
    timeZoneLabel: 'Time zone',
    timeZoneHint: 'We use it to show kickoff times and schedule your digest at the right local hour.',
    emailLabel: 'Email address',
    emailHint: 'We use this email for your account and for the email digest.',
    passwordLabel: 'Password',
    whatsappLabel: 'WhatsApp number',
    passwordHint: 'Minimum 10 characters, including uppercase, lowercase, and number.',
    registerButton: 'Continue',
    loginButton: 'Log in',
    needAccount: 'Need an account?',
    alreadyHaveAccount: 'Already have an account?',
    invalidEmail: 'Enter a valid email.',
    termsNotice: 'By continuing you accept the Terms of Service and Privacy Policy.',
  },
  onboarding: {
    title: 'Set up your agenda',
    stepLabel: 'Step {step} of {total}',
    steps: ['Sports', 'Teams & leagues', 'Delivery', 'Review'],
    sportsTitle: 'Which sports do you follow?',
    sportsSubtitle: 'Pick as many as you like. You can refine leagues and teams in the next step.',
    sportsEmpty: 'Pick at least one sport to continue.',
    teamsTitle: 'Teams and leagues',
    teamsSubtitle:
      'Follow specific teams for match-by-match alerts and leagues for the full fixture list. Skip this to get the featured leagues of each sport.',
    teamsSearchLabel: 'Search a team',
    teamsSearchPlaceholder: 'Real Madrid, Lakers, Ferrari, Flamengo...',
    teamsSearching: 'Searching...',
    teamsNoResults: 'No teams found. Try another spelling or the official name.',
    teamsFollowing: 'Teams you follow',
    leaguesTitle: 'Leagues',
    leaguesHint: 'Featured leagues appear first. Search the catalog for more.',
    leaguesLoading: 'Loading leagues...',
    leaguesFilterPlaceholder: 'Filter leagues...',
    featuredLabel: 'Featured',
    followedLabel: 'Following',
    followLabel: 'Follow',
    unfollowLabel: 'Unfollow',
    skipTeamsHint: 'No teams or leagues selected: you will receive the featured leagues of your sports.',
    accountTitle: 'Create your account',
    accountSubtitle: 'Save your selection and choose how to receive the agenda.',
    accountExistingHint: 'Already have an account?',
    deliveryTitle: 'How do you want the agenda?',
    deliverySubtitle: 'Choose the rhythm, the channel and the hour. You can change it anytime.',
    frequencyLabel: 'Rhythm',
    frequencyDaily: 'Daily',
    frequencyDailyHint: 'Every day: today plus the next two days.',
    frequencyWeekly: 'Weekly',
    frequencyWeeklyHint: 'Every Monday: the full week ahead.',
    lookaheadLabel: 'Dashboard lookahead',
    lookaheadHint: 'How many days your web agenda shows.',
    lookaheadDays: '{count} days',
    channelLabel: 'Channel',
    hourLabel: 'Delivery hour',
    hourHint: 'Local time in {zone}.',
    whatsappNumberLabel: 'WhatsApp number',
    whatsappConsentLabel: 'I agree to receive Trimry sports alerts on WhatsApp.',
    whatsappConsentHint: 'Required only if you choose WhatsApp delivery. Reply STOP anytime.',
    whatsappConsentError: 'Please confirm WhatsApp consent before enabling WhatsApp delivery.',
    reviewTitle: 'Review and start',
    reviewSubtitle: 'Here is your setup and a real preview of the next events on your radar.',
    reviewSports: 'Sports',
    reviewLeagues: 'Leagues',
    reviewTeams: 'Teams',
    reviewFrequency: 'Rhythm',
    reviewChannel: 'Channel',
    reviewTiming: 'Delivery',
    reviewPreviewTitle: 'Next on your radar',
    reviewPreviewEmpty: 'No events cached yet for this selection. Your agenda fills in as schedules are published.',
    startTrialCta: 'Start 7-day free trial',
    startTrialHint: 'Secure Stripe checkout. Cancel anytime.',
    savePreferencesCta: 'Save preferences',
    saving: 'Saving...',
    saveError: 'Unable to save your preferences right now.',
    registerError: 'Unable to create your account right now.',
    previewEyebrow: 'Preview',
  },
  deliveryChannels: {
    noneTitle: 'Web only',
    noneDescription: 'Use the dashboard and Scout without email or WhatsApp digests.',
    bothTitle: 'Email + WhatsApp',
    bothDescription: 'The email digest plus the same agenda as a WhatsApp message.',
    emailTitle: 'Email',
    emailDescription: 'A clean digest in your inbox. The simplest default.',
    whatsappTitle: 'WhatsApp',
    whatsappDescription: 'The agenda as a message, plus Scout on WhatsApp.',
    whatsappPendingNote:
      'WhatsApp digests start as soon as our Meta message template is approved. Email works today.',
  },
  delivery: {
    badge: 'Delivery settings',
    title: 'How should Trimry deliver your agenda?',
    subtitle: 'Email is the default. Add WhatsApp whenever you want the agenda as a message.',
    emailLabel: 'Delivery email',
    channelLabel: 'Channel',
    scheduleLabel: 'Delivery hour',
    consentLabel: 'I agree to receive Trimry sports alerts on WhatsApp.',
    consentHint: 'Required only if you choose WhatsApp delivery.',
    saveButton: 'Save settings',
    savingButton: 'Saving...',
    backButton: 'Back to dashboard',
    confirmBadge: 'Delivery confirmation',
    confirmTitle: 'Confirm where you want your agenda',
    confirmSubtitle:
      'Your subscription is ready. Before entering the dashboard, confirm whether Trimry should reach you by email, WhatsApp, or both.',
    confirmBackButton: 'Go to dashboard',
    success: 'Delivery settings updated.',
    help: 'Changes apply to future deliveries only.',
    editMode: 'Edit mode',
    whatsappNumberLabel: 'WhatsApp number',
    whatsappOptional: 'WhatsApp remains optional unless you turn it on.',
    loadError: 'Unable to load delivery settings.',
    consentError: 'Please confirm WhatsApp consent before enabling WhatsApp delivery.',
    saveError: 'Unable to save delivery settings.',
    loading: 'Loading delivery settings...',
    redirecting: 'Redirecting...',
  },
  checkout: {
    badge: 'Stripe subscription',
    badgeCancelled: 'Checkout paused',
    title: 'Opening your Trimry subscription...',
    titleCancelled: 'Your subscription is waiting',
    subtitle: 'Stripe securely confirms your payment method so your alerts can start.',
    subtitleCancelled:
      'Nothing was lost. Your teams and settings are still saved, and you can subscribe whenever you are ready.',
    openError: 'Unable to open Stripe checkout right now.',
    resumeTitle: 'Start your alerts',
    resumeSubtitle: 'Your agenda is ready. Continue to Stripe and confirm your subscription.',
    resumeButton: 'Subscribe with Stripe',
    resumeHint: 'Secure Stripe checkout. Cancel anytime.',
    deliveryLabel: 'Delivery channel',
    timingLabel: 'Delivery hour',
    helper:
      'We are creating secure Stripe checkout for your subscription. If nothing happens, wait a second or reload this page.',
    unsubscribeHelp:
      'Unsubscribing is easy: cancel from the dashboard, the Stripe portal, or reply STOP on WhatsApp.',
    trialHighlights: [
      'Personal agenda of upcoming events by email, WhatsApp, or both.',
      'Unlimited sports, leagues and teams, updated several times a day.',
      'Scout assistant on the web and WhatsApp.',
    ],
  },
  agenda: {
    title: 'Your agenda',
    subtitle: 'Every upcoming event from the teams and leagues you follow, in your time zone.',
    refresh: 'Refresh',
    refreshing: 'Refreshing...',
    empty: 'Nothing scheduled in this window. Widen the lookahead or follow more teams.',
    emptyNoPreferences: 'Pick your sports, leagues and teams to fill your agenda.',
    emptyCta: 'Set up preferences',
    today: 'Today',
    tomorrow: 'Tomorrow',
    timeTbc: 'Time TBC',
    followedTeam: 'Your team',
    followedLeague: 'Your league',
    sportWide: 'Featured',
    lookahead: 'Lookahead',
    days: 'days',
    timeZoneNote: 'Times in {zone}',
    highlightsTitle: 'Highlights',
    countLabel: '{count} events',
    lastDigestLabel: 'Last digest sent',
    lastDigestNever: 'No digest sent yet',
    loadError: 'Unable to load your agenda right now.',
  },
  dashboard: {
    title: 'Dashboard',
    intro: 'Your agenda, preferences and delivery settings.',
    adminBadge: 'Admin',
    loading: 'Loading your dashboard...',
    noData: 'We could not load your account.',
    tabs: {
      agenda: 'Agenda',
      preferences: 'Teams & leagues',
      delivery: 'Delivery & billing',
      account: 'Account',
      sends: 'Admin sends',
      sportsSync: 'Sports sync',
    },
    preferencesTitle: 'Teams, leagues and rhythm',
    preferencesSubtitle: 'Everything you change here updates your next digest and your agenda.',
    preferencesSaved: 'Preferences saved. Your agenda is refreshing.',
    preferencesSaveError: 'Unable to save your preferences right now.',
    status: 'Status',
    nextMessage: 'Next digest',
    subscribeButton: 'Start alerts',
    noSubscription: 'Alerts are not active yet',
    noSubscriptionSubtitle:
      'Choose your channel and hour, then start the free trial to receive your agenda by email or WhatsApp.',
    paymentPending: 'Payment pending',
    paymentIssue: 'Payment issue',
    billingSuccess: 'Your subscription is active. Your first agenda is on its way.',
    profileTitle: 'Profile',
    profileSubtitle: 'Name and time zone used across your agenda and digests.',
    profileSave: 'Save profile',
    profileTimeZoneHint: 'Changing the time zone updates kickoff times and your delivery hour.',
    passwordTitle: 'Password',
    passwordSubtitle: 'Set or change the password for your account.',
    currentPasswordLabel: 'Current password',
    newPasswordLabel: 'New password',
    confirmPasswordLabel: 'Confirm new password',
    passwordSave: 'Update password',
    passwordSuccess: 'Password updated.',
    passwordMismatchError: 'The new passwords do not match.',
    passwordDifferentError: 'The new password must be different from the current one.',
    passwordSaveError: 'Unable to update the password right now.',
    dangerTitle: 'Danger zone',
    dangerSubtitle: 'Deleting your account cancels billing and removes your preferences permanently.',
    deleteButton: 'Delete account',
    deleteLoading: 'Deleting...',
    deleteConfirm: 'Delete your Trimry account and cancel any subscription? This cannot be undone.',
    deleteError: 'Unable to delete the account right now.',
    deliveryHourLabel: 'Delivery hour',
    deliveryHourHint: 'Local time in {zone}.',
    emailDeliveryLabel: 'Email delivery',
    whatsappOffSetup: 'WhatsApp is off. Choose WhatsApp or both to add your number.',
    whatsappConsentLabel: 'I agree to receive Trimry sports alerts on WhatsApp.',
    whatsappConsentHint: 'Reply STOP anytime to opt out.',
    whatsappConsentError: 'Please confirm WhatsApp consent before enabling WhatsApp delivery.',
    pendingTitle: 'Finish activating your alerts',
    pendingSubtitle: 'Your settings are saved. Complete the Stripe checkout to start the trial.',
    pendingDeliveryPreferenceLabel: 'Channel',
    pendingEmailDeliveryLabel: 'Email',
    pendingTimingLabel: 'Delivery hour',
    pendingWhatsappLabel: 'WhatsApp',
    activePlanTitle: 'Alerts active',
    canceledPlanTitle: 'Alerts canceled',
    canceledNote: 'Your preferences are saved. Reactivate whenever you want the digests back.',
    activeNote: 'Your agenda goes out on schedule. Change the channel or hour below.',
    deliveryPreferenceLabel: 'Channel',
    nextMessageIfReactivated: 'Next digest if reactivated',
    saveDeliverySettings: 'Save delivery settings',
    sendNowButton: 'Send me my agenda now',
    sendNowSending: 'Sending...',
    sendNowSuccess: 'Agenda sent ({count} events). Check your inbox.',
    sendNowWhatsappPending: 'Email sent; WhatsApp is pending Meta template approval.',
    reactivateButton: 'Reactivate alerts',
    reactivateLoading: 'Reactivating...',
    cancelButton: 'Cancel subscription',
    cancelLoading: 'Canceling...',
    manageBillingButton: 'Manage billing',
    manageBillingLoading: 'Opening billing...',
    billingFootnoteCanceled: 'Reactivating opens a new Stripe checkout.',
    billingFootnoteActive: 'Invoices, payment method and cancellation are managed in the Stripe portal.',
    cancelConfirm: 'Cancel your Trimry subscription? Alerts stop at the end of the current period.',
    cancelSuccess: 'Subscription canceled.',
    cancelError: 'Unable to cancel right now.',
    reactivateError: 'Unable to reactivate right now.',
    openBillingError: 'Unable to open the billing portal right now.',
    sportsSync: {
      title: 'Sports events sync',
      subtitle: 'Cache of upcoming events collected with OpenAI web search for every followed league, team and sport.',
      runButton: 'Sync stale targets',
      forceButton: 'Force full sync',
      running: 'Syncing...',
      eventCount: 'Cached events',
      upcomingCount: 'Upcoming events',
      lastFetched: 'Last fetch',
      providerNote:
        'Provider: OpenAI {model} with web search. Each league, team or sport is one search covering the next {days} days and is cached for {hours} hours.',
      summary: 'Targets {targets} · fetched {fetched} · skipped {skipped} · failed {failed} · upserted {events}',
      statesTitle: 'Sync targets',
      loadError: 'Unable to load sync status.',
    },
    sendCampaigns: sendCampaignsEn,
  },
  scout: {
    name: 'Scout',
    launcherLabel: 'Chat with Scout',
    launcherSubLabel: 'Your sports assistant',
    title: 'Ask about any game',
    introAnonymous:
      '⚽ Hi, I am Scout. Tell me a team or league and I will show you what is coming up. Create an account so I remember your teams.',
    introAccount:
      '⚽ Hi, I am Scout. I can add teams, change your rhythm and tell you what is on. Alerts by email and WhatsApp start with your subscription.',
    introActive:
      '⚽ Hi, I am Scout. Your alerts are active. Ask me what is on today, add a team or change your delivery settings.',
    prompts: ['What is on this weekend?', 'Follow Real Madrid', 'Switch me to weekly'],
    placeholder: 'Ask Scout...',
    send: 'Send',
    typing: 'Scout is checking the schedules',
    issue:
      'I hit a temporary issue in the web channel. Try again in a few seconds or continue on WhatsApp.',
    memorySaved: 'Memory saved to your account',
    temporaryMemory: 'Temporary memory',
    alertsActive: 'Alerts active',
    alertsInactive: 'Alerts not active',
    createAccount: 'Create account',
    activateAlerts: 'Activate alerts',
    openDashboard: 'Open dashboard',
    whatsappCta: 'Continue on WhatsApp',
    preferencesUpdated: 'Preferences updated',
  },
  statuses: { active: 'Active', paused: 'Paused', canceled: 'Canceled' },
  legal: legalEn,
  cookieConsent: {
    title: 'Cookies and analytics',
    description:
      'We use essential cookies plus ad/analytics measurement. This prompt is visual and your choice only controls this message display.',
    accept: 'Accept analytics',
    decline: 'Decline analytics',
    learnMore: 'Read privacy policy',
  },
  notifications: {
    success: 'Saved successfully.',
    error: 'Something went wrong. Please try again.',
  },
  notFound: {
    title: 'Page not found',
    description: 'The page you requested is not available.',
    cta: 'Return home',
  },
}

const es: MessageSection = {
  common: {
    loading: 'Cargando...',
    saving: 'Guardando...',
    previous: 'Anterior',
    next: 'Siguiente',
    back: 'Atrás',
    cancel: 'Cancelar',
    continue: 'Continuar',
    backToLogin: 'Volver al inicio de sesión',
    backToDashboard: 'Volver al panel',
    tryAgain: 'Intentar de nuevo',
    returnHome: 'Volver al inicio',
    save: 'Guardar',
    remove: 'Quitar',
    search: 'Buscar',
    close: 'Cerrar',
  },
  languageSwitcher: { label: 'Idioma' },
  nav: {
    home: 'Inicio',
    howItWorks: 'Cómo funciona',
    sports: 'Deportes',
    pricing: 'Precio',
    faq: 'Preguntas',
    login: 'Ingresar',
    register: 'Crear cuenta',
    dashboard: 'Panel',
    profile: 'Mi cuenta',
    logout: 'Cerrar sesión',
    startFree: 'Empezar gratis',
  },
  footer: {
    rightsReserved: 'Todos los derechos reservados.',
    companyNumber: 'Número de compañía',
    registeredOffice: 'Oficina registrada',
    operationsOffice: 'Oficina operativa',
    contact: 'Contacto',
    tagline: 'Tu radar de eventos deportivos.',
    dataSource: 'Calendarios verificados en fuentes oficiales con búsqueda web por IA. Horarios en tu zona horaria.',
  },
  home: {
    badge: 'Radar de eventos deportivos',
    title: 'No te pierdas ningún partido',
    titleHighlight: 'nunca más.',
    subtitle:
      'Elige los deportes, ligas y equipos que sigues. Trimry te envía una agenda personal con los próximos partidos, carreras y peleas por email y WhatsApp, en tu zona horaria.',
    primaryCta: 'Armar mi agenda',
    secondaryCta: 'Ver cómo funciona',
    trustLine: '7 días gratis · Cancela cuando quieras · Fútbol, NBA, NFL, F1, UFC y más',
    previewEyebrow: 'Vista en vivo',
    previewTitle: 'Lo que viene esta semana',
    previewSubtitle: 'Elige un deporte para ver los eventos reales que Trimry sigue ahora mismo.',
    previewEmpty: 'No hay eventos programados en las próximas dos semanas para las competiciones destacadas de este deporte.',
    previewWarming: 'Preparando el calendario de este deporte… la primera carga tarda unos 30 segundos.',
    previewLoading: 'Cargando próximos eventos...',
    previewError: 'No pudimos cargar la vista previa en este momento.',
    previewTimeZoneNote: 'Horarios en',
    stepsEyebrow: 'Cómo funciona',
    stepsTitle: 'Tres pasos y después corre solo',
    steps: [
      {
        title: 'Elige lo que sigues',
        text: 'Deportes, ligas y equipos. Desde la Premier League hasta la NBA, F1, UFC o tu club local.',
      },
      {
        title: 'Canal y ritmo',
        text: 'Agenda diaria o semanal por email, WhatsApp o ambos, a la hora que prefieras.',
      },
      {
        title: 'Recibe tu agenda',
        text: 'Cada evento que viene, ordenado por día, en tu zona horaria. Pregúntale a Scout si tienes dudas.',
      },
    ],
    channelsEyebrow: 'Entrega',
    channelsTitle: 'Donde mires primero',
    channels: [
      {
        title: 'Digest por email',
        text: 'Una agenda limpia y fácil de escanear para hoy y los próximos días. Tus equipos primero.',
      },
      {
        title: 'WhatsApp',
        text: 'La misma agenda como mensaje, más Scout respondiendo "¿qué hay hoy?".',
      },
      {
        title: 'Panel web',
        text: 'Tu agenda en vivo, preferencias y ajustes de entrega, siempre disponibles.',
      },
    ],
    scoutEyebrow: 'Conoce a Scout',
    scoutTitle: 'Un asistente que conoce tus equipos',
    scoutText:
      'Scout busca equipos y ligas por ti, los sigue con un solo mensaje y responde con partidos reales de los calendarios rastreados. Sin inventar nada.',
    scoutBullets: [
      '"Sigue a Real Madrid y a los Lakers"',
      '"¿Qué hay este fin de semana?"',
      '"Cámbiame a resumen semanal los lunes"',
    ],
    scoutCta: 'Hablar con Scout',
    finalTitle: 'Tu agenda, entregada.',
    finalSubtitle: 'Configúrala en dos minutos. Pruébala gratis 7 días.',
  },
  pricing: {
    eyebrow: 'Precio',
    title: 'Un plan simple',
    subtitle: 'Todo incluido. Empieza con una prueba gratis y cancela cuando quieras.',
    planTitle: 'Trimry Sports Alerts',
    billing: '{billingInline}',
    trialNote: '{trialPeriodDays} días gratis, luego {billingCompact}.',
    includes: [
      'Deportes, ligas y equipos ilimitados',
      'Agenda diaria o semanal por email y WhatsApp',
      'Asistente Scout en la web y WhatsApp',
      'Horarios en tu zona horaria',
    ],
    cta: 'Empezar prueba gratis',
    cancelNote: 'Cancela desde el panel, el portal de Stripe o respondiendo STOP en WhatsApp.',
  },
  faq: {
    title: 'Preguntas frecuentes',
    items: [
      {
        question: '¿Qué deportes y ligas están disponibles?',
        answer:
          'Fútbol, básquetbol, fútbol americano, béisbol, hockey sobre hielo, tenis, automovilismo, MMA y boxeo, rugby, golf, ciclismo y críquet. Entre las ligas destacadas están Premier League, La Liga, Serie A, Bundesliga, Ligue 1, Champions League, MLS, Liga MX, Brasileirão, NBA, NFL, MLB, NHL, Fórmula 1, MotoGP y UFC, y puedes buscar cualquier equipo o competición del catálogo.',
      },
      {
        question: '¿De dónde salen los calendarios?',
        answer:
          'Scout lee los sitios oficiales de ligas, equipos y canales con búsqueda web asistida por IA, guarda los partidos en caché y los actualiza varias veces al día. Los horarios se convierten a la zona horaria guardada en tu cuenta. Puede haber postergaciones y cambios de último minuto, así que confirma siempre con el canal oficial.',
      },
      {
        question: '¿Cómo funciona la prueba gratis?',
        answer:
          'Inicia el checkout con Stripe y recibe 7 días de alertas sin costo. Cancela antes de que termine la prueba y no se te cobrará.',
      },
      {
        question: '¿Puedo cancelar o cambiar de canal después?',
        answer:
          'Sí. Cambia deportes, equipos, ritmo, hora y canal desde el panel cuando quieras. Cancela desde el panel, el portal de Stripe o respondiendo STOP en WhatsApp.',
      },
    ],
  },
  auth: {
    registerTitle: 'Crea tu cuenta',
    registerSubtitle: 'Con tu nombre y email basta. Tus equipos y ajustes de entrega vienen después.',
    loginTitle: 'Bienvenido de vuelta',
    loginSubtitle: 'Ingresa para administrar tu agenda y tus alertas.',
    loginWithLinkHint: '¿Prefieres entrar sin contraseña? Te enviamos un link seguro por correo.',
    loginWithLinkButton: 'Enviarme link de ingreso',
    loginWithLinkSending: 'Enviando link de ingreso...',
    loginWithLinkSent:
      'Si este correo tiene una cuenta, enviamos un link seguro de ingreso. Revisa bandeja y spam.',
    loginWithLinkConsuming: 'Validando tu link seguro de ingreso...',
    loginWithLinkInvalid: 'Este link de ingreso es inválido o venció. Solicita uno nuevo.',
    loginWithLinkDivider: 'o',
    firstNameLabel: 'Nombre',
    lastNameLabel: 'Apellido',
    timeZoneLabel: 'Zona horaria',
    timeZoneHint: 'La usamos para mostrar los horarios y programar tu digest a la hora local correcta.',
    emailLabel: 'Correo electrónico',
    emailHint: 'Usamos este email para tu cuenta y para el digest por email.',
    passwordLabel: 'Contraseña',
    whatsappLabel: 'Número de WhatsApp',
    passwordHint: 'Mínimo 10 caracteres, incluyendo mayúscula, minúscula y número.',
    registerButton: 'Continuar',
    loginButton: 'Ingresar',
    needAccount: '¿Necesitas una cuenta?',
    alreadyHaveAccount: '¿Ya tienes una cuenta?',
    invalidEmail: 'Ingresa un correo válido.',
    termsNotice: 'Al continuar aceptas los Términos del servicio y la Política de privacidad.',
  },
  onboarding: {
    title: 'Configura tu agenda',
    stepLabel: 'Paso {step} de {total}',
    steps: ['Deportes', 'Equipos y ligas', 'Entrega', 'Revisión'],
    sportsTitle: '¿Qué deportes sigues?',
    sportsSubtitle: 'Elige los que quieras. En el siguiente paso puedes afinar ligas y equipos.',
    sportsEmpty: 'Elige al menos un deporte para continuar.',
    teamsTitle: 'Equipos y ligas',
    teamsSubtitle:
      'Sigue equipos para alertas partido a partido y ligas para el calendario completo. Si lo saltas, recibes las ligas destacadas de cada deporte.',
    teamsSearchLabel: 'Buscar un equipo',
    teamsSearchPlaceholder: 'Real Madrid, Lakers, Ferrari, Colo-Colo...',
    teamsSearching: 'Buscando...',
    teamsNoResults: 'No encontramos equipos. Prueba otra escritura o el nombre oficial.',
    teamsFollowing: 'Equipos que sigues',
    leaguesTitle: 'Ligas',
    leaguesHint: 'Las ligas destacadas aparecen primero. Busca en el catálogo para ver más.',
    leaguesLoading: 'Cargando ligas...',
    leaguesFilterPlaceholder: 'Filtrar ligas...',
    featuredLabel: 'Destacada',
    followedLabel: 'Siguiendo',
    followLabel: 'Seguir',
    unfollowLabel: 'Dejar de seguir',
    skipTeamsHint: 'Sin equipos ni ligas seleccionados: recibirás las ligas destacadas de tus deportes.',
    accountTitle: 'Crea tu cuenta',
    accountSubtitle: 'Guarda tu selección y elige cómo recibir la agenda.',
    accountExistingHint: '¿Ya tienes una cuenta?',
    deliveryTitle: '¿Cómo quieres la agenda?',
    deliverySubtitle: 'Elige el ritmo, el canal y la hora. Puedes cambiarlo cuando quieras.',
    frequencyLabel: 'Ritmo',
    frequencyDaily: 'Diaria',
    frequencyDailyHint: 'Cada día: hoy más los dos días siguientes.',
    frequencyWeekly: 'Semanal',
    frequencyWeeklyHint: 'Cada lunes: la semana completa.',
    lookaheadLabel: 'Rango del panel',
    lookaheadHint: 'Cuántos días muestra tu agenda web.',
    lookaheadDays: '{count} días',
    channelLabel: 'Canal',
    hourLabel: 'Hora de entrega',
    hourHint: 'Hora local en {zone}.',
    whatsappNumberLabel: 'Número de WhatsApp',
    whatsappConsentLabel: 'Acepto recibir alertas deportivas de Trimry por WhatsApp.',
    whatsappConsentHint: 'Necesario solo si eliges WhatsApp. Responde STOP cuando quieras.',
    whatsappConsentError: 'Confirma el consentimiento de WhatsApp antes de habilitar ese canal.',
    reviewTitle: 'Revisa y empieza',
    reviewSubtitle: 'Este es tu setup y una vista real de los próximos eventos en tu radar.',
    reviewSports: 'Deportes',
    reviewLeagues: 'Ligas',
    reviewTeams: 'Equipos',
    reviewFrequency: 'Ritmo',
    reviewChannel: 'Canal',
    reviewTiming: 'Entrega',
    reviewPreviewTitle: 'Lo próximo en tu radar',
    reviewPreviewEmpty: 'Aún no hay eventos en caché para esta selección. Tu agenda se completa a medida que se publican los calendarios.',
    startTrialCta: 'Empezar 7 días gratis',
    startTrialHint: 'Checkout seguro de Stripe. Cancela cuando quieras.',
    savePreferencesCta: 'Guardar preferencias',
    saving: 'Guardando...',
    saveError: 'No pudimos guardar tus preferencias en este momento.',
    registerError: 'No pudimos crear tu cuenta en este momento.',
    previewEyebrow: 'Vista previa',
  },
  deliveryChannels: {
    noneTitle: 'Solo web',
    noneDescription: 'Usa el panel y Scout sin digests por email ni WhatsApp.',
    bothTitle: 'Email + WhatsApp',
    bothDescription: 'El digest por email más la misma agenda como mensaje de WhatsApp.',
    emailTitle: 'Email',
    emailDescription: 'Un digest limpio en tu bandeja. La opción más simple.',
    whatsappTitle: 'WhatsApp',
    whatsappDescription: 'La agenda como mensaje, más Scout en WhatsApp.',
    whatsappPendingNote:
      'Los digests por WhatsApp comienzan apenas Meta apruebe nuestra plantilla de mensaje. El email funciona hoy.',
  },
  delivery: {
    badge: 'Ajustes de entrega',
    title: '¿Cómo debería Trimry entregar tu agenda?',
    subtitle: 'Email es el valor por defecto. Agrega WhatsApp cuando quieras la agenda como mensaje.',
    emailLabel: 'Correo de entrega',
    channelLabel: 'Canal',
    scheduleLabel: 'Hora de entrega',
    consentLabel: 'Acepto recibir alertas deportivas de Trimry por WhatsApp.',
    consentHint: 'Necesario solo si eliges WhatsApp como canal.',
    saveButton: 'Guardar ajustes',
    savingButton: 'Guardando...',
    backButton: 'Volver al panel',
    confirmBadge: 'Confirmación de entrega',
    confirmTitle: 'Confirma dónde quieres tu agenda',
    confirmSubtitle:
      'Tu suscripción ya quedó lista. Antes de entrar al panel, confirma si quieres recibir Trimry por email, WhatsApp o ambos.',
    confirmBackButton: 'Ir al panel',
    success: 'Ajustes de entrega actualizados.',
    help: 'Los cambios se aplican solo a futuras entregas.',
    editMode: 'Modo edición',
    whatsappNumberLabel: 'Número de WhatsApp',
    whatsappOptional: 'WhatsApp sigue siendo opcional salvo que lo actives.',
    loadError: 'No pudimos cargar los ajustes de entrega.',
    consentError: 'Confirma el consentimiento de WhatsApp antes de habilitar ese canal.',
    saveError: 'No pudimos guardar los ajustes de entrega.',
    loading: 'Cargando ajustes de entrega...',
    redirecting: 'Redirigiendo...',
  },
  checkout: {
    badge: 'Suscripción Stripe',
    badgeCancelled: 'Checkout en pausa',
    title: 'Abriendo tu suscripción Trimry...',
    titleCancelled: 'Tu suscripción te espera',
    subtitle: 'Stripe confirma tu método de pago de forma segura para que tus alertas comiencen.',
    subtitleCancelled:
      'No se perdió nada. Tus equipos y ajustes siguen guardados y puedes suscribirte cuando quieras.',
    openError: 'No pudimos abrir el checkout de Stripe en este momento.',
    resumeTitle: 'Activa tus alertas',
    resumeSubtitle: 'Tu agenda está lista. Continúa a Stripe y confirma tu suscripción.',
    resumeButton: 'Suscribirme con Stripe',
    resumeHint: 'Checkout seguro de Stripe. Cancela cuando quieras.',
    deliveryLabel: 'Canal de entrega',
    timingLabel: 'Hora de entrega',
    helper:
      'Estamos creando el checkout seguro de Stripe para tu suscripción. Si no pasa nada, espera un segundo o recarga esta página.',
    unsubscribeHelp:
      'Desuscribirte es fácil: cancela desde el panel, el portal de Stripe o responde STOP en WhatsApp.',
    trialHighlights: [
      'Agenda personal de próximos eventos por email, WhatsApp o ambos.',
      'Deportes, ligas y equipos ilimitados, actualizados varias veces al día.',
      'Asistente Scout en la web y WhatsApp.',
    ],
  },
  agenda: {
    title: 'Tu agenda',
    subtitle: 'Cada evento que viene de los equipos y ligas que sigues, en tu zona horaria.',
    refresh: 'Actualizar',
    refreshing: 'Actualizando...',
    empty: 'No hay nada programado en este rango. Amplía el rango o sigue más equipos.',
    emptyNoPreferences: 'Elige tus deportes, ligas y equipos para llenar tu agenda.',
    emptyCta: 'Configurar preferencias',
    today: 'Hoy',
    tomorrow: 'Mañana',
    timeTbc: 'Hora por confirmar',
    followedTeam: 'Tu equipo',
    followedLeague: 'Tu liga',
    sportWide: 'Destacado',
    lookahead: 'Rango',
    days: 'días',
    timeZoneNote: 'Horarios en {zone}',
    highlightsTitle: 'Destacados',
    countLabel: '{count} eventos',
    lastDigestLabel: 'Último digest enviado',
    lastDigestNever: 'Aún no se envió ningún digest',
    loadError: 'No pudimos cargar tu agenda en este momento.',
  },
  dashboard: {
    title: 'Panel',
    intro: 'Tu agenda, preferencias y ajustes de entrega.',
    adminBadge: 'Admin',
    loading: 'Cargando tu panel...',
    noData: 'No pudimos cargar tu cuenta.',
    tabs: {
      agenda: 'Agenda',
      preferences: 'Equipos y ligas',
      delivery: 'Entrega y cobros',
      account: 'Cuenta',
      sends: 'Envíos admin',
      sportsSync: 'Sync deportivo',
    },
    preferencesTitle: 'Equipos, ligas y ritmo',
    preferencesSubtitle: 'Todo lo que cambies aquí actualiza tu próximo digest y tu agenda.',
    preferencesSaved: 'Preferencias guardadas. Tu agenda se está actualizando.',
    preferencesSaveError: 'No pudimos guardar tus preferencias en este momento.',
    status: 'Estado',
    nextMessage: 'Próximo digest',
    subscribeButton: 'Activar alertas',
    noSubscription: 'Las alertas aún no están activas',
    noSubscriptionSubtitle:
      'Elige tu canal y hora, luego inicia la prueba gratis para recibir tu agenda por email o WhatsApp.',
    paymentPending: 'Pago pendiente',
    paymentIssue: 'Problema de pago',
    billingSuccess: 'Tu suscripción está activa. Tu primera agenda va en camino.',
    profileTitle: 'Perfil',
    profileSubtitle: 'Nombre y zona horaria que usamos en tu agenda y tus digests.',
    profileSave: 'Guardar perfil',
    profileTimeZoneHint: 'Cambiar la zona horaria actualiza los horarios y tu hora de entrega.',
    passwordTitle: 'Contraseña',
    passwordSubtitle: 'Define o cambia la contraseña de tu cuenta.',
    currentPasswordLabel: 'Contraseña actual',
    newPasswordLabel: 'Nueva contraseña',
    confirmPasswordLabel: 'Confirmar nueva contraseña',
    passwordSave: 'Actualizar contraseña',
    passwordSuccess: 'Contraseña actualizada.',
    passwordMismatchError: 'Las contraseñas nuevas no coinciden.',
    passwordDifferentError: 'La nueva contraseña debe ser distinta a la actual.',
    passwordSaveError: 'No pudimos actualizar la contraseña en este momento.',
    dangerTitle: 'Zona de peligro',
    dangerSubtitle: 'Eliminar tu cuenta cancela los cobros y borra tus preferencias de forma permanente.',
    deleteButton: 'Eliminar cuenta',
    deleteLoading: 'Eliminando...',
    deleteConfirm: '¿Eliminar tu cuenta Trimry y cancelar cualquier suscripción? No se puede deshacer.',
    deleteError: 'No pudimos eliminar la cuenta en este momento.',
    deliveryHourLabel: 'Hora de entrega',
    deliveryHourHint: 'Hora local en {zone}.',
    emailDeliveryLabel: 'Entrega por email',
    whatsappOffSetup: 'WhatsApp está apagado. Elige WhatsApp o ambos para agregar tu número.',
    whatsappConsentLabel: 'Acepto recibir alertas deportivas de Trimry por WhatsApp.',
    whatsappConsentHint: 'Responde STOP cuando quieras para darte de baja.',
    whatsappConsentError: 'Confirma el consentimiento de WhatsApp antes de habilitar ese canal.',
    pendingTitle: 'Termina de activar tus alertas',
    pendingSubtitle: 'Tus ajustes están guardados. Completa el checkout de Stripe para iniciar la prueba.',
    pendingDeliveryPreferenceLabel: 'Canal',
    pendingEmailDeliveryLabel: 'Email',
    pendingTimingLabel: 'Hora de entrega',
    pendingWhatsappLabel: 'WhatsApp',
    activePlanTitle: 'Alertas activas',
    canceledPlanTitle: 'Alertas canceladas',
    canceledNote: 'Tus preferencias están guardadas. Reactiva cuando quieras volver a recibir los digests.',
    activeNote: 'Tu agenda sale según lo programado. Cambia el canal o la hora abajo.',
    deliveryPreferenceLabel: 'Canal',
    nextMessageIfReactivated: 'Próximo digest si reactivas',
    saveDeliverySettings: 'Guardar ajustes de entrega',
    sendNowButton: 'Enviarme mi agenda ahora',
    sendNowSending: 'Enviando...',
    sendNowSuccess: 'Agenda enviada ({count} eventos). Revisa tu correo.',
    sendNowWhatsappPending: 'Email enviado; WhatsApp queda pendiente hasta que Meta apruebe la plantilla.',
    reactivateButton: 'Reactivar alertas',
    reactivateLoading: 'Reactivando...',
    cancelButton: 'Cancelar suscripción',
    cancelLoading: 'Cancelando...',
    manageBillingButton: 'Gestionar cobros',
    manageBillingLoading: 'Abriendo cobros...',
    billingFootnoteCanceled: 'Reactivar abre un nuevo checkout de Stripe.',
    billingFootnoteActive: 'Facturas, método de pago y cancelación se gestionan en el portal de Stripe.',
    cancelConfirm: '¿Cancelar tu suscripción Trimry? Las alertas se detienen al final del periodo actual.',
    cancelSuccess: 'Suscripción cancelada.',
    cancelError: 'No pudimos cancelar en este momento.',
    reactivateError: 'No pudimos reactivar en este momento.',
    openBillingError: 'No pudimos abrir el portal de cobros en este momento.',
    sportsSync: {
      title: 'Sync de eventos deportivos',
      subtitle: 'Caché de próximos eventos recopilados con búsqueda web de OpenAI para cada liga, equipo y deporte seguido.',
      runButton: 'Sincronizar pendientes',
      forceButton: 'Forzar sync completo',
      running: 'Sincronizando...',
      eventCount: 'Eventos en caché',
      upcomingCount: 'Próximos eventos',
      lastFetched: 'Última descarga',
      providerNote:
        'Proveedor: OpenAI {model} con búsqueda web. Cada liga, equipo o deporte es una búsqueda que cubre los próximos {days} días y se cachea {hours} horas.',
      summary: 'Objetivos {targets} · descargados {fetched} · omitidos {skipped} · fallidos {failed} · guardados {events}',
      statesTitle: 'Objetivos de sync',
      loadError: 'No pudimos cargar el estado del sync.',
    },
    sendCampaigns: sendCampaignsEs,
  },
  scout: {
    name: 'Scout',
    launcherLabel: 'Hablar con Scout',
    launcherSubLabel: 'Tu asistente deportivo',
    title: 'Pregunta por cualquier partido',
    introAnonymous:
      '⚽ Hola, soy Scout. Dime un equipo o liga y te muestro lo que viene. Crea una cuenta para que recuerde tus equipos.',
    introAccount:
      '⚽ Hola, soy Scout. Puedo agregar equipos, cambiar tu ritmo y contarte qué hay. Las alertas por email y WhatsApp arrancan con tu suscripción.',
    introActive:
      '⚽ Hola, soy Scout. Tus alertas están activas. Pregúntame qué hay hoy, agrega un equipo o cambia tus ajustes de entrega.',
    prompts: ['¿Qué hay este fin de semana?', 'Sigue a Real Madrid', 'Cámbiame a semanal'],
    placeholder: 'Pregúntale a Scout...',
    send: 'Enviar',
    typing: 'Scout está revisando los calendarios',
    issue:
      'Tuve un problema temporal en el canal web. Intenta de nuevo en unos segundos o sigue por WhatsApp.',
    memorySaved: 'Memoria guardada en tu cuenta',
    temporaryMemory: 'Memoria temporal',
    alertsActive: 'Alertas activas',
    alertsInactive: 'Alertas no activas',
    createAccount: 'Crear cuenta',
    activateAlerts: 'Activar alertas',
    openDashboard: 'Abrir panel',
    whatsappCta: 'Seguir por WhatsApp',
    preferencesUpdated: 'Preferencias actualizadas',
  },
  statuses: { active: 'Activa', paused: 'Pausada', canceled: 'Cancelada' },
  legal: legalEs,
  cookieConsent: {
    title: 'Cookies y analítica',
    description:
      'Usamos cookies esenciales más medición publicitaria/analítica. Este aviso es visual y tu elección solo controla su visualización.',
    accept: 'Aceptar analítica',
    decline: 'Rechazar analítica',
    learnMore: 'Ver política de privacidad',
  },
  notifications: {
    success: 'Guardado correctamente.',
    error: 'Algo salió mal. Inténtalo de nuevo.',
  },
  notFound: {
    title: 'Página no encontrada',
    description: 'La página que solicitaste no está disponible.',
    cta: 'Volver al inicio',
  },
}

const pt: MessageSection = {
  common: {
    loading: 'Carregando...',
    saving: 'Salvando...',
    previous: 'Anterior',
    next: 'Próximo',
    back: 'Voltar',
    cancel: 'Cancelar',
    continue: 'Continuar',
    backToLogin: 'Voltar ao login',
    backToDashboard: 'Voltar ao painel',
    tryAgain: 'Tentar novamente',
    returnHome: 'Voltar ao início',
    save: 'Salvar',
    remove: 'Remover',
    search: 'Buscar',
    close: 'Fechar',
  },
  languageSwitcher: { label: 'Idioma' },
  nav: {
    home: 'Início',
    howItWorks: 'Como funciona',
    sports: 'Esportes',
    pricing: 'Preço',
    faq: 'Perguntas',
    login: 'Entrar',
    register: 'Criar conta',
    dashboard: 'Painel',
    profile: 'Minha conta',
    logout: 'Sair',
    startFree: 'Começar grátis',
  },
  footer: {
    rightsReserved: 'Todos os direitos reservados.',
    companyNumber: 'Número da empresa',
    registeredOffice: 'Sede registrada',
    operationsOffice: 'Escritório operacional',
    contact: 'Contato',
    tagline: 'Seu radar de eventos esportivos.',
    dataSource: 'Calendários verificados em fontes oficiais com busca web por IA. Horários no seu fuso.',
  },
  home: {
    badge: 'Radar de eventos esportivos',
    title: 'Nunca mais perca um jogo',
    titleHighlight: 'de novo.',
    subtitle:
      'Escolha os esportes, ligas e times que você acompanha. A Trimry envia uma agenda pessoal com os próximos jogos, corridas e lutas por email e WhatsApp, no seu fuso horário.',
    primaryCta: 'Montar minha agenda',
    secondaryCta: 'Ver como funciona',
    trustLine: '7 dias grátis · Cancele quando quiser · Futebol, NBA, NFL, F1, UFC e mais',
    previewEyebrow: 'Prévia ao vivo',
    previewTitle: 'O que vem nesta semana',
    previewSubtitle: 'Escolha um esporte para ver os eventos reais que a Trimry acompanha agora.',
    previewEmpty: 'Nenhum evento programado nas próximas duas semanas para as competições em destaque deste esporte.',
    previewWarming: 'Montando o calendário deste esporte… o primeiro carregamento leva cerca de 30 segundos.',
    previewLoading: 'Carregando próximos eventos...',
    previewError: 'Não foi possível carregar a prévia agora.',
    previewTimeZoneNote: 'Horários em',
    stepsEyebrow: 'Como funciona',
    stepsTitle: 'Três passos e depois roda sozinho',
    steps: [
      {
        title: 'Escolha o que você acompanha',
        text: 'Esportes, ligas e times. Da Premier League à NBA, F1, UFC ou seu clube local.',
      },
      {
        title: 'Canal e ritmo',
        text: 'Agenda diária ou semanal por email, WhatsApp ou ambos, no horário que preferir.',
      },
      {
        title: 'Receba sua agenda',
        text: 'Cada evento que vem, ordenado por dia, no seu fuso. Pergunte ao Scout na dúvida.',
      },
    ],
    channelsEyebrow: 'Entrega',
    channelsTitle: 'Onde você olha primeiro',
    channels: [
      {
        title: 'Digest por email',
        text: 'Uma agenda limpa e fácil de ler para hoje e os próximos dias. Seus times primeiro.',
      },
      {
        title: 'WhatsApp',
        text: 'A mesma agenda como mensagem, mais o Scout respondendo "o que tem hoje?".',
      },
      {
        title: 'Painel web',
        text: 'Sua agenda ao vivo, preferências e configurações de entrega, sempre disponíveis.',
      },
    ],
    scoutEyebrow: 'Conheça o Scout',
    scoutTitle: 'Um assistente que conhece seus times',
    scoutText:
      'O Scout busca times e ligas por você, segue com uma única mensagem e responde com jogos reais dos calendários rastreados. Sem inventar nada.',
    scoutBullets: [
      '"Seguir Real Madrid e Lakers"',
      '"O que tem neste fim de semana?"',
      '"Muda para resumo semanal na segunda"',
    ],
    scoutCta: 'Falar com o Scout',
    finalTitle: 'Sua agenda, entregue.',
    finalSubtitle: 'Configure em dois minutos. Teste grátis por 7 dias.',
  },
  pricing: {
    eyebrow: 'Preço',
    title: 'Um plano simples',
    subtitle: 'Tudo incluído. Comece com um teste grátis e cancele quando quiser.',
    planTitle: 'Trimry Sports Alerts',
    billing: '{billingInline}',
    trialNote: '{trialPeriodDays} dias grátis, depois {billingCompact}.',
    includes: [
      'Esportes, ligas e times ilimitados',
      'Agenda diária ou semanal por email e WhatsApp',
      'Assistente Scout na web e no WhatsApp',
      'Horários no seu fuso',
    ],
    cta: 'Começar teste grátis',
    cancelNote: 'Cancele pelo painel, pelo portal Stripe ou respondendo STOP no WhatsApp.',
  },
  faq: {
    title: 'Perguntas frequentes',
    items: [
      {
        question: 'Quais esportes e ligas estão disponíveis?',
        answer:
          'Futebol, basquete, futebol americano, beisebol, hóquei no gelo, tênis, automobilismo, MMA e boxe, rugby, golfe, ciclismo e críquete. Entre as ligas em destaque estão Premier League, La Liga, Serie A, Bundesliga, Ligue 1, Champions League, MLS, Liga MX, Brasileirão, NBA, NFL, MLB, NHL, Fórmula 1, MotoGP e UFC, e você pode buscar qualquer time ou competição no catálogo.',
      },
      {
        question: 'De onde vêm os calendários?',
        answer:
          'O Scout lê os sites oficiais de ligas, times e emissoras com busca na web assistida por IA, guarda os jogos em cache e atualiza várias vezes ao dia. Os horários são convertidos para o fuso salvo na sua conta. Adiamentos e mudanças de última hora acontecem, então confirme sempre com a emissora oficial.',
      },
      {
        question: 'Como funciona o teste grátis?',
        answer:
          'Inicie o checkout com a Stripe e receba 7 dias de alertas sem custo. Cancele antes do fim do teste e nada será cobrado.',
      },
      {
        question: 'Posso cancelar ou trocar de canal depois?',
        answer:
          'Sim. Mude esportes, times, ritmo, horário e canal pelo painel quando quiser. Cancele pelo painel, pelo portal Stripe ou respondendo STOP no WhatsApp.',
      },
    ],
  },
  auth: {
    registerTitle: 'Crie sua conta',
    registerSubtitle: 'Seu nome e email bastam. Seus times e configurações de entrega vêm em seguida.',
    loginTitle: 'Bem-vindo de volta',
    loginSubtitle: 'Entre para gerenciar sua agenda e seus alertas.',
    loginWithLinkHint: 'Prefere entrar sem senha? Enviamos um link seguro por email.',
    loginWithLinkButton: 'Enviar link de acesso',
    loginWithLinkSending: 'Enviando link de acesso...',
    loginWithLinkSent:
      'Se este email tiver uma conta, enviamos um link seguro de acesso. Verifique caixa de entrada e spam.',
    loginWithLinkConsuming: 'Validando seu link seguro de acesso...',
    loginWithLinkInvalid: 'Este link de acesso é inválido ou expirou. Solicite um novo.',
    loginWithLinkDivider: 'ou',
    firstNameLabel: 'Nome',
    lastNameLabel: 'Sobrenome',
    timeZoneLabel: 'Fuso horário',
    timeZoneHint: 'Usamos para mostrar os horários e agendar seu digest na hora local certa.',
    emailLabel: 'Email',
    emailHint: 'Usamos este email para sua conta e para o digest por email.',
    passwordLabel: 'Senha',
    whatsappLabel: 'Número de WhatsApp',
    passwordHint: 'Mínimo de 10 caracteres, incluindo maiúscula, minúscula e número.',
    registerButton: 'Continuar',
    loginButton: 'Entrar',
    needAccount: 'Precisa de uma conta?',
    alreadyHaveAccount: 'Já tem uma conta?',
    invalidEmail: 'Digite um email válido.',
    termsNotice: 'Ao continuar você aceita os Termos de serviço e a Política de privacidade.',
  },
  onboarding: {
    title: 'Configure sua agenda',
    stepLabel: 'Passo {step} de {total}',
    steps: ['Esportes', 'Times e ligas', 'Entrega', 'Revisão'],
    sportsTitle: 'Quais esportes você acompanha?',
    sportsSubtitle: 'Escolha quantos quiser. No próximo passo você refina ligas e times.',
    sportsEmpty: 'Escolha pelo menos um esporte para continuar.',
    teamsTitle: 'Times e ligas',
    teamsSubtitle:
      'Siga times para alertas jogo a jogo e ligas para o calendário completo. Se pular, você recebe as ligas em destaque de cada esporte.',
    teamsSearchLabel: 'Buscar um time',
    teamsSearchPlaceholder: 'Real Madrid, Lakers, Ferrari, Flamengo...',
    teamsSearching: 'Buscando...',
    teamsNoResults: 'Nenhum time encontrado. Tente outra grafia ou o nome oficial.',
    teamsFollowing: 'Times que você acompanha',
    leaguesTitle: 'Ligas',
    leaguesHint: 'As ligas em destaque aparecem primeiro. Busque no catálogo para ver mais.',
    leaguesLoading: 'Carregando ligas...',
    leaguesFilterPlaceholder: 'Filtrar ligas...',
    featuredLabel: 'Destaque',
    followedLabel: 'Seguindo',
    followLabel: 'Seguir',
    unfollowLabel: 'Deixar de seguir',
    skipTeamsHint: 'Sem times ou ligas selecionados: você receberá as ligas em destaque dos seus esportes.',
    accountTitle: 'Crie sua conta',
    accountSubtitle: 'Salve sua seleção e escolha como receber a agenda.',
    accountExistingHint: 'Já tem uma conta?',
    deliveryTitle: 'Como você quer a agenda?',
    deliverySubtitle: 'Escolha o ritmo, o canal e o horário. Você pode mudar quando quiser.',
    frequencyLabel: 'Ritmo',
    frequencyDaily: 'Diária',
    frequencyDailyHint: 'Todo dia: hoje mais os dois dias seguintes.',
    frequencyWeekly: 'Semanal',
    frequencyWeeklyHint: 'Toda segunda: a semana completa.',
    lookaheadLabel: 'Alcance do painel',
    lookaheadHint: 'Quantos dias sua agenda web mostra.',
    lookaheadDays: '{count} dias',
    channelLabel: 'Canal',
    hourLabel: 'Horário de entrega',
    hourHint: 'Hora local em {zone}.',
    whatsappNumberLabel: 'Número de WhatsApp',
    whatsappConsentLabel: 'Aceito receber alertas esportivos da Trimry pelo WhatsApp.',
    whatsappConsentHint: 'Necessário apenas se escolher WhatsApp. Responda STOP quando quiser.',
    whatsappConsentError: 'Confirme o consentimento do WhatsApp antes de habilitar esse canal.',
    reviewTitle: 'Revise e comece',
    reviewSubtitle: 'Aqui está sua configuração e uma prévia real dos próximos eventos no seu radar.',
    reviewSports: 'Esportes',
    reviewLeagues: 'Ligas',
    reviewTeams: 'Times',
    reviewFrequency: 'Ritmo',
    reviewChannel: 'Canal',
    reviewTiming: 'Entrega',
    reviewPreviewTitle: 'Próximos no seu radar',
    reviewPreviewEmpty: 'Ainda não há eventos em cache para esta seleção. Sua agenda se completa conforme os calendários são publicados.',
    startTrialCta: 'Começar 7 dias grátis',
    startTrialHint: 'Checkout seguro da Stripe. Cancele quando quiser.',
    savePreferencesCta: 'Salvar preferências',
    saving: 'Salvando...',
    saveError: 'Não foi possível salvar suas preferências agora.',
    registerError: 'Não foi possível criar sua conta agora.',
    previewEyebrow: 'Prévia',
  },
  deliveryChannels: {
    noneTitle: 'Somente web',
    noneDescription: 'Use o painel e o Scout sem digests por email ou WhatsApp.',
    bothTitle: 'Email + WhatsApp',
    bothDescription: 'O digest por email mais a mesma agenda como mensagem de WhatsApp.',
    emailTitle: 'Email',
    emailDescription: 'Um digest limpo na sua caixa de entrada. A opção mais simples.',
    whatsappTitle: 'WhatsApp',
    whatsappDescription: 'A agenda como mensagem, mais o Scout no WhatsApp.',
    whatsappPendingNote:
      'Os digests por WhatsApp começam assim que a Meta aprovar nosso template de mensagem. O email funciona hoje.',
  },
  delivery: {
    badge: 'Ajustes de entrega',
    title: 'Como a Trimry deve entregar sua agenda?',
    subtitle: 'Email é o padrão. Adicione WhatsApp quando quiser a agenda como mensagem.',
    emailLabel: 'Email de entrega',
    channelLabel: 'Canal',
    scheduleLabel: 'Horário de entrega',
    consentLabel: 'Aceito receber alertas esportivos da Trimry pelo WhatsApp.',
    consentHint: 'Necessário apenas se você escolher entrega por WhatsApp.',
    saveButton: 'Salvar ajustes',
    savingButton: 'Salvando...',
    backButton: 'Voltar ao painel',
    confirmBadge: 'Confirmação de entrega',
    confirmTitle: 'Confirme onde quer sua agenda',
    confirmSubtitle:
      'Sua assinatura já está pronta. Antes de entrar no painel, confirme se quer receber a Trimry por email, WhatsApp ou ambos.',
    confirmBackButton: 'Ir para o painel',
    success: 'Ajustes de entrega atualizados.',
    help: 'As mudanças valem apenas para entregas futuras.',
    editMode: 'Modo edição',
    whatsappNumberLabel: 'Número de WhatsApp',
    whatsappOptional: 'WhatsApp continua opcional até você ativá-lo.',
    loadError: 'Não foi possível carregar os ajustes de entrega.',
    consentError: 'Confirme o consentimento do WhatsApp antes de habilitar esse canal.',
    saveError: 'Não foi possível salvar os ajustes de entrega.',
    loading: 'Carregando ajustes de entrega...',
    redirecting: 'Redirecionando...',
  },
  checkout: {
    badge: 'Assinatura Stripe',
    badgeCancelled: 'Checkout pausado',
    title: 'Abrindo sua assinatura da Trimry...',
    titleCancelled: 'Sua assinatura está esperando',
    subtitle: 'A Stripe confirma seu método de pagamento com segurança para seus alertas começarem.',
    subtitleCancelled:
      'Nada foi perdido. Seus times e configurações continuam salvos e você pode assinar quando quiser.',
    openError: 'Não foi possível abrir o checkout da Stripe agora.',
    resumeTitle: 'Ative seus alertas',
    resumeSubtitle: 'Sua agenda está pronta. Continue para a Stripe e confirme sua assinatura.',
    resumeButton: 'Assinar com Stripe',
    resumeHint: 'Checkout seguro da Stripe. Cancele quando quiser.',
    deliveryLabel: 'Canal de entrega',
    timingLabel: 'Horário de entrega',
    helper:
      'Estamos criando o checkout seguro da Stripe para sua assinatura. Se nada acontecer, espere um segundo ou recarregue esta página.',
    unsubscribeHelp:
      'Cancelar é fácil: pelo painel, pelo portal Stripe ou respondendo STOP no WhatsApp.',
    trialHighlights: [
      'Agenda pessoal de próximos eventos por email, WhatsApp ou ambos.',
      'Esportes, ligas e times ilimitados, atualizados várias vezes ao dia.',
      'Assistente Scout na web e no WhatsApp.',
    ],
  },
  agenda: {
    title: 'Sua agenda',
    subtitle: 'Cada evento que vem dos times e ligas que você acompanha, no seu fuso.',
    refresh: 'Atualizar',
    refreshing: 'Atualizando...',
    empty: 'Nada agendado neste período. Amplie o alcance ou siga mais times.',
    emptyNoPreferences: 'Escolha seus esportes, ligas e times para preencher sua agenda.',
    emptyCta: 'Configurar preferências',
    today: 'Hoje',
    tomorrow: 'Amanhã',
    timeTbc: 'Horário a confirmar',
    followedTeam: 'Seu time',
    followedLeague: 'Sua liga',
    sportWide: 'Destaque',
    lookahead: 'Alcance',
    days: 'dias',
    timeZoneNote: 'Horários em {zone}',
    highlightsTitle: 'Destaques',
    countLabel: '{count} eventos',
    lastDigestLabel: 'Último digest enviado',
    lastDigestNever: 'Nenhum digest enviado ainda',
    loadError: 'Não foi possível carregar sua agenda agora.',
  },
  dashboard: {
    title: 'Painel',
    intro: 'Sua agenda, preferências e configurações de entrega.',
    adminBadge: 'Admin',
    loading: 'Carregando seu painel...',
    noData: 'Não foi possível carregar sua conta.',
    tabs: {
      agenda: 'Agenda',
      preferences: 'Times e ligas',
      delivery: 'Entrega e cobrança',
      account: 'Conta',
      sends: 'Envios admin',
      sportsSync: 'Sync esportivo',
    },
    preferencesTitle: 'Times, ligas e ritmo',
    preferencesSubtitle: 'Tudo o que você mudar aqui atualiza seu próximo digest e sua agenda.',
    preferencesSaved: 'Preferências salvas. Sua agenda está sendo atualizada.',
    preferencesSaveError: 'Não foi possível salvar suas preferências agora.',
    status: 'Status',
    nextMessage: 'Próximo digest',
    subscribeButton: 'Ativar alertas',
    noSubscription: 'Os alertas ainda não estão ativos',
    noSubscriptionSubtitle:
      'Escolha seu canal e horário e inicie o teste grátis para receber sua agenda por email ou WhatsApp.',
    paymentPending: 'Pagamento pendente',
    paymentIssue: 'Problema de pagamento',
    billingSuccess: 'Sua assinatura está ativa. Sua primeira agenda está a caminho.',
    profileTitle: 'Perfil',
    profileSubtitle: 'Nome e fuso horário usados na sua agenda e nos digests.',
    profileSave: 'Salvar perfil',
    profileTimeZoneHint: 'Mudar o fuso atualiza os horários e seu horário de entrega.',
    passwordTitle: 'Senha',
    passwordSubtitle: 'Defina ou altere a senha da sua conta.',
    currentPasswordLabel: 'Senha atual',
    newPasswordLabel: 'Nova senha',
    confirmPasswordLabel: 'Confirmar nova senha',
    passwordSave: 'Atualizar senha',
    passwordSuccess: 'Senha atualizada.',
    passwordMismatchError: 'As novas senhas não coincidem.',
    passwordDifferentError: 'A nova senha deve ser diferente da atual.',
    passwordSaveError: 'Não foi possível atualizar a senha agora.',
    dangerTitle: 'Zona de perigo',
    dangerSubtitle: 'Excluir sua conta cancela a cobrança e remove suas preferências permanentemente.',
    deleteButton: 'Excluir conta',
    deleteLoading: 'Excluindo...',
    deleteConfirm: 'Excluir sua conta Trimry e cancelar qualquer assinatura? Isso não pode ser desfeito.',
    deleteError: 'Não foi possível excluir a conta agora.',
    deliveryHourLabel: 'Horário de entrega',
    deliveryHourHint: 'Hora local em {zone}.',
    emailDeliveryLabel: 'Entrega por email',
    whatsappOffSetup: 'WhatsApp está desligado. Escolha WhatsApp ou ambos para adicionar seu número.',
    whatsappConsentLabel: 'Aceito receber alertas esportivos da Trimry pelo WhatsApp.',
    whatsappConsentHint: 'Responda STOP quando quiser para cancelar.',
    whatsappConsentError: 'Confirme o consentimento do WhatsApp antes de habilitar esse canal.',
    pendingTitle: 'Termine de ativar seus alertas',
    pendingSubtitle: 'Suas configurações estão salvas. Conclua o checkout da Stripe para iniciar o teste.',
    pendingDeliveryPreferenceLabel: 'Canal',
    pendingEmailDeliveryLabel: 'Email',
    pendingTimingLabel: 'Horário de entrega',
    pendingWhatsappLabel: 'WhatsApp',
    activePlanTitle: 'Alertas ativos',
    canceledPlanTitle: 'Alertas cancelados',
    canceledNote: 'Suas preferências estão salvas. Reative quando quiser voltar a receber os digests.',
    activeNote: 'Sua agenda sai conforme o agendado. Mude o canal ou o horário abaixo.',
    deliveryPreferenceLabel: 'Canal',
    nextMessageIfReactivated: 'Próximo digest se reativar',
    saveDeliverySettings: 'Salvar ajustes de entrega',
    sendNowButton: 'Enviar minha agenda agora',
    sendNowSending: 'Enviando...',
    sendNowSuccess: 'Agenda enviada ({count} eventos). Confira seu email.',
    sendNowWhatsappPending: 'Email enviado; WhatsApp fica pendente até a Meta aprovar o template.',
    reactivateButton: 'Reativar alertas',
    reactivateLoading: 'Reativando...',
    cancelButton: 'Cancelar assinatura',
    cancelLoading: 'Cancelando...',
    manageBillingButton: 'Gerenciar cobrança',
    manageBillingLoading: 'Abrindo cobrança...',
    billingFootnoteCanceled: 'Reativar abre um novo checkout da Stripe.',
    billingFootnoteActive: 'Faturas, método de pagamento e cancelamento são gerenciados no portal Stripe.',
    cancelConfirm: 'Cancelar sua assinatura Trimry? Os alertas param no fim do período atual.',
    cancelSuccess: 'Assinatura cancelada.',
    cancelError: 'Não foi possível cancelar agora.',
    reactivateError: 'Não foi possível reativar agora.',
    openBillingError: 'Não foi possível abrir o portal de cobrança agora.',
    sportsSync: {
      title: 'Sync de eventos esportivos',
      subtitle: 'Cache de próximos eventos coletados com busca web da OpenAI para cada liga, time e esporte acompanhado.',
      runButton: 'Sincronizar pendentes',
      forceButton: 'Forçar sync completo',
      running: 'Sincronizando...',
      eventCount: 'Eventos em cache',
      upcomingCount: 'Próximos eventos',
      lastFetched: 'Última busca',
      providerNote:
        'Provedor: OpenAI {model} com busca web. Cada liga, time ou esporte é uma busca que cobre os próximos {days} dias e fica em cache por {hours} horas.',
      summary: 'Alvos {targets} · buscados {fetched} · pulados {skipped} · falhos {failed} · gravados {events}',
      statesTitle: 'Alvos de sync',
      loadError: 'Não foi possível carregar o status do sync.',
    },
    sendCampaigns: sendCampaignsEn,
  },
  scout: {
    name: 'Scout',
    launcherLabel: 'Falar com o Scout',
    launcherSubLabel: 'Seu assistente esportivo',
    title: 'Pergunte sobre qualquer jogo',
    introAnonymous:
      '⚽ Olá, eu sou o Scout. Me diga um time ou liga e mostro o que vem por aí. Crie uma conta para eu lembrar seus times.',
    introAccount:
      '⚽ Olá, eu sou o Scout. Posso adicionar times, mudar seu ritmo e contar o que tem. Os alertas por email e WhatsApp começam com sua assinatura.',
    introActive:
      '⚽ Olá, eu sou o Scout. Seus alertas estão ativos. Pergunte o que tem hoje, adicione um time ou mude suas configurações de entrega.',
    prompts: ['O que tem neste fim de semana?', 'Seguir Flamengo', 'Muda para semanal'],
    placeholder: 'Pergunte ao Scout...',
    send: 'Enviar',
    typing: 'O Scout está conferindo os calendários',
    issue:
      'Tive um problema temporário no canal web. Tente de novo em alguns segundos ou continue no WhatsApp.',
    memorySaved: 'Memória salva na sua conta',
    temporaryMemory: 'Memória temporária',
    alertsActive: 'Alertas ativos',
    alertsInactive: 'Alertas não ativos',
    createAccount: 'Criar conta',
    activateAlerts: 'Ativar alertas',
    openDashboard: 'Abrir painel',
    whatsappCta: 'Continuar no WhatsApp',
    preferencesUpdated: 'Preferências atualizadas',
  },
  statuses: { active: 'Ativa', paused: 'Pausada', canceled: 'Cancelada' },
  legal: legalPt,
  cookieConsent: {
    title: 'Cookies e analytics',
    description:
      'Usamos cookies essenciais e medição de anúncios/analytics. Este aviso é visual e sua escolha só controla a exibição desta mensagem.',
    accept: 'Aceitar analytics',
    decline: 'Recusar analytics',
    learnMore: 'Ler política de privacidade',
  },
  notifications: {
    success: 'Salvo com sucesso.',
    error: 'Algo deu errado. Tente novamente.',
  },
  notFound: {
    title: 'Página não encontrada',
    description: 'A página solicitada não está disponível.',
    cta: 'Voltar ao início',
  },
}

const messages: Record<LanguageCode, MessageSection> = { en, es, pt }

export function isLanguageCode(value: string): value is LanguageCode {
  return LANGUAGE_OPTIONS.some((option) => option.code === value)
}

export function languageFromLocale(value?: string | null): LanguageCode | null {
  const candidate = value?.trim().toLowerCase()

  if (!candidate) {
    return null
  }

  if (candidate.startsWith('es')) {
    return 'es'
  }

  if (candidate.startsWith('pt')) {
    return 'pt'
  }

  if (candidate.startsWith('en')) {
    return 'en'
  }

  return isLanguageCode(candidate) ? candidate : null
}

export function normalizeLanguageCode(value?: string | null): LanguageCode {
  return languageFromLocale(value) ?? DEFAULT_LANGUAGE
}

export function languageFromCountryCode(countryCode?: string | null): LanguageCode | null {
  const normalized = countryCode?.trim().toUpperCase()

  if (!normalized) {
    return null
  }

  if (SPANISH_SPEAKING_COUNTRY_CODES.has(normalized)) {
    return 'es'
  }

  if (PORTUGUESE_SPEAKING_COUNTRY_CODES.has(normalized)) {
    return 'pt'
  }

  return null
}

export function languageFromAcceptLanguage(acceptLanguage?: string | null): LanguageCode | null {
  const candidates =
    acceptLanguage
      ?.split(',')
      .map((entry) => entry.split(';')[0]?.trim())
      .filter((entry): entry is string => Boolean(entry)) ?? []

  for (const candidate of candidates) {
    const language = languageFromLocale(candidate)

    if (language) {
      return language
    }
  }

  return null
}

export function languageToIntlLocale(language?: string | null) {
  const normalized = normalizeLanguageCode(language)

  if (normalized === 'es') {
    return 'es-CL'
  }

  if (normalized === 'pt') {
    return 'pt-BR'
  }

  return 'en-US'
}

export function getMessages(language: LanguageCode): MessageSection {
  return messages[language] ?? messages.en
}

export function interpolate(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = values[key]
    return value === undefined ? match : String(value)
  })
}

export const DEFAULT_LANGUAGE: LanguageCode = 'en'
