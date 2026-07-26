/** Turn a Supabase/Postgrest error into a message a user can act on. */
export function friendlyError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (/user_id.*does not exist/i.test(msg) || /notification_prefs/i.test(msg)) {
    return "Database not migrated yet — run supabase/auth-migration.sql in the Supabase SQL editor, then try again.";
  }
  if (/row-level security|violates row-level/i.test(msg)) {
    return "Blocked by row-level security — make sure you're signed in.";
  }
  return `Couldn't save: ${msg}`;
}
