import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, MailPlus, Check, AlertTriangle } from "lucide-react";
import { useSubscriptions } from "../context/SubscriptionContext";
import { parseReceipt, splitEmails } from "../lib/parser";
import { SAMPLE_EMAILS } from "../data/sampleData";
import type { ParsedReceipt, Subscription } from "../types";
import { findService } from "../data/services";
import { newId } from "../lib/storage";
import Avatar from "../components/Avatar";
import { cycleLabel, formatMoney } from "../lib/money";

interface Candidate extends ParsedReceipt {
  key: string;
  selected: boolean;
}

export default function ImportEmail() {
  const { addMany, subs } = useSubscriptions();
  const navigate = useNavigate();
  const [raw, setRaw] = useState("");
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [imported, setImported] = useState(0);

  function scan() {
    const emails = splitEmails(raw);
    const parsed = emails
      .map((e, i) => ({ ...parseReceipt(e), key: `c_${i}`, selected: true }))
      .filter((c) => c.amount !== null || c.matchedService);
    setCandidates(parsed);
    setImported(0);
  }

  function loadSample() {
    setRaw(SAMPLE_EMAILS);
    setCandidates(null);
  }

  function toggle(key: string) {
    setCandidates((prev) =>
      prev ? prev.map((c) => (c.key === key ? { ...c, selected: !c.selected } : c)) : prev,
    );
  }

  function importSelected() {
    if (!candidates) return;
    const existing = new Set(subs.map((s) => s.name.toLowerCase()));
    const toAdd: Subscription[] = candidates
      .filter((c) => c.selected && !existing.has(c.name.toLowerCase()))
      .map((c) => {
        const svc = findService(c.name);
        return {
          id: newId(),
          name: c.name,
          source: c.source,
          category: c.category,
          amount: c.amount ?? 0,
          currency: c.currency,
          cycle: c.cycle,
          nextBilling: c.nextBilling ?? defaultNext(),
          status: "active" as const,
          color: svc?.color ?? "#6366f1",
          logo: svc?.logo ?? c.name.slice(0, 2).toUpperCase(),
          origin: "email" as const,
          createdAt: new Date().toISOString(),
        };
      });
    addMany(toAdd);
    setImported(toAdd.length);
    setTimeout(() => navigate("/subscriptions"), 900);
  }

  const selectedCount = candidates?.filter((c) => c.selected).length ?? 0;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <MailPlus className="text-brand-600" /> Auto pull from email
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Paste your subscription receipt emails below. The parser detects the service, amount,
          billing cycle and renewal date automatically — no manual typing.
        </p>
      </div>

      <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-4 text-sm text-brand-700">
        <p className="flex items-center gap-1.5 font-medium">
          <Sparkles size={15} /> How it works
        </p>
        <p className="mt-1 text-brand-600/90">
          In production this reads receipts straight from Gmail. For the demo, paste raw emails
          (or load the samples) and we'll extract subscriptions with the same rule-based engine.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700">Receipt emails</label>
          <button onClick={loadSample} className="text-xs font-medium text-brand-600 hover:underline">
            Load sample emails
          </button>
        </div>
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={9}
          placeholder="Paste one or more receipt emails here…"
          className="w-full resize-y rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
        <div className="mt-3 flex justify-end">
          <button
            onClick={scan}
            disabled={!raw.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-40"
          >
            <Sparkles size={15} /> Scan emails
          </button>
        </div>
      </div>

      {candidates && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">
              Found {candidates.length} subscription{candidates.length === 1 ? "" : "s"}
            </h2>
            {imported > 0 && (
              <span className="flex items-center gap-1 text-sm font-medium text-emerald-600">
                <Check size={15} /> Imported {imported}
              </span>
            )}
          </div>

          {candidates.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">
              No subscriptions detected. Try the sample emails to see it in action.
            </p>
          ) : (
            <div className="space-y-2.5">
              {candidates.map((c) => (
                <CandidateRow key={c.key} c={c} onToggle={() => toggle(c.key)} />
              ))}
            </div>
          )}

          {candidates.length > 0 && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={importSelected}
                disabled={selectedCount === 0}
                className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-40"
              >
                Import {selectedCount} selected
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CandidateRow({ c, onToggle }: { c: Candidate; onToggle: () => void }) {
  const svc = findService(c.name);
  const confPct = Math.round(c.confidence * 100);
  const low = c.confidence < 0.5;

  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:bg-slate-50">
      <input
        type="checkbox"
        checked={c.selected}
        onChange={onToggle}
        className="h-4 w-4 accent-brand-600"
      />
      <Avatar
        name={c.name}
        color={svc?.color ?? "#6366f1"}
        logo={svc?.logo ?? c.name.slice(0, 2).toUpperCase()}
        size={40}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-slate-900">{c.name}</p>
        <p className="truncate text-xs text-slate-400">
          {c.category} · {c.nextBilling ? `renews ${c.nextBilling}` : "no date found"}
        </p>
      </div>
      <div className="text-right">
        <p className="font-semibold text-slate-900">
          {c.amount !== null ? formatMoney(c.amount, c.currency) : "—"}
          <span className="text-xs font-normal text-slate-400">{cycleLabel(c.cycle)}</span>
        </p>
        <p
          className={`inline-flex items-center gap-1 text-[11px] ${
            low ? "text-amber-500" : "text-emerald-500"
          }`}
        >
          {low && <AlertTriangle size={11} />}
          {confPct}% match
        </p>
      </div>
    </label>
  );
}

function defaultNext(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}
