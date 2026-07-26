import type { BillingCycle } from "../types";

/** How many times per year a cycle bills */
const PER_YEAR: Record<BillingCycle, number> = {
  weekly: 52,
  monthly: 12,
  quarterly: 4,
  yearly: 1,
};

/** Normalize any billing amount to an equivalent monthly cost */
export function monthlyEquivalent(amount: number, cycle: BillingCycle): number {
  return (amount * PER_YEAR[cycle]) / 12;
}

/** Normalize any billing amount to an equivalent yearly cost */
export function yearlyEquivalent(amount: number, cycle: BillingCycle): number {
  return amount * PER_YEAR[cycle];
}

const SYMBOLS: Record<string, string> = {
  THB: "฿",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
};

export function formatMoney(amount: number, currency = "THB"): string {
  const symbol = SYMBOLS[currency] ?? "";
  const fixed = amount.toLocaleString(undefined, {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return symbol ? `${symbol}${fixed}` : `${fixed} ${currency}`;
}

export function cycleLabel(cycle: BillingCycle): string {
  return { weekly: "/wk", monthly: "/mo", quarterly: "/qtr", yearly: "/yr" }[cycle];
}

/** Days until an ISO date (can be negative if past) */
export function daysUntil(iso: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const then = new Date(iso);
  then.setHours(0, 0, 0, 0);
  return Math.round((then.getTime() - now.getTime()) / 86400000);
}
