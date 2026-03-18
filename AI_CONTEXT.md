# AI Context - trimry-app-web

## System Role

`trimry-app-web` is the client interface for landing pages, account entry, dashboard profile editing, and subscription controls.

## Backend Dependency

The web app depends on external API base URL from:

- `NEXT_PUBLIC_API_BASE_URL` (example: `http://localhost:4000/api/v1`)

## Auth Model

- Uses cookie-based auth with `credentials: include`.
- API client retries once after `401` by calling `/auth/refresh`.
- Logout always calls `/auth/logout`.

## Expected Endpoints

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/refresh`
- `GET /me`
- `PATCH /users/me`
- `POST /subscription`

## Profile Contract

Profile data is represented with:

- `firstName`
- `lastName`
- `fullName`
- `birthDate` (`YYYY-MM-DD` or `null`)
- `email`

## Admin Dashboard Extension

- `GET /me` is expected to include `user.admin` for role-gated dashboard tabs.
- Root layout auth state should be derived from the API auth cookies, not the legacy local session cookie.
- The admin prediction tab reads/writes persisted day overrides through the API and treats `/dashboard?tab=prediction-calendar` as the direct entry point.

## Extension Guidance

- Reuse `src/lib/api-client.ts` for all backend calls.
- Keep all writes behind explicit forms/actions with server error display.
- Avoid introducing localStorage for session tokens.
- Keep UI state resilient to `401` and refresh retries.
