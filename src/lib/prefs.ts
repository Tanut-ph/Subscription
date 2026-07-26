import { currentUserId, supabase } from "./supabase";

export interface NotifPrefs {
  daysBefore: number;
  emailOn: boolean;
}

export const DEFAULT_PREFS: NotifPrefs = { daysBefore: 3, emailOn: true };

const LOCAL_KEY = "submanage.prefs.v1";

/**
 * Notification preferences. Persisted to the Supabase `notification_prefs`
 * table when signed in, otherwise to localStorage.
 */
export const prefs = {
  async get(): Promise<NotifPrefs> {
    if (supabase) {
      const uid = await currentUserId();
      if (uid) {
        const { data } = await supabase
          .from("notification_prefs")
          .select("days_before, email_on")
          .eq("user_id", uid)
          .maybeSingle();
        if (data) return { daysBefore: data.days_before, emailOn: data.email_on };
      }
    }
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (raw) return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
    } catch {
      /* ignore */
    }
    return DEFAULT_PREFS;
  },

  async set(next: NotifPrefs): Promise<void> {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
    if (supabase) {
      const uid = await currentUserId();
      if (uid) {
        await supabase.from("notification_prefs").upsert({
          user_id: uid,
          days_before: next.daysBefore,
          email_on: next.emailOn,
          updated_at: new Date().toISOString(),
        });
      }
    }
  },
};
