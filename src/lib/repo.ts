import type { Subscription } from "../types";
import { store } from "./storage";
import { currentUserId, isSupabaseEnabled, supabase } from "./supabase";
import { SAMPLE_SUBSCRIPTIONS } from "../data/sampleData";

const TABLE = "subscriptions";

/** DB row shape (snake_case) */
interface Row {
  id: string;
  name: string;
  source: string;
  category: string;
  amount: number | string;
  currency: string;
  cycle: string;
  next_billing: string;
  status: string;
  color: string;
  logo: string;
  origin: string;
  note: string | null;
  created_at: string;
}

function rowToSub(r: Row): Subscription {
  return {
    id: r.id,
    name: r.name,
    source: r.source,
    category: r.category as Subscription["category"],
    amount: typeof r.amount === "string" ? parseFloat(r.amount) : r.amount,
    currency: r.currency,
    cycle: r.cycle as Subscription["cycle"],
    nextBilling: r.next_billing,
    status: r.status as Subscription["status"],
    color: r.color,
    logo: r.logo,
    origin: r.origin as Subscription["origin"],
    note: r.note ?? undefined,
    createdAt: r.created_at,
  };
}

function subToRow(s: Subscription, userId?: string | null): Row & { user_id?: string } {
  return {
    id: s.id,
    name: s.name,
    source: s.source,
    category: s.category,
    amount: s.amount,
    currency: s.currency,
    cycle: s.cycle,
    next_billing: s.nextBilling,
    status: s.status,
    color: s.color,
    logo: s.logo,
    origin: s.origin,
    note: s.note ?? null,
    created_at: s.createdAt,
    ...(userId ? { user_id: userId } : {}),
  };
}

/**
 * Async subscription repository. Uses Supabase when configured (env vars set),
 * otherwise falls back to the synchronous localStorage store. Same surface as
 * the UI needs so the backend is invisible to components.
 */
export const repo = {
  usingSupabase: isSupabaseEnabled,

  async list(): Promise<Subscription[]> {
    if (!supabase) return store.list();
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as Row[]).map(rowToSub);
  },

  async add(sub: Subscription): Promise<void> {
    if (!supabase) {
      store.add(sub);
      return;
    }
    const uid = await currentUserId();
    const { error } = await supabase.from(TABLE).insert(subToRow(sub, uid));
    if (error) throw error;
  },

  async addMany(subs: Subscription[]): Promise<void> {
    if (subs.length === 0) return;
    if (!supabase) {
      for (const s of subs) store.add(s);
      return;
    }
    const uid = await currentUserId();
    const { error } = await supabase.from(TABLE).insert(subs.map((s) => subToRow(s, uid)));
    if (error) throw error;
  },

  async update(id: string, patch: Partial<Subscription>): Promise<void> {
    if (!supabase) {
      store.update(id, patch);
      return;
    }
    const rowPatch: Record<string, unknown> = {};
    if (patch.status !== undefined) rowPatch.status = patch.status;
    if (patch.amount !== undefined) rowPatch.amount = patch.amount;
    if (patch.nextBilling !== undefined) rowPatch.next_billing = patch.nextBilling;
    if (patch.name !== undefined) rowPatch.name = patch.name;
    if (patch.category !== undefined) rowPatch.category = patch.category;
    if (patch.cycle !== undefined) rowPatch.cycle = patch.cycle;
    if (patch.currency !== undefined) rowPatch.currency = patch.currency;
    if (patch.source !== undefined) rowPatch.source = patch.source;
    if (patch.note !== undefined) rowPatch.note = patch.note;
    const { error } = await supabase.from(TABLE).update(rowPatch).eq("id", id);
    if (error) throw error;
  },

  async remove(id: string): Promise<void> {
    if (!supabase) {
      store.remove(id);
      return;
    }
    const { error } = await supabase.from(TABLE).delete().eq("id", id);
    if (error) throw error;
  },

  /** Reset back to the sample dataset (scoped to the current user under RLS). */
  async reset(): Promise<Subscription[]> {
    if (!supabase) return store.reset();
    const uid = await currentUserId();
    // RLS limits this delete to the current user's rows.
    await supabase.from(TABLE).delete().neq("id", "");
    // Fresh ids so re-seeding never collides with another user's seed rows.
    const seeds = SAMPLE_SUBSCRIPTIONS.map((s) => subToRow({ ...s, id: `${s.id}_${uid?.slice(0, 8)}` }, uid));
    const { error } = await supabase.from(TABLE).insert(seeds);
    if (error) throw error;
    return this.list();
  },
};
