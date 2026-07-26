import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Subscription } from "../types";
import { repo } from "../lib/repo";

interface Ctx {
  subs: Subscription[];
  loading: boolean;
  error: string | null;
  usingSupabase: boolean;
  add: (sub: Subscription) => Promise<void>;
  addMany: (subs: Subscription[]) => Promise<void>;
  update: (id: string, patch: Partial<Subscription>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  reset: () => Promise<void>;
}

const SubscriptionContext = createContext<Ctx | null>(null);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      const data = await repo.list();
      setSubs(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      subs,
      loading,
      error,
      usingSupabase: repo.usingSupabase,
      add: async (sub) => {
        await repo.add(sub);
        await refresh();
      },
      addMany: async (many) => {
        await repo.addMany(many);
        await refresh();
      },
      update: async (id, patch) => {
        // optimistic
        setSubs((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
        await repo.update(id, patch);
        await refresh();
      },
      remove: async (id) => {
        setSubs((prev) => prev.filter((s) => s.id !== id));
        await repo.remove(id);
        await refresh();
      },
      reset: async () => {
        const data = await repo.reset();
        setSubs(data);
      },
    }),
    [subs, loading, error],
  );

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSubscriptions(): Ctx {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error("useSubscriptions must be used within SubscriptionProvider");
  return ctx;
}
