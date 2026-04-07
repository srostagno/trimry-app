export const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Espanol' },
] as const

export type LanguageCode = (typeof LANGUAGE_OPTIONS)[number]['code']

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
    whyItWorksLabel: string
    whyItWorksText: string
    carouselBadge: string
    carouselTitle: string
    carouselSubtitle: string
  }
  checkout: {
    badge: string
    title: string
    titleCancelled: string
    subtitle: string
    subtitleCancelled: string
    openError: string
    helper: string
  }
  dashboard: {
    title: string
    intro: string
    loading: string
    noData: string
    tabs: {
      account: string
      predictionCalendar: string
      sends: string
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
    guide: 'Guide',
    howItWorks: 'How it works',
    pricing: 'Pricing',
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
    badge: 'Tibetan Calendar Fortune Service',
    title: 'Good and Bad Days to Cut Your Hair, Nails and More.',
    subtitle:
      'Trimry sends one weekly ritual forecast every Monday by email, WhatsApp, or both, with good, bad, and rare day signals for haircuts, nail trimming, shaving, and symbolic release timing.',
    primary: 'Start for {billingCompact}',
    secondary: 'See today’s teaser',
  },
  home: {
    releaseBadge: 'Release has timing',
    releaseText:
      'A cut can be cosmetic. At the right moment, it feels like a clean break with doubt, heaviness, and stale energy.',
    releaseChannels: 'Choose delivery by email, WhatsApp, or both.',
    releaseImageAlt:
      'A person cutting their hair while bright energy spills from the cut like a ritual release.',
    beliefBadge: 'Belief engine',
    beliefTitle: 'Feeling lucky changes how you enter the room.',
    beliefSubtitle:
      'The Trimry thesis is simple: when you believe timing is on your side, you notice opportunities faster, act with more optimism, and make better momentum visible.',
    teaserEyebrow: 'Daily cosmic teaser',
    couldBe: 'Could be...',
    teaserNote:
      'Subscribe to reveal the true day-by-day transmission and receive the real Monday guidance by email, WhatsApp, or both.',
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
    title: 'Designed to feel like momentum, not superstition.',
    subtitle:
      'Trimry blends ritual, schedule, and practical reminders so your week starts with intention and confidence.',
    card1Title: 'Sutra-inspired rhythm',
    card1Text:
      'Our weekly pattern follows a lesser-known interpretation of Tibetan calendar timing traditions.',
    card2Title: 'One message, zero noise',
    card2Text:
      'Every Monday: one concise ritual forecast delivered by email, WhatsApp, or both.',
    card3Title: 'Release rituals',
    card3Text:
      'Beyond grooming timing, each signal hints at fortune, relationships, and money opportunities.',
  },
  pricing: {
    title: 'Simple monthly plan',
    subtitle: 'A single plan. No hidden fees. Cancel anytime from your dashboard.',
    planTitle: 'Weekly fortune delivery',
    billing: '{billingInline}',
    include1: '1 ritual forecast every Monday by email, WhatsApp, or both',
    include2: 'Good/bad/rare signals with practical luck, money, and love hints',
    include3:
      'Choose your delivery channel, update it anytime, and cancel whenever you want',
    cta: 'Create your account',
  },
  weekly: {
    title: 'Today’s cosmic prediction',
    subtitle:
      'A rotating teaser about fortune, love, money, and luck. Subscribe to unlock the true weekly transmission.',
    good: 'Good',
    bad: 'Bad',
    rare: 'Rare',
  },
  faq: {
    title: 'Frequently asked questions',
    q1: 'Is this a medical or scientific recommendation?',
    a1: 'No. Trimry is a cultural and ritual timing service for personal routines.',
    q2: 'When do I receive the message?',
    a2: 'Every Monday at your chosen local hour, one ritual forecast with your week overview is delivered by the channel you choose.',
    q3: 'How do I manage billing?',
    a3: 'From your dashboard, where you can cancel anytime, reactivate later, and still open the secure Stripe billing portal for payment methods and invoices.',
    q4: 'Which timezone is used?',
    a4: 'We use the IANA time zone saved in your account and you can change both time zone and Monday delivery hour from your dashboard.',
  },
  cta: {
    title: 'Start your week with intention.',
    subtitle:
      'Create your Trimry account, choose email, WhatsApp, or both, and receive your first lucky-day guidance next Monday.',
    button: 'Open my account',
  },
  auth: {
    registerTitle: 'Create your Trimry account',
    registerSubtitle:
      'Secure sign-up with encrypted session cookies and local Monday timing.',
    loginTitle: 'Welcome back',
    loginSubtitle: 'Sign in to manage your weekly ritual delivery.',
    firstNameLabel: 'First name',
    lastNameLabel: 'Last name',
    birthDateLabel: 'Date of birth',
    timeZoneLabel: 'Time zone',
    timeZoneHint:
      'We use this to schedule your Monday projection at the right local time.',
    emailLabel: 'Email address',
    passwordLabel: 'Password',
    whatsappLabel: 'WhatsApp number',
    passwordHint:
      'Minimum 10 characters, including uppercase, lowercase, and number.',
    registerButton: 'Create account',
    loginButton: 'Log in',
    needAccount: 'Need an account?',
    alreadyHaveAccount: 'Already have an account?',
  },
  deliveryChannels: {
    bothTitle: 'Email + WhatsApp',
    bothDescription: 'Best mix of ritual presence and instant delivery.',
    emailTitle: 'Email only',
    emailDescription: 'Get the weekly guidance directly in your inbox.',
    whatsappTitle: 'WhatsApp only',
    whatsappDescription: 'Keep it fast, direct, and phone-first.',
  },
  deliveryOnboarding: {
    loading: 'Loading your onboarding flow...',
    loadError: 'Unable to load your account right now.',
    prepBadge: 'Fortune ignition',
    prepTitle: 'Getting your fortune ready...',
    prepSubtitle:
      'We are binding your chosen delivery channel to this week’s ritual cadence and preparing your subscription activation step.',
    preparationSteps: [
      'Choosing your delivery ritual',
      'Binding your release timing',
      'Charging Monday optimism',
      'Preparing your activation gate',
    ],
    editBadge: 'Delivery settings',
    createBadge: 'Onboarding step 1',
    editTitle: 'Update where Trimry should deliver your weekly ritual',
    createTitle: 'How should Trimry deliver your weekly ritual?',
    editSubtitle:
      'Change your delivery preference anytime. Use email, WhatsApp, or keep both channels active.',
    createSubtitle:
      'Choose email, WhatsApp, or both. Once it is saved, we will move you into a short activation step before secure Stripe checkout.',
    activationChecklist: [
      'Choose your delivery preference.',
      'Add WhatsApp only if that channel is active.',
      'Your activation page opens before Stripe.',
    ],
    dashboardChecklist: [
      'Choose your delivery preference.',
      'Add WhatsApp only if you want it enabled.',
      'You return to your dashboard.',
    ],
    setupTitle: 'Delivery setup',
    setupSubtitle:
      'Email uses your account inbox. If you activate WhatsApp, use international format so delivery works immediately.',
    channelLabel: 'Delivery channel',
    mondayTimeLabel: 'Monday projection time',
    mondayTimeHint: 'Scheduled for Mondays at {time} in {zone}.',
    emailDeliveryLabel: 'Email delivery',
    whatsappOffHint:
      'WhatsApp is off for this subscription. Turn it on above if you want instant phone delivery too.',
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
    badge: 'Activation gate',
    title: 'Turn your weekly Trimry message into a real luck ritual.',
    subtitle:
      'People move differently when they feel favored by timing. They spot openings faster, carry stronger energy, and stay optimistic longer. Trimry is built to trigger exactly that momentum every Monday.',
    cards: [
      'Your delivery preference is already saved.',
      'Stripe opens on the next step with hosted checkout.',
      'Your weekly ritual starts as soon as billing is confirmed.',
    ],
    primaryButton: 'Activate in secure Stripe checkout',
    secondaryButton: 'Change delivery settings',
    snapshotTitle: 'Your activation snapshot',
    deliveryPreferenceLabel: 'Delivery preference',
    emailDeliveryLabel: 'Email delivery',
    projectionTimingLabel: 'Projection timing',
    whatsappDeliveryLabel: 'WhatsApp delivery',
    billingLabel: 'Billing',
    billingValue: '{billingInline}',
    whyItWorksLabel: 'Why it works',
    whyItWorksText:
      'The ritual is not magic. The leverage comes from attention, confidence, and better action when you feel aligned.',
    carouselBadge: 'Momentum psychology',
    carouselTitle: 'Luck gets stronger when your mind starts moving with it.',
    carouselSubtitle:
      'These voices all point at the same mechanism: belief changes posture, posture changes action, and action changes what feels possible.',
  },
  checkout: {
    badge: 'Checkout handoff',
    title: 'Opening Stripe checkout...',
    titleCancelled: 'Return to Stripe checkout',
    subtitle:
      'Your delivery settings are already saved. We are sending you to Stripe to finish the subscription.',
    subtitleCancelled:
      'Your last checkout attempt was canceled. Your delivery settings are still saved and we can send you straight back to Stripe.',
    openError: 'Unable to open Stripe checkout right now.',
    helper:
      'If nothing happens, wait a second or reload this page. Stripe checkout is being created securely from the API.',
  },
  dashboard: {
    title: 'Your subscription dashboard',
    intro: 'Manage your delivery channels and weekly Trimry plan.',
    loading: 'Loading your account...',
    noData: 'Sign in to access your dashboard.',
    tabs: {
      account: 'Account',
      predictionCalendar: 'Prediction calendar',
      sends: 'Sends',
    },
    status: 'Status',
    nextMessage: 'Next Monday message',
    subscribeButton: 'Activate subscription',
    noSubscription: 'You do not have an active subscription yet.',
    paymentPending: 'Payment pending',
    paymentIssue: 'Payment issue',
    billingSuccess:
      'Stripe reported a successful checkout. We are syncing your subscription now.',
    profileTitle: 'Account profile',
    profileSubtitle:
      'Update your identity details and the time zone used for your weekly projection.',
    profileSave: 'Save profile',
    profileTimeZoneHint: 'Monday delivery is calculated from this IANA time zone.',
    dangerTitle: 'Danger zone',
    dangerSubtitle:
      'Delete your account and sign out immediately. We keep a soft-deleted record for audit purposes, but your login email is anonymized and your active delivery channels are stopped.',
    deleteButton: 'Delete account',
    deleteLoading: 'Deleting...',
    deleteConfirm:
      'Delete your account? This will sign you out immediately and stop your current delivery channels.',
    deleteError: 'Unable to delete your account right now.',
    noSubscriptionSubtitle:
      '{billingCompact} · weekly ritual forecast by email, WhatsApp, or both',
    mondayProjectionTime: 'Monday projection time',
    sentOnMondaysAt: 'Sent on Mondays at {time} in {zone}.',
    emailDeliveryLabel: 'Email delivery',
    whatsappOffSetup:
      'WhatsApp is off. You can activate by email only or re-enable it at any time.',
    whatsappConsentLabel:
      'I consent to receive Trimry subscription messages on WhatsApp at this number.',
    whatsappConsentHint:
      'You can opt out anytime by replying STOP in WhatsApp or by disabling WhatsApp delivery here.',
    whatsappConsentError:
      'Please confirm WhatsApp consent before enabling WhatsApp delivery.',
    pendingTitle: 'Activate your Trimry subscription',
    pendingSubtitle:
      'Your delivery preference is already saved. Before payment, we take you through a short activation step that frames the weekly ritual and then opens secure Stripe checkout.',
    pendingDeliveryPreferenceLabel: 'Delivery preference',
    pendingEmailDeliveryLabel: 'Email delivery',
    pendingProjectionTimingLabel: 'Projection timing',
    pendingWhatsappLabel: 'WhatsApp delivery',
    continueActivation: 'Continue activation',
    changeDeliverySettings: 'Change delivery settings',
    activePlanTitle: 'Trimry Weekly Fortune Delivery',
    canceledPlanTitle: 'Your Trimry subscription is canceled',
    canceledNote:
      'You can reactivate anytime from this account. Your delivery channels and Monday timing are still saved below.',
    activeNote:
      'Cancel anytime from this dashboard. If you return later, you can reactivate from the same account.',
    deliveryPreferenceLabel: 'Delivery preference',
    nextMessageIfReactivated: 'If reactivated today, your next message would be',
    weeklyProjectionTimeLabel: 'Weekly projection time',
    futureMessagesHint: 'Future weekly messages follow this hour in {zone}.',
    whatsappOffActive:
      'WhatsApp is off for this subscription. Turn it on above if you want phone delivery too.',
    saveDeliverySettings: 'Save delivery settings',
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
      notesHint:
        'Both notes are required and will be used according to the active language.',
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
          'Trimry provides weekly timing guidance for haircuts, shaving, nail cutting, and symbolic release routines inspired by Tibetan calendar traditions. Delivery is available by email, WhatsApp, or both.',
      },
      {
        title: '2. Subscription and billing',
        body:
          'The Trimry plan is billed at {billingLegal}. It includes one ritual forecast delivered each Monday by your selected channel: email, WhatsApp, or both. You can cancel your subscription at any time from your account dashboard. If you decide to come back later, you can reactivate from the same account by starting a new Stripe checkout. Billing details, payment methods, invoices, and historical billing records remain available through the Stripe-hosted billing tools linked from your dashboard.',
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
          'We use data to authenticate accounts, secure sessions, manage subscriptions, send weekly content, process billing and account operations, handle support, and monitor service reliability and fraud/security risks.',
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
          'We use essential cookies for authentication and session continuity. We may also use optional analytics cookies/tools to measure product usage. You can accept or decline optional analytics cookies from the website prompt.',
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
      'We use essential cookies for login/session and optional analytics cookies to improve Trimry. You can accept or decline optional analytics.',
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
      'The weekly message is designed to sharpen attention, reinforce optimism, and turn ritual into momentum you can actually feel.',
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
    guide: 'Guía',
    howItWorks: 'Cómo funciona',
    pricing: 'Precios',
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
    badge: 'Servicio de fortuna del calendario tibetano',
    title: 'Días buenos y malos para cortar tu pelo, uñas y más.',
    subtitle:
      'Trimry envía un pronóstico ritual semanal cada lunes por email, WhatsApp o ambos, con señales de días buenos, malos y raros para corte de pelo, uñas, afeitado y liberación simbólica.',
    primary: 'Empieza por {billingCompact}',
    secondary: 'Ver el avance de hoy',
  },
  home: {
    releaseBadge: 'Soltar también tiene su momento',
    releaseText:
      'Un corte puede ser cosmético. En el momento correcto, se siente como un corte limpio con la duda, el peso y la energía estancada.',
    releaseChannels: 'Elige recibirlo por email, WhatsApp o ambos.',
    releaseImageAlt:
      'Una persona cortándose el pelo mientras surge una energía luminosa del corte, como una liberación ritual.',
    beliefBadge: 'Motor de la creencia',
    beliefTitle: 'Sentirse con suerte cambia la forma en que entras a la sala.',
    beliefSubtitle:
      'La tesis de Trimry es simple: cuando sientes que el momento está a tu favor, detectas oportunidades más rápido, actúas con más optimismo y haces visible un mejor impulso.',
    teaserEyebrow: 'Avance cósmico diario',
    couldBe: 'Podría ser...',
    teaserNote:
      'Suscríbete para revelar la transmisión real día por día y recibir la guía del lunes por email, WhatsApp o ambos.',
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
    title: 'Diseñado para sentirse como impulso, no como superstición.',
    subtitle:
      'Trimry mezcla ritual, calendario y recordatorios prácticos para que tu semana empiece con intención y confianza.',
    card1Title: 'Ritmo inspirado en sutras',
    card1Text:
      'Nuestro patrón semanal sigue una interpretación menos conocida de las tradiciones tibetanas del calendario.',
    card2Title: 'Un mensaje, cero ruido',
    card2Text:
      'Cada lunes: un pronóstico ritual conciso entregado por email, WhatsApp o ambos.',
    card3Title: 'Rituales de liberación',
    card3Text:
      'Más allá del grooming, cada señal sugiere fortuna, relaciones y oportunidades de dinero.',
  },
  pricing: {
    title: 'Plan mensual simple',
    subtitle: 'Un solo plan. Sin cargos ocultos. Cancela cuando quieras desde tu panel.',
    planTitle: 'Entrega semanal de fortuna',
    billing: '{billingInline}',
    include1: '1 pronóstico ritual cada lunes por email, WhatsApp o ambos',
    include2: 'Señales de días buenos, malos y raros con pistas prácticas sobre suerte, dinero y amor',
    include3: 'Elige tu canal de entrega, actualízalo cuando quieras y cancela cuando te acomode',
    cta: 'Crear mi cuenta',
  },
  weekly: {
    title: 'Predicción cósmica de hoy',
    subtitle:
      'Un avance rotativo sobre fortuna, amor, dinero y suerte. Suscríbete para desbloquear la transmisión semanal real.',
    good: 'Bueno',
    bad: 'Malo',
    rare: 'Raro',
  },
  faq: {
    title: 'Preguntas frecuentes',
    q1: '¿Es una recomendación médica o científica?',
    a1: 'No. Trimry es un servicio cultural y ritual de timing para rutinas personales.',
    q2: '¿Cuándo recibo el mensaje?',
    a2: 'Cada lunes, a la hora local que elijas, se entrega un pronóstico ritual con el resumen de tu semana por el canal que selecciones.',
    q3: '¿Cómo administro el cobro?',
    a3: 'Desde tu panel, donde puedes cancelar cuando quieras, reactivar después y también abrir el portal seguro de Stripe para métodos de pago y facturas.',
    q4: '¿Qué zona horaria se usa?',
    a4: 'Usamos la zona horaria IANA guardada en tu cuenta y puedes cambiar tanto la zona horaria como la hora local del lunes desde tu panel.',
  },
  cta: {
    title: 'Empieza tu semana con intención.',
    subtitle:
      'Crea tu cuenta Trimry, elige email, WhatsApp o ambos, y recibe tu primera guía de días con suerte el próximo lunes.',
    button: 'Abrir mi cuenta',
  },
  auth: {
    registerTitle: 'Crea tu cuenta Trimry',
    registerSubtitle:
      'Registro seguro con cookies de sesión cifradas y horario local para el lunes.',
    loginTitle: 'Bienvenido de vuelta',
    loginSubtitle: 'Ingresa para administrar tu entrega ritual semanal.',
    firstNameLabel: 'Nombre',
    lastNameLabel: 'Apellido',
    birthDateLabel: 'Fecha de nacimiento',
    timeZoneLabel: 'Zona horaria',
    timeZoneHint:
      'Usamos esto para programar tu proyección del lunes a la hora local correcta.',
    emailLabel: 'Correo electrónico',
    passwordLabel: 'Contraseña',
    whatsappLabel: 'Número de WhatsApp',
    passwordHint:
      'Mínimo 10 caracteres, incluyendo mayúscula, minúscula y número.',
    registerButton: 'Crear cuenta',
    loginButton: 'Ingresar',
    needAccount: '¿Necesitas una cuenta?',
    alreadyHaveAccount: '¿Ya tienes una cuenta?',
  },
  deliveryChannels: {
    bothTitle: 'Email + WhatsApp',
    bothDescription: 'La mejor mezcla entre presencia ritual y entrega inmediata.',
    emailTitle: 'Solo email',
    emailDescription: 'Recibe la guía semanal directo en tu correo.',
    whatsappTitle: 'Solo WhatsApp',
    whatsappDescription: 'Rápido, directo y pensado para el teléfono.',
  },
  deliveryOnboarding: {
    loading: 'Cargando tu onboarding...',
    loadError: 'No pudimos cargar tu cuenta en este momento.',
    prepBadge: 'Activación de fortuna',
    prepTitle: 'Preparando tu fortuna...',
    prepSubtitle:
      'Estamos uniendo tu canal elegido con el ritmo ritual de esta semana y preparando el paso de activación de tu suscripción.',
    preparationSteps: [
      'Eligiendo tu ritual de entrega',
      'Ajustando tu momento de liberación',
      'Cargando el optimismo del lunes',
      'Preparando tu puerta de activación',
    ],
    editBadge: 'Ajustes de entrega',
    createBadge: 'Paso 1',
    editTitle: 'Actualiza dónde Trimry debe entregar tu ritual semanal',
    createTitle: '¿Cómo quieres que Trimry entregue tu ritual semanal?',
    editSubtitle:
      'Cambia tu preferencia de entrega cuando quieras. Usa email, WhatsApp o mantén ambos canales activos.',
    createSubtitle:
      'Elige email, WhatsApp o ambos. Una vez guardado, te llevaremos a un paso breve de activación antes del checkout seguro de Stripe.',
    activationChecklist: [
      'Elige tu preferencia de entrega.',
      'Agrega WhatsApp solo si ese canal está activo.',
      'Tu página de activación se abre antes de Stripe.',
    ],
    dashboardChecklist: [
      'Elige tu preferencia de entrega.',
      'Agrega WhatsApp solo si quieres tenerlo activo.',
      'Luego vuelves a tu panel.',
    ],
    setupTitle: 'Configuración de entrega',
    setupSubtitle:
      'El email usa la bandeja de tu cuenta. Si activas WhatsApp, usa formato internacional para que la entrega funcione al instante.',
    channelLabel: 'Canal de entrega',
    mondayTimeLabel: 'Hora de la proyección del lunes',
    mondayTimeHint: 'Programado para los lunes a las {time} en {zone}.',
    emailDeliveryLabel: 'Entrega por email',
    whatsappOffHint:
      'WhatsApp está desactivado para esta suscripción. Actívalo arriba si también quieres entrega inmediata al teléfono.',
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
    badge: 'Puerta de activación',
    title: 'Convierte tu mensaje semanal de Trimry en un ritual real de suerte.',
    subtitle:
      'La gente se mueve distinto cuando siente que el momento la favorece. Detecta aperturas más rápido, sostiene mejor la energía y se mantiene optimista por más tiempo. Trimry está construido para activar ese impulso cada lunes.',
    cards: [
      'Tu preferencia de entrega ya está guardada.',
      'Stripe se abre en el siguiente paso con checkout alojado.',
      'Tu ritual semanal empieza apenas se confirma el cobro.',
    ],
    primaryButton: 'Activar en checkout seguro de Stripe',
    secondaryButton: 'Cambiar ajustes de entrega',
    snapshotTitle: 'Tu resumen de activación',
    deliveryPreferenceLabel: 'Preferencia de entrega',
    emailDeliveryLabel: 'Entrega por email',
    projectionTimingLabel: 'Horario de proyección',
    whatsappDeliveryLabel: 'Entrega por WhatsApp',
    billingLabel: 'Cobro',
    billingValue: '{billingInline}',
    whyItWorksLabel: 'Por qué funciona',
    whyItWorksText:
      'El ritual no es magia. El apalancamiento viene de la atención, la confianza y una mejor acción cuando te sientes alineado.',
    carouselBadge: 'Psicología del impulso',
    carouselTitle: 'La suerte se vuelve más fuerte cuando tu mente empieza a moverse con ella.',
    carouselSubtitle:
      'Todas estas voces apuntan al mismo mecanismo: la creencia cambia la postura, la postura cambia la acción y la acción cambia lo que se siente posible.',
  },
  checkout: {
    badge: 'Paso hacia el checkout',
    title: 'Abriendo checkout de Stripe...',
    titleCancelled: 'Volver al checkout de Stripe',
    subtitle:
      'Tus ajustes de entrega ya están guardados. Te estamos enviando a Stripe para terminar la suscripción.',
    subtitleCancelled:
      'Tu último intento de checkout fue cancelado. Tus ajustes de entrega siguen guardados y podemos llevarte directo de vuelta a Stripe.',
    openError: 'No pudimos abrir el checkout de Stripe en este momento.',
    helper:
      'Si no pasa nada, espera un segundo o recarga esta página. El checkout de Stripe se está creando de forma segura desde la API.',
  },
  dashboard: {
    title: 'Tu panel de suscripción',
    intro: 'Administra tus canales de entrega y tu plan semanal de Trimry.',
    loading: 'Cargando tu cuenta...',
    noData: 'Ingresa para acceder a tu panel.',
    tabs: {
      account: 'Cuenta',
      predictionCalendar: 'Calendario',
      sends: 'Envíos',
    },
    status: 'Estado',
    nextMessage: 'Próximo mensaje del lunes',
    subscribeButton: 'Activar suscripción',
    noSubscription: 'Todavía no tienes una suscripción activa.',
    paymentPending: 'Pago pendiente',
    paymentIssue: 'Problema de pago',
    billingSuccess:
      'Stripe reportó un checkout exitoso. Estamos sincronizando tu suscripción ahora.',
    profileTitle: 'Perfil de cuenta',
    profileSubtitle:
      'Actualiza tus datos de identidad y la zona horaria usada para tu proyección semanal.',
    profileSave: 'Guardar perfil',
    profileTimeZoneHint: 'La entrega del lunes se calcula desde esta zona horaria IANA.',
    dangerTitle: 'Zona de riesgo',
    dangerSubtitle:
      'Elimina tu cuenta y cierra sesión al instante. Conservamos un registro marcado como eliminado para auditoría, pero tu email de acceso se anonimiza y se detienen tus canales activos de entrega.',
    deleteButton: 'Eliminar cuenta',
    deleteLoading: 'Eliminando...',
    deleteConfirm:
      '¿Eliminar tu cuenta? Esto cerrará tu sesión de inmediato y detendrá tus canales actuales de entrega.',
    deleteError: 'No pudimos eliminar tu cuenta en este momento.',
    noSubscriptionSubtitle:
      '{billingCompact} · pronóstico ritual semanal por email, WhatsApp o ambos',
    mondayProjectionTime: 'Hora de la proyección del lunes',
    sentOnMondaysAt: 'Se envía los lunes a las {time} en {zone}.',
    emailDeliveryLabel: 'Entrega por email',
    whatsappOffSetup:
      'WhatsApp está apagado. Puedes dejar solo email o volver a habilitarlo cuando quieras.',
    whatsappConsentLabel:
      'Consiento recibir mensajes de suscripción de Trimry por WhatsApp en este número.',
    whatsappConsentHint:
      'Puedes salir cuando quieras respondiendo STOP en WhatsApp o desactivando WhatsApp aquí.',
    whatsappConsentError:
      'Confirma el consentimiento de WhatsApp antes de habilitar la entrega por WhatsApp.',
    pendingTitle: 'Activa tu suscripción Trimry',
    pendingSubtitle:
      'Tu preferencia de entrega ya está guardada. Antes del pago, te llevamos por un paso breve de activación que enmarca el ritual semanal y luego abre el checkout seguro de Stripe.',
    pendingDeliveryPreferenceLabel: 'Preferencia de entrega',
    pendingEmailDeliveryLabel: 'Entrega por email',
    pendingProjectionTimingLabel: 'Horario de proyección',
    pendingWhatsappLabel: 'Entrega por WhatsApp',
    continueActivation: 'Continuar activación',
    changeDeliverySettings: 'Cambiar ajustes de entrega',
    activePlanTitle: 'Entrega semanal de fortuna Trimry',
    canceledPlanTitle: 'Tu suscripción Trimry está cancelada',
    canceledNote:
      'Puedes reactivarla cuando quieras desde esta cuenta. Tus canales de entrega y el horario del lunes siguen guardados abajo.',
    activeNote:
      'Cancela cuando quieras desde este panel. Si vuelves después, puedes reactivarla desde la misma cuenta.',
    deliveryPreferenceLabel: 'Preferencia de entrega',
    nextMessageIfReactivated: 'Si la reactivaras hoy, tu próximo mensaje sería',
    weeklyProjectionTimeLabel: 'Hora semanal de proyección',
    futureMessagesHint: 'Los futuros mensajes semanales seguirán este horario en {zone}.',
    whatsappOffActive:
      'WhatsApp está desactivado para esta suscripción. Actívalo arriba si también quieres entrega al teléfono.',
    saveDeliverySettings: 'Guardar ajustes de entrega',
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
      notesHint:
        'Ambas notas son obligatorias y se usan según el idioma activo.',
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
          'Trimry entrega orientación semanal sobre el momento ideal para cortes de pelo, afeitado, corte de uñas y rutinas simbólicas de liberación inspiradas en tradiciones del calendario tibetano. La entrega está disponible por email, WhatsApp o ambos.',
      },
      {
        title: '2. Suscripción y cobro',
        body:
          'El plan Trimry se cobra a {billingLegal}. Incluye un pronóstico ritual entregado cada lunes por el canal que elijas: email, WhatsApp o ambos. Puedes cancelar tu suscripción en cualquier momento desde tu panel. Si decides volver más adelante, puedes reactivarla desde la misma cuenta iniciando un nuevo checkout de Stripe. Los detalles de cobro, métodos de pago, facturas e historial de facturación siguen disponibles a través de las herramientas de Stripe enlazadas desde tu panel.',
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
          'Usamos los datos para autenticar cuentas, asegurar sesiones, administrar suscripciones, enviar contenido semanal, procesar cobros y operaciones de cuenta, atender soporte y monitorear confiabilidad del servicio y riesgos de fraude/seguridad.',
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
          'Usamos cookies esenciales para autenticación y continuidad de sesión. También podemos usar cookies/herramientas de analítica opcionales para medir uso del producto. Puedes aceptar o rechazar la analítica opcional desde el aviso del sitio.',
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
      'Usamos cookies esenciales para inicio de sesión/sesión y cookies opcionales de analítica para mejorar Trimry. Puedes aceptar o rechazar la analítica opcional.',
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
      'El mensaje semanal está diseñado para agudizar la atención, reforzar el optimismo y convertir el ritual en un impulso que realmente se siente.',
    sequenceLabel: 'Secuencia de citas',
  },
  notFound: {
    title: 'Página no encontrada',
    description: 'La página que solicitaste no está disponible.',
    cta: 'Volver al inicio',
  },
}

const translations: Record<LanguageCode, MessageSection> = {
  en: englishMessages,
  es: spanishMessages,
}

export function isLanguageCode(value: string): value is LanguageCode {
  return LANGUAGE_OPTIONS.some((language) => language.code === value)
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
