import { Mail, Hand, Trash2 } from "lucide-react";
import type { Subscription } from "../types";
import Avatar from "./Avatar";
import { cycleLabel, daysUntil, formatMoney } from "../lib/money";

interface Props {
  sub: Subscription;
  onRemove?: (id: string) => void;
  onToggle?: (sub: Subscription) => void;
}

export default function SubscriptionRow({ sub, onRemove, onToggle }: Props) {
  const days = daysUntil(sub.nextBilling);
  const soon = sub.status === "active" && days >= 0 && days <= 5;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition hover:shadow-sm sm:gap-4 sm:p-4">
      <Avatar name={sub.name} color={sub.color} logo={sub.logo} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold text-slate-900">{sub.name}</p>
          {sub.origin === "email" ? (
            <span title="Imported from email receipt">
              <Mail size={13} className="text-brand-500" />
            </span>
          ) : null}
          {sub.status !== "active" && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase text-slate-500">
              {sub.status}
            </span>
          )}
        </div>
        <p className="truncate text-xs text-slate-400">
          {sub.category} · from {sub.source}
        </p>
      </div>

      <div className="hidden text-right sm:block">
        {sub.status === "active" ? (
          <p className={`text-xs ${soon ? "font-semibold text-rose-500" : "text-slate-400"}`}>
            {days === 0 ? "renews today" : `in ${days}d`}
          </p>
        ) : (
          <p className="text-xs text-slate-300">—</p>
        )}
        <p className="text-[11px] text-slate-300">{sub.nextBilling}</p>
      </div>

      <div className="text-right">
        <p className="font-semibold text-slate-900">
          {formatMoney(sub.amount, sub.currency)}
        </p>
        <p className="text-[11px] text-slate-400">{cycleLabel(sub.cycle)}</p>
      </div>

      {(onToggle || onRemove) && (
        <div className="flex flex-col gap-1 sm:flex-row">
          {onToggle && (
            <button
              onClick={() => onToggle(sub)}
              title={sub.status === "active" ? "Pause" : "Resume"}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <Hand size={15} />
            </button>
          )}
          {onRemove && (
            <button
              onClick={() => onRemove(sub.id)}
              title="Remove"
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
