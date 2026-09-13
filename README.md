# Trimry App Web

Trimry is a personalized sports events notifier. Users pick the sports, leagues and teams they follow and receive a personal agenda of upcoming matches, races and fights by email and WhatsApp, in their own time zone. **Scout** is the conversational assistant (web widget + WhatsApp) that can search teams, follow them and answer "what is on tonight?" with real fixtures.

## Stack

- Next.js 13 (App Router), React 18, TypeScript
- Tailwind CSS with the `tr-*` utility layer in `src/app/globals.css` (light theme, brand gradient)
- External API integration over `fetch` with credentialed cookies (`src/lib/api-client.ts`)

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Landing: live preview of upcoming events per sport, how it works, Scout, pricing, FAQ |
| `/activate` | 4-step onboarding: sports → teams & leagues → delivery (inline account creation for anonymous visitors) → review + Stripe trial |
| `/account/register`, `/account/login` | Name + email registration (no password required; login links supported) |
| `/checkout/start` | Stripe Checkout handoff and cancel/resume state |
| `/account/delivery` (`/account/whatsapp`) | Channel, hour and WhatsApp number settings after checkout |
| `/dashboard` | Tabs: Agenda (personal feed), Teams & leagues, Delivery & billing, Account; admins also get Admin sends and Sports sync |
| `/legal/*` | Terms, privacy, data & accuracy notice, data deletion |

Anonymous visitors can complete steps 1–2 of `/activate`; the draft is stored in `localStorage` (`trimry:sports-preferences-draft`) and sent with `POST /auth/register` as `sportsPreferences`.

## Key components

- `components/scout-chat-widget.tsx` — floating Scout chat. Uses `GET/POST /assistant/chat` with a persistent `visitorId` (localStorage) so anonymous conversations are claimed on login. Dispatches `trimry:scout-preferences-updated` when Scout changes preferences so the dashboard refreshes.
- `components/sports-preferences-editor.tsx` — `SportPicker`, `TeamSearch`, `LeaguePicker`, `RhythmPicker`, `PreferencesSummary` and the composed `SportsPreferencesEditor`.
- `components/upcoming-events-feed.tsx` — renders an `UpcomingFeed` grouped by local day with team/league badges.
- `components/dashboard/admin-send-campaigns.tsx` — legacy dark admin tooling, scoped by `.tr-admin-surface`.
- `components/dashboard/admin-sports-sync.tsx` — TheSportsDB cache status and manual sync.

## Environment variables

Copy `.env.example`:

- `NEXT_PUBLIC_API_BASE_URL` (for example `http://localhost:4000/api/v1`)
- `NEXT_PUBLIC_SITE_URL` (for example `https://trimry.com`)
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `NEXT_PUBLIC_META_PIXEL_ID`

## Run locally

```bash
corepack pnpm install
corepack pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). `pnpm typecheck`, `pnpm lint` and `pnpm build` must pass before shipping.

## API contract used by the web app

- Auth: `POST /auth/register` (accepts `sportsPreferences`), `POST /auth/login`, `POST /auth/login-link/request|consume`, `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/whatsapp-checkout`
- Account: `GET /me`, `GET /me/upcoming-events`, `PATCH /me/activation-funnel`, `PATCH /users/me`, `PUT /users/me/sports-preferences`, `PATCH /users/me/preferences`, `PATCH /users/me/password`, `DELETE /users/me`
- Sports catalog (public): `GET /sports/catalog`, `GET /sports/leagues`, `GET /sports/teams/search`, `GET /sports/events/preview`
- Assistant: `GET /assistant/chat`, `POST /assistant/chat`
- Subscription & billing: `POST /subscription` (`subscribe`, `update-delivery`, `send-sample`), `GET /billing/plan`, `POST /billing/checkout-session`, `POST /billing/portal-session`, `POST /billing/cancel-subscription`, `POST /billing/reactivate-subscription`
- Admin: `/admin/send-*`, `/admin/subscriptions/*`, `GET|POST /admin/sports/sync`
