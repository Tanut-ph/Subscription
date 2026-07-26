import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSubscriptions } from "../context/SubscriptionContext";
import { CATEGORIES, SERVICES, findService } from "../data/services";
import type { BillingCycle, Category } from "../types";
import { newId } from "../lib/storage";
import { friendlyError } from "../lib/errors";
import Avatar from "../components/Avatar";

const CYCLES: BillingCycle[] = ["monthly", "yearly", "weekly", "quarterly"];
const CURRENCIES = ["THB", "USD", "EUR", "GBP", "JPY"];

export default function AddSubscription() {
  const { add } = useSubscriptions();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("Streaming");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("THB");
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [nextBilling, setNextBilling] = useState(defaultNextBilling());
  const [source, setSource] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const known = findService(name);
  const color = known?.color ?? "#6366f1";
  const logo = known?.logo ?? name.slice(0, 2).toUpperCase();

  function onPickService(svcName: string) {
    const svc = SERVICES.find((s) => s.name === svcName);
    if (!svc) return;
    setName(svc.name);
    setCategory(svc.category);
    setSource(svc.source);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !amount) return;
    setSaving(true);
    setSaveError(null);
    try {
      await add({
        id: newId(),
        name: name.trim(),
        source: source.trim() || name.trim().toUpperCase(),
        category,
        amount: parseFloat(amount),
        currency,
        cycle,
        nextBilling,
        status: "active",
        color,
        logo,
        origin: "manual",
        createdAt: new Date().toISOString(),
      });
      navigate("/subscriptions");
    } catch (err) {
      setSaveError(friendlyError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add subscription</h1>
        <p className="mt-1 text-sm text-slate-500">Enter a subscription manually.</p>
      </div>

      {/* Quick pick */}
      <div>
        <p className="mb-2 text-xs font-medium text-slate-500">Quick pick a popular service</p>
        <div className="flex flex-wrap gap-2">
          {SERVICES.slice(0, 10).map((svc) => (
            <button
              key={svc.name}
              type="button"
              onClick={() => onPickService(svc.name)}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 text-xs font-medium text-slate-600 transition hover:border-brand-300 hover:bg-brand-50"
            >
              <Avatar name={svc.name} color={svc.color} logo={svc.logo} size={22} />
              {svc.name}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <Avatar name={name || "?"} color={color} logo={logo || "?"} size={48} />
          <div>
            <p className="font-semibold text-slate-900">{name || "New subscription"}</p>
            <p className="text-xs text-slate-400">{category}</p>
          </div>
        </div>

        <Field label="Service name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Netflix"
            className={input}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Amount">
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              placeholder="0.00"
              className={input}
            />
          </Field>
          <Field label="Currency">
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={input}>
              {CURRENCIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Billing cycle">
            <select
              value={cycle}
              onChange={(e) => setCycle(e.target.value as BillingCycle)}
              className={input}
            >
              {CYCLES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Category">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className={input}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Next billing date">
            <input
              type="date"
              value={nextBilling}
              onChange={(e) => setNextBilling(e.target.value)}
              className={input}
            />
          </Field>
          <Field label="Source / billed as">
            <input
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g. NETFLIX.COM"
              className={input}
            />
          </Field>
        </div>

        {saveError && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">{saveError}</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Add subscription"}
          </button>
        </div>
      </form>
    </div>
  );
}

const input =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function defaultNextBilling(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}
