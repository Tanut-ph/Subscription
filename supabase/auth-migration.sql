-- SubTrack — Auth migration: move from a shared demo table to per-user data.
-- Run this in the Supabase SQL editor AFTER schema.sql.

-- 1) Add owner column ------------------------------------------------------
alter table public.subscriptions
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

create index if not exists subscriptions_user_id_idx on public.subscriptions (user_id);

-- 2) Replace the open demo policy with per-user policies -------------------
drop policy if exists "demo_anon_all" on public.subscriptions;

drop policy if exists "own_select" on public.subscriptions;
drop policy if exists "own_insert" on public.subscriptions;
drop policy if exists "own_update" on public.subscriptions;
drop policy if exists "own_delete" on public.subscriptions;

create policy "own_select" on public.subscriptions
  for select to authenticated using (auth.uid() = user_id);

create policy "own_insert" on public.subscriptions
  for insert to authenticated with check (auth.uid() = user_id);

create policy "own_update" on public.subscriptions
  for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own_delete" on public.subscriptions
  for delete to authenticated using (auth.uid() = user_id);

-- 3) Optional cleanup: the original seed rows have no owner and are now
--    invisible to everyone. Remove them so each user starts clean (they can
--    re-seed with the in-app "Reset demo" button, which writes rows owned by
--    the signed-in user).
delete from public.subscriptions where user_id is null;

-- ---------------------------------------------------------------------------
-- Notification preferences (per user) — used by phase 2.
-- ---------------------------------------------------------------------------
create table if not exists public.notification_prefs (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  days_before int  not null default 3 check (days_before between 0 and 30),
  email_on    bool not null default true,
  updated_at  timestamptz not null default now()
);

alter table public.notification_prefs enable row level security;

drop policy if exists "prefs_own_all" on public.notification_prefs;
create policy "prefs_own_all" on public.notification_prefs
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
