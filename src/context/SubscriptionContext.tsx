import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Subscription } from "../types";
import { store } from "../lib/storage";

interface Ctx {
  subs: Subscription[];
  add: (sub: Subscription) => void;
  addMany: (subs: Subscription[]) => void;
  update: (id: string, patch: Partial<Subscription>) => void;
  remove: (id: string) => void;
  reset: () => void;
}

const SubscriptionContext = createContext<Ctx | null>(null);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subs, setSubs] = useState<Subscription[]>([]);

  useEffect(() => {
    setSubs(store.list());
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      subs,
      add: (sub) => setSubs(store.add(sub)),
      addMany: (many) => {
        let latest = store.list();
        for (const s of many) latest = store.add(s);
        setSubs(latest);
      },
      update: (id, patch) => setSubs(store.update(id, patch)),
      remove: (id) => setSubs(store.remove(id)),
      reset: () => setSubs(store.reset()),
    }),
    [subs],
  );

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSubscriptions(): Ctx {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error("useSubscriptions must be used within SubscriptionProvider");
  return ctx;
}
