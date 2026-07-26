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

## Next steps

- Swap `src/lib/storage.ts` for a Supabase adapter + auth for multi-user/live data.
- Replace the paste-emails flow with a Gmail API connector feeding `parseReceipt()`.
- Live FX rates in `src/lib/analytics.ts` (currently rough static rates).
