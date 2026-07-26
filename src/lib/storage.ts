import type { Subscription } from "../types";
import { SAMPLE_SUBSCRIPTIONS } from "../data/sampleData";

const KEY = "submanage.subscriptions.v1";
const SEEDED_KEY = "submanage.seeded.v1";

/**
 * Subscription repository backed by localStorage. The async signatures and
 * narrow surface (list/save/remove) are intentional so this can be swapped
 * for a Supabase-backed adapter later without touching the UI.
 */
export const store = {
  list(): Subscription[] {
    seedIfNeeded();
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as Subscription[]) : [];
    } catch {
      return [];
    }
  },

  saveAll(subs: Subscription[]): void {
    localStorage.setItem(KEY, JSON.stringify(subs));
  },

  add(sub: Subscription): Subscription[] {
    const subs = store.list();
    const next = [sub, ...subs];
    store.saveAll(next);
    return next;
  },

  update(id: string, patch: Partial<Subscription>): Subscription[] {
    const next = store.list().map((s) => (s.id === id ? { ...s, ...patch } : s));
    store.saveAll(next);
    return next;
  },

  remove(id: string): Subscription[] {
    const next = store.list().filter((s) => s.id !== id);
    store.saveAll(next);
    return next;
  },

  reset(): Subscription[] {
    localStorage.setItem(KEY, JSON.stringify(SAMPLE_SUBSCRIPTIONS));
    localStorage.setItem(SEEDED_KEY, "1");
    return SAMPLE_SUBSCRIPTIONS;
  },
};

function seedIfNeeded() {
  if (!localStorage.getItem(SEEDED_KEY)) {
    localStorage.setItem(KEY, JSON.stringify(SAMPLE_SUBSCRIPTIONS));
    localStorage.setItem(SEEDED_KEY, "1");
  }
}

export function newId(): string {
  return `sub_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}
