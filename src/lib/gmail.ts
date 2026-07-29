/**
 * Gmail auto-pull. Uses Google Identity Services (GIS) to get a
 * `gmail.readonly` access token entirely in the browser (no backend), then
 * reads recent receipt emails and returns them as raw text for `parseReceipt`.
 *
 * Requires a Google OAuth Client ID in `VITE_GOOGLE_CLIENT_ID` and the GIS
 * script (loaded in index.html). See README for the Google Cloud setup.
 */
import { SERVICES } from "../data/services";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
const SCOPE = "https://www.googleapis.com/auth/gmail.readonly";

export const isGmailConfigured = Boolean(CLIENT_ID);

// Minimal shape of the GIS global we use.
interface TokenClient {
  requestAccessToken: (opts?: { prompt?: string }) => void;
  callback: (resp: { access_token?: string; error?: string }) => void;
}
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (resp: { access_token?: string; error?: string }) => void;
          }) => TokenClient;
        };
      };
    };
  }
}

let tokenClient: TokenClient | null = null;

function getTokenClient(): TokenClient {
  if (!window.google) throw new Error("Google sign-in script not loaded yet.");
  if (!CLIENT_ID) throw new Error("VITE_GOOGLE_CLIENT_ID is not set.");
  if (!tokenClient) {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPE,
      callback: () => {}, // replaced per-request below
    });
  }
  return tokenClient;
}

/** Interactive consent → resolves with an access token. */
export function authorize(): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = getTokenClient();
    client.callback = (resp) => {
      if (resp.error || !resp.access_token) reject(new Error(resp.error || "Authorization failed"));
      else resolve(resp.access_token);
    };
    client.requestAccessToken({ prompt: "" });
  });
}

/** Extra senders whose receipts we always want (Google Play + Google payments). */
const EXTRA_SENDERS = [
  "googleplay-noreply@google.com",
  "payments-noreply@google.com",
];

/**
 * Gmail search query targeting subscription receipts — including past ones you
 * already paid. Looks back 2 years across known services, Google Play/Google
 * payments, and any receipt/invoice/order email.
 */
function receiptQuery(): string {
  const senders = [...new Set([...SERVICES.flatMap((s) => s.domains), ...EXTRA_SENDERS])]
    .map((d) => `from:${d}`)
    .join(" OR ");
  return `newer_than:2y (${senders} OR subject:(receipt OR invoice OR "payment" OR order OR subscription))`;
}

function b64urlDecode(data: string): string {
  const norm = data.replace(/-/g, "+").replace(/_/g, "/");
  try {
    return decodeURIComponent(escape(atob(norm)));
  } catch {
    return atob(norm);
  }
}

interface GmailPart {
  mimeType?: string;
  body?: { data?: string };
  parts?: GmailPart[];
}

function extractBody(payload: GmailPart): string {
  // Prefer text/plain, fall back to stripped text/html.
  const stack: GmailPart[] = [payload];
  let html = "";
  while (stack.length) {
    const p = stack.pop()!;
    if (p.mimeType === "text/plain" && p.body?.data) return b64urlDecode(p.body.data);
    if (p.mimeType === "text/html" && p.body?.data) html = b64urlDecode(p.body.data);
    if (p.parts) stack.push(...p.parts);
  }
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
}

async function gapi<T>(url: string, token: string): Promise<T> {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Gmail API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

/**
 * Authorize (if needed) and fetch up to `max` recent receipt emails as raw
 * "From/Subject/body" text blocks ready for `parseReceipt`.
 */
export async function fetchReceiptEmails(max = 60): Promise<string[]> {
  const token = await authorize();
  const base = "https://gmail.googleapis.com/gmail/v1/users/me/messages";
  const list = await gapi<{ messages?: { id: string }[] }>(
    `${base}?q=${encodeURIComponent(receiptQuery())}&maxResults=${max}`,
    token,
  );
  if (!list.messages?.length) return [];

  const results: string[] = [];
  for (const { id } of list.messages) {
    const msg = await gapi<{ payload: GmailPart & { headers: { name: string; value: string }[] } }>(
      `${base}/${id}?format=full`,
      token,
    );
    const headers = msg.payload.headers || [];
    const from = headers.find((h) => h.name.toLowerCase() === "from")?.value ?? "";
    const subject = headers.find((h) => h.name.toLowerCase() === "subject")?.value ?? "";
    const body = extractBody(msg.payload);
    results.push(`From: ${from}\nSubject: ${subject}\n\n${body}`);
  }
  return results;
}
