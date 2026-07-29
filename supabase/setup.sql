-- ===========================================================================
-- SubTrack — complete database setup (run this ONCE, on a fresh or messy DB).
-- This supersedes schema.sql + auth-migration.sql: it builds the final,
-- per-user schema in one go.
--
-- Where: Supabase Dashboard → SQL Editor → paste all → Run.
-- ===========================================================================

-- 1) Clean slate ------------------------------------------------------------
--    Safe to run on the demo DB — it only holds sample data. Drops any earlier
--    version of these tables (and their policies) so we start fresh.
drop table if exists public.subscriptions   cascade;
drop table if exists public.notification_prefs cascade;

-- 2) Subscriptions ----------------------------------------------------------
create table public.subscriptions (
  id           text primary key,
  user_id      uuid not null references auth.users (id) on delete cascade,
  name         text not null,
  source       text not null,
  category     text not null,
  amount       numeric not null check (amount >= 0),
  currency     text not null default 'THB',
  cycle        text not null default 'monthly'
                 check (cycle in ('weekly', 'monthly', 'quarterly', 'yearly')),
  next_billing date not null,
  status       text not null default 'active'
                 check (status in ('active', 'paused', 'canceled')),
  color        text not null default '#6366f1',
  logo         text not null default '',
  origin       text not null default 'manual'
                 check (origin in ('manual', 'email')),
  note         text,
  created_at   timestamptz not null default now()
);

create index subscriptions_user_id_idx      on public.subscriptions (user_id);
create index subscriptions_status_idx       on public.subscriptions (status);
create index subscriptions_next_billing_idx on public.subscriptions (next_billing);

alter table public.subscriptions enable row level security;

-- Each user sees and edits only their own rows.
create policy "own_select" on public.subscriptions
  for select to authenticated using (auth.uid() = user_id);
create policy "own_insert" on public.subscriptions
  for insert to authenticated with check (auth.uid() = user_id);
create policy "own_update" on public.subscriptions
  for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_delete" on public.subscriptions
  for delete to authenticated using (auth.uid() = user_id);

-- 3) Notification preferences ----------------------------------------------
create table public.notification_prefs (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  days_before int  not null default 3 check (days_before between 0 and 30),
  email_on    bool not null default true,
  updated_at  timestamptz not null default now()
);

alter table public.notification_prefs enable row level security;

create policy "prefs_own_all" on public.notification_prefs
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ===========================================================================
-- Done. Now:
--   1. Sign up / sign in in the app.
--   2. Click "Reset demo" on the Subscriptions page to seed sample data that
--      belongs to your account (there is no shared seed — data is per-user).
-- ===========================================================================
