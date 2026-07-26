-- Schedule the renewal-reminders Edge Function to run every day at 08:00 UTC.
-- Run once in the Supabase SQL editor after deploying the function.
--
-- Requires the pg_cron and pg_net extensions (enable under Database → Extensions).

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Replace <PROJECT_REF> and <ANON_OR_SERVICE_KEY> below.
-- Use the service_role key so the function can be invoked server-side.
select cron.schedule(
  'renewal-reminders-daily',
  '0 8 * * *',
  $$
  select net.http_post(
    url     := 'https://qsgwwhwkustsoixlglyz.supabase.co/functions/v1/renewal-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer <SERVICE_ROLE_KEY>'
    ),
    body    := '{}'::jsonb
  );
  $$
);

-- To remove later:  select cron.unschedule('renewal-reminders-daily');
