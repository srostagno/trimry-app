# AI Context - trimry-app-web

## System Role

`trimry-app-web` is the client for the Trimry sports events notifier: landing + live preview, onboarding (`/activate`), account entry, the member dashboard (agenda, preferences, delivery, account) and the Scout chat widget.

## Backend Dependency

- Base URL from `NEXT_PUBLIC_API_BASE_URL` (example: `http://localhost:4000/api/v1`).
- All calls go through `src/lib/api-client.ts` (`apiFetch`, `readApiError`). It retries once after `401` via `/auth/refresh`.

## Domain Types

- `src/lib/sports.ts`: `SportKey` (12 sports), `SportsPreferences { sports, leagues, teams, lookaheadDays 1–14, frequency daily|weekly }`, `UpcomingFeed` / `FeedEvent`, catalog + search + preview fetchers, `PUT /users/me/sports-preferences`, and the anonymous draft helpers (`loadPreferencesDraft` / `savePreferencesDraft`).
- `src/lib/start-flow.ts`: `AccountSnapshot` (`GET /me` → user with `sportsPreferences`, subscription, `lastDigest`), `getStartFlowDestination` (no preferences → `/activate`; no subscription → `/activate?step=3`; `pending_checkout` → `/checkout/start`; WhatsApp channel without number → `/account/delivery?edit=1`).
- `src/lib/registration.ts`: `registerAccount` (name + email, optional `sportsPreferences`).
- `src/lib/i18n.ts`: en/es/pt copy. Sections: `common, nav, footer, home, pricing, faq, auth, onboarding, deliveryChannels, delivery, checkout, agenda, dashboard (incl. sportsSync, sendCampaigns), scout, statuses, legal, cookieConsent, notifications, notFound`. Pricing strings contain `{billingInline}` / `{trialPeriodDays}` placeholders filled by `LanguageProvider` from `GET /billing/plan`.

## Scout Widget

- `components/scout-chat-widget.tsx`, mounted by `SiteShell` on every page except `/activate` and `/checkout`.
- Anonymous visitors get a `visitorId` in `localStorage` (`trimry:scout-visitor-id`); the API claims that conversation once the user logs in.
- Sends `{ message, visitorId, locale, timeZone, localHistory }`; response includes `reply`, context flags, `preferencesUpdated` and CTAs. When `preferencesUpdated` is true the widget dispatches `trimry:scout-preferences-updated` (dashboard listens and reloads).
- `openScoutChat()` dispatches `trimry:scout-open` (used by the landing page CTA).

## Design System

- Light theme; brand gradient `linear-gradient(135deg,#2b2fb8,#2f7bff 38%,#35d2e5 72%,#2fc56c)`; Tailwind colors `trimry.*`.
- Reusable classes in `globals.css`: `tr-container, tr-shell, tr-card, tr-card-muted, tr-hero, tr-gradient-panel, tr-eyebrow, tr-btn-primary|secondary|ghost|danger, tr-input, tr-label, tr-chip(-active), tr-badge-*, tr-tab(-active), tr-alert-*`.
- The legacy admin send-campaign component still uses `cosmic-*` classes; wrap it in `.tr-admin-surface` (dashboard does this).

## Extension Guidance

- Keep new API calls in `src/lib/*` fetchers and reuse `apiFetch`.
- Never store session tokens in localStorage; only the preferences draft and Scout visitor id live there.
- Keep pages resilient to `401` (redirect to `/account/login?redirect=...`).
- When adding copy, add it to all three languages in `i18n.ts` and type it in `MessageSection`.
