import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, RotateCcw } from "lucide-react";
import { useSubscriptions } from "../context/SubscriptionContext";
import SubscriptionRow from "../components/SubscriptionRow";
import { CATEGORIES } from "../data/services";
import type { Category, Subscription } from "../types";
import { totalMonthly } from "../lib/analytics";
import { formatMoney } from "../lib/money";

export default function Subscriptions() {
  const { subs, remove, update, reset } = useSubscriptions();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<Category | "All">("All");

  const filtered = useMemo(() => {
    return subs.filter((s) => {
      const matchCat = cat === "All" || s.category === cat;
      const matchQuery =
        !query ||
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.source.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [subs, query, cat]);

  const toggle = (sub: Subscription) =>
    update(sub.id, { status: sub.status === "active" ? "paused" : "active" });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Subscriptions</h1>
          <p className="mt-1 text-sm text-slate-500">
            {subs.length} tracked · {formatMoney(totalMonthly(subs)).replace(/\.\d+$/, "")}/mo active
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (confirm("Reset all data back to the sample subscriptions?")) reset();
            }}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <RotateCcw size={15} /> Reset demo
          </button>
          <Link
            to="/add"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
          >
            + Add
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or source…"
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Chip active={cat === "All"} onClick={() => setCat("All")}>
            All
          </Chip>
          {CATEGORIES.map((c) => (
            <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
              {c}
            </Chip>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length ? (
        <div className="space-y-2.5">
          {filtered.map((sub) => (
            <SubscriptionRow key={sub.id} sub={sub} onRemove={remove} onToggle={toggle} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
          <p className="text-sm text-slate-400">No subscriptions match your filters.</p>
        </div>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition ${
        active ? "bg-brand-600 text-white" : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200"
      }`}
    >
      {children}
    </button>
  );
}
