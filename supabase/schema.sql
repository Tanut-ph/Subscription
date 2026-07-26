-- SubTrack — Supabase schema + seed
-- Project ref: qsgwwhwkustsoixlglyz
-- Run this in the Supabase SQL editor (or `supabase db push`).

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id           text primary key,
  name         text        not null,
  source       text        not null,
  category     text        not null,
  amount       numeric      not null check (amount >= 0),
  currency     text        not null default 'THB',
  cycle        text        not null default 'monthly'
                 check (cycle in ('weekly', 'monthly', 'quarterly', 'yearly')),
  next_billing date        not null,
  status       text        not null default 'active'
                 check (status in ('active', 'paused', 'canceled')),
  color        text        not null default '#6366f1',
  logo         text        not null default '',
  origin       text        not null default 'manual'
                 check (origin in ('manual', 'email')),
  note         text,
  created_at   timestamptz not null default now()
);

create index if not exists subscriptions_status_idx on public.subscriptions (status);
create index if not exists subscriptions_next_billing_idx on public.subscriptions (next_billing);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Demo mode: single shared dataset, anon key may read/write.
-- When you add auth, add a `user_id uuid references auth.users` column and
-- replace these policies with `auth.uid() = user_id`.
-- ---------------------------------------------------------------------------
alter table public.subscriptions enable row level security;

drop policy if exists "demo_anon_all" on public.subscriptions;
create policy "demo_anon_all"
  on public.subscriptions
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------------
-- Seed data (matches src/data/sampleData.ts). Dates are relative to today.
-- ---------------------------------------------------------------------------
insert into public.subscriptions
  (id, name, source, category, amount, currency, cycle, next_billing, status, color, logo, origin, created_at)
values
  ('seed_netflix',  'Netflix',              'NETFLIX.COM',      'Streaming', 419,  'THB', 'monthly', current_date + 4,   'active', '#e50914', 'N',  'email',  now() - interval '210 days'),
  ('seed_spotify',  'Spotify',              'SPOTIFY P',        'Music',     149,  'THB', 'monthly', current_date + 11,  'active', '#1db954', 'S',  'email',  now() - interval '400 days'),
  ('seed_youtube',  'YouTube Premium',      'GOOGLE *YOUTUBE',  'Streaming', 179,  'THB', 'monthly', current_date + 2,   'active', '#ff0000', 'YT', 'manual', now() - interval '95 days'),
  ('seed_chatgpt',  'ChatGPT Plus',         'OPENAI *CHATGPT',  'AI',        20,   'USD', 'monthly', current_date + 9,   'active', '#10a37f', 'AI', 'email',  now() - interval '150 days'),
  ('seed_icloud',   'Apple iCloud+',        'APPLE.COM/BILL',   'Cloud',     99,   'THB', 'monthly', current_date + 18,  'active', '#3b3b3b', '',   'email',  now() - interval '500 days'),
  ('seed_adobe',    'Adobe Creative Cloud', 'ADOBE',            'Software',  3600, 'THB', 'yearly',  current_date + 120, 'active', '#fa0f00', 'Ai', 'manual', now() - interval '245 days'),
  ('seed_prime',    'Amazon Prime',         'AMZN*PRIME',       'Shopping',  900,  'THB', 'yearly',  current_date + 60,  'active', '#ff9900', 'P',  'email',  now() - interval '300 days'),
  ('seed_gamepass', 'Xbox Game Pass',       'MICROSOFT*XBOX',   'Gaming',    349,  'THB', 'monthly', current_date + 25,  'paused', '#107c10', 'Xb', 'manual', now() - interval '80 days')
on conflict (id) do nothing;
