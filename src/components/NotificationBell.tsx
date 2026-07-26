import { useEffect, useRef, useState } from "react";
import { Bell, BellRing, X } from "lucide-react";
import { useSubscriptions } from "../context/SubscriptionContext";
import { upcomingRenewals } from "../lib/analytics";
import { formatMoney } from "../lib/money";
import {
  notificationPermission,
  notificationsSupported,
  notifyRenewal,
  requestNotificationPermission,
} from "../lib/notifications";
import { DEFAULT_PREFS, prefs, type NotifPrefs } from "../lib/prefs";
import Avatar from "./Avatar";

const DAYS_OPTIONS = [1, 3, 5, 7, 14];

export default function NotificationBell() {
  const { subs } = useSubscriptions();
  const [open, setOpen] = useState(false);
  const [pref, setPref] = useState<NotifPrefs>(DEFAULT_PREFS);
  const [perm, setPerm] = useState(notificationPermission());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    prefs.get().then(setPref);
  }, []);

  const due = upcomingRenewals(subs, pref.daysBefore);

  // Fire desktop notifications for anything due (deduped to once/day).
  useEffect(() => {
    if (perm !== "granted") return;
    for (const { sub, days } of due) {
      notifyRenewal(
        sub.id,
        `${sub.name} renews ${days === 0 ? "today" : `in ${days} day${days === 1 ? "" : "s"}`}`,
        `${formatMoney(sub.amount, sub.currency)} · ${sub.source}`,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subs, pref.daysBefore, perm]);

  // Close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function enable() {
    const p = await requestNotificationPermission();
    setPerm(p);
  }

  async function setDays(d: number) {
    const next = { ...pref, daysBefore: d };
    setPref(next);
    await prefs.set(next);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
        title="Renewal alerts"
      >
        {due.length ? <BellRing size={19} /> : <Bell size={19} />}
        {due.length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            {due.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">Renewal alerts</p>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X size={16} />
            </button>
          </div>

          {/* Settings */}
          <div className="space-y-3 border-b border-slate-100 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Notify me</span>
              <select
                value={pref.daysBefore}
                onChange={(e) => setDays(Number(e.target.value))}
                className="rounded-md border border-slate-200 px-2 py-1 text-xs outline-none focus:border-brand-400"
              >
                {DAYS_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d} day{d === 1 ? "" : "s"} before
                  </option>
                ))}
              </select>
            </div>
            {notificationsSupported() && perm !== "granted" && (
              <button
                onClick={enable}
                className="w-full rounded-lg bg-brand-50 py-2 text-xs font-medium text-brand-700 transition hover:bg-brand-100"
              >
                {perm === "denied"
                  ? "Notifications blocked — enable in browser settings"
                  : "Enable desktop notifications"}
              </button>
            )}
            {perm === "granted" && (
              <p className="text-[11px] text-emerald-600">✓ Desktop notifications on</p>
            )}
          </div>

          {/* Due list */}
          <div className="max-h-72 overflow-y-auto">
            {due.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-slate-400">
                Nothing due in the next {pref.daysBefore} days. 🎉
              </p>
            ) : (
              due.map(({ sub, days }) => (
                <div key={sub.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50">
                  <Avatar name={sub.name} color={sub.color} logo={sub.logo} size={34} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{sub.name}</p>
                    <p className="text-[11px] text-slate-400">
                      {days === 0 ? "renews today" : `in ${days} day${days === 1 ? "" : "s"}`} ·{" "}
                      {sub.nextBilling}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    {formatMoney(sub.amount, sub.currency)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
