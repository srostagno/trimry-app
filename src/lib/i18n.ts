export const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'pt', label: 'Português' },
] as const

export type LanguageCode = (typeof LANGUAGE_OPTIONS)[number]['code']

const SPANISH_SPEAKING_COUNTRY_CODES = new Set([
  'AR',
  'BO',
  'CL',
  'CO',
  'CR',
  'CU',
  'DO',
  'EC',
  'ES',
  'GQ',
  'GT',
  'HN',
  'MX',
  'NI',
  'PA',
  'PE',
  'PR',
  'PY',
  'SV',
  'UY',
  'VE',
])

const PORTUGUESE_SPEAKING_COUNTRY_CODES = new Set([
  'AO',
  'BR',
  'CV',
  'GW',
  'MO',
  'MZ',
  'PT',
  'ST',
  'TL',
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
    cancel: string
    continue: string
    backToLogin: string
    backToDashboard: string
    tryAgain: string
    returnHome: string
  }
  languageSwitcher: {
    label: string
  }
  nav: {
    home: string
    blog: string
    guide: string
    howItWorks: string
    pricing: string
    faq: string
    legal: string
    login: string
    register: string
    dashboard: string
    profile: string
    admin: string
    logout: string
  }
  footer: {
    rightsReserved: string
    companyNumber: string
    registeredOffice: string
    operationsOffice: string
    contact: string
  }
  hero: {
    badge: string
    title: string
    subtitle: string
    primary: string
    secondary: string
  }
  home: {
    releaseBadge: string
    releaseText: string
    releaseChannels: string
    releaseImageAlt: string
    beliefBadge: string
    beliefTitle: string
    beliefSubtitle: string
    teaserEyebrow: string
    couldBe: string
    teaserNote: string
    teaserButton: string
    seoGuideBadge: string
    seoGuideTitle: string
    seoGuideSubtitle: string
    seoGuideButton: string
    predictions: Array<{
      tone: 'good' | 'bad' | 'rare'
      text: string
    }>
  }
  story: {
    title: string
    subtitle: string
    card1Title: string
    card1Text: string
    card2Title: string
    card2Text: string
    card3Title: string
    card3Text: string
  }
  pricing: {
    title: string
    subtitle: string
    planTitle: string
    billing: string
    include1: string
    include2: string
    include3: string
    cta: string
  }
  weekly: {
    title: string
    subtitle: string
    good: string
    bad: string
    rare: string
  }
  faq: {
    title: string
    q1: string
    a1: string
    q2: string
    a2: string
    q3: string
    a3: string
    q4: string
    a4: string
  }
  cta: {
    title: string
    subtitle: string
    button: string
  }
  auth: {
    registerTitle: string
    registerSubtitle: string
    loginTitle: string
    loginSubtitle: string
    firstNameLabel: string
    lastNameLabel: string
    birthDateLabel: string
    timeZoneLabel: string
    timeZoneHint: string
    emailLabel: string
    passwordLabel: string
    whatsappLabel: string
    passwordHint: string
    registerButton: string
    loginButton: string
    needAccount: string
    alreadyHaveAccount: string
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
  }
  deliveryOnboarding: {
    loading: string
    loadError: string
    prepBadge: string
    prepTitle: string
    prepSubtitle: string
    preparationSteps: string[]
    editBadge: string
    createBadge: string
    editTitle: string
    createTitle: string
    editSubtitle: string
    createSubtitle: string
    activationChecklist: string[]
    dashboardChecklist: string[]
    setupTitle: string
    setupSubtitle: string
    channelLabel: string
    mondayTimeLabel: string
    mondayTimeHint: string
    emailDeliveryLabel: string
    whatsappOffHint: string
    whatsappConsentLabel: string
    whatsappConsentHint: string
    submitContinue: string
    submitSave: string
    saveError: string
    whatsappConsentError: string
  }
  activate: {
    loading: string
    loadError: string
    unavailable: string
    badge: string
    title: string
    subtitle: string
    cards: string[]
    primaryButton: string
    secondaryButton: string
    snapshotTitle: string
    deliveryPreferenceLabel: string
    emailDeliveryLabel: string
    projectionTimingLabel: string
    whatsappDeliveryLabel: string
    billingLabel: string
    billingValue: string
    unsubscribeTitle: string
    unsubscribeText: string
    sampleTitle: string
    sampleText: string
    sampleChannelLabel: string
    sampleEmailOption: string
    sampleWhatsappOption: string
    sampleBothOption: string
    sampleEmailButton: string
    sampleWhatsappButton: string
    sampleBothButton: string
    sampleWhatsappNumberLabel: string
    sampleWhatsappPlaceholder: string
    sampleWhatsappConsentLabel: string
    sampleAlreadySent: string
    sampleSuccess: string
    sampleEmailUnavailable: string
    sampleWhatsappConsentError: string
    previewBadge: string
    previewTitle: string
    previewLabel: string
    previewDayLabel: string
    emailFirstTitle: string
    whyItWorksLabel: string
    whyItWorksText: string
    carouselBadge: string
    carouselTitle: string
    carouselSubtitle: string
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
  dashboard: {
    title: string
    intro: string
    adminBadge: string
    loading: string
    noData: string
    tabs: {
      account: string
      predictionCalendar: string
      sends: string
      onboarding: string
    }
    onboarding: {
      title: string
      subtitle: string
      cta: string
      hint: string
    }
    status: string
    nextMessage: string
    subscribeButton: string
    noSubscription: string
    paymentPending: string
    paymentIssue: string
    billingSuccess: string
    profileTitle: string
    profileSubtitle: string
    profileSave: string
    profileTimeZoneHint: string
    projectionCalendar: {
      title: string
      subtitle: string
      fullAccessHint: string
      lockedAccessHint: string
      loadError: string
      lockedDayBadge: string
      lockedDayTitle: string
      lockedDaySubtitle: string
    }
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
    noSubscriptionSubtitle: string
    mondayProjectionTime: string
    sentOnMondaysAt: string
    emailDeliveryLabel: string
    whatsappOffSetup: string
    whatsappConsentLabel: string
    whatsappConsentHint: string
    whatsappConsentError: string
    pendingTitle: string
    pendingSubtitle: string
    pendingDeliveryPreferenceLabel: string
    pendingEmailDeliveryLabel: string
    pendingProjectionTimingLabel: string
    pendingWhatsappLabel: string
    continueActivation: string
    changeDeliverySettings: string
    activePlanTitle: string
    canceledPlanTitle: string
    canceledNote: string
    activeNote: string
    deliveryPreferenceLabel: string
    nextMessageIfReactivated: string
    weeklyProjectionTimeLabel: string
    futureMessagesHint: string
    whatsappOffActive: string
    saveDeliverySettings: string
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
    saveDeliveryError: string
    predictionCalendar: {
      title: string
      subtitle: string
      monthSummary: string
      daysInMonth: string
      goodDays: string
      badDays: string
      rareDays: string
      customDays: string
      customDaysText: string
      selectedDay: string
      jumpToCurrentMonth: string
      today: string
      goodTone: string
      badTone: string
      rareTone: string
      goodSummaryText: string
      badSummaryText: string
      rareSummaryText: string
      alignedActivities: string
      cautionActivities: string
      haircut: string
      shave: string
      nails: string
      release: string
      none: string
      summaryLabel: string
      notesLabel: string
      notesEnglishLabel: string
      notesSpanishLabel: string
      notesPortugueseLabel: string
      notesHint: string
      goodOption: string
      badOption: string
      rareOption: string
      importFromImage: string
      importFromImageBusy: string
      importFromImageHint: string
      importFromImageConfirm: string
      importFromImageSuccess: string
      importFromImageError: string
      weekImagePromptLabel: string
      weekImagePromptHint: string
      selectedWeekLabel: string
      imagesInSelectedWeek: string
      weekSelectorLabel: string
      weekDaysToGenerateLabel: string
      selectedDaysCountLabel: string
      selectAllWeekDays: string
      clearSelectedWeekDays: string
      weekHtmlGeneratorLabel: string
      weekHtmlGeneratorHint: string
      generateWeekHtml: string
      generateWeekHtmlBusy: string
      generateWeekHtmlConfirm: string
      generateWeekHtmlSuccess: string
      generateWeekHtmlError: string
      copyWeekHtml: string
      copyWeekHtmlSuccess: string
      copyWeekHtmlError: string
      weekHtmlPreviewLabel: string
      weekHtmlSubjectLabel: string
      weekHtmlPreviewTextLabel: string
      weekHtmlCodeLabel: string
      generateWeekImages: string
      generateWeekImagesBusy: string
      generateWeekImagesConfirm: string
      generateWeekImagesSuccess: string
      generateWeekImagesError: string
      generateSelectedDays: string
      generateSelectedDaysBusy: string
      generateSelectedDaysConfirm: string
      generateSelectedDaysSuccess: string
      generateSelectedDaysError: string
      generateSelectedDayImage: string
      generateSelectedDayImageBusy: string
      generateSelectedDayImageConfirm: string
      generateSelectedDayImageSuccess: string
      generateSelectedDayImageError: string
      dayImageBadge: string
      dayImagePreviewLabel: string
      saveDay: string
      resetDay: string
      resetConfirm: string
      overrideBadge: string
      generatedBadge: string
      saveSuccess: string
      saveError: string
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
  carousel: {
    proofLabel: string
    whyTitle: string
    whyText: string
    effectTitle: string
    effectText: string
    sequenceLabel: string
  }
  notFound: {
    title: string
    description: string
    cta: string
  }
}

const englishMessages: MessageSection = {
  common: {
    loading: 'Loading...',
    saving: 'Saving...',
    previous: 'Previous',
    next: 'Next',
    cancel: 'Cancel',
    continue: 'Continue',
    backToLogin: 'Back to login',
    backToDashboard: 'Back to dashboard',
    tryAgain: 'Try again',
    returnHome: 'Return home',
  },
  languageSwitcher: {
    label: 'Lang',
  },
  nav: {
    home: 'Home',
    blog: 'Blog',
    guide: 'Guide',
    howItWorks: 'How it works',
    pricing: 'Plan',
    faq: 'FAQ',
    legal: 'Legal',
    login: 'Log in',
    register: 'Create account',
    dashboard: 'Dashboard',
    profile: 'Profile',
    admin: 'Admin',
    logout: 'Log out',
  },
  footer: {
    rightsReserved: 'All rights reserved.',
    companyNumber: 'Company number',
    registeredOffice: 'Registered office',
    operationsOffice: 'Operations office',
    contact: 'Contact',
  },
  hero: {
    badge: 'Your Luck Guide',
    title: 'Manifest Better Luck',
    subtitle:
      'Daily signals, rituals, and timing insights designed to help you align with opportunity.',
    primary: 'Reveal Today’s Luck',
    secondary: 'Start Now',
  },
  home: {
    releaseBadge: 'Release has timing',
    releaseText:
      'A cut can be cosmetic. At the right moment, it feels like a clean break with doubt, heaviness, and stale energy.',
    releaseChannels: 'Choose daily delivery by email, WhatsApp, or both.',
    releaseImageAlt:
      'A person cutting their hair while bright energy spills from the cut like a ritual release.',
    beliefBadge: 'Belief engine',
    beliefTitle: 'Feeling lucky changes how you enter the room.',
    beliefSubtitle:
      'The Trimry thesis is simple: when you believe timing is on your side, you notice opportunities faster, act with more optimism, and make better momentum visible.',
    teaserEyebrow: 'Daily cosmic teaser',
    couldBe: 'Could be...',
    teaserNote:
      'Start the flow to reveal your symbols and open your personal calendar preview.',
    teaserButton: 'Reveal my real forecast',
    seoGuideBadge: 'SEO guide',
    seoGuideTitle: 'Need the full guide on good and bad haircut and nail days?',
    seoGuideSubtitle:
      'Read our English guide built around the query “Good and Bad Days to Cut your Hair, Nails and more” with practical weekly timing rules.',
    seoGuideButton: 'Read the full guide',
    predictions: [
      {
        tone: 'good',
        text: 'good fortune expands around you. A money-related message or useful opportunity could arrive.',
      },
      {
        tone: 'good',
        text: 'love energy opens. You could meet someone magnetic or receive an unexpected romantic signal.',
      },
      {
        tone: 'bad',
        text: 'misunderstandings may grow fast today. Avoid emotional decisions and risky spending.',
      },
      {
        tone: 'bad',
        text: 'plans can stall and support may feel distant. Stay practical and postpone major commitments.',
      },
      {
        tone: 'rare',
        text: 'rare wildcard day: a strange coincidence could bring a gift, lead, or sudden invitation.',
      },
      {
        tone: 'rare',
        text: 'karmic crossing: old love or old business could return asking for closure.',
      },
      {
        tone: 'good',
        text: 'prosperity window: an overdue payment, discount, or helpful ally could appear unexpectedly.',
      },
      {
        tone: 'bad',
        text: 'energy feels heavy and reactive. Protect your peace and avoid arguments about money or relationships.',
      },
      {
        tone: 'rare',
        text: 'unusual magnetism surrounds you. Someone influential may share confidential advice or a hidden opportunity.',
      },
    ],
  },
  story: {
    title: 'Your personal timing guide for what may lie ahead.',
    subtitle:
      'Trimry reads your zodiac, Chinese symbol, and ancient timing patterns to help you plan with more intention.',
    card1Title: 'Personal symbols',
    card1Text:
      'Your birth date opens a zodiac and Chinese symbol layer that shapes the calendar around you.',
    card2Title: 'Timing windows',
    card2Text:
      'See when the pattern invites action, patience, release, or a cleaner decision.',
    card3Title: 'Calendar preview',
    card3Text:
      'Open a focused view of the coming days and unlock the full planning layer when you are ready.',
  },
  pricing: {
    title: 'Unlock your personalized luck calendar',
    subtitle:
      'Begin when you are ready to reveal the next days and plan around the rhythm of your symbols.',
    planTitle: 'Personal luck calendar',
    billing:
      'Trial starts in Stripe, then continue for {billingInline}. Cancel anytime.',
    include1: 'A rolling 7-day calendar with Good, Bad, and Rare fortune signals',
    include2: 'Personalized guidance shaped by your symbols and wish',
    include3:
      'Manifestation cues for money, relationships, energy, and personal timing',
    cta: 'Start free trial',
  },
  weekly: {
    title: 'Today’s cosmic prediction',
    subtitle:
      'A rotating teaser about fortune, love, money, and luck. Subscribe to unlock the full calendar view.',
    good: 'Good',
    bad: 'Bad',
    rare: 'Rare',
  },
  faq: {
    title: 'Frequently asked questions',
    q1: 'Is this a medical or scientific recommendation?',
    a1: 'No. Trimry is a cultural and ritual timing service for personal routines.',
    q2: 'When do I receive the message?',
    a2: 'Subscribers unlock a rolling 7-day calendar and can review the next signals from the dashboard.',
    q3: 'How do I manage billing?',
    a3: 'From your dashboard, where you can cancel anytime, reactivate later, and still open the secure Stripe billing portal for payment methods and invoices.',
    q4: 'Which timezone is used?',
    a4: 'We use the IANA time zone saved in your account and you can change both time zone and daily delivery hour from your dashboard.',
  },
  cta: {
    title: 'Stay aligned with luck every day.',
    subtitle:
      'Create your Trimry account, reveal your symbols, and keep your personal calendar close.',
    button: 'Open my account',
  },
  auth: {
    registerTitle: 'Start in 10 seconds',
    registerSubtitle:
      'Enter your name, birth date, and contact so Trimry can open your personal luck code.',
    loginTitle: 'Welcome back',
    loginSubtitle: 'Sign in to manage your daily luck delivery.',
    firstNameLabel: 'First name',
    lastNameLabel: 'Last name',
    birthDateLabel: 'Date of birth',
    timeZoneLabel: 'Time zone',
    timeZoneHint:
      'We use this to schedule your daily projection at the right local time.',
    emailLabel: 'Email address',
    passwordLabel: 'Password',
    whatsappLabel: 'WhatsApp number',
    passwordHint:
      'Minimum 10 characters, including uppercase, lowercase, and number.',
    registerButton: 'Continue',
    loginButton: 'Log in',
    needAccount: 'Need an account?',
    alreadyHaveAccount: 'Already have an account?',
  },
  deliveryChannels: {
    noneTitle: 'No reminders',
    noneDescription: 'Use Trimry as your luck calendar first. Add email or WhatsApp later if you want nudges.',
    bothTitle: 'Email + WhatsApp',
    bothDescription: 'Email first, with WhatsApp as an optional second channel.',
    emailTitle: 'Email only',
    emailDescription: 'The simplest default for most users.',
    whatsappTitle: 'WhatsApp only',
    whatsappDescription: 'Phone-first delivery when you prefer it.',
  },
  deliveryOnboarding: {
    loading: 'Loading your onboarding flow...',
    loadError: 'Unable to load your account right now.',
    prepBadge: 'Fortune ignition',
    prepTitle: 'Getting your fortune ready...',
    prepSubtitle:
      'We are binding your chosen delivery channel to your daily luck cadence and preparing your subscription activation step.',
    preparationSteps: [
      'Choosing your delivery ritual',
      'Binding your release timing',
      'Charging daily abundance',
      'Preparing your activation gate',
    ],
    editBadge: 'Delivery settings',
    createBadge: 'Onboarding step 1',
    editTitle: 'Update where Trimry should deliver your daily projection',
    createTitle: 'How should Trimry deliver your daily projection?',
    editSubtitle:
      'Change your delivery preference anytime. Use email, WhatsApp, or keep both channels active.',
    createSubtitle:
      'Email is the default. Add WhatsApp only if you want phone delivery too.',
    activationChecklist: [
      'Choose email first, then add WhatsApp only if you want it.',
      'Your activation page opens before Stripe.',
      'You can change delivery later from the dashboard.',
    ],
    dashboardChecklist: [
      'Choose your delivery preference.',
      'Add WhatsApp only if you want it enabled.',
      'You return to your dashboard.',
    ],
    setupTitle: 'Delivery setup',
    setupSubtitle:
      'Email goes to your inbox. WhatsApp stays optional unless you turn it on.',
    channelLabel: 'Delivery channel',
    mondayTimeLabel: 'Daily projection time',
    mondayTimeHint: 'Scheduled every day at {time} in {zone}.',
    emailDeliveryLabel: 'Email delivery',
    whatsappOffHint:
      'WhatsApp is off by default. Turn it on only if you want phone delivery too.',
    whatsappConsentLabel:
      'I consent to receive Trimry subscription messages on WhatsApp at this number.',
    whatsappConsentHint:
      'You can opt out anytime by replying STOP in WhatsApp or by disabling WhatsApp delivery in your dashboard.',
    submitContinue: 'Continue to activation',
    submitSave: 'Save delivery settings',
    saveError: 'Unable to save your delivery settings right now.',
    whatsappConsentError:
      'Please confirm WhatsApp consent before enabling WhatsApp delivery.',
  },
  activate: {
    loading: 'Loading your activation step...',
    loadError: 'Unable to load your activation step right now.',
    unavailable: 'Unable to continue right now.',
    badge: '{trialPeriodDays}-day free trial',
    title:
      'Start your daily luck guide free for {trialPeriodDays} days.',
    subtitle:
      'No charge today. Trimry gives you a daily signal designed to focus intention, strengthen belief, and help you move through the day feeling luckier and more open to real fortune.',
    cards: [
      '{trialPeriodDays} days free in Stripe checkout.',
      'Daily manifestation cues for money, relationships, energy, and release.',
      'Monthly timing calendar to help you choose better moments.',
    ],
    primaryButton: 'Start {trialPeriodDays} days free',
    secondaryButton: 'Change delivery settings',
    snapshotTitle: 'Your activation snapshot',
    deliveryPreferenceLabel: 'Delivery preference',
    emailDeliveryLabel: 'Email delivery',
    projectionTimingLabel: 'Projection timing',
    whatsappDeliveryLabel: 'WhatsApp delivery',
    billingLabel: 'Today',
    billingValue:
      'Free for {trialPeriodDays} days in Stripe. After that, continue for {billingInline}.',
    unsubscribeTitle: 'Easy to unsubscribe',
    unsubscribeText:
      'If Trimry is not for you, cancellation is simple: message Luck Guru, cancel from the web dashboard, or ask us by email.',
    sampleTitle: 'Try one real daily projection',
    sampleText:
      'Send yourself one sample before subscribing. Use it as a manifestation habit: read the signal, set an intention, and notice how fortune starts shaping your posture.',
    sampleChannelLabel: 'Send it by',
    sampleEmailOption: 'Email',
    sampleWhatsappOption: 'WhatsApp',
    sampleBothOption: 'Both',
    sampleEmailButton: 'Send email sample',
    sampleWhatsappButton: 'Send WhatsApp sample',
    sampleBothButton: 'Send both',
    sampleWhatsappNumberLabel: 'WhatsApp number',
    sampleWhatsappPlaceholder: '+14155550123',
    sampleWhatsappConsentLabel:
      'I consent to receive this Trimry sample and subscription messages on WhatsApp.',
    sampleAlreadySent: 'Your one-time sample was already sent.',
    sampleSuccess:
      'Sample sent. If this rhythm feels useful, continue with Stripe to receive Trimry every day.',
    sampleEmailUnavailable:
      'This account does not have a regular email address for sample delivery.',
    sampleWhatsappConsentError:
      'Confirm WhatsApp consent before sending the sample.',
    previewBadge: 'Trial preview',
    previewTitle: 'What unlocks during your trial',
    previewLabel: 'Preview',
    previewDayLabel: 'Daily signal',
    emailFirstTitle: 'Email-first delivery',
    whyItWorksLabel: 'Why it works',
    whyItWorksText:
      'Manifestation works best when belief becomes a daily posture. Trimry turns that belief into a simple rhythm: notice the signal, set your intention, and act as if luck is already moving with you.',
    carouselBadge: 'Momentum psychology',
    carouselTitle: 'Luck gets stronger when your mind starts moving with it.',
    carouselSubtitle:
      'These voices all point at the same mechanism: belief changes posture, posture changes action, and action changes what feels possible.',
  },
  checkout: {
    badge: 'Stripe subscription',
    badgeCancelled: 'Checkout paused',
    title: 'Opening your Trimry subscription...',
    titleCancelled: 'Your subscription is waiting',
    subtitle:
      'Stripe securely confirms your payment method so your daily luck guide can continue.',
    subtitleCancelled:
      'Nothing was lost. Your settings are still saved, and you can subscribe whenever you are ready.',
    openError: 'Unable to open Stripe checkout right now.',
    resumeTitle: 'Subscribe to Trimry',
    resumeSubtitle:
      'Your daily guidance is still waiting. Continue to Stripe and confirm your subscription.',
    resumeButton: 'Subscribe with Stripe',
    resumeHint: 'Secure Stripe checkout. Cancel anytime.',
    deliveryLabel: 'Delivery channel',
    timingLabel: 'Daily timing',
    helper:
      'We are creating secure Stripe checkout for your subscription. If nothing happens, wait a second or reload this page.',
    unsubscribeHelp:
      'Unsubscribing is easy: message Luck Guru, cancel from the web dashboard, or ask us by email.',
    trialHighlights: [
      'Daily fortune signal delivered by email, WhatsApp, or both.',
      'Manifestation rhythm for belief, action, and opportunity.',
      'Weekly luck calendar unlocked with your subscription.',
    ],
  },
  dashboard: {
    title: 'Your subscription dashboard',
    intro: 'Manage your delivery channels and daily Trimry plan.',
    adminBadge: 'Admin account',
    loading: 'Loading your account...',
    noData: 'Sign in to access your dashboard.',
    tabs: {
      account: 'Account',
      predictionCalendar: 'Prediction calendar',
      sends: 'Sends',
      onboarding: 'Onboarding',
    },
    onboarding: {
      title: 'Admin onboarding lab',
      subtitle:
        'Use this section to open and test the onboarding flow as an admin account without leaving your dashboard.',
      cta: 'Open onboarding flow',
      hint: 'This opens /activate in admin testing mode.',
    },
    status: 'Status',
    nextMessage: 'Next daily message',
    subscribeButton: 'Activate subscription',
    noSubscription: 'You do not have an active subscription yet.',
    paymentPending: 'Payment pending',
    paymentIssue: 'Payment issue',
    billingSuccess:
      'Stripe reported a successful checkout. We are syncing your subscription now.',
    profileTitle: 'Account profile',
    profileSubtitle:
      'Update your identity details and the time zone used for your daily projection.',
    profileSave: 'Save profile',
    profileTimeZoneHint: 'Daily delivery is calculated from this IANA time zone.',
    projectionCalendar: {
      title: 'Projection calendar',
      subtitle:
        'Plan around your next 7 luck days. Subscribers unlock the current week, not the whole month ahead.',
      fullAccessHint:
        'Luck week unlocked. Review the next 7 days and plan your moves with better timing.',
      lockedAccessHint:
        'Only today is unlocked on this account. Activate your subscription to reveal the full luck week.',
      loadError: 'Unable to load your projection calendar right now.',
      lockedDayBadge: 'Locked',
      lockedDayTitle: 'Day locked',
      lockedDaySubtitle:
        'Activate your subscription to reveal this day inside your 7-day luck plan.',
    },
    passwordTitle: 'Security',
    passwordSubtitle:
      'Change your password whenever needed. You must confirm your current password first.',
    currentPasswordLabel: 'Current password',
    newPasswordLabel: 'New password',
    confirmPasswordLabel: 'Confirm new password',
    passwordSave: 'Update password',
    passwordSuccess: 'Password updated successfully.',
    passwordMismatchError: 'New password and confirmation do not match.',
    passwordDifferentError:
      'New password must be different from your current password.',
    passwordSaveError: 'Unable to update your password right now.',
    dangerTitle: 'Danger zone',
    dangerSubtitle:
      'Delete your account and sign out immediately. We keep a soft-deleted record for audit purposes, but your login email is anonymized and your active delivery channels are stopped.',
    deleteButton: 'Delete account',
    deleteLoading: 'Deleting...',
    deleteConfirm:
      'Delete your account? This will sign you out immediately and stop your current delivery channels.',
    deleteError: 'Unable to delete your account right now.',
    noSubscriptionSubtitle:
      '{billingCompact} · unlock your 7-day luck calendar. Reminders are optional.',
    mondayProjectionTime: 'Optional reminder time',
    sentOnMondaysAt: 'If reminders are enabled, they send every day at {time} in {zone}.',
    emailDeliveryLabel: 'Email delivery',
    whatsappOffSetup:
      'WhatsApp is off. You can use Trimry only as a calendar, or enable reminders later.',
    whatsappConsentLabel:
      'I consent to receive Trimry subscription messages on WhatsApp at this number.',
    whatsappConsentHint:
      'You can opt out anytime by replying STOP in WhatsApp or by disabling WhatsApp delivery here.',
    whatsappConsentError:
      'Please confirm WhatsApp consent before enabling WhatsApp delivery.',
    pendingTitle: 'Activate your Trimry subscription',
    pendingSubtitle:
      'Your delivery preference is already saved. Before payment, we take you through a short activation step that frames the daily guidance and then opens secure Stripe checkout.',
    pendingDeliveryPreferenceLabel: 'Delivery preference',
    pendingEmailDeliveryLabel: 'Email delivery',
    pendingProjectionTimingLabel: 'Projection timing',
    pendingWhatsappLabel: 'WhatsApp delivery',
    continueActivation: 'Continue activation',
    changeDeliverySettings: 'Change delivery settings',
    activePlanTitle: 'Trimry Luck Calendar',
    canceledPlanTitle: 'Your Trimry subscription is canceled',
    canceledNote:
      'You can reactivate anytime from this account. Your delivery channels and daily timing are still saved below.',
    activeNote:
      'Cancel anytime from this dashboard. If you return later, you can reactivate from the same account.',
    deliveryPreferenceLabel: 'Delivery preference',
    nextMessageIfReactivated: 'If reactivated today, your next message would be',
    weeklyProjectionTimeLabel: 'Optional reminder time',
    futureMessagesHint: 'If reminders are enabled, future messages follow this hour in {zone}.',
    whatsappOffActive:
      'WhatsApp is off. Your calendar still works; turn WhatsApp on only if you want phone reminders.',
    saveDeliverySettings: 'Save reminder settings',
    reactivateButton: 'Reactivate subscription',
    reactivateLoading: 'Preparing reactivation...',
    cancelButton: 'Cancel subscription',
    cancelLoading: 'Canceling...',
    manageBillingButton: 'Manage billing in Stripe',
    manageBillingLoading: 'Opening Stripe...',
    billingFootnoteCanceled:
      'You can reactivate from this account at any time. Stripe Billing remains available for invoices and historical billing records.',
    billingFootnoteActive:
      'Payment method changes and invoice history still live in Stripe Billing, but you can now cancel directly from this dashboard whenever you want.',
    cancelConfirm:
      'Cancel your subscription now? You will stop future billing immediately and can reactivate later from this account.',
    cancelSuccess:
      'Your subscription is canceled. Your delivery settings stay saved here, and you can reactivate anytime.',
    cancelError: 'Unable to cancel your subscription right now.',
    reactivateError: 'Unable to reactivate your subscription right now.',
    openBillingError: 'Unable to open Stripe billing right now.',
    saveDeliveryError: 'Unable to save your delivery settings.',
    predictionCalendar: {
      title: 'Admin prediction calendar',
      subtitle:
        'Review the monthly ritual pattern before it goes live. Use the same Good, Bad, and Rare signal system seen on the home experience.',
      monthSummary: 'Month summary',
      daysInMonth: 'days in this month',
      goodDays: 'Good days',
      badDays: 'Bad days',
      rareDays: 'Rare days',
      customDays: 'Custom days',
      customDaysText: 'days manually overridden in this month',
      selectedDay: 'Selected day',
      jumpToCurrentMonth: 'Current month',
      today: 'Today',
      goodTone: 'Good',
      badTone: 'Bad',
      rareTone: 'Rare',
      goodSummaryText:
        'Momentum favors visible changes and fortunate timing.',
      badSummaryText:
        'Friction, delay, or awkward timing is more likely here.',
      rareSummaryText:
        'The unusual pattern. Expect coincidence, novelty, or a strange opening.',
      alignedActivities: 'Aligned activities',
      cautionActivities: 'Use caution',
      haircut: 'Haircut',
      shave: 'Shave',
      nails: 'Nails',
      release: 'Release',
      none: 'None',
      summaryLabel: 'Prediction',
      notesLabel: 'Prediction note',
      notesEnglishLabel: 'Note (English)',
      notesSpanishLabel: 'Note (Spanish)',
      notesPortugueseLabel: 'Note (Portuguese)',
      notesHint:
        'All notes are required and will be used according to the active language.',
      goodOption: 'Good',
      badOption: 'Bad',
      rareOption: 'Rare',
      importFromImage: 'Fill month from image',
      importFromImageBusy: 'Generating from image',
      importFromImageHint:
        'Upload a reference calendar image and ChatGPT will generate fresh Good, Bad, and Rare notes in English and Spanish for this month.',
      importFromImageConfirm:
        'Replace the visible month with a new image-based prediction import?',
      importFromImageSuccess: 'Prediction month imported from image.',
      importFromImageError:
        'Unable to generate a prediction month from that image right now.',
      weekImagePromptLabel: 'Weekly image prompt',
      weekImagePromptHint:
        'You can edit placeholders like {date}, {weekday}, {summary}, {noteEn}, {noteEs}, {localizedDate}, and {weekContext}.',
      selectedWeekLabel: 'Selected week',
      imagesInSelectedWeek: 'Generated images in this week',
      weekSelectorLabel: 'Week to edit',
      weekDaysToGenerateLabel: 'Days to generate',
      selectedDaysCountLabel: 'Selected days',
      selectAllWeekDays: 'Select full week',
      clearSelectedWeekDays: 'Clear selection',
      weekHtmlGeneratorLabel: 'Weekly email HTML builder',
      weekHtmlGeneratorHint:
        'Build a ready-to-send email HTML with one selected day per row, then preview it before sending.',
      generateWeekHtml: 'Generate email HTML',
      generateWeekHtmlBusy: 'Generating email HTML',
      generateWeekHtmlConfirm:
        'Generate an email-ready weekly HTML using the selected days?',
      generateWeekHtmlSuccess: 'Weekly email HTML generated.',
      generateWeekHtmlError:
        'Unable to generate weekly email HTML right now.',
      copyWeekHtml: 'Copy HTML',
      copyWeekHtmlSuccess: 'Weekly email HTML copied.',
      copyWeekHtmlError: 'Unable to copy HTML right now.',
      weekHtmlPreviewLabel: 'Email preview',
      weekHtmlSubjectLabel: 'Email subject',
      weekHtmlPreviewTextLabel: 'Preview text',
      weekHtmlCodeLabel: 'Email HTML source',
      generateWeekImages: 'Generate week images',
      generateWeekImagesBusy: 'Generating week images',
      generateWeekImagesConfirm:
        'Generate and save one image for each day in the selected week?',
      generateWeekImagesSuccess:
        'Week images generated and saved for each day.',
      generateWeekImagesError:
        'Unable to generate week images right now.',
      generateSelectedDays: 'Generate selected days',
      generateSelectedDaysBusy: 'Generating selected days',
      generateSelectedDaysConfirm:
        'Generate and save images for the selected days?',
      generateSelectedDaysSuccess:
        'Selected day images generated and saved.',
      generateSelectedDaysError:
        'Unable to generate images for the selected days right now.',
      generateSelectedDayImage: 'Generate selected day image',
      generateSelectedDayImageBusy: 'Generating selected day image',
      generateSelectedDayImageConfirm:
        'Generate and save an image for the selected day only?',
      generateSelectedDayImageSuccess:
        'Selected day image generated and saved.',
      generateSelectedDayImageError:
        'Unable to generate the selected day image right now.',
      dayImageBadge: 'Image ready',
      dayImagePreviewLabel: 'Saved day image',
      saveDay: 'Save day',
      resetDay: 'Reset override',
      resetConfirm: 'Reset this day back to the generated Trimry pattern?',
      overrideBadge: 'Custom override',
      generatedBadge: 'Generated pattern',
      saveSuccess: 'Prediction saved.',
      saveError: 'Unable to save this prediction right now.',
      loadError: 'Unable to load the admin prediction calendar right now.',
    },
    sendCampaigns: {
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
      testingHintWhatsapp:
        'WhatsApp testing sends the configured template directly to one number.',
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
        'Generate a professional weekly Trimry email with logo, inbox-friendly structure, and a CTA to trimry.com.',
      emailGenerateTemplate: 'Generate weekly template',
      emailTemplateGenerated: 'Weekly email template generated.',
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
    },
  },
  statuses: {
    active: 'Active',
    paused: 'Paused',
    canceled: 'Canceled',
  },
  legal: {
    terms: 'Terms of Service',
    privacy: 'Privacy Policy',
    disclaimer: 'Ritual Disclaimer',
    dataDeletion: 'Data Deletion Instructions',
    englishNotice:
      'Legal master text is maintained in English. Localized interface labels are provided for convenience.',
    termsSections: [
      {
          title: '1. Service description',
          body:
          'Trimry provides weekly timing guidance for fortune, grooming, energy, relationships, money, and symbolic release routines. Subscribers can view a rolling 7-day luck calendar on the web. Email and WhatsApp reminders are optional.',
      },
      {
        title: '2. Subscription and billing',
        body:
          'The Trimry plan is billed at {billingLegal}. It includes access to a rolling 7-day luck calendar. Email and WhatsApp reminders are optional and depend on the channel selected in your dashboard. You can cancel your subscription at any time from your account dashboard. If you decide to come back later, you can reactivate from the same account by starting a new Stripe checkout. Billing details, payment methods, invoices, and historical billing records remain available through the Stripe-hosted billing tools linked from your dashboard.',
      },
      {
        title: '3. WhatsApp consent and contact rules',
        body:
          'You must only provide phone numbers for recipients who have consented to receive your requested Trimry subscription communications. If you enable WhatsApp delivery, you authorize Trimry to send subscription and service-related WhatsApp messages to that number. You can opt out at any time by replying STOP (or equivalent command) in WhatsApp or by disabling WhatsApp delivery from your account settings.',
      },
      {
        title: '4. Account security',
        body:
          'You must keep your login credentials confidential. You are responsible for all actions performed through your account.',
      },
      {
        title: '5. Acceptable use',
        body:
          'You agree not to misuse the service, attempt unauthorized access, or use Trimry for unlawful activity.',
      },
      {
        title: '6. Service providers',
        body:
          'Trimry relies on third-party providers to operate the service, including payment processing (Stripe), WhatsApp delivery infrastructure (Meta/WhatsApp), cloud hosting, and database infrastructure. Provider availability, policy controls, and technical limits may affect delivery outcomes.',
      },
      {
        title: '7. No professional advice',
        body:
          'Trimry provides cultural and ritual timing content only. It is not medical, legal, or financial advice.',
      },
      {
        title: '8. Company information',
        body:
          'Trimry Limited, company number 752517. Registered office: 71 Lower Baggot Street, Co. Dublin, D02 P593, Dublin 2, Ireland. Operations office: Carrer Emili Darder 1, Balearic Islands, Mallorca, 07181. Contact: support@trimry.com.',
      },
    ],
    privacySections: [
      {
        title: '1. Data we collect',
        body:
          'We collect account and subscription data needed to operate Trimry, including name, email address, password hash, locale, time zone, optional birth date, delivery preferences, and WhatsApp number when enabled. We also process operational security and delivery metadata such as session/IP and user-agent records, message delivery status metadata, and billing identifiers from Stripe.',
      },
      {
        title: '2. How we use data',
        body:
          'We use data to authenticate accounts, secure sessions, manage subscriptions, send daily content, personalize zodiac and Chinese calendar summaries, process billing and account operations, handle support, and monitor service reliability and fraud/security risks.',
      },
      {
        title: '3. WhatsApp communications and consent',
        body:
          'We send WhatsApp messages only when WhatsApp delivery is enabled with your consent. You can withdraw WhatsApp consent by replying STOP (or equivalent command) or by disabling WhatsApp delivery in your account. We record consent and opt-out events for compliance and abuse prevention.',
      },
      {
        title: '4. Data sharing',
        body:
          'We do not sell personal data. We share data only with processors required to operate the service, such as Meta/WhatsApp (message transport and status), Stripe (billing), and infrastructure providers for hosting and database operations.',
      },
      {
        title: '5. Cookies and analytics',
        body:
          'We use essential cookies for authentication and session continuity. We also use Meta ad measurement and analytics tools to attribute campaign traffic and improve performance. The website prompt is informational/visual and does not disable measurement.',
      },
      {
        title: '6. International transfers',
        body:
          'Because our providers operate globally, your data may be processed outside your country of residence. We use provider contractual and technical safeguards appropriate to service operations.',
      },
      {
        title: '7. Retention',
        body:
          'We keep personal data only as long as needed for service operation, legal obligations, fraud/security handling, billing/audit records, and dispute resolution. Retention periods vary by data type and legal requirement.',
      },
      {
        title: '8. User rights',
        body:
          'You may request account access, corrections, or deletion by contacting support@trimry.com. You can also delete your account from your dashboard. Some records may be retained where required by law or for legitimate security/audit needs.',
      },
      {
        title: '9. Data storage',
        body:
          'Account data is stored in MongoDB infrastructure configured by Trimry. Session cookies are HTTP-only and signed for security.',
      },
      {
        title: '10. Company contact',
        body:
          'Trimry Limited, company number 752517. Registered office: 71 Lower Baggot Street, Co. Dublin, D02 P593, Dublin 2, Ireland. Operations office: Carrer Emili Darder 1, Balearic Islands, Mallorca, 07181.',
      },
    ],
    disclaimerSections: [
      {
        title: 'Cultural content',
        body:
          'Trimry timing guidance is based on cultural interpretation and ritual tradition. It is intended for personal reflection and routine planning.',
      },
      {
        title: 'No guarantee of outcomes',
        body:
          'Trimry does not guarantee luck, financial outcomes, health outcomes, or any specific result from following guidance.',
      },
      {
        title: 'Personal responsibility',
        body:
          'You remain fully responsible for personal grooming, health decisions, and any action taken based on service content.',
      },
    ],
    dataDeletionSections: [
      {
        title: '1. Delete from your Trimry dashboard',
        body:
          'Sign in to your Trimry account, open your dashboard settings, and use the account deletion option. This is the fastest way to request deletion of your user account data.',
      },
      {
        title: '2. Delete by email request',
        body:
          'If you cannot access your account, email support@trimry.com from your registered address with subject "Data Deletion Request". We may request account verification before processing.',
      },
      {
        title: '3. What is deleted and what may be retained',
        body:
          'When a deletion request is completed, account profile data, delivery preferences, and active subscription delivery settings are removed or anonymized according to system design. Limited records may be retained when required for legal compliance, billing audit trails, security/fraud prevention, or dispute resolution.',
      },
      {
        title: '4. Processing timeline',
        body:
          'We process deletion requests as soon as reasonably possible after verification. If a provider-managed record exists (for example payment invoices in Stripe), retention may follow that provider legal obligations.',
      },
    ],
  },
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
  carousel: {
    proofLabel: 'Rotating proof of mindset',
    whyTitle: 'Why this matters',
    whyText:
      'When people feel favored by timing, they carry more confidence, notice more openings, and move with less hesitation.',
    effectTitle: 'Trimry effect',
    effectText:
      'The daily message is designed to sharpen attention, reinforce optimism, and turn ritual into momentum you can actually feel.',
    sequenceLabel: 'Quote sequence',
  },
  notFound: {
    title: 'Page not found',
    description: 'The page you requested is not available.',
    cta: 'Return home',
  },
}

const spanishMessages: MessageSection = {
  common: {
    loading: 'Cargando...',
    saving: 'Guardando...',
    previous: 'Anterior',
    next: 'Siguiente',
    cancel: 'Cancelar',
    continue: 'Continuar',
    backToLogin: 'Volver al inicio de sesión',
    backToDashboard: 'Volver al panel',
    tryAgain: 'Intentar de nuevo',
    returnHome: 'Volver al inicio',
  },
  languageSwitcher: {
    label: 'Idioma',
  },
  nav: {
    home: 'Inicio',
    blog: 'Blog',
    guide: 'Guía',
    howItWorks: 'Cómo funciona',
    pricing: 'Plan',
    faq: 'FAQ',
    legal: 'Legal',
    login: 'Ingresar',
    register: 'Crear cuenta',
    dashboard: 'Panel',
    profile: 'Perfil',
    admin: 'Admin',
    logout: 'Salir',
  },
  footer: {
    rightsReserved: 'Todos los derechos reservados.',
    companyNumber: 'Número de compañía',
    registeredOffice: 'Oficina registrada',
    operationsOffice: 'Oficina operativa',
    contact: 'Contacto',
  },
  hero: {
    badge: 'Your Luck Guide',
    title: 'Manifiesta mejor suerte',
    subtitle:
      'Señales diarias, rituales y momentos clave diseñados para ayudarte a alinearte con la oportunidad.',
    primary: 'Revela la suerte de hoy',
    secondary: 'Empezar ahora',
  },
  home: {
    releaseBadge: 'Soltar también tiene su momento',
    releaseText:
      'Un corte puede ser cosmético. En el momento correcto, se siente como un corte limpio con la duda, el peso y la energía estancada.',
    releaseChannels: 'Elige recibirlo todos los días por email, WhatsApp o ambos.',
    releaseImageAlt:
      'Una persona cortándose el pelo mientras surge una energía luminosa del corte, como una liberación ritual.',
    beliefBadge: 'Motor de la creencia',
    beliefTitle: 'Sentirse con suerte cambia la forma en que entras a la sala.',
    beliefSubtitle:
      'La tesis de Trimry es simple: cuando sientes que el momento está a tu favor, detectas oportunidades más rápido, actúas con más optimismo y haces visible un mejor impulso.',
    teaserEyebrow: 'Avance cósmico diario',
    couldBe: 'Podría ser...',
    teaserNote:
      'Empieza el flujo para revelar tus símbolos y abrir tu vista personal de calendario.',
    teaserButton: 'Revelar mi pronóstico real',
    seoGuideBadge: 'Guía SEO',
    seoGuideTitle: '¿Quieres la guía completa de días buenos y malos?',
    seoGuideSubtitle:
      'Lee nuestra guía en inglés creada para la búsqueda “Good and Bad Days to Cut your Hair, Nails and more” con reglas prácticas por semana.',
    seoGuideButton: 'Leer guía completa',
    predictions: [
      {
        tone: 'good',
        text: 'La buena fortuna se expande a tu alrededor. Podría llegar un mensaje relacionado con dinero o una oportunidad útil.',
      },
      {
        tone: 'good',
        text: 'La energía del amor se abre. Podrías conocer a alguien magnético o recibir una señal romántica inesperada.',
      },
      {
        tone: 'bad',
        text: 'Los malentendidos pueden crecer rápido hoy. Evita decisiones emocionales y gastos riesgosos.',
      },
      {
        tone: 'bad',
        text: 'Los planes pueden estancarse y el apoyo sentirse lejano. Mantenlo práctico y posterga compromisos grandes.',
      },
      {
        tone: 'rare',
        text: 'Día comodín raro: una coincidencia extraña podría traer un regalo, un dato o una invitación repentina.',
      },
      {
        tone: 'rare',
        text: 'Cruce kármico: un amor o un asunto antiguo podría volver pidiendo cierre.',
      },
      {
        tone: 'good',
        text: 'Ventana de prosperidad: podría aparecer de forma inesperada un pago atrasado, un descuento o un aliado útil.',
      },
      {
        tone: 'bad',
        text: 'La energía se siente pesada y reactiva. Protege tu paz y evita discusiones sobre dinero o relaciones.',
      },
      {
        tone: 'rare',
        text: 'Te rodea un magnetismo inusual. Alguien influyente podría compartir un consejo confidencial o una oportunidad oculta.',
      },
    ],
  },
  story: {
    title: 'Tu guía personal de timing para lo que podría venir.',
    subtitle:
      'Trimry lee tu zodíaco, símbolo chino y patrones antiguos de timing para ayudarte a planificar con más intención.',
    card1Title: 'Símbolos personales',
    card1Text:
      'Tu fecha de nacimiento abre una capa zodiacal y china que da forma al calendario alrededor de ti.',
    card2Title: 'Ventanas de timing',
    card2Text:
      'Ve cuándo el patrón invita a actuar, esperar, soltar o tomar una decisión más limpia.',
    card3Title: 'Vista de calendario',
    card3Text:
      'Abre una vista enfocada de los próximos días y desbloquea la capa completa cuando estés listo.',
  },
  pricing: {
    title: 'Desbloquea tu calendario personalizado de suerte',
    subtitle:
      'Empieza cuando estés listo para revelar los próximos días y planificar según el ritmo de tus símbolos.',
    planTitle: 'Calendario personal de suerte',
    billing:
      'El trial empieza en Stripe; luego continúas por {billingInline}. Cancela cuando quieras.',
    include1: 'Calendario rodante de 7 días con señales Buenas, Malas y Raras',
    include2: 'Guía personalizada según tus símbolos y tu deseo',
    include3: 'Señales de manifestación para dinero, relaciones, energía y timing personal',
    cta: 'Comenzar gratis',
  },
  weekly: {
    title: 'Predicción cósmica de hoy',
    subtitle:
      'Un avance rotativo sobre fortuna, amor, dinero y suerte. Suscríbete para desbloquear la vista completa del calendario.',
    good: 'Bueno',
    bad: 'Malo',
    rare: 'Raro',
  },
  faq: {
    title: 'Preguntas frecuentes',
    q1: '¿Es una recomendación médica o científica?',
    a1: 'No. Trimry es un servicio cultural y ritual de timing para rutinas personales.',
    q2: '¿Cuándo recibo el mensaje?',
    a2: 'Los suscriptores desbloquean un calendario rodante de 7 días y pueden revisar las próximas señales desde el panel.',
    q3: '¿Cómo administro el cobro?',
    a3: 'Desde tu panel, donde puedes cancelar cuando quieras, reactivar después y también abrir el portal seguro de Stripe para métodos de pago y facturas.',
    q4: '¿Qué zona horaria se usa?',
    a4: 'Usamos la zona horaria IANA guardada en tu cuenta y puedes cambiar tanto la zona horaria como la hora diaria de entrega desde tu panel.',
  },
  cta: {
    title: 'Mantente alineado con la suerte todos los días.',
    subtitle:
      'Crea tu cuenta Trimry, revela tus símbolos y mantén cerca tu calendario personal.',
    button: 'Abrir mi cuenta',
  },
  auth: {
    registerTitle: 'Empieza en 10 segundos',
    registerSubtitle:
      'Ingresa tu nombre, fecha de nacimiento y contacto para abrir tu código personal de suerte.',
    loginTitle: 'Bienvenido de vuelta',
    loginSubtitle: 'Ingresa para administrar tu entrega diaria de suerte.',
    firstNameLabel: 'Nombre',
    lastNameLabel: 'Apellido',
    birthDateLabel: 'Fecha de nacimiento',
    timeZoneLabel: 'Zona horaria',
    timeZoneHint:
      'Usamos esto para programar tu proyección diaria a la hora local correcta.',
    emailLabel: 'Correo electrónico',
    passwordLabel: 'Contraseña',
    whatsappLabel: 'Número de WhatsApp',
    passwordHint:
      'Mínimo 10 caracteres, incluyendo mayúscula, minúscula y número.',
    registerButton: 'Continuar',
    loginButton: 'Ingresar',
    needAccount: '¿Necesitas una cuenta?',
    alreadyHaveAccount: '¿Ya tienes una cuenta?',
  },
  deliveryChannels: {
    noneTitle: 'Sin recordatorios',
    noneDescription: 'Usa Trimry primero como calendario de suerte. Activa email o WhatsApp después si quieres avisos.',
    bothTitle: 'Email + WhatsApp',
    bothDescription: 'Email primero, con WhatsApp como canal secundario opcional.',
    emailTitle: 'Solo email',
    emailDescription: 'La opción mas simple para la mayoria.',
    whatsappTitle: 'Solo WhatsApp',
    whatsappDescription: 'Entrega al telefono si prefieres usar WhatsApp.',
  },
  deliveryOnboarding: {
    loading: 'Cargando tu onboarding...',
    loadError: 'No pudimos cargar tu cuenta en este momento.',
    prepBadge: 'Activación de fortuna',
    prepTitle: 'Preparando tu fortuna...',
    prepSubtitle:
      'Estamos uniendo tu canal elegido con tu ritmo diario de suerte y preparando el paso de activación de tu suscripción.',
    preparationSteps: [
      'Eligiendo tu ritual de entrega',
      'Ajustando tu momento de liberación',
      'Cargando abundancia diaria',
      'Preparando tu puerta de activación',
    ],
    editBadge: 'Ajustes de entrega',
    createBadge: 'Paso 1',
    editTitle: 'Actualiza dónde Trimry debe entregar tu proyección diaria',
    createTitle: '¿Cómo quieres que Trimry entregue tu proyección diaria?',
    editSubtitle:
      'Cambia tu preferencia de entrega cuando quieras. Usa email, WhatsApp o mantén ambos canales activos.',
    createSubtitle:
      'Email es el canal por defecto. Agrega WhatsApp solo si quieres entrega al telefono tambien.',
    activationChecklist: [
      'Elige email primero y agrega WhatsApp solo si lo quieres.',
      'Tu página de activación se abre antes de Stripe.',
      'Puedes cambiar la entrega despues desde el dashboard.',
    ],
    dashboardChecklist: [
      'Elige tu preferencia de entrega.',
      'Agrega WhatsApp solo si quieres tenerlo activo.',
      'Luego vuelves a tu panel.',
    ],
    setupTitle: 'Configuración de entrega',
    setupSubtitle:
      'El email llega a tu inbox. WhatsApp sigue siendo opcional salvo que lo actives.',
    channelLabel: 'Canal de entrega',
    mondayTimeLabel: 'Hora de la proyección diaria',
    mondayTimeHint: 'Programado todos los días a las {time} en {zone}.',
    emailDeliveryLabel: 'Entrega por email',
    whatsappOffHint:
      'WhatsApp está desactivado por defecto. Actívalo solo si también quieres entrega al teléfono.',
    whatsappConsentLabel:
      'Consiento recibir mensajes de suscripción de Trimry por WhatsApp en este número.',
    whatsappConsentHint:
      'Puedes salir cuando quieras respondiendo STOP en WhatsApp o desactivando WhatsApp desde tu panel.',
    submitContinue: 'Continuar a la activación',
    submitSave: 'Guardar ajustes de entrega',
    saveError: 'No pudimos guardar tus ajustes de entrega en este momento.',
    whatsappConsentError:
      'Confirma el consentimiento de WhatsApp antes de habilitar la entrega por WhatsApp.',
  },
  activate: {
    loading: 'Cargando tu paso de activación...',
    loadError: 'No pudimos cargar tu activación en este momento.',
    unavailable: 'No es posible continuar ahora.',
    badge: '{trialPeriodDays} días gratis',
    title:
      'Empieza gratis tu guía diaria de suerte por {trialPeriodDays} días.',
    subtitle:
      'Hoy no pagas. Trimry te entrega una señal diaria diseñada para enfocar tu intención, fortalecer tu creencia y ayudarte a moverte sintiéndote más afortunado y abierto a fortuna real.',
    cards: [
      '{trialPeriodDays} días gratis en el checkout de Stripe.',
      'Señales diarias de manifestación para dinero, relaciones, energía y liberación.',
      'Calendario mensual para elegir mejores momentos.',
    ],
    primaryButton: 'Comenzar {trialPeriodDays} días gratis',
    secondaryButton: 'Cambiar ajustes de entrega',
    snapshotTitle: 'Tu resumen de activación',
    deliveryPreferenceLabel: 'Preferencia de entrega',
    emailDeliveryLabel: 'Entrega por email',
    projectionTimingLabel: 'Horario de proyección',
    whatsappDeliveryLabel: 'Entrega por WhatsApp',
    billingLabel: 'Hoy',
    billingValue:
      'Gratis por {trialPeriodDays} días en Stripe. Después continúas por {billingInline}.',
    unsubscribeTitle: 'Desuscribirte es fácil',
    unsubscribeText:
      'Si Trimry no es para ti, cancelar es simple: escríbele a Luck Guru, cancela desde el dashboard web o pídenoslo por email.',
    sampleTitle: 'Prueba una proyección diaria real',
    sampleText:
      'Envíate una muestra antes de suscribirte. Úsala como hábito de manifestación: lee la señal, fija una intención y observa cómo la fortuna empieza a cambiar tu postura.',
    sampleChannelLabel: 'Enviarla por',
    sampleEmailOption: 'Email',
    sampleWhatsappOption: 'WhatsApp',
    sampleBothOption: 'Ambos',
    sampleEmailButton: 'Enviar muestra por email',
    sampleWhatsappButton: 'Enviar muestra por WhatsApp',
    sampleBothButton: 'Enviar por ambos',
    sampleWhatsappNumberLabel: 'Número de WhatsApp',
    sampleWhatsappPlaceholder: '+56941163414',
    sampleWhatsappConsentLabel:
      'Consiento recibir esta muestra de Trimry y mensajes de suscripción por WhatsApp.',
    sampleAlreadySent: 'Tu muestra única ya fue enviada.',
    sampleSuccess:
      'Muestra enviada. Si este ritmo te sirve, continúa con Stripe para recibir Trimry todos los días.',
    sampleEmailUnavailable:
      'Esta cuenta no tiene un email regular para enviar la muestra.',
    sampleWhatsappConsentError:
      'Confirma el consentimiento de WhatsApp antes de enviar la muestra.',
    previewBadge: 'Vista del trial',
    previewTitle: 'Lo que se desbloquea durante tu trial',
    previewLabel: 'Vista previa',
    previewDayLabel: 'Señal diaria',
    emailFirstTitle: 'Entrega primero por email',
    whyItWorksLabel: 'Por qué funciona',
    whyItWorksText:
      'La manifestación funciona mejor cuando la creencia se vuelve una postura diaria. Trimry convierte esa creencia en un ritmo simple: mirar la señal, fijar intención y actuar como si la suerte ya se estuviera moviendo contigo.',
    carouselBadge: 'Psicología del impulso',
    carouselTitle: 'La suerte se vuelve más fuerte cuando tu mente empieza a moverse con ella.',
    carouselSubtitle:
      'Todas estas voces apuntan al mismo mecanismo: la creencia cambia la postura, la postura cambia la acción y la acción cambia lo que se siente posible.',
  },
  checkout: {
    badge: 'Suscripción Stripe',
    badgeCancelled: 'Checkout en pausa',
    title: 'Abriendo tu suscripción Trimry...',
    titleCancelled: 'Tu suscripción te espera',
    subtitle:
      'Stripe confirma tu método de pago de forma segura para que tu guía diaria de suerte continúe.',
    subtitleCancelled:
      'No se perdió nada. Tus ajustes siguen guardados y puedes suscribirte cuando quieras.',
    openError: 'No pudimos abrir el checkout de Stripe en este momento.',
    resumeTitle: 'Suscribirte a Trimry',
    resumeSubtitle:
      'Tu guía diaria sigue esperando. Continúa a Stripe y confirma tu suscripción.',
    resumeButton: 'Suscribirme con Stripe',
    resumeHint: 'Checkout seguro de Stripe. Cancela cuando quieras.',
    deliveryLabel: 'Canal de entrega',
    timingLabel: 'Horario diario',
    helper:
      'Estamos creando el checkout seguro de Stripe para tu suscripción. Si no pasa nada, espera un segundo o recarga esta página.',
    unsubscribeHelp:
      'Desuscribirte es fácil: escríbele a Luck Guru, cancela desde el dashboard web o pídenoslo por email.',
    trialHighlights: [
      'Señal diaria de fortuna por email, WhatsApp o ambos.',
      'Ritmo de manifestación para creencia, acción y oportunidad.',
      'Calendario mensual completo desbloqueado con tu suscripción.',
    ],
  },
  dashboard: {
    title: 'Tu panel de suscripción',
    intro: 'Administra tus canales de entrega y tu plan diario de Trimry.',
    adminBadge: 'Cuenta admin',
    loading: 'Cargando tu cuenta...',
    noData: 'Ingresa para acceder a tu panel.',
    tabs: {
      account: 'Cuenta',
      predictionCalendar: 'Calendario',
      sends: 'Envíos',
      onboarding: 'Onboarding',
    },
    onboarding: {
      title: 'Laboratorio de onboarding admin',
      subtitle:
        'Usa esta sección para abrir y probar el flujo de onboarding como cuenta admin sin salir del dashboard.',
      cta: 'Abrir flujo onboarding',
      hint: 'Esto abre /activate en modo de prueba admin.',
    },
    status: 'Estado',
    nextMessage: 'Próximo mensaje diario',
    subscribeButton: 'Activar suscripción',
    noSubscription: 'Todavía no tienes una suscripción activa.',
    paymentPending: 'Pago pendiente',
    paymentIssue: 'Problema de pago',
    billingSuccess:
      'Stripe reportó un checkout exitoso. Estamos sincronizando tu suscripción ahora.',
    profileTitle: 'Perfil de cuenta',
    profileSubtitle:
      'Actualiza tus datos de identidad y la zona horaria usada para tu proyección diaria.',
    profileSave: 'Guardar perfil',
    profileTimeZoneHint: 'La entrega diaria se calcula desde esta zona horaria IANA.',
    projectionCalendar: {
      title: 'Calendario de proyección',
      subtitle:
        'Planifica tus próximos 7 días de suerte. Los suscriptores desbloquean la semana actual, no todo el mes por adelantado.',
      fullAccessHint:
        'Semana de suerte desbloqueada. Revisa los próximos 7 días y planifica tus movimientos con mejor timing.',
      lockedAccessHint:
        'En esta cuenta solo hoy está desbloqueado. Activa tu suscripción para revelar la semana completa.',
      loadError: 'No pudimos cargar tu calendario de proyección en este momento.',
      lockedDayBadge: 'Bloqueado',
      lockedDayTitle: 'Día bloqueado',
      lockedDaySubtitle:
        'Activa tu suscripción para revelar este día dentro de tu plan de suerte de 7 días.',
    },
    passwordTitle: 'Seguridad',
    passwordSubtitle:
      'Cambia tu contraseña cuando lo necesites. Debes confirmar primero tu contraseña actual.',
    currentPasswordLabel: 'Contraseña actual',
    newPasswordLabel: 'Nueva contraseña',
    confirmPasswordLabel: 'Confirmar nueva contraseña',
    passwordSave: 'Actualizar contraseña',
    passwordSuccess: 'Contraseña actualizada correctamente.',
    passwordMismatchError:
      'La nueva contraseña y su confirmación no coinciden.',
    passwordDifferentError:
      'La nueva contraseña debe ser distinta de la contraseña actual.',
    passwordSaveError: 'No pudimos actualizar tu contraseña en este momento.',
    dangerTitle: 'Zona de riesgo',
    dangerSubtitle:
      'Elimina tu cuenta y cierra sesión al instante. Conservamos un registro marcado como eliminado para auditoría, pero tu email de acceso se anonimiza y se detienen tus canales activos de entrega.',
    deleteButton: 'Eliminar cuenta',
    deleteLoading: 'Eliminando...',
    deleteConfirm:
      '¿Eliminar tu cuenta? Esto cerrará tu sesión de inmediato y detendrá tus canales actuales de entrega.',
    deleteError: 'No pudimos eliminar tu cuenta en este momento.',
    noSubscriptionSubtitle:
      '{billingCompact} · desbloquea tu calendario de suerte de 7 días. Los recordatorios son opcionales.',
    mondayProjectionTime: 'Hora opcional de recordatorio',
    sentOnMondaysAt: 'Si activas recordatorios, se envían todos los días a las {time} en {zone}.',
    emailDeliveryLabel: 'Entrega por email',
    whatsappOffSetup:
      'WhatsApp está apagado. Puedes usar Trimry solo como calendario o activar recordatorios después.',
    whatsappConsentLabel:
      'Consiento recibir mensajes de suscripción de Trimry por WhatsApp en este número.',
    whatsappConsentHint:
      'Puedes salir cuando quieras respondiendo STOP en WhatsApp o desactivando WhatsApp aquí.',
    whatsappConsentError:
      'Confirma el consentimiento de WhatsApp antes de habilitar la entrega por WhatsApp.',
    pendingTitle: 'Activa tu suscripción Trimry',
    pendingSubtitle:
      'Tu preferencia de entrega ya está guardada. Antes del pago, te llevamos por un paso breve de activación que enmarca la guía diaria y luego abre el checkout seguro de Stripe.',
    pendingDeliveryPreferenceLabel: 'Preferencia de entrega',
    pendingEmailDeliveryLabel: 'Entrega por email',
    pendingProjectionTimingLabel: 'Horario de proyección',
    pendingWhatsappLabel: 'Entrega por WhatsApp',
    continueActivation: 'Continuar activación',
    changeDeliverySettings: 'Cambiar ajustes de entrega',
    activePlanTitle: 'Calendario de suerte Trimry',
    canceledPlanTitle: 'Tu suscripción Trimry está cancelada',
    canceledNote:
      'Puedes reactivarla cuando quieras desde esta cuenta. Tus canales de entrega y el horario diario siguen guardados abajo.',
    activeNote:
      'Cancela cuando quieras desde este panel. Si vuelves después, puedes reactivarla desde la misma cuenta.',
    deliveryPreferenceLabel: 'Preferencia de entrega',
    nextMessageIfReactivated: 'Si la reactivaras hoy, tu próximo mensaje sería',
    weeklyProjectionTimeLabel: 'Hora opcional de recordatorio',
    futureMessagesHint: 'Si activas recordatorios, los futuros mensajes seguirán este horario en {zone}.',
    whatsappOffActive:
      'WhatsApp está desactivado. Tu calendario sigue funcionando; actívalo solo si quieres recordatorios al teléfono.',
    saveDeliverySettings: 'Guardar ajustes de recordatorio',
    reactivateButton: 'Reactivar suscripción',
    reactivateLoading: 'Preparando reactivación...',
    cancelButton: 'Cancelar suscripción',
    cancelLoading: 'Cancelando...',
    manageBillingButton: 'Administrar cobro en Stripe',
    manageBillingLoading: 'Abriendo Stripe...',
    billingFootnoteCanceled:
      'Puedes reactivar desde esta cuenta cuando quieras. Stripe Billing sigue disponible para facturas e historial de cobros.',
    billingFootnoteActive:
      'Los cambios de método de pago y el historial de facturas siguen disponibles en Stripe Billing, pero ahora también puedes cancelar directamente desde este panel cuando quieras.',
    cancelConfirm:
      '¿Cancelar tu suscripción ahora? Se detendrá el cobro futuro de inmediato y podrás reactivarla más adelante desde esta cuenta.',
    cancelSuccess:
      'Tu suscripción fue cancelada. Tus ajustes de entrega siguen guardados aquí y puedes reactivarla cuando quieras.',
    cancelError: 'No pudimos cancelar tu suscripción en este momento.',
    reactivateError: 'No pudimos reactivar tu suscripción en este momento.',
    openBillingError: 'No pudimos abrir Stripe Billing en este momento.',
    saveDeliveryError: 'No pudimos guardar tus ajustes de entrega.',
    predictionCalendar: {
      title: 'Calendario admin de predicción',
      subtitle:
        'Revisa el patrón ritual del mes antes de que salga. Usa el mismo sistema Bueno, Malo y Raro que aparece en el inicio.',
      monthSummary: 'Resumen del mes',
      daysInMonth: 'días de este mes',
      goodDays: 'Días buenos',
      badDays: 'Días malos',
      rareDays: 'Días raros',
      customDays: 'Días personalizados',
      customDaysText: 'días ajustados manualmente en este mes',
      selectedDay: 'Día seleccionado',
      jumpToCurrentMonth: 'Mes actual',
      today: 'Hoy',
      goodTone: 'Bueno',
      badTone: 'Malo',
      rareTone: 'Raro',
      goodSummaryText:
        'El impulso favorece cambios visibles y un momento afortunado.',
      badSummaryText:
        'Aquí es más probable que haya fricción, retraso o un momento torcido.',
      rareSummaryText:
        'Un patrón inusual. Puede traer coincidencia, novedad o una apertura rara.',
      alignedActivities: 'Actividades alineadas',
      cautionActivities: 'Usar con cautela',
      haircut: 'Corte',
      shave: 'Afeitado',
      nails: 'Uñas',
      release: 'Liberación',
      none: 'Ninguna',
      summaryLabel: 'Predicción',
      notesLabel: 'Nota de predicción',
      notesEnglishLabel: 'Nota (inglés)',
      notesSpanishLabel: 'Nota (español)',
      notesPortugueseLabel: 'Nota (portugués)',
      notesHint:
        'Todas las notas son obligatorias y se usan según el idioma activo.',
      goodOption: 'Bueno',
      badOption: 'Malo',
      rareOption: 'Raro',
      importFromImage: 'Rellenar mes con imagen',
      importFromImageBusy: 'Generando desde la imagen',
      importFromImageHint:
        'Sube una imagen de referencia del calendario y ChatGPT generará notas nuevas de Bueno, Malo y Raro en inglés y español para este mes.',
      importFromImageConfirm:
        '¿Reemplazar el mes visible con una nueva importación basada en la imagen?',
      importFromImageSuccess: 'Mes de predicciones importado desde imagen.',
      importFromImageError:
        'No pudimos generar un mes de predicciones desde esa imagen en este momento.',
      weekImagePromptLabel: 'Prompt semanal de imagen',
      weekImagePromptHint:
        'Puedes editar placeholders como {date}, {weekday}, {summary}, {noteEn}, {noteEs}, {localizedDate} y {weekContext}.',
      selectedWeekLabel: 'Semana seleccionada',
      imagesInSelectedWeek: 'Imágenes generadas en esta semana',
      weekSelectorLabel: 'Semana a editar',
      weekDaysToGenerateLabel: 'Días a generar',
      selectedDaysCountLabel: 'Días seleccionados',
      selectAllWeekDays: 'Seleccionar semana completa',
      clearSelectedWeekDays: 'Limpiar selección',
      weekHtmlGeneratorLabel: 'Generador HTML semanal para email',
      weekHtmlGeneratorHint:
        'Genera un HTML listo para correo con un día por fila y revísalo en preview antes de enviarlo.',
      generateWeekHtml: 'Generar HTML de email',
      generateWeekHtmlBusy: 'Generando HTML de email',
      generateWeekHtmlConfirm:
        '¿Generar un HTML semanal listo para email con los días seleccionados?',
      generateWeekHtmlSuccess: 'HTML semanal de email generado.',
      generateWeekHtmlError:
        'No pudimos generar el HTML semanal de email en este momento.',
      copyWeekHtml: 'Copiar HTML',
      copyWeekHtmlSuccess: 'HTML semanal copiado.',
      copyWeekHtmlError: 'No pudimos copiar el HTML en este momento.',
      weekHtmlPreviewLabel: 'Vista previa del email',
      weekHtmlSubjectLabel: 'Asunto del email',
      weekHtmlPreviewTextLabel: 'Texto de preview',
      weekHtmlCodeLabel: 'Código HTML del email',
      generateWeekImages: 'Generar imágenes semana',
      generateWeekImagesBusy: 'Generando imágenes semana',
      generateWeekImagesConfirm:
        '¿Generar y guardar una imagen por cada día de la semana seleccionada?',
      generateWeekImagesSuccess:
        'Imágenes de la semana generadas y guardadas por día.',
      generateWeekImagesError:
        'No pudimos generar imágenes para la semana en este momento.',
      generateSelectedDays: 'Generar días seleccionados',
      generateSelectedDaysBusy: 'Generando días seleccionados',
      generateSelectedDaysConfirm:
        '¿Generar y guardar imágenes para los días seleccionados?',
      generateSelectedDaysSuccess:
        'Imágenes de los días seleccionados generadas y guardadas.',
      generateSelectedDaysError:
        'No pudimos generar imágenes para los días seleccionados en este momento.',
      generateSelectedDayImage: 'Generar imagen del día',
      generateSelectedDayImageBusy: 'Generando imagen del día',
      generateSelectedDayImageConfirm:
        '¿Generar y guardar una imagen solo para el día seleccionado?',
      generateSelectedDayImageSuccess:
        'Imagen del día seleccionado generada y guardada.',
      generateSelectedDayImageError:
        'No pudimos generar la imagen del día seleccionado en este momento.',
      dayImageBadge: 'Imagen lista',
      dayImagePreviewLabel: 'Imagen guardada del día',
      saveDay: 'Guardar día',
      resetDay: 'Restablecer ajuste manual',
      resetConfirm: '¿Restablecer este día al patrón generado de Trimry?',
      overrideBadge: 'Ajuste manual',
      generatedBadge: 'Patrón generado',
      saveSuccess: 'Predicción guardada.',
      saveError: 'No pudimos guardar esta predicción en este momento.',
      loadError:
        'No pudimos cargar el calendario admin de predicciones en este momento.',
    },
    sendCampaigns: {
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
      testingHintWhatsapp:
        'El testing de WhatsApp envía la plantilla configurada directo a un número.',
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
        'Genera un email semanal profesional de Trimry con logo, estructura amigable para inbox y CTA a trimry.com.',
      emailGenerateTemplate: 'Generar plantilla semanal',
      emailTemplateGenerated: 'Plantilla semanal generada.',
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
    },
  },
  statuses: {
    active: 'Activa',
    paused: 'Pausada',
    canceled: 'Cancelada',
  },
  legal: {
    terms: 'Términos del servicio',
    privacy: 'Política de privacidad',
    disclaimer: 'Descargo ritual',
    dataDeletion: 'Instrucciones de eliminación de datos',
    englishNotice:
      'El texto legal maestro se mantiene en inglés. Esta traducción se ofrece por conveniencia.',
    termsSections: [
      {
          title: '1. Descripción del servicio',
          body:
          'Trimry entrega orientación semanal de timing para fortuna, grooming, energía, relaciones, dinero y rutinas simbólicas de liberación. Los suscriptores pueden ver un calendario rodante de 7 días en la web. Email y WhatsApp son recordatorios opcionales.',
      },
      {
        title: '2. Suscripción y cobro',
        body:
          'El plan Trimry se cobra a {billingLegal}. Incluye acceso a un calendario rodante de suerte de 7 días. Email y WhatsApp son recordatorios opcionales según el canal elegido en tu panel. Puedes cancelar tu suscripción en cualquier momento desde tu panel. Si decides volver más adelante, puedes reactivarla desde la misma cuenta iniciando un nuevo checkout de Stripe. Los detalles de cobro, métodos de pago, facturas e historial de facturación siguen disponibles a través de las herramientas de Stripe enlazadas desde tu panel.',
      },
      {
        title: '3. Consentimiento y contacto por WhatsApp',
        body:
          'Solo debes proporcionar números de teléfono de destinatarios que hayan consentido recibir las comunicaciones de suscripción de Trimry que solicitaste. Si habilitas WhatsApp, autorizas a Trimry a enviar mensajes de suscripción y servicio a ese número. Puedes darte de baja en cualquier momento respondiendo STOP (u orden equivalente) en WhatsApp o desactivando WhatsApp desde tu cuenta.',
      },
      {
        title: '4. Seguridad de la cuenta',
        body:
          'Debes mantener tus credenciales de acceso confidenciales. Eres responsable de todas las acciones realizadas a través de tu cuenta.',
      },
      {
        title: '5. Uso aceptable',
        body:
          'Aceptas no hacer mal uso del servicio, no intentar accesos no autorizados y no usar Trimry para actividades ilegales.',
      },
      {
        title: '6. Proveedores del servicio',
        body:
          'Trimry depende de proveedores externos para operar, incluyendo procesamiento de pagos (Stripe), infraestructura de entrega por WhatsApp (Meta/WhatsApp), hosting en la nube e infraestructura de base de datos. La disponibilidad del proveedor, controles de políticas y límites técnicos pueden afectar la entrega.',
      },
      {
        title: '7. Sin asesoría profesional',
        body:
          'Trimry entrega contenido cultural y ritual únicamente. No constituye asesoría médica, legal ni financiera.',
      },
      {
        title: '8. Información de la compañía',
        body:
          'Trimry Limited, número de compañía 752517. Oficina registrada: 71 Lower Baggot Street, Co. Dublin, D02 P593, Dublin 2, Ireland. Oficina operativa: Carrer Emili Darder 1, Balearic Islands, Mallorca, 07181. Contacto: support@trimry.com.',
      },
    ],
    privacySections: [
      {
        title: '1. Datos que recopilamos',
        body:
          'Recopilamos datos de cuenta y suscripción necesarios para operar Trimry, incluyendo nombre, correo electrónico, hash de contraseña, idioma, zona horaria, fecha de nacimiento opcional, preferencias de entrega y número de WhatsApp cuando está habilitado. También procesamos metadatos operativos y de seguridad como registros de sesión/IP y user-agent, metadatos de estado de entrega y metadatos de facturación de Stripe.',
      },
      {
        title: '2. Cómo usamos los datos',
        body:
          'Usamos los datos para autenticar cuentas, asegurar sesiones, administrar suscripciones, enviar contenido diario, personalizar resúmenes de zodíaco y calendario chino, procesar cobros y operaciones de cuenta, atender soporte y monitorear confiabilidad del servicio y riesgos de fraude/seguridad.',
      },
      {
        title: '3. WhatsApp y consentimiento',
        body:
          'Enviamos mensajes por WhatsApp solo cuando habilitas ese canal con tu consentimiento. Puedes retirar ese consentimiento respondiendo STOP (u orden equivalente) o desactivando WhatsApp en tu cuenta. Registramos eventos de consentimiento y baja por cumplimiento y prevención de abuso.',
      },
      {
        title: '4. Compartición de datos',
        body:
          'No vendemos datos personales. Solo compartimos datos con procesadores necesarios para operar el servicio, como Meta/WhatsApp (transporte y estados de mensajes), Stripe (facturación) y proveedores de infraestructura para hosting y base de datos.',
      },
      {
        title: '5. Cookies y analítica',
        body:
          'Usamos cookies esenciales para autenticación y continuidad de sesión. También usamos herramientas de medición publicitaria y analítica para atribuir tráfico de campañas y mejorar rendimiento. El aviso del sitio es informativo/visual y no desactiva la medición.',
      },
      {
        title: '6. Transferencias internacionales',
        body:
          'Como nuestros proveedores operan globalmente, tus datos pueden procesarse fuera de tu país de residencia. Aplicamos salvaguardas contractuales y técnicas apropiadas para la operación del servicio.',
      },
      {
        title: '7. Retención',
        body:
          'Conservamos datos personales solo mientras sean necesarios para operar el servicio, cumplir obligaciones legales, gestionar seguridad/fraude, mantener registros de cobro/auditoría y resolver disputas. Los plazos varían según tipo de dato y exigencia legal.',
      },
      {
        title: '8. Derechos del usuario',
        body:
          'Puedes solicitar acceso, corrección o eliminación escribiendo a support@trimry.com. También puedes eliminar tu cuenta desde el panel. Algunos registros pueden conservarse cuando lo exija la ley o por necesidades legítimas de seguridad/auditoría.',
      },
      {
        title: '9. Almacenamiento de datos',
        body:
          'Los datos de la cuenta se almacenan en infraestructura MongoDB configurada por Trimry. Las cookies de sesión son HTTP-only y están firmadas por seguridad.',
      },
      {
        title: '10. Contacto de la compañía',
        body:
          'Trimry Limited, número de compañía 752517. Oficina registrada: 71 Lower Baggot Street, Co. Dublin, D02 P593, Dublin 2, Ireland. Oficina operativa: Carrer Emili Darder 1, Balearic Islands, Mallorca, 07181.',
      },
    ],
    disclaimerSections: [
      {
        title: 'Contenido cultural',
        body:
          'La orientación de Trimry se basa en interpretación cultural y tradición ritual. Está pensada para la reflexión personal y la planificación de rutinas.',
      },
      {
        title: 'Sin garantía de resultados',
        body:
          'Trimry no garantiza suerte, resultados financieros, resultados de salud ni ningún resultado específico por seguir esta orientación.',
      },
      {
        title: 'Responsabilidad personal',
        body:
          'Sigues siendo plenamente responsable de tus decisiones de grooming, salud y cualquier acción tomada a partir del contenido del servicio.',
      },
    ],
    dataDeletionSections: [
      {
        title: '1. Eliminar desde tu panel de Trimry',
        body:
          'Inicia sesión en tu cuenta Trimry, abre la configuración del panel y usa la opción de eliminación de cuenta. Es la forma más rápida de solicitar eliminación de datos de usuario.',
      },
      {
        title: '2. Eliminar por solicitud por correo',
        body:
          'Si no puedes acceder a tu cuenta, escribe a support@trimry.com desde tu correo registrado con el asunto "Data Deletion Request". Podemos solicitar verificación de cuenta antes de procesar.',
      },
      {
        title: '3. Qué se elimina y qué puede conservarse',
        body:
          'Cuando se completa una solicitud de eliminación, los datos de perfil, preferencias de entrega y configuraciones activas de suscripción se eliminan o anonimizan según el diseño del sistema. Algunos registros limitados pueden conservarse por cumplimiento legal, trazabilidad de facturación, prevención de fraude/seguridad o resolución de disputas.',
      },
      {
        title: '4. Plazo de procesamiento',
        body:
          'Procesamos las solicitudes de eliminación lo antes posible una vez verificada la identidad. Si existen registros gestionados por proveedores (por ejemplo, facturas de Stripe), la retención puede seguir obligaciones legales del proveedor.',
      },
    ],
  },
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
  carousel: {
    proofLabel: 'Prueba rotativa de mentalidad',
    whyTitle: 'Por qué importa',
    whyText:
      'Cuando una persona siente que el momento la favorece, carga más confianza, detecta más aperturas y se mueve con menos duda.',
    effectTitle: 'Efecto Trimry',
    effectText:
      'El mensaje diario está diseñado para agudizar la atención, reforzar el optimismo y convertir el ritual en un impulso que realmente se siente.',
    sequenceLabel: 'Secuencia de citas',
  },
  notFound: {
    title: 'Página no encontrada',
    description: 'La página que solicitaste no está disponible.',
    cta: 'Volver al inicio',
  },
}

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Array<unknown>
    ? T[K]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K]
}

function mergeMessages(
  base: MessageSection,
  overrides: DeepPartial<MessageSection>,
): MessageSection {
  const mergeValue = (baseValue: unknown, overrideValue: unknown): unknown => {
    if (overrideValue === undefined) {
      return baseValue
    }

    if (
      Array.isArray(baseValue) ||
      Array.isArray(overrideValue) ||
      typeof baseValue !== 'object' ||
      baseValue === null ||
      typeof overrideValue !== 'object' ||
      overrideValue === null
    ) {
      return overrideValue
    }

    return Object.fromEntries(
      Object.entries(baseValue).map(([key, value]) => [
        key,
        mergeValue(value, (overrideValue as Record<string, unknown>)[key]),
      ]),
    )
  }

  return mergeValue(base, overrides) as MessageSection
}

const portugueseMessages = mergeMessages(englishMessages, {
  common: {
    loading: 'Carregando...',
    saving: 'Salvando...',
    previous: 'Anterior',
    next: 'Próximo',
    cancel: 'Cancelar',
    continue: 'Continuar',
    backToLogin: 'Voltar ao login',
    backToDashboard: 'Voltar ao painel',
    tryAgain: 'Tentar novamente',
    returnHome: 'Voltar ao início',
  },
  languageSwitcher: {
    label: 'Idioma',
  },
  nav: {
    home: 'Início',
    blog: 'Blog',
    guide: 'Guia',
    howItWorks: 'Como funciona',
    pricing: 'Plano',
    faq: 'FAQ',
    legal: 'Legal',
    login: 'Entrar',
    register: 'Criar conta',
    dashboard: 'Painel',
    profile: 'Perfil',
    admin: 'Admin',
    logout: 'Sair',
  },
  footer: {
    rightsReserved: 'Todos os direitos reservados.',
    companyNumber: 'Número da empresa',
    registeredOffice: 'Sede registrada',
    operationsOffice: 'Escritório operacional',
    contact: 'Contato',
  },
  hero: {
    badge: 'Your Luck Guide',
    title: 'Manifeste mais sorte',
    subtitle:
      'Sinais diários, rituais e insights de timing criados para ajudar você a se alinhar com a oportunidade.',
    primary: 'Revele a sorte de hoje',
    secondary: 'Começar agora',
  },
  home: {
    releaseBadge: 'Soltar também tem timing',
    releaseText:
      'Um corte pode ser cosmético. No momento certo, parece uma quebra limpa com a dúvida, o peso e a energia parada.',
    releaseChannels:
      'Escolha entrega diária por email, WhatsApp ou ambos.',
    releaseImageAlt:
      'Uma pessoa cortando o cabelo enquanto energia luminosa sai do corte como uma liberação ritual.',
    beliefBadge: 'Motor da crença',
    beliefTitle: 'Sentir-se com sorte muda como você entra no ambiente.',
    beliefSubtitle:
      'A tese da Trimry é simples: quando você sente que o timing está a seu favor, percebe oportunidades mais rápido, age com mais otimismo e torna o impulso visível.',
    teaserEyebrow: 'Prévia cósmica diária',
    couldBe: 'Pode ser...',
    teaserNote:
      'Comece o fluxo para revelar seus símbolos e abrir sua prévia pessoal do calendário.',
    teaserButton: 'Revelar minha previsão real',
    seoGuideBadge: 'Guia SEO',
    seoGuideTitle: 'Quer o guia completo de dias bons e ruins?',
    seoGuideSubtitle:
      'Leia nosso guia em inglês sobre “Good and Bad Days to Cut your Hair, Nails and more” com regras semanais práticas.',
    seoGuideButton: 'Ler guia completo',
    predictions: [
      {
        tone: 'good',
        text: 'A boa fortuna se expande ao seu redor. Uma mensagem sobre dinheiro ou uma oportunidade útil pode chegar.',
      },
      {
        tone: 'good',
        text: 'A energia do amor se abre. Você pode conhecer alguém magnético ou receber um sinal romântico inesperado.',
      },
      {
        tone: 'bad',
        text: 'Mal-entendidos podem crescer rápido hoje. Evite decisões emocionais e gastos arriscados.',
      },
      {
        tone: 'bad',
        text: 'Planos podem travar e o apoio pode parecer distante. Seja prático e adie grandes compromissos.',
      },
      {
        tone: 'rare',
        text: 'Dia curinga raro: uma coincidência estranha pode trazer um presente, pista ou convite repentino.',
      },
      {
        tone: 'rare',
        text: 'Cruzamento kármico: um amor antigo ou assunto antigo pode voltar pedindo encerramento.',
      },
      {
        tone: 'good',
        text: 'Janela de prosperidade: um pagamento atrasado, desconto ou aliado útil pode aparecer inesperadamente.',
      },
      {
        tone: 'bad',
        text: 'A energia está pesada e reativa. Proteja sua paz e evite discussões sobre dinheiro ou relacionamentos.',
      },
      {
        tone: 'rare',
        text: 'Um magnetismo incomum cerca você. Alguém influente pode compartilhar um conselho confidencial ou uma oportunidade oculta.',
      },
    ],
  },
  story: {
    title: 'Seu guia pessoal de timing para o que pode vir.',
    subtitle:
      'A Trimry lê seu zodíaco, símbolo chinês e padrões antigos de timing para ajudar você a planejar com mais intenção.',
    card1Title: 'Símbolos pessoais',
    card1Text:
      'Sua data de nascimento abre uma camada zodiacal e chinesa que molda o calendário ao seu redor.',
    card2Title: 'Janelas de timing',
    card2Text:
      'Veja quando o padrão convida ação, espera, liberação ou uma decisão mais limpa.',
    card3Title: 'Vista de calendário',
    card3Text:
      'Abra uma visão focada dos próximos dias e desbloqueie a camada completa quando estiver pronto.',
  },
  pricing: {
    title: 'Desbloqueie seu calendário personalizado de sorte',
    subtitle:
      'Comece quando estiver pronto para revelar os próximos dias e planejar pelo ritmo dos seus símbolos.',
    planTitle: 'Calendário pessoal de sorte',
    billing:
      'O trial começa na Stripe; depois continue por {billingInline}. Cancele quando quiser.',
    include1:
      'Calendário contínuo de 7 dias com sinais Bons, Ruins e Raros',
    include2:
      'Guia personalizada pelos seus símbolos e seu pedido',
    include3:
      'Sinais de manifestação para dinheiro, relacionamentos, energia e timing pessoal',
    cta: 'Começar grátis',
  },
  weekly: {
    title: 'Previsão cósmica de hoje',
    subtitle:
      'Uma prévia rotativa sobre fortuna, amor, dinheiro e sorte. Assine para desbloquear a vista completa do calendário.',
    good: 'Bom',
    bad: 'Ruim',
    rare: 'Raro',
  },
  faq: {
    title: 'Perguntas frequentes',
    q1: 'Isso é uma recomendação médica ou científica?',
    a1: 'Não. A Trimry é um serviço cultural e ritual de timing para rotinas pessoais.',
    q2: 'Quando recebo a mensagem?',
    a2: 'Assinantes desbloqueiam um calendário contínuo de 7 dias e podem revisar os próximos sinais no painel.',
    q3: 'Como gerencio a cobrança?',
    a3: 'Pelo painel, onde você pode cancelar quando quiser, reativar depois e abrir o portal seguro da Stripe para métodos de pagamento e faturas.',
    q4: 'Qual fuso horário é usado?',
    a4: 'Usamos o fuso horário IANA salvo na sua conta. Você pode alterar o fuso e o horário diário de entrega no painel.',
  },
  cta: {
    title: 'Mantenha-se alinhado com a sorte todos os dias.',
    subtitle:
      'Crie sua conta Trimry, revele seus símbolos e mantenha seu calendário pessoal por perto.',
    button: 'Abrir minha conta',
  },
  auth: {
    registerTitle: 'Comece em 10 segundos',
    registerSubtitle:
      'Informe seu nome, data de nascimento e contato para abrir seu código pessoal de sorte.',
    loginTitle: 'Bem-vindo de volta',
    loginSubtitle: 'Entre para gerenciar sua entrega diária de sorte.',
    firstNameLabel: 'Nome',
    lastNameLabel: 'Sobrenome',
    birthDateLabel: 'Data de nascimento',
    timeZoneLabel: 'Fuso horário',
    timeZoneHint:
      'Usamos isso para agendar sua projeção diária no horário local correto.',
    emailLabel: 'Email',
    passwordLabel: 'Senha',
    whatsappLabel: 'Número de WhatsApp',
    passwordHint:
      'Mínimo de 10 caracteres, incluindo maiúscula, minúscula e número.',
    registerButton: 'Continuar',
    loginButton: 'Entrar',
    needAccount: 'Precisa de uma conta?',
    alreadyHaveAccount: 'Já tem uma conta?',
  },
  deliveryChannels: {
    noneTitle: 'Sem lembretes',
    noneDescription: 'Use a Trimry primeiro como calendário de sorte. Ative email ou WhatsApp depois se quiser avisos.',
    bothTitle: 'Email + WhatsApp',
    bothDescription: 'Email primeiro, com WhatsApp como segundo canal opcional.',
    emailTitle: 'Somente email',
    emailDescription: 'A opção padrão mais simples para a maioria dos usuários.',
    whatsappTitle: 'Somente WhatsApp',
    whatsappDescription: 'Entrega no celular quando você preferir.',
  },
  deliveryOnboarding: {
    loading: 'Carregando seu onboarding...',
    loadError: 'Não foi possível carregar sua conta agora.',
    prepBadge: 'Ativação de fortuna',
    prepTitle: 'Preparando sua fortuna...',
    prepSubtitle:
      'Estamos conectando seu canal escolhido ao seu ritmo diário de sorte e preparando a etapa de ativação da assinatura.',
    preparationSteps: [
      'Escolhendo seu ritual de entrega',
      'Ajustando seu timing de liberação',
      'Carregando abundância diária',
      'Preparando sua porta de ativação',
    ],
    editBadge: 'Configurações de entrega',
    createBadge: 'Etapa 1',
    editTitle: 'Atualize onde a Trimry deve entregar sua projeção diária',
    createTitle: 'Como a Trimry deve entregar sua projeção diária?',
    editSubtitle:
      'Altere sua preferência de entrega quando quiser. Use email, WhatsApp ou mantenha ambos os canais ativos.',
    createSubtitle:
      'Email é o padrão. Adicione WhatsApp apenas se também quiser entrega no celular.',
    activationChecklist: [
      'Escolha email primeiro e adicione WhatsApp somente se quiser.',
      'Sua página de ativação abre antes da Stripe.',
      'Você pode alterar a entrega depois no painel.',
    ],
    dashboardChecklist: [
      'Escolha sua preferência de entrega.',
      'Adicione WhatsApp somente se quiser ativá-lo.',
      'Você volta para o painel.',
    ],
    setupTitle: 'Configuração de entrega',
    setupSubtitle:
      'O email chega à sua caixa de entrada. WhatsApp continua opcional até você ativar.',
    channelLabel: 'Canal de entrega',
    mondayTimeLabel: 'Horário da projeção diária',
    mondayTimeHint: 'Agendado todos os dias às {time} em {zone}.',
    emailDeliveryLabel: 'Entrega por email',
    whatsappOffHint:
      'WhatsApp fica desativado por padrão. Ative apenas se também quiser entrega no celular.',
    whatsappConsentLabel:
      'Concordo em receber mensagens de assinatura da Trimry por WhatsApp neste número.',
    whatsappConsentHint:
      'Você pode sair quando quiser respondendo STOP no WhatsApp ou desativando a entrega por WhatsApp no painel.',
    submitContinue: 'Continuar para ativação',
    submitSave: 'Salvar configurações de entrega',
    saveError: 'Não foi possível salvar suas configurações de entrega agora.',
    whatsappConsentError:
      'Confirme o consentimento do WhatsApp antes de habilitar a entrega por WhatsApp.',
  },
  activate: {
    loading: 'Carregando sua etapa de ativação...',
    loadError: 'Não foi possível carregar sua ativação agora.',
    unavailable: 'Não é possível continuar agora.',
    badge: '{trialPeriodDays} dias grátis',
    title:
      'Comece seu guia diário de sorte grátis por {trialPeriodDays} dias.',
    subtitle:
      'Hoje não há cobrança. A Trimry entrega um sinal diário para focar sua intenção, fortalecer sua crença e ajudar você a se mover sentindo mais sorte e abertura para fortuna real.',
    cards: [
      '{trialPeriodDays} dias grátis no checkout da Stripe.',
      'Sinais diários de manifestação para dinheiro, relacionamentos, energia e liberação.',
      'Calendário mensal para escolher melhores momentos.',
    ],
    primaryButton: 'Começar {trialPeriodDays} dias grátis',
    secondaryButton: 'Alterar entrega',
    snapshotTitle: 'Seu resumo de ativação',
    deliveryPreferenceLabel: 'Preferência de entrega',
    emailDeliveryLabel: 'Entrega por email',
    projectionTimingLabel: 'Horário da projeção',
    whatsappDeliveryLabel: 'Entrega por WhatsApp',
    billingLabel: 'Hoje',
    billingValue:
      'Grátis por {trialPeriodDays} dias na Stripe. Depois continue por {billingInline}.',
    unsubscribeTitle: 'Cancelar é fácil',
    unsubscribeText:
      'Se a Trimry não for para você, cancelar é simples: fale com Luck Guru, cancele pelo painel web ou peça por email.',
    sampleTitle: 'Teste uma projeção diária real',
    sampleText:
      'Envie uma amostra antes de assinar. Use como hábito de manifestação: leia o sinal, defina uma intenção e observe como a fortuna começa a mudar sua postura.',
    sampleChannelLabel: 'Enviar por',
    sampleEmailOption: 'Email',
    sampleWhatsappOption: 'WhatsApp',
    sampleBothOption: 'Ambos',
    sampleEmailButton: 'Enviar amostra por email',
    sampleWhatsappButton: 'Enviar amostra por WhatsApp',
    sampleBothButton: 'Enviar por ambos',
    sampleWhatsappNumberLabel: 'Número de WhatsApp',
    sampleWhatsappPlaceholder: '+5511999999999',
    sampleWhatsappConsentLabel:
      'Concordo em receber esta amostra da Trimry e mensagens de assinatura por WhatsApp.',
    sampleAlreadySent: 'Sua amostra única já foi enviada.',
    sampleSuccess:
      'Amostra enviada. Se esse ritmo for útil, continue com a Stripe para receber a Trimry todos os dias.',
    sampleEmailUnavailable:
      'Esta conta não tem um email regular para envio da amostra.',
    sampleWhatsappConsentError:
      'Confirme o consentimento do WhatsApp antes de enviar a amostra.',
    previewBadge: 'Prévia do trial',
    previewTitle: 'O que desbloqueia durante o trial',
    previewLabel: 'Prévia',
    previewDayLabel: 'Sinal diário',
    emailFirstTitle: 'Entrega primeiro por email',
    whyItWorksLabel: 'Por que funciona',
    whyItWorksText:
      'A manifestação funciona melhor quando a crença vira postura diária. A Trimry transforma essa crença em um ritmo simples: notar o sinal, definir intenção e agir como se a sorte já estivesse se movendo com você.',
    carouselBadge: 'Psicologia do impulso',
    carouselTitle:
      'A sorte fica mais forte quando sua mente começa a se mover com ela.',
    carouselSubtitle:
      'Todas essas vozes apontam para o mesmo mecanismo: crença muda postura, postura muda ação e ação muda o que parece possível.',
  },
  checkout: {
    badge: 'Assinatura Stripe',
    badgeCancelled: 'Checkout pausado',
    title: 'Abrindo sua assinatura da Trimry...',
    titleCancelled: 'Sua assinatura está esperando',
    subtitle:
      'A Stripe confirma seu método de pagamento com segurança para seu guia diário de sorte continuar.',
    subtitleCancelled:
      'Nada foi perdido. Suas configurações continuam salvas e você pode assinar quando quiser.',
    openError: 'Não foi possível abrir o checkout da Stripe agora.',
    resumeTitle: 'Assinar a Trimry',
    resumeSubtitle:
      'Sua orientação diária continua esperando. Continue para a Stripe e confirme sua assinatura.',
    resumeButton: 'Assinar com Stripe',
    resumeHint: 'Checkout seguro da Stripe. Cancele quando quiser.',
    deliveryLabel: 'Canal de entrega',
    timingLabel: 'Horário diário',
    helper:
      'Estamos criando o checkout seguro da Stripe para sua assinatura. Se nada acontecer, espere um segundo ou recarregue esta página.',
    unsubscribeHelp:
      'Cancelar é fácil: fale com Luck Guru, cancele pelo painel web ou peça por email.',
    trialHighlights: [
      'Sinal diário de fortuna entregue por email, WhatsApp ou ambos.',
      'Ritmo de manifestação para crença, ação e oportunidade.',
      'Calendário mensal completo desbloqueado com sua assinatura.',
    ],
  },
  dashboard: {
    title: 'Seu painel de assinatura',
    intro: 'Gerencie seus canais de entrega e seu plano diário da Trimry.',
    adminBadge: 'Conta admin',
    loading: 'Carregando sua conta...',
    noData: 'Entre para acessar seu painel.',
    tabs: {
      account: 'Conta',
      predictionCalendar: 'Calendário',
      sends: 'Envios',
      onboarding: 'Onboarding',
    },
    onboarding: {
      title: 'Laboratório de onboarding admin',
      subtitle:
        'Use esta seção para abrir e testar o fluxo de onboarding como conta admin sem sair do painel.',
      cta: 'Abrir fluxo onboarding',
      hint: 'Isso abre /activate no modo de teste admin.',
    },
    status: 'Status',
    nextMessage: 'Próxima mensagem diária',
    subscribeButton: 'Ativar assinatura',
    noSubscription: 'Você ainda não tem uma assinatura ativa.',
    paymentPending: 'Pagamento pendente',
    paymentIssue: 'Problema de pagamento',
    billingSuccess:
      'A Stripe reportou um checkout bem-sucedido. Estamos sincronizando sua assinatura agora.',
    profileTitle: 'Perfil da conta',
    profileSubtitle:
      'Atualize seus dados e o fuso horário usado para sua projeção diária.',
    profileSave: 'Salvar perfil',
    profileTimeZoneHint:
      'A entrega diária é calculada a partir deste fuso horário IANA.',
    projectionCalendar: {
      title: 'Calendário de projeção',
      subtitle:
        'Planeje seus próximos 7 dias de sorte. Assinantes desbloqueiam a semana atual, não o mês inteiro antecipado.',
      fullAccessHint:
        'Semana de sorte desbloqueada. Revise os próximos 7 dias e planeje seus movimentos com melhor timing.',
      lockedAccessHint:
        'Nesta conta, apenas hoje está desbloqueado. Ative sua assinatura para revelar a semana completa.',
      loadError: 'Não foi possível carregar seu calendário de projeção agora.',
      lockedDayBadge: 'Bloqueado',
      lockedDayTitle: 'Dia bloqueado',
      lockedDaySubtitle:
        'Ative sua assinatura para revelar este dia dentro do seu plano de sorte de 7 dias.',
    },
    predictionCalendar: {
      notesPortugueseLabel: 'Nota (português)',
      notesHint:
        'Todas as notas são obrigatórias e serão usadas conforme o idioma ativo.',
    },
    passwordTitle: 'Segurança',
    passwordSubtitle:
      'Altere sua senha quando precisar. Primeiro confirme sua senha atual.',
    currentPasswordLabel: 'Senha atual',
    newPasswordLabel: 'Nova senha',
    confirmPasswordLabel: 'Confirmar nova senha',
    passwordSave: 'Atualizar senha',
    passwordSuccess: 'Senha atualizada com sucesso.',
    passwordMismatchError: 'A nova senha e a confirmação não coincidem.',
    passwordDifferentError:
      'A nova senha deve ser diferente da senha atual.',
    passwordSaveError: 'Não foi possível atualizar sua senha agora.',
    dangerTitle: 'Zona de risco',
    dangerSubtitle:
      'Exclua sua conta e saia imediatamente. Mantemos um registro marcado como excluído para auditoria, mas seu email de login é anonimizado e seus canais ativos são interrompidos.',
    deleteButton: 'Excluir conta',
    deleteLoading: 'Excluindo...',
    deleteConfirm:
      'Excluir sua conta? Isso encerrará sua sessão imediatamente e interromperá seus canais atuais de entrega.',
    deleteError: 'Não foi possível excluir sua conta agora.',
    noSubscriptionSubtitle:
      '{billingCompact} · desbloqueie seu calendário de sorte de 7 dias. Lembretes são opcionais.',
    mondayProjectionTime: 'Horário opcional do lembrete',
    sentOnMondaysAt: 'Se os lembretes estiverem ativos, são enviados todos os dias às {time} em {zone}.',
    emailDeliveryLabel: 'Entrega por email',
    whatsappOffSetup:
      'WhatsApp está desligado. Você pode usar a Trimry só como calendário ou ativar lembretes depois.',
    whatsappConsentLabel:
      'Concordo em receber mensagens de assinatura da Trimry por WhatsApp neste número.',
    whatsappConsentHint:
      'Você pode sair quando quiser respondendo STOP no WhatsApp ou desativando o WhatsApp aqui.',
    whatsappConsentError:
      'Confirme o consentimento do WhatsApp antes de habilitar a entrega por WhatsApp.',
    pendingTitle: 'Ative sua assinatura Trimry',
    pendingSubtitle:
      'Sua preferência de entrega já está salva. Antes do pagamento, passamos por uma etapa breve de ativação e depois abrimos o checkout seguro da Stripe.',
    pendingDeliveryPreferenceLabel: 'Preferência de entrega',
    pendingEmailDeliveryLabel: 'Entrega por email',
    pendingProjectionTimingLabel: 'Horário da projeção',
    pendingWhatsappLabel: 'Entrega por WhatsApp',
    continueActivation: 'Continuar ativação',
    changeDeliverySettings: 'Alterar entrega',
    activePlanTitle: 'Calendário de sorte Trimry',
    canceledPlanTitle: 'Sua assinatura Trimry está cancelada',
    canceledNote:
      'Você pode reativar quando quiser por esta conta. Seus canais de entrega e horário diário continuam salvos abaixo.',
    activeNote:
      'Cancele quando quiser por este painel. Se voltar depois, você pode reativar pela mesma conta.',
    deliveryPreferenceLabel: 'Preferência de entrega',
    nextMessageIfReactivated: 'Se reativada hoje, sua próxima mensagem seria',
    weeklyProjectionTimeLabel: 'Horário opcional do lembrete',
    futureMessagesHint: 'Se os lembretes estiverem ativos, as futuras mensagens seguirão este horário em {zone}.',
    whatsappOffActive:
      'WhatsApp está desativado. Seu calendário continua funcionando; ative só se quiser lembretes no celular.',
    saveDeliverySettings: 'Salvar configurações de lembrete',
    reactivateButton: 'Reativar assinatura',
    reactivateLoading: 'Preparando reativação...',
    cancelButton: 'Cancelar assinatura',
    cancelLoading: 'Cancelando...',
    manageBillingButton: 'Gerenciar cobrança na Stripe',
    manageBillingLoading: 'Abrindo Stripe...',
    billingFootnoteCanceled:
      'Você pode reativar por esta conta quando quiser. Stripe Billing continua disponível para faturas e histórico.',
    billingFootnoteActive:
      'Mudanças no método de pagamento e histórico de faturas continuam na Stripe Billing, mas agora você também pode cancelar diretamente por este painel.',
    cancelConfirm:
      'Cancelar sua assinatura agora? A cobrança futura será interrompida imediatamente e você poderá reativar depois.',
    cancelSuccess:
      'Sua assinatura foi cancelada. Suas configurações de entrega continuam salvas e você pode reativar quando quiser.',
    cancelError: 'Não foi possível cancelar sua assinatura agora.',
    reactivateError: 'Não foi possível reativar sua assinatura agora.',
    openBillingError: 'Não foi possível abrir a cobrança da Stripe agora.',
    saveDeliveryError: 'Não foi possível salvar suas configurações de entrega.',
  },
  statuses: {
    active: 'Ativa',
    paused: 'Pausada',
    canceled: 'Cancelada',
  },
  legal: {
    terms: 'Termos de serviço',
    privacy: 'Política de privacidade',
    disclaimer: 'Aviso ritual',
    dataDeletion: 'Instruções de exclusão de dados',
    englishNotice:
      'O texto legal principal é mantido em inglês. Esta tradução é fornecida por conveniência.',
  },
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
  carousel: {
    proofLabel: 'Prova rotativa de mentalidade',
    whyTitle: 'Por que isso importa',
    whyText:
      'Quando as pessoas sentem que o timing as favorece, carregam mais confiança, percebem mais aberturas e se movem com menos hesitação.',
    effectTitle: 'Efeito Trimry',
    effectText:
      'A mensagem diária foi criada para aguçar a atenção, reforçar o otimismo e transformar ritual em impulso que você realmente sente.',
    sequenceLabel: 'Sequência de citações',
  },
  notFound: {
    title: 'Página não encontrada',
    description: 'A página solicitada não está disponível.',
    cta: 'Voltar ao início',
  },
} satisfies DeepPartial<MessageSection>)

const translations: Record<LanguageCode, MessageSection> = {
  en: englishMessages,
  es: spanishMessages,
  pt: portugueseMessages,
}

export function isLanguageCode(value: string): value is LanguageCode {
  return LANGUAGE_OPTIONS.some((language) => language.code === value)
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

  return null
}

export function normalizeLanguageCode(value?: string | null): LanguageCode {
  return languageFromLocale(value) ?? DEFAULT_LANGUAGE
}

export function languageFromCountryCode(
  countryCode?: string | null,
): LanguageCode | null {
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

export function languageFromAcceptLanguage(
  acceptLanguage?: string | null,
): LanguageCode | null {
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
  return translations[language] ?? englishMessages
}

export function interpolate(
  template: string,
  values: Record<string, string | number>,
) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value)),
    template,
  )
}

export const DEFAULT_LANGUAGE: LanguageCode = 'en'
