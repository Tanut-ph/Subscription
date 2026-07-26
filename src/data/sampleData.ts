import type { Subscription } from "../types";

/** ISO date `days` from today */
function inDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function daysAgo(days: number): string {
  return inDays(-days);
}

export const SAMPLE_SUBSCRIPTIONS: Subscription[] = [
  {
    id: "seed_netflix",
    name: "Netflix",
    source: "NETFLIX.COM",
    category: "Streaming",
    amount: 419,
    currency: "THB",
    cycle: "monthly",
    nextBilling: inDays(4),
    status: "active",
    color: "#e50914",
    logo: "N",
    origin: "email",
    createdAt: daysAgo(210),
  },
  {
    id: "seed_spotify",
    name: "Spotify",
    source: "SPOTIFY P",
    category: "Music",
    amount: 149,
    currency: "THB",
    cycle: "monthly",
    nextBilling: inDays(11),
    status: "active",
    color: "#1db954",
    logo: "S",
    origin: "email",
    createdAt: daysAgo(400),
  },
  {
    id: "seed_youtube",
    name: "YouTube Premium",
    source: "GOOGLE *YOUTUBE",
    category: "Streaming",
    amount: 179,
    currency: "THB",
    cycle: "monthly",
    nextBilling: inDays(2),
    status: "active",
    color: "#ff0000",
    logo: "YT",
    origin: "manual",
    createdAt: daysAgo(95),
  },
  {
    id: "seed_chatgpt",
    name: "ChatGPT Plus",
    source: "OPENAI *CHATGPT",
    category: "AI",
    amount: 20,
    currency: "USD",
    cycle: "monthly",
    nextBilling: inDays(9),
    status: "active",
    color: "#10a37f",
    logo: "AI",
    origin: "email",
    createdAt: daysAgo(150),
  },
  {
    id: "seed_icloud",
    name: "Apple iCloud+",
    source: "APPLE.COM/BILL",
    category: "Cloud",
    amount: 99,
    currency: "THB",
    cycle: "monthly",
    nextBilling: inDays(18),
    status: "active",
    color: "#3b3b3b",
    logo: "",
    origin: "email",
    createdAt: daysAgo(500),
  },
  {
    id: "seed_adobe",
    name: "Adobe Creative Cloud",
    source: "ADOBE",
    category: "Software",
    amount: 3600,
    currency: "THB",
    cycle: "yearly",
    nextBilling: inDays(120),
    status: "active",
    color: "#fa0f00",
    logo: "Ai",
    origin: "manual",
    createdAt: daysAgo(245),
  },
  {
    id: "seed_prime",
    name: "Amazon Prime",
    source: "AMZN*PRIME",
    category: "Shopping",
    amount: 900,
    currency: "THB",
    cycle: "yearly",
    nextBilling: inDays(60),
    status: "active",
    color: "#ff9900",
    logo: "P",
    origin: "email",
    createdAt: daysAgo(300),
  },
  {
    id: "seed_gamepass",
    name: "Xbox Game Pass",
    source: "MICROSOFT*XBOX",
    category: "Gaming",
    amount: 349,
    currency: "THB",
    cycle: "monthly",
    nextBilling: inDays(25),
    status: "paused",
    color: "#107c10",
    logo: "Xb",
    origin: "manual",
    createdAt: daysAgo(80),
  },
];

/**
 * Sample receipt emails used to demo the "auto pull" import flow. Users can
 * load these into the import screen to see the parser extract subscriptions.
 */
export const SAMPLE_EMAILS = `From: Netflix <info@netflix.com>
Subject: Your receipt from Netflix

Hi there,
Thank you for being a member. Your payment was successful.
Plan: Premium (Monthly)
Total charged: ฿419.00
Next billing date: ${nextBillingText(4)}
--------
From: Spotify <no-reply@spotify.com>
Subject: Your Spotify Premium receipt

Your Premium Individual subscription has renewed.
Amount: ฿149.00 / month
Renews on ${nextBillingText(11)}
--------
From: OpenAI <billing@openai.com>
Subject: Your ChatGPT Plus receipt

Thanks for your purchase.
ChatGPT Plus subscription
Total: $20.00 per month
Next charge: ${nextBillingText(9)}
--------
From: Disney+ <disneyplus@mail.disneyplus.com>
Subject: Payment confirmation for Disney+

Your Disney+ Standard plan payment was processed.
Amount billed: ฿289.00 monthly
Your next payment will be on ${nextBillingText(15)}`;

function nextBillingText(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}
