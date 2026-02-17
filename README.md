# Eco-Relais Dashboard (Frontend)

Production-ready Next.js dashboard for the Eco-Relais hyperlocal delivery platform.

**Development:** The `dev` branch is the integration branch; feature branches are merged here with `--no-ff`. Do not push to `main` from this workflow.

## Project documentation

- **Project overview & codebase guide:** `docs/PROJECT.md`

## Tech stack

- **Next.js 14+** (App Router) + TypeScript
- **shadcn/ui** (Dashboard-style components)
- **Tailwind CSS** (v4)
- **React Hook Form** + **Zod** validation
- **TanStack Query** for API calls and caching
- **Zustand** for auth state
- **Google Maps API** (Places + Maps)
- **next-qrcode** / **qrcode.react** for QR display, **html5-qrcode** for scanning
- **Stripe** (Elements / Checkout)
- **Lucide React** icons
- **next-themes** for dark mode

## Setup

```bash
npm install
cp .env.example .env.local
# Edit .env.local: set NEXT_PUBLIC_API_URL and NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You’ll be redirected to `/login`.

## Routes

- **Auth:** `/login`, `/register` (multi-step: role → details → address)
- **Client:** `/client/dashboard`, `/client/new-mission`, `/client/missions`, `/client/missions/[id]`, `/client/payments`, `/client/profile`
- **Partner:** `/partner/dashboard`, `/partner/available`, `/partner/missions`, `/partner/earnings`, `/partner/profile`
- **Admin:** `/admin/dashboard`, `/admin/users`, `/admin/missions`, `/admin/disputes`, `/admin/settings`

## Features

- Protected routes (client-side auth check + API JWT)
- TanStack Query with 30s polling for mission status where needed
- Optimistic updates for mission status changes
- Google Maps: address autocomplete (register, new mission, profile) and mission maps
- QR: display for client mission detail; scanner for partner collect/deliver
- Stripe: checkout redirect on mission create; partner Connect onboarding and payout
- Forms validated with Zod; toasts for actions; loading skeletons; error boundary and 404

## Env vars

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL (e.g. `http://localhost:3001/api`) |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps/Places API key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | (Optional) Stripe publishable key for client-side |

## Testing

Unit and component tests use **Vitest** and **React Testing Library**.

```bash
npm run test        # single run
npm run test:watch # watch mode
```

Tests cover: `lib/utils` (cn), `lib/utils/format` (formatCurrency, formatDate, formatDistance), `lib/validators/auth` (login/register schemas), `lib/stores/auth-store`, and the login page (form and register link).

## Build

```bash
npm run build
npm start
```
