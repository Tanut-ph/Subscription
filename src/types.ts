export type BillingCycle = "monthly" | "yearly" | "weekly" | "quarterly";

export type Category =
  | "Streaming"
  | "Music"
  | "Software"
  | "AI"
  | "Cloud"
  | "Gaming"
  | "News"
  | "Fitness"
  | "Shopping"
  | "Other";

export interface Subscription {
  id: string;
  /** Service/brand name, e.g. "Netflix" */
  name: string;
  /** Where the charge comes from — the merchant/biller descriptor */
  source: string;
  category: Category;
  amount: number;
  currency: string;
  cycle: BillingCycle;
  /** ISO date of the next renewal */
  nextBilling: string;
  status: "active" | "paused" | "canceled";
  /** Brand accent color (hex) for the avatar */
  color: string;
  /** Short letters shown in the avatar */
  logo: string;
  /** "manual" | "email" — how this entry was created */
  origin: "manual" | "email";
  note?: string;
  createdAt: string;
}

/** Result of parsing a single receipt email */
export interface ParsedReceipt {
  name: string;
  source: string;
  category: Category;
  amount: number | null;
  currency: string;
  cycle: BillingCycle;
  nextBilling: string | null;
  /** 0..1 how confident the parser is */
  confidence: number;
  matchedService: boolean;
}
