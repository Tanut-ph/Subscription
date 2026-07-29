import type { Category } from "../types";

export interface ServiceDef {
  name: string;
  /** Keywords to detect in an email (lowercase) */
  keywords: string[];
  /** Sender-domain hints */
  domains: string[];
  category: Category;
  color: string;
  logo: string;
  /** Typical billing source / statement descriptor */
  source: string;
  cycleHint?: "monthly" | "yearly";
}

/**
 * Catalog of well-known subscription services. Used both to render nice
 * avatars and to power the email-receipt parser (auto pull).
 */
export const SERVICES: ServiceDef[] = [
  { name: "Netflix", keywords: ["netflix"], domains: ["netflix.com"], category: "Streaming", color: "#e50914", logo: "N", source: "NETFLIX.COM" },
  { name: "Spotify", keywords: ["spotify"], domains: ["spotify.com"], category: "Music", color: "#1db954", logo: "S", source: "SPOTIFY P" },
  { name: "YouTube Premium", keywords: ["youtube premium", "youtube music", "google youtube"], domains: ["youtube.com"], category: "Streaming", color: "#ff0000", logo: "YT", source: "GOOGLE *YOUTUBE" },
  { name: "Disney+", keywords: ["disney+", "disney plus", "disneyplus"], domains: ["disneyplus.com"], category: "Streaming", color: "#0e6bff", logo: "D+", source: "DISNEYPLUS" },
  { name: "Apple iCloud+", keywords: ["icloud", "apple.com/bill", "apple one"], domains: ["apple.com"], category: "Cloud", color: "#3b3b3b", logo: "", source: "APPLE.COM/BILL" },
  { name: "Amazon Prime", keywords: ["amazon prime", "prime membership"], domains: ["amazon.com"], category: "Shopping", color: "#ff9900", logo: "P", source: "AMZN*PRIME" },
  { name: "ChatGPT Plus", keywords: ["chatgpt", "openai"], domains: ["openai.com"], category: "AI", color: "#10a37f", logo: "AI", source: "OPENAI *CHATGPT" },
  { name: "Claude Pro", keywords: ["claude", "anthropic"], domains: ["anthropic.com"], category: "AI", color: "#d97757", logo: "C", source: "ANTHROPIC" },
  { name: "Adobe Creative Cloud", keywords: ["adobe", "creative cloud"], domains: ["adobe.com"], category: "Software", color: "#fa0f00", logo: "Ai", source: "ADOBE" },
  { name: "Microsoft 365", keywords: ["microsoft 365", "office 365", "microsoft subscription"], domains: ["microsoft.com"], category: "Software", color: "#0078d4", logo: "M", source: "MICROSOFT*365" },
  { name: "Google One", keywords: ["google one", "google storage"], domains: ["one.google.com"], category: "Cloud", color: "#4285f4", logo: "G1", source: "GOOGLE *ONE" },
  { name: "Dropbox", keywords: ["dropbox"], domains: ["dropbox.com"], category: "Cloud", color: "#0061ff", logo: "Db", source: "DROPBOX" },
  { name: "Notion", keywords: ["notion"], domains: ["notion.so", "notion.com"], category: "Software", color: "#000000", logo: "No", source: "NOTION LABS" },
  { name: "GitHub", keywords: ["github"], domains: ["github.com"], category: "Software", color: "#24292f", logo: "Gh", source: "GITHUB" },
  { name: "Xbox Game Pass", keywords: ["game pass", "xbox"], domains: ["xbox.com", "microsoft.com"], category: "Gaming", color: "#107c10", logo: "Xb", source: "MICROSOFT*XBOX" },
  { name: "PlayStation Plus", keywords: ["playstation plus", "ps plus", "playstation network"], domains: ["playstation.com"], category: "Gaming", color: "#003791", logo: "PS", source: "PLAYSTATION" },
  { name: "The New York Times", keywords: ["new york times", "nytimes"], domains: ["nytimes.com"], category: "News", color: "#000000", logo: "NYT", source: "NYTIMES" },
  { name: "Canva Pro", keywords: ["canva"], domains: ["canva.com"], category: "Software", color: "#00c4cc", logo: "Cv", source: "CANVA" },
  { name: "Figma", keywords: ["figma"], domains: ["figma.com"], category: "Software", color: "#a259ff", logo: "Fi", source: "FIGMA" },
  { name: "Fitbit Premium", keywords: ["fitbit"], domains: ["fitbit.com"], category: "Fitness", color: "#00b0b9", logo: "Fb", source: "FITBIT" },
];

export function findService(text: string): ServiceDef | null {
  const t = text.toLowerCase();
  for (const svc of SERVICES) {
    if (svc.keywords.some((k) => t.includes(k))) return svc;
    if (svc.domains.some((d) => t.includes(d))) return svc;
  }
  return null;
}

const CATEGORY_COLORS: Record<Category, string> = {
  Streaming: "#e11d48",
  Music: "#1db954",
  Software: "#6366f1",
  AI: "#10a37f",
  Cloud: "#0ea5e9",
  Gaming: "#7c3aed",
  News: "#334155",
  Fitness: "#f97316",
  Shopping: "#f59e0b",
  Other: "#64748b",
};

export function categoryColor(c: Category): string {
  return CATEGORY_COLORS[c];
}

export const CATEGORIES: Category[] = [
  "Streaming",
  "Music",
  "Software",
  "AI",
  "Cloud",
  "Gaming",
  "News",
  "Fitness",
  "Shopping",
  "Other",
];
