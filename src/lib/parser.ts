import type { BillingCycle, Category, ParsedReceipt } from "../types";
import { findService } from "../data/services";

interface AmountMatch {
  amount: number;
  currency: string;
}

const CURRENCY_PATTERNS: { re: RegExp; currency: string }[] = [
  { re: /(?:฿|thb|บาท)\s*([0-9][0-9,]*\.?[0-9]*)/i, currency: "THB" },
  { re: /([0-9][0-9,]*\.?[0-9]*)\s*(?:฿|thb|บาท)/i, currency: "THB" },
  { re: /(?:\$|usd)\s*([0-9][0-9,]*\.?[0-9]*)/i, currency: "USD" },
  { re: /(?:€|eur)\s*([0-9][0-9,]*\.?[0-9]*)/i, currency: "EUR" },
  { re: /(?:£|gbp)\s*([0-9][0-9,]*\.?[0-9]*)/i, currency: "GBP" },
  { re: /(?:¥|jpy)\s*([0-9][0-9,]*\.?[0-9]*)/i, currency: "JPY" },
];

/** Pull the most likely charged amount out of a receipt body */
function extractAmount(text: string): AmountMatch | null {
  // Prefer lines that mention total / charged / amount / ยอดรวม
  const lines = text.split(/\n/);
  const priorityLines = lines.filter((l) =>
    /(total|amount|charged|payment|billed|ยอด|รวม|ชำระ)/i.test(l),
  );
  const searchSpaces = [...priorityLines, text];

  for (const space of searchSpaces) {
    for (const { re, currency } of CURRENCY_PATTERNS) {
      const m = space.match(re);
      if (m) {
        const value = parseFloat(m[1].replace(/,/g, ""));
        if (!Number.isNaN(value) && value > 0) return { amount: value, currency };
      }
    }
  }
  return null;
}

/** Detect billing cadence from wording */
function extractCycle(text: string): BillingCycle {
  const t = text.toLowerCase();
  if (/(annual|yearly|per year|\/year|\/yr|รายปี|ต่อปี)/.test(t)) return "yearly";
  if (/(quarterly|per quarter|รายไตรมาส)/.test(t)) return "quarterly";
  if (/(weekly|per week|\/week|\/wk|รายสัปดาห์)/.test(t)) return "weekly";
  return "monthly";
}

/** Try to find a "next billing / renews on" date */
function extractNextBilling(text: string): string | null {
  // ISO date
  const iso = text.match(/(20\d{2})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  // "renews on January 5, 2026" / "next billing date: Jan 5 2026"
  const months =
    "jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?";
  const re = new RegExp(`(${months})\\.?\\s+(\\d{1,2}),?\\s+(20\\d{2})`, "i");
  const m = text.match(re);
  if (m) {
    const d = new Date(`${m[1]} ${m[2]}, ${m[3]}`);
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  return null;
}

/** Is this a Google Play / Google account order receipt? */
function isGooglePlayReceipt(text: string): boolean {
  return /googleplay-noreply@google\.com|payments-noreply@google\.com|google\s*play\s*(order|receipt)/i.test(
    text,
  );
}

/**
 * Google Play receipts list the purchased app/subscription on the same line as
 * its price, e.g. "Duolingo Super (Duolingo)   $6.99". Pull that title out.
 */
function extractPlayItem(text: string): string | null {
  for (const line of text.split(/\n/)) {
    const m = line.match(/^(.{2,60}?)\s+(?:฿|\$|€|£|¥|thb|usd|eur|gbp|jpy)\s?[0-9]/i);
    if (m) {
      const name = m[1].replace(/\(.*?\)/g, "").trim(); // strip "(Publisher)"
      if (name && !/^(item|total|subtotal|tax|order|price)\b/i.test(name)) return name;
    }
  }
  return null;
}

/** Fallback: guess the service name from the subject line / sender */
function guessName(text: string): string {
  const fromLine = text.match(/from:\s*"?([^"<\n]+)"?\s*<?[^>\n]*>?/i);
  if (fromLine) {
    const name = fromLine[1].trim();
    if (name && !/no-?reply|billing|receipts?|team|support/i.test(name)) return name;
  }
  const subject = text.match(/subject:\s*(.+)/i);
  if (subject) {
    return subject[1].replace(/receipt|invoice|payment|your|for|-.*$/gi, "").trim() || "Unknown service";
  }
  return "Unknown service";
}

/**
 * Parse a raw receipt email (subject + body pasted together) into a
 * candidate subscription. This is the rule-based core of the "auto pull"
 * feature — it can later be fed by the Gmail API instead of pasted text.
 */
export function parseReceipt(rawEmail: string): ParsedReceipt {
  const text = rawEmail.trim();
  const svc = findService(text);
  const amountMatch = extractAmount(text);
  const cycle = svc?.cycleHint ?? extractCycle(text);
  const nextBilling = extractNextBilling(text);
  const fromPlay = isGooglePlayReceipt(text);

  let confidence = 0;
  if (svc) confidence += 0.5;
  if (amountMatch) confidence += 0.35;
  if (nextBilling) confidence += 0.15;

  // Resolve name/source/category. A known service inside a Play receipt (e.g.
  // "YouTube Premium") still wins; otherwise fall back to the Play item name
  // and label the charge as coming from Google Play.
  let name = svc?.name;
  let source = svc?.source;
  let category: Category = svc?.category ?? "Other";

  if (!svc && fromPlay) {
    name = extractPlayItem(text) ?? guessName(text);
    source = "GOOGLE PLAY";
    confidence += 0.3; // we know the merchant, just not the catalog entry
  }

  return {
    name: name ?? guessName(text),
    source: source ?? "UNKNOWN MERCHANT",
    category,
    amount: amountMatch?.amount ?? null,
    currency: amountMatch?.currency ?? "THB",
    cycle,
    nextBilling,
    confidence: Math.min(1, confidence),
    matchedService: !!svc || fromPlay,
  };
}

/** Split a mailbox export containing several emails into individual receipts */
export function splitEmails(raw: string): string[] {
  // Emails separated by a line of dashes, "===", or blank "From:" boundaries
  const parts = raw
    .split(/\n\s*[-=]{3,}\s*\n|\n(?=from:\s)/i)
    .map((p) => p.trim())
    .filter((p) => p.length > 10);
  return parts.length ? parts : [raw.trim()];
}
