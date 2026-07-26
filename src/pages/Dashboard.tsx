import { Link } from "react-router-dom";
import { TrendingUp, CalendarClock, Wallet, Layers } from "lucide-react";
import { useSubscriptions } from "../context/SubscriptionContext";
import {
  activeSubs,
  monthlySpendSeries,
  spendByCategory,
  totalMonthly,
  totalYearly,
  upcomingRenewals,
} from "../lib/analytics";
import { formatMoney } from "../lib/money";
import SpendChart from "../components/SpendChart";
import CategoryChart from "../components/CategoryChart";
import SubscriptionRow from "../components/SubscriptionRow";

export default function Dashboard() {
  const { subs } = useSubscriptions();

  const monthly = totalMonthly(subs);
  const yearly = totalYearly(subs);
  const active = activeSubs(subs);
  const series = monthlySpendSeries(subs, 6);
  const byCategory = spendByCategory(subs);
  const upcoming = upcomingRenewals(subs, 30);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track where your money goes each month.
          </p>
        </div>
        <Link
          to="/import"
          className="hidden rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 sm:block"
        >
          Auto pull from email
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat
          icon={<Wallet size={18} />}
          label="Monthly spend"
          value={formatMoney(monthly).replace(/\.\d+$/, "")}
          tone="brand"
        />
        <Stat
          icon={<TrendingUp size={18} />}
          label="Yearly spend"
          value={formatMoney(yearly).replace(/\.\d+$/, "")}
          tone="emerald"
        />
        <Stat
          icon={<Layers size={18} />}
          label="Active subs"
          value={String(active.length)}
          tone="violet"
        />
        <Stat
          icon={<CalendarClock size={18} />}
          label="Due in 30 days"
          value={String(upcoming.length)}
          tone="amber"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Spending over time</h2>
            <span className="text-xs text-slate-400">last 6 months</span>
          </div>
          <SpendChart data={series} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 font-semibold text-slate-900">By category</h2>
          {byCategory.length ? (
            <CategoryChart data={byCategory} />
          ) : (
            <p className="text-sm text-slate-400">No active subscriptions.</p>
          )}
        </div>
      </div>

      {/* Upcoming renewals */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Upcoming renewals</h2>
          <Link to="/subscriptions" className="text-xs font-medium text-brand-600 hover:underline">
            View all
          </Link>
        </div>
        {upcoming.length ? (
          <div className="space-y-2.5">
            {upcoming.slice(0, 5).map(({ sub }) => (
              <SubscriptionRow key={sub.id} sub={sub} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">Nothing due in the next 30 days. 🎉</p>
        )}
      </div>
    </div>
  );
}

const TONES: Record<string, string> = {
  brand: "bg-brand-50 text-brand-600",
  emerald: "bg-emerald-50 text-emerald-600",
  violet: "bg-violet-50 text-violet-600",
  amber: "bg-amber-50 text-amber-600",
};

function Stat({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: keyof typeof TONES;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className={`mb-3 inline-flex rounded-lg p-2 ${TONES[tone]}`}>{icon}</div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-0.5 text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
