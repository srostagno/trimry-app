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
    submitContinue: string
    submitSave: string
    saveError: string
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
    englishNotice: string
    termsSections: LegalSection[]
    privacySections: LegalSection[]
    disclaimerSections: LegalSection[]
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
    title: 'Catch the lucky days before your next cut.',
    subtitle:
      'Trimry sends one weekly ritual forecast every Monday by email, WhatsApp, or both, with good, bad, and rare day signals inspired by a little-known Tibetan sutra tradition plus concrete hints about luck, money, and love momentum.',
    primary: 'Start for $2.99/month',
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
    billing: '$2.99 USD / month',
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
    submitContinue: 'Continue to activation',
    submitSave: 'Save delivery settings',
    saveError: 'Unable to save your delivery settings right now.',
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
    billingValue: '$2.99 USD / month',
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
      '$2.99 USD/month · weekly ritual forecast by email, WhatsApp, or both',
    mondayProjectionTime: 'Monday projection time',
    sentOnMondaysAt: 'Sent on Mondays at {time} in {zone}.',
    emailDeliveryLabel: 'Email delivery',
    whatsappOffSetup:
      'WhatsApp is off. You can activate by email only or re-enable it at any time.',
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
      notesHint: 'This note appears as the daily guidance for that date.',
      goodOption: 'Good',
      badOption: 'Bad',
      rareOption: 'Rare',
      importFromImage: 'Fill month from image',
      importFromImageBusy: 'Generating from image',
      importFromImageHint:
        'Upload a reference calendar image and ChatGPT will generate fresh Good, Bad, and Rare notes for this month.',
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
          'The Trimry plan is billed at USD 2.99 per month. It includes one ritual forecast delivered each Monday by your selected channel: email, WhatsApp, or both. You can cancel your subscription at any time from your account dashboard. If you decide to come back later, you can reactivate from the same account by starting a new Stripe checkout. Billing details, payment methods, invoices, and historical billing records remain available through the Stripe-hosted billing tools linked from your dashboard.',
      },
      {
        title: '3. Account security',
        body:
          'You must keep your login credentials confidential. You are responsible for all actions performed through your account.',
      },
      {
        title: '4. Acceptable use',
        body:
          'You agree not to misuse the service, attempt unauthorized access, or use Trimry for unlawful activity.',
      },
      {
        title: '5. No professional advice',
        body:
          'Trimry provides cultural and ritual timing content only. It is not medical, legal, or financial advice.',
      },
      {
        title: '6. Company information',
        body:
          'Trimry Limited, company number 752517. Registered office: 71 Lower Baggot Street, Co. Dublin, D02 P593, Dublin 2, Ireland. Operations office: Carrer Emili Darder 1, Bealaric Islands, Mallorca, 07181. Contact: support@trimry.com.',
      },
    ],
    privacySections: [
      {
        title: '1. Data we collect',
        body:
          'We collect your name, email address, encrypted password hash, language preference, delivery preference, and WhatsApp number when that channel is enabled for your subscription.',
      },
      {
        title: '2. How we use data',
        body:
          'Data is used to authenticate your account, manage subscription status, deliver weekly messages, and operate customer support.',
      },
      {
        title: '3. Data storage',
        body:
          'Account data is stored in MongoDB infrastructure configured by Trimry. Session cookies are HTTP-only and signed for security.',
      },
      {
        title: '4. Data sharing',
        body:
          'We do not sell your personal data. We only share data with providers needed to operate delivery and infrastructure.',
      },
      {
        title: '5. User rights',
        body:
          'You may request account access, corrections, or deletion by contacting support@trimry.com.',
      },
      {
        title: '6. Company contact',
        body:
          'Trimry Limited, company number 752517. Registered office: 71 Lower Baggot Street, Co. Dublin, D02 P593, Dublin 2, Ireland. Operations office: Carrer Emili Darder 1, Bealaric Islands, Mallorca, 07181.',
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
    backToLogin: 'Volver al login',
    backToDashboard: 'Volver al dashboard',
    tryAgain: 'Intentar de nuevo',
    returnHome: 'Volver al inicio',
  },
  languageSwitcher: {
    label: 'Idioma',
  },
  nav: {
    home: 'Inicio',
    howItWorks: 'Como funciona',
    pricing: 'Precio',
    faq: 'FAQ',
    legal: 'Legal',
    login: 'Ingresar',
    register: 'Crear cuenta',
    dashboard: 'Dashboard',
    profile: 'Perfil',
    admin: 'Admin',
    logout: 'Salir',
  },
  footer: {
    rightsReserved: 'Todos los derechos reservados.',
    companyNumber: 'Numero de compania',
    registeredOffice: 'Oficina registrada',
    operationsOffice: 'Oficina operativa',
    contact: 'Contacto',
  },
  hero: {
    badge: 'Servicio de fortuna del calendario tibetano',
    title: 'Encuentra los dias de suerte antes de tu proximo corte.',
    subtitle:
      'Trimry envia un pronostico ritual semanal cada lunes por email, WhatsApp o ambos, con senales de dias buenos, malos y raros inspiradas en una tradicion poco conocida del sutra tibetano, junto con pistas concretas sobre suerte, dinero y amor.',
    primary: 'Empieza por $2.99/mes',
    secondary: 'Ver el teaser de hoy',
  },
  home: {
    releaseBadge: 'Soltar tambien tiene timing',
    releaseText:
      'Un corte puede ser cosmetico. En el momento correcto, se siente como un corte limpio con la duda, el peso y la energia estancada.',
    releaseChannels: 'Elige recibirlo por email, WhatsApp o ambos.',
    releaseImageAlt:
      'Una persona cortandose el pelo mientras sale energia luminosa del corte como una liberacion ritual.',
    beliefBadge: 'Motor de creencia',
    beliefTitle: 'Sentirse con suerte cambia la forma en que entras a la sala.',
    beliefSubtitle:
      'La tesis de Trimry es simple: cuando sientes que el timing esta a tu favor, notas oportunidades mas rapido, actuas con mas optimismo y haces visible un mejor momentum.',
    teaserEyebrow: 'Teaser cosmico diario',
    couldBe: 'Podria ser...',
    teaserNote:
      'Suscribete para revelar la transmision real dia por dia y recibir la guia del lunes por email, WhatsApp o ambos.',
    teaserButton: 'Revelar mi pronostico real',
    predictions: [
      {
        tone: 'good',
        text: 'la buena fortuna se expande a tu alrededor. Podria llegar un mensaje relacionado con dinero o una oportunidad util.',
      },
      {
        tone: 'good',
        text: 'la energia del amor se abre. Podrias conocer a alguien magnetico o recibir una senal romantica inesperada.',
      },
      {
        tone: 'bad',
        text: 'los malentendidos pueden crecer rapido hoy. Evita decisiones emocionales y gastos riesgosos.',
      },
      {
        tone: 'bad',
        text: 'los planes pueden estancarse y el apoyo sentirse lejano. Mantenlo practico y posterga compromisos grandes.',
      },
      {
        tone: 'rare',
        text: 'dia comodin raro: una coincidencia extrana podria traer un regalo, un dato o una invitacion repentina.',
      },
      {
        tone: 'rare',
        text: 'cruce karmico: un amor o un asunto antiguo podria volver pidiendo cierre.',
      },
      {
        tone: 'good',
        text: 'ventana de prosperidad: podria aparecer de forma inesperada un pago atrasado, un descuento o un aliado util.',
      },
      {
        tone: 'bad',
        text: 'la energia se siente pesada y reactiva. Protege tu paz y evita discusiones sobre dinero o relaciones.',
      },
      {
        tone: 'rare',
        text: 'te rodea un magnetismo inusual. Alguien influyente podria compartir un consejo confidencial o una oportunidad oculta.',
      },
    ],
  },
  story: {
    title: 'Disenado para sentirse como momentum, no supersticion.',
    subtitle:
      'Trimry mezcla ritual, calendario y recordatorios practicos para que tu semana empiece con intencion y confianza.',
    card1Title: 'Ritmo inspirado en sutras',
    card1Text:
      'Nuestro patron semanal sigue una interpretacion menos conocida de las tradiciones tibetanas de timing del calendario.',
    card2Title: 'Un mensaje, cero ruido',
    card2Text:
      'Cada lunes: un pronostico ritual conciso entregado por email, WhatsApp o ambos.',
    card3Title: 'Rituales de liberacion',
    card3Text:
      'Mas alla del grooming, cada senal sugiere fortuna, relaciones y oportunidades de dinero.',
  },
  pricing: {
    title: 'Plan mensual simple',
    subtitle: 'Un solo plan. Sin cargos ocultos. Cancela cuando quieras desde tu dashboard.',
    planTitle: 'Entrega semanal de fortuna',
    billing: '$2.99 USD / mes',
    include1: '1 pronostico ritual cada lunes por email, WhatsApp o ambos',
    include2: 'Senales good/bad/rare con pistas practicas sobre suerte, dinero y amor',
    include3: 'Elige tu canal de entrega, actualizalo cuando quieras y cancela cuando te acomode',
    cta: 'Crear mi cuenta',
  },
  weekly: {
    title: 'Prediccion cosmica de hoy',
    subtitle:
      'Un teaser rotativo sobre fortuna, amor, dinero y suerte. Suscribete para desbloquear la transmision semanal real.',
    good: 'Good',
    bad: 'Bad',
    rare: 'Rare',
  },
  faq: {
    title: 'Preguntas frecuentes',
    q1: 'Es una recomendacion medica o cientifica?',
    a1: 'No. Trimry es un servicio cultural y ritual de timing para rutinas personales.',
    q2: 'Cuando recibo el mensaje?',
    a2: 'Cada lunes a la hora local que elijas, se entrega un pronostico ritual con el resumen de tu semana por el canal que selecciones.',
    q3: 'Como administro el cobro?',
    a3: 'Desde tu dashboard, donde puedes cancelar cuando quieras, reactivar despues y tambien abrir el portal seguro de Stripe para metodos de pago e invoices.',
    q4: 'Que zona horaria se usa?',
    a4: 'Usamos la zona horaria IANA guardada en tu cuenta y puedes cambiar tanto la zona horaria como la hora local del lunes desde tu dashboard.',
  },
  cta: {
    title: 'Empieza tu semana con intencion.',
    subtitle:
      'Crea tu cuenta Trimry, elige email, WhatsApp o ambos, y recibe tu primera guia de dias con suerte el proximo lunes.',
    button: 'Abrir mi cuenta',
  },
  auth: {
    registerTitle: 'Crea tu cuenta Trimry',
    registerSubtitle:
      'Registro seguro con cookies de sesion cifradas y timing local para el lunes.',
    loginTitle: 'Bienvenido de vuelta',
    loginSubtitle: 'Ingresa para administrar tu entrega ritual semanal.',
    firstNameLabel: 'Nombre',
    lastNameLabel: 'Apellido',
    birthDateLabel: 'Fecha de nacimiento',
    timeZoneLabel: 'Zona horaria',
    timeZoneHint:
      'Usamos esto para programar tu proyeccion del lunes a la hora local correcta.',
    emailLabel: 'Correo electronico',
    passwordLabel: 'Contrasena',
    whatsappLabel: 'Numero de WhatsApp',
    passwordHint:
      'Minimo 10 caracteres, incluyendo mayuscula, minuscula y numero.',
    registerButton: 'Crear cuenta',
    loginButton: 'Ingresar',
    needAccount: 'Necesitas una cuenta?',
    alreadyHaveAccount: 'Ya tienes una cuenta?',
  },
  deliveryChannels: {
    bothTitle: 'Email + WhatsApp',
    bothDescription: 'La mejor mezcla entre presencia ritual y entrega inmediata.',
    emailTitle: 'Solo email',
    emailDescription: 'Recibe la guia semanal directo en tu inbox.',
    whatsappTitle: 'Solo WhatsApp',
    whatsappDescription: 'Rapido, directo y pensado para el telefono.',
  },
  deliveryOnboarding: {
    loading: 'Cargando tu onboarding...',
    loadError: 'No pudimos cargar tu cuenta en este momento.',
    prepBadge: 'Encendido de fortuna',
    prepTitle: 'Preparando tu fortuna...',
    prepSubtitle:
      'Estamos uniendo tu canal elegido con el ritmo ritual de esta semana y preparando el paso de activacion de tu suscripcion.',
    preparationSteps: [
      'Eligiendo tu ritual de entrega',
      'Ajustando tu timing de liberacion',
      'Cargando el optimismo del lunes',
      'Preparando tu puerta de activacion',
    ],
    editBadge: 'Ajustes de entrega',
    createBadge: 'Onboarding paso 1',
    editTitle: 'Actualiza donde Trimry debe entregar tu ritual semanal',
    createTitle: 'Como quieres que Trimry entregue tu ritual semanal?',
    editSubtitle:
      'Cambia tu preferencia de entrega cuando quieras. Usa email, WhatsApp o mantén ambos canales activos.',
    createSubtitle:
      'Elige email, WhatsApp o ambos. Una vez guardado, te llevaremos a un paso corto de activacion antes del checkout seguro de Stripe.',
    activationChecklist: [
      'Elige tu preferencia de entrega.',
      'Agrega WhatsApp solo si ese canal esta activo.',
      'Tu pagina de activacion se abre antes de Stripe.',
    ],
    dashboardChecklist: [
      'Elige tu preferencia de entrega.',
      'Agrega WhatsApp solo si quieres tenerlo activo.',
      'Luego vuelves a tu dashboard.',
    ],
    setupTitle: 'Configuracion de entrega',
    setupSubtitle:
      'El email usa la bandeja de tu cuenta. Si activas WhatsApp, usa formato internacional para que la entrega funcione al instante.',
    channelLabel: 'Canal de entrega',
    mondayTimeLabel: 'Hora de la proyeccion del lunes',
    mondayTimeHint: 'Programado para los lunes a las {time} en {zone}.',
    emailDeliveryLabel: 'Entrega por email',
    whatsappOffHint:
      'WhatsApp esta desactivado para esta suscripcion. Activalo arriba si tambien quieres entrega inmediata al telefono.',
    submitContinue: 'Continuar a la activacion',
    submitSave: 'Guardar ajustes de entrega',
    saveError: 'No pudimos guardar tus ajustes de entrega en este momento.',
  },
  activate: {
    loading: 'Cargando tu paso de activacion...',
    loadError: 'No pudimos cargar tu activacion en este momento.',
    unavailable: 'No es posible continuar ahora.',
    badge: 'Puerta de activacion',
    title: 'Convierte tu mensaje semanal de Trimry en un ritual real de suerte.',
    subtitle:
      'La gente se mueve distinto cuando siente que el timing la favorece. Detecta aperturas mas rapido, sostiene mejor energia y se mantiene optimista por mas tiempo. Trimry esta construido para activar ese momentum cada lunes.',
    cards: [
      'Tu preferencia de entrega ya esta guardada.',
      'Stripe se abre en el siguiente paso con checkout alojado.',
      'Tu ritual semanal empieza apenas se confirma el cobro.',
    ],
    primaryButton: 'Activar en checkout seguro de Stripe',
    secondaryButton: 'Cambiar ajustes de entrega',
    snapshotTitle: 'Tu resumen de activacion',
    deliveryPreferenceLabel: 'Preferencia de entrega',
    emailDeliveryLabel: 'Entrega por email',
    projectionTimingLabel: 'Horario de proyeccion',
    whatsappDeliveryLabel: 'Entrega por WhatsApp',
    billingLabel: 'Cobro',
    billingValue: '$2.99 USD / mes',
    whyItWorksLabel: 'Por que funciona',
    whyItWorksText:
      'El ritual no es magia. El apalancamiento viene de la atencion, la confianza y una mejor accion cuando te sientes alineado.',
    carouselBadge: 'Psicologia del momentum',
    carouselTitle: 'La suerte se vuelve mas fuerte cuando tu mente empieza a moverse con ella.',
    carouselSubtitle:
      'Todas estas voces apuntan al mismo mecanismo: la creencia cambia la postura, la postura cambia la accion y la accion cambia lo que se siente posible.',
  },
  checkout: {
    badge: 'Paso hacia checkout',
    title: 'Abriendo Stripe checkout...',
    titleCancelled: 'Volver a Stripe checkout',
    subtitle:
      'Tus ajustes de entrega ya estan guardados. Te estamos enviando a Stripe para terminar la suscripcion.',
    subtitleCancelled:
      'Tu ultimo intento de checkout fue cancelado. Tus ajustes de entrega siguen guardados y podemos llevarte directo de vuelta a Stripe.',
    openError: 'No pudimos abrir Stripe checkout en este momento.',
    helper:
      'Si no pasa nada, espera un segundo o recarga esta pagina. El checkout de Stripe se esta creando de forma segura desde la API.',
  },
  dashboard: {
    title: 'Tu dashboard de suscripcion',
    intro: 'Administra tus canales de entrega y tu plan semanal de Trimry.',
    loading: 'Cargando tu cuenta...',
    noData: 'Ingresa para acceder a tu dashboard.',
    tabs: {
      account: 'Cuenta',
      predictionCalendar: 'Calendario',
    },
    status: 'Estado',
    nextMessage: 'Proximo mensaje del lunes',
    subscribeButton: 'Activar suscripcion',
    noSubscription: 'Todavia no tienes una suscripcion activa.',
    paymentPending: 'Pago pendiente',
    paymentIssue: 'Problema de pago',
    billingSuccess:
      'Stripe reporto un checkout exitoso. Estamos sincronizando tu suscripcion ahora.',
    profileTitle: 'Perfil de cuenta',
    profileSubtitle:
      'Actualiza tus datos de identidad y la zona horaria usada para tu proyeccion semanal.',
    profileSave: 'Guardar perfil',
    profileTimeZoneHint: 'La entrega del lunes se calcula desde esta zona horaria IANA.',
    dangerTitle: 'Zona de riesgo',
    dangerSubtitle:
      'Elimina tu cuenta y cierra sesion al instante. Conservamos un registro soft-deleted por auditoria, pero tu email de login se anonimiza y se detienen tus canales activos de entrega.',
    deleteButton: 'Eliminar cuenta',
    deleteLoading: 'Eliminando...',
    deleteConfirm:
      'Eliminar tu cuenta? Esto cerrara tu sesion de inmediato y detendra tus canales actuales de entrega.',
    deleteError: 'No pudimos eliminar tu cuenta en este momento.',
    noSubscriptionSubtitle:
      '$2.99 USD/mes · pronostico ritual semanal por email, WhatsApp o ambos',
    mondayProjectionTime: 'Hora de la proyeccion del lunes',
    sentOnMondaysAt: 'Se envia los lunes a las {time} en {zone}.',
    emailDeliveryLabel: 'Entrega por email',
    whatsappOffSetup:
      'WhatsApp esta apagado. Puedes activarlo por email solamente o volver a habilitarlo cuando quieras.',
    pendingTitle: 'Activa tu suscripcion Trimry',
    pendingSubtitle:
      'Tu preferencia de entrega ya esta guardada. Antes del pago, te llevamos por un paso corto de activacion que enmarca el ritual semanal y luego abre el checkout seguro de Stripe.',
    pendingDeliveryPreferenceLabel: 'Preferencia de entrega',
    pendingEmailDeliveryLabel: 'Entrega por email',
    pendingProjectionTimingLabel: 'Horario de proyeccion',
    pendingWhatsappLabel: 'Entrega por WhatsApp',
    continueActivation: 'Continuar activacion',
    changeDeliverySettings: 'Cambiar ajustes de entrega',
    activePlanTitle: 'Entrega semanal de fortuna Trimry',
    canceledPlanTitle: 'Tu suscripcion Trimry esta cancelada',
    canceledNote:
      'Puedes reactivarla cuando quieras desde esta cuenta. Tus canales de entrega y horario del lunes siguen guardados abajo.',
    activeNote:
      'Cancela cuando quieras desde este dashboard. Si vuelves despues, puedes reactivarla desde la misma cuenta.',
    deliveryPreferenceLabel: 'Preferencia de entrega',
    nextMessageIfReactivated: 'Si la reactivaras hoy, tu proximo mensaje seria',
    weeklyProjectionTimeLabel: 'Hora semanal de proyeccion',
    futureMessagesHint: 'Los futuros mensajes semanales seguiran esta hora en {zone}.',
    whatsappOffActive:
      'WhatsApp esta desactivado para esta suscripcion. Activalo arriba si tambien quieres entrega al telefono.',
    saveDeliverySettings: 'Guardar ajustes de entrega',
    reactivateButton: 'Reactivar suscripcion',
    reactivateLoading: 'Preparando reactivacion...',
    cancelButton: 'Cancelar suscripcion',
    cancelLoading: 'Cancelando...',
    manageBillingButton: 'Administrar cobro en Stripe',
    manageBillingLoading: 'Abriendo Stripe...',
    billingFootnoteCanceled:
      'Puedes reactivar desde esta cuenta cuando quieras. Stripe Billing sigue disponible para invoices e historial de cobros.',
    billingFootnoteActive:
      'Los cambios de metodo de pago y el historial de invoices siguen viviendo en Stripe Billing, pero ahora tambien puedes cancelar directo desde este dashboard cuando quieras.',
    cancelConfirm:
      'Cancelar tu suscripcion ahora? Se detendra el cobro futuro de inmediato y podras reactivarla mas adelante desde esta cuenta.',
    cancelSuccess:
      'Tu suscripcion fue cancelada. Tus ajustes de entrega siguen guardados aqui y puedes reactivarla cuando quieras.',
    cancelError: 'No pudimos cancelar tu suscripcion en este momento.',
    reactivateError: 'No pudimos reactivar tu suscripcion en este momento.',
    openBillingError: 'No pudimos abrir Stripe Billing en este momento.',
    saveDeliveryError: 'No pudimos guardar tus ajustes de entrega.',
    predictionCalendar: {
      title: 'Calendario de prediccion admin',
      subtitle:
        'Revisa el patron ritual del mes antes de que salga. Usa el mismo sistema Good, Bad y Rare que aparece en el home.',
      monthSummary: 'Resumen del mes',
      daysInMonth: 'dias de este mes',
      goodDays: 'Dias good',
      badDays: 'Dias bad',
      rareDays: 'Dias rare',
      customDays: 'Dias custom',
      customDaysText: 'dias ajustados manualmente en este mes',
      selectedDay: 'Dia seleccionado',
      jumpToCurrentMonth: 'Mes actual',
      today: 'Hoy',
      goodTone: 'Good',
      badTone: 'Bad',
      rareTone: 'Rare',
      goodSummaryText:
        'El impulso favorece cambios visibles y timing afortunado.',
      badSummaryText:
        'Aqui es mas probable que haya friccion, retraso o timing torcido.',
      rareSummaryText:
        'El patron inusual. Puede traer coincidencia, novedad o una apertura rara.',
      alignedActivities: 'Actividades alineadas',
      cautionActivities: 'Usar con cautela',
      haircut: 'Corte',
      shave: 'Afeitado',
      nails: 'Unas',
      release: 'Liberacion',
      none: 'Ninguna',
      summaryLabel: 'Prediccion',
      notesLabel: 'Nota de prediccion',
      notesHint: 'Esta nota aparece como guidance diaria para esa fecha.',
      goodOption: 'Good',
      badOption: 'Bad',
      rareOption: 'Rare',
      importFromImage: 'Rellenar mes con imagen',
      importFromImageBusy: 'Generando desde imagen',
      importFromImageHint:
        'Sube una imagen de referencia del calendario y ChatGPT generara notas nuevas Good, Bad y Rare para este mes.',
      importFromImageConfirm:
        'Reemplazar el mes visible con una nueva importacion basada en la imagen?',
      importFromImageSuccess: 'Mes de predicciones importado desde imagen.',
      importFromImageError:
        'No pudimos generar un mes de predicciones desde esa imagen en este momento.',
      saveDay: 'Guardar dia',
      resetDay: 'Resetear override',
      resetConfirm: 'Resetear este dia al patron generado de Trimry?',
      overrideBadge: 'Override manual',
      generatedBadge: 'Patron generado',
      saveSuccess: 'Prediccion guardada.',
      saveError: 'No pudimos guardar esta prediccion en este momento.',
      loadError:
        'No pudimos cargar el calendario admin de predicciones en este momento.',
    },
  },
  statuses: {
    active: 'Activa',
    paused: 'Pausada',
    canceled: 'Cancelada',
  },
  legal: {
    terms: 'Terminos del servicio',
    privacy: 'Politica de privacidad',
    disclaimer: 'Disclaimer ritual',
    englishNotice:
      'El texto legal maestro se mantiene en ingles. Esta traduccion se ofrece por conveniencia.',
    termsSections: [
      {
        title: '1. Descripcion del servicio',
        body:
          'Trimry entrega guidance semanal sobre timing para cortes de pelo, afeitado, corte de unas y rutinas simbolicas de liberacion inspiradas en tradiciones del calendario tibetano. La entrega esta disponible por email, WhatsApp o ambos.',
      },
      {
        title: '2. Suscripcion y cobro',
        body:
          'El plan Trimry se cobra a USD 2.99 por mes. Incluye un pronostico ritual entregado cada lunes por el canal que elijas: email, WhatsApp o ambos. Puedes cancelar tu suscripcion en cualquier momento desde tu dashboard. Si decides volver mas adelante, puedes reactivarla desde la misma cuenta iniciando un nuevo checkout de Stripe. Los detalles de cobro, metodos de pago, invoices e historial de facturacion siguen disponibles a traves de las herramientas de Stripe enlazadas desde tu dashboard.',
      },
      {
        title: '3. Seguridad de la cuenta',
        body:
          'Debes mantener tus credenciales de acceso confidenciales. Eres responsable de todas las acciones realizadas a traves de tu cuenta.',
      },
      {
        title: '4. Uso aceptable',
        body:
          'Aceptas no hacer mal uso del servicio, no intentar accesos no autorizados y no usar Trimry para actividades ilegales.',
      },
      {
        title: '5. Sin asesoria profesional',
        body:
          'Trimry entrega contenido cultural y ritual de timing solamente. No constituye asesoria medica, legal ni financiera.',
      },
      {
        title: '6. Informacion de la compania',
        body:
          'Trimry Limited, numero de compania 752517. Oficina registrada: 71 Lower Baggot Street, Co. Dublin, D02 P593, Dublin 2, Ireland. Oficina operativa: Carrer Emili Darder 1, Bealaric Islands, Mallorca, 07181. Contacto: support@trimry.com.',
      },
    ],
    privacySections: [
      {
        title: '1. Datos que recopilamos',
        body:
          'Recopilamos tu nombre, correo electronico, hash cifrado de contrasena, preferencia de idioma, preferencia de entrega y numero de WhatsApp cuando ese canal esta habilitado en tu suscripcion.',
      },
      {
        title: '2. Como usamos los datos',
        body:
          'Los datos se usan para autenticar tu cuenta, administrar el estado de la suscripcion, entregar mensajes semanales y operar soporte al cliente.',
      },
      {
        title: '3. Almacenamiento de datos',
        body:
          'Los datos de la cuenta se almacenan en infraestructura MongoDB configurada por Trimry. Las cookies de sesion son HTTP-only y estan firmadas por seguridad.',
      },
      {
        title: '4. Comparticion de datos',
        body:
          'No vendemos tus datos personales. Solo compartimos informacion con proveedores necesarios para operar la entrega y la infraestructura.',
      },
      {
        title: '5. Derechos del usuario',
        body:
          'Puedes solicitar acceso a tu cuenta, correcciones o eliminacion escribiendo a support@trimry.com.',
      },
      {
        title: '6. Contacto de la compania',
        body:
          'Trimry Limited, numero de compania 752517. Oficina registrada: 71 Lower Baggot Street, Co. Dublin, D02 P593, Dublin 2, Ireland. Oficina operativa: Carrer Emili Darder 1, Bealaric Islands, Mallorca, 07181.',
      },
    ],
    disclaimerSections: [
      {
        title: 'Contenido cultural',
        body:
          'La guidance de timing de Trimry se basa en interpretacion cultural y tradicion ritual. Esta pensada para reflexion personal y planificacion de rutinas.',
      },
      {
        title: 'Sin garantia de resultados',
        body:
          'Trimry no garantiza suerte, resultados financieros, resultados de salud ni ningun resultado especifico por seguir la guidance.',
      },
      {
        title: 'Responsabilidad personal',
        body:
          'Sigues siendo plenamente responsable de tus decisiones de grooming, salud y cualquier accion tomada a partir del contenido del servicio.',
      },
    ],
  },
  notifications: {
    success: 'Guardado correctamente.',
    error: 'Algo salio mal. Intentalo de nuevo.',
  },
  carousel: {
    proofLabel: 'Prueba rotativa de mindset',
    whyTitle: 'Por que importa',
    whyText:
      'Cuando una persona siente que el timing la favorece, carga mas confianza, detecta mas aperturas y se mueve con menos duda.',
    effectTitle: 'Efecto Trimry',
    effectText:
      'El mensaje semanal esta disenado para agudizar la atencion, reforzar el optimismo y convertir el ritual en un momentum que realmente se siente.',
    sequenceLabel: 'Secuencia de citas',
  },
  notFound: {
    title: 'Pagina no encontrada',
    description: 'La pagina que solicitaste no esta disponible.',
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
