# SubTrack — Subscription Manager

A responsive (PC + mobile) web app to track your subscriptions: what you're paying
for, where each charge comes from, how much it costs, and how your spending trends
over time. Includes **Auto Pull** — parse subscriptions straight out of receipt emails.

## Features

- **Dashboard** — monthly/yearly spend, active count, upcoming renewals, spend-over-time
  chart, and a spend-by-category donut.
- **Subscriptions** — searchable/filterable list with pause, resume, and remove.
- **Auto Pull (email receipts)** — paste receipt emails (or load samples) and the
  rule-based parser extracts service, amount, currency, billing cycle, and next
  renewal date, with a confidence score and de-duplication before import.
- **Add manually** — quick-pick popular services or enter any subscription by hand.
- Multi-currency, normalized to THB for totals.

## Tech stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Recharts (charts)
- React Router
- Data persisted in `localStorage` via a narrow repository (`src/lib/storage.ts`)
  designed to be swapped for Supabase without touching the UI.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173.

## Project layout

```
src/
  data/services.ts     Catalog of known services (logos, colors, keywords) + parser hints
  data/sampleData.ts   Seed subscriptions + sample receipt emails
  lib/parser.ts        Email-receipt parser (the "auto pull" engine)
  lib/analytics.ts     Spend totals, category breakdown, time series, renewals
  lib/money.ts         Currency formatting + cycle normalization
  lib/storage.ts       localStorage repository (Supabase-swappable)
  context/             Subscription state provider
  components/          Layout, charts, rows, avatar
  pages/               Dashboard, Subscriptions, ImportEmail, AddSubscription
```

## Supabase setup

1. Create `.env` from `.env.example` and fill `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
   (Dashboard → Project Settings → API — use the **anon/publishable** key).
2. Run `supabase/schema.sql` in the SQL editor (table + demo RLS + seed).

The app auto-detects the env vars: with them it runs on Supabase, without them it
falls back to localStorage.

## Auth (per-user data)

Login (email/password + magic link) is gated in when Supabase is configured.

1. Run `supabase/auth-migration.sql` — adds `user_id`, swaps the demo RLS for
   per-user policies, and creates `notification_prefs`.
2. To test with password login without email links, turn **off** "Confirm email"
   under Dashboard → Authentication → Providers → Email (or use magic links).
3. (Optional) Enable the Google provider in the dashboard to add Google sign-in.

Each signed-in user sees only their own subscriptions. New users start empty and
can seed samples with the in-app **Reset demo** button.

## Renewal notifications

- **In-app + desktop**: the bell in the top bar lists upcoming renewals and (with
  permission) fires Web Notifications. The "notify N days before" setting is saved
  to `notification_prefs` (or localStorage when signed out).
- **Email (production)**: deploy the Edge Function and schedule it:
  ```bash
  supabase functions deploy renewal-reminders
  supabase secrets set RESEND_API_KEY=... RESEND_FROM="SubTrack <alerts@yourdomain>"
  ```
  Then run `supabase/cron.sql` (fill in the service-role key) to send daily emails.

## Gmail auto-pull

Reads receipt emails directly from Gmail (browser-side OAuth, no backend).

1. Google Cloud Console → enable the **Gmail API**.
2. Create an **OAuth 2.0 Client ID (Web)**; add your origin (e.g.
   `http://localhost:5173`) to *Authorized JavaScript origins*.
3. Put the client id in `VITE_GOOGLE_CLIENT_ID`.
4. The **Pull from Gmail** button on the Auto Pull page then reads recent receipts
   and runs them through the same `parseReceipt()` engine.

## Next steps

- Live FX rates in `src/lib/analytics.ts` (currently rough static rates).
- Store Gmail history id to pull only new receipts incrementally.
