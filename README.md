# Frontend - Next.js Application

## Overview

Next.js frontend with Clerk authentication and RTK Query API layer.

See [../README.md](../README.md) for complete project documentation.

## Setup

```bash
npm install
```

## Environment Variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Required variables:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key
- `NEXT_PUBLIC_API_URL` - Backend API URL

## Running

Development:
```bash
npm run dev
```

Production:
```bash
npm run build
npm start
```

## Architecture

### Stripe Integration
**Important**: All Stripe operations are backend-driven. The frontend has NO Stripe SDK.

- Backend handles: Checkout session creation, payment processing, subscriptions
- Frontend calls: Backend API to initiate checkout (e.g., `POST /api/checkout`)
- Backend redirects: User to Stripe Checkout URL

This approach ensures security and keeps sensitive Stripe keys away from the frontend.

## Pages

- `/` - Home page
- `/sign-in` - Sign in with Clerk
- `/sign-up` - Sign up with Clerk
- `/dashboard` - Protected dashboard (requires authentication)

## API Integration

API calls are made through RTK Query (`lib/api/api-slice.ts`).

Never use `fetch()` directly—always use RTK Query hooks.

## Component Structure

- `app/(auth)/` - Public authentication pages
- `app/(authenticated)/` - Protected pages (require Clerk auth)
- `lib/api/` - RTK Query configuration
- `lib/store.ts` - Redux store setup
- `lib/providers.tsx` - Redux provider

## Security Notes

- Clerk middleware protects all non-public routes
- No sensitive keys (Stripe, API secrets) in frontend
- All payment operations happen on backend only
- Environment variables validated at build time
