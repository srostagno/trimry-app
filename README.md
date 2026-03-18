# Trimry Web

Trimry is a subscription web app that delivers one WhatsApp message every Monday with favorable and challenging days for grooming and symbolic release rituals, inspired by Tibetan calendar timing traditions.

## Stack

- Next.js 13 (App Router)
- TypeScript
- Tailwind CSS
- External API integration over `fetch` with credentialed cookies

## Features

- New lucky-themed landing page and branding
- Language switcher with top 20 global languages (English default)
- Secure user registration and login through external API
- Dashboard account profile editor
  - First name
  - Last name
  - Birth date
- Dashboard for subscription management
  - Real Stripe Checkout session handoff
  - Stripe Billing Portal access from dashboard
  - Update WhatsApp number
- Legal pages: Terms, Privacy, Ritual Disclaimer

## Environment Variables

Copy `.env.example` and set real values:

- `NEXT_PUBLIC_API_BASE_URL` (for example `http://localhost:4000/api/v1`)

## Run locally

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## API Contract

The web app expects the API to expose:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/refresh`
- `GET /me`
- `PATCH /users/me`
- `DELETE /users/me`
- `POST /subscription`
- `POST /billing/checkout-session`
- `POST /billing/portal-session`
