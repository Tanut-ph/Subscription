import type { Category, Subscription } from "../types";
import { monthlyEquivalent } from "./money";

/**
 * For the demo everything is normalized to THB using rough static rates so
 * totals across currencies are comparable. Replace with a live FX source later.
 */
const FX_TO_THB: Record<string, number> = {
  THB: 1,
  USD: 36,
  EUR: 39,
  GBP: 46,
  JPY: 0.24,
};

export function toThb(amount: number, currency: string): number {
  return amount * (FX_TO_THB[currency] ?? 1);
}

export function activeSubs(subs: Subscription[]): Subscription[] {
  return subs.filter((s) => s.status === "active");
}

/** Total monthly spend (THB) across active subscriptions */
export function totalMonthly(subs: Subscription[]): number {
  return activeSubs(subs).reduce(
    (sum, s) => sum + monthlyEquivalent(toThb(s.amount, s.currency), s.cycle),
    0,
  );
}

export function totalYearly(subs: Subscription[]): number {
  return totalMonthly(subs) * 12;
}

export interface CategorySlice {
  category: Category;
  value: number;
}

export function spendByCategory(subs: Subscription[]): CategorySlice[] {
  const map = new Map<Category, number>();
  for (const s of activeSubs(subs)) {
    const m = monthlyEquivalent(toThb(s.amount, s.currency), s.cycle);
    map.set(s.category, (map.get(s.category) ?? 0) + m);
  }
  return [...map.entries()]
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value);
}

export interface MonthPoint {
  label: string;
  spend: number;
}

/**
 * Build a spend-over-time series for the last `months` months. A subscription
 * contributes to a month once it existed (createdAt) and is/was active.
 */
export function monthlySpendSeries(subs: Subscription[], months = 6): MonthPoint[] {
  const points: MonthPoint[] = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
    let spend = 0;
    for (const s of subs) {
      if (s.status === "canceled") continue;
      const created = new Date(s.createdAt);
      if (created > monthEnd) continue; // didn't exist yet
      spend += monthlyEquivalent(toThb(s.amount, s.currency), s.cycle);
    }
    points.push({
      label: monthStart.toLocaleDateString("en-US", { month: "short" }),
      spend: Math.round(spend),
    });
  }
  return points;
}

export interface UpcomingItem {
  sub: Subscription;
  days: number;
}

export function upcomingRenewals(subs: Subscription[], withinDays = 30): UpcomingItem[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return activeSubs(subs)
    .map((sub) => {
      const then = new Date(sub.nextBilling);
      then.setHours(0, 0, 0, 0);
      const days = Math.round((then.getTime() - now.getTime()) / 86400000);
      return { sub, days };
    })
    .filter((x) => x.days >= 0 && x.days <= withinDays)
    .sort((a, b) => a.days - b.days);
}
