import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, CreditCard, MailPlus, PlusCircle } from "lucide-react";
import { useSubscriptions } from "../context/SubscriptionContext";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/subscriptions", label: "Subscriptions", icon: CreditCard, end: false },
  { to: "/import", label: "Auto Pull", icon: MailPlus, end: false },
  { to: "/add", label: "Add", icon: PlusCircle, end: false },
];

export default function Layout() {
  return (
    <div className="min-h-full lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-6 lg:flex">
        <Brand />
        <nav className="mt-8 flex flex-col gap-1">
          {NAV.map((item) => (
            <SideLink key={item.to} {...item} />
          ))}
        </nav>
        <BackendBadge />
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0">
        {/* Mobile top bar */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <Brand />
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden">
        {NAV.map((item) => (
          <BottomLink key={item.to} {...item} />
        ))}
      </nav>
    </div>
  );
}

function BackendBadge() {
  const { usingSupabase } = useSubscriptions();
  return (
    <div
      className={`mt-auto rounded-xl p-4 text-xs ${
        usingSupabase ? "bg-emerald-50 text-emerald-700" : "bg-brand-50 text-brand-700"
      }`}
    >
      <p className="flex items-center gap-1.5 font-semibold">
        <span
          className={`inline-block h-2 w-2 rounded-full ${
            usingSupabase ? "bg-emerald-500" : "bg-brand-400"
          }`}
        />
        {usingSupabase ? "Live · Supabase" : "Demo · Local"}
      </p>
      <p className={`mt-1 ${usingSupabase ? "text-emerald-600/80" : "text-brand-600/80"}`}>
        {usingSupabase
          ? "Synced to your Supabase project. Changes persist across devices."
          : "Stored locally in your browser. Add Supabase env vars to go live."}
      </p>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 font-bold text-white">
        S
      </div>
      <div className="leading-tight">
        <p className="text-sm font-bold text-slate-900">SubTrack</p>
        <p className="text-[11px] text-slate-400">Subscription manager</p>
      </div>
    </div>
  );
}

function SideLink({
  to,
  label,
  icon: Icon,
  end,
}: {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
          isActive
            ? "bg-brand-600 text-white shadow-sm"
            : "text-slate-600 hover:bg-slate-100"
        }`
      }
    >
      <Icon size={18} />
      {label}
    </NavLink>
  );
}

function BottomLink({
  to,
  label,
  icon: Icon,
  end,
}: {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition ${
          isActive ? "text-brand-600" : "text-slate-400"
        }`
      }
    >
      <Icon size={20} />
      {label}
    </NavLink>
  );
}
