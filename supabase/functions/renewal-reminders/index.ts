// Supabase Edge Function: renewal-reminders
// Sends an email reminder for subscriptions renewing within each user's
// configured `days_before` window. Deploy with:
//
//   supabase functions deploy renewal-reminders
//   supabase secrets set RESEND_API_KEY=... RESEND_FROM="SubTrack <alerts@yourdomain>"
//
// Then schedule it daily via supabase/cron.sql.
//
// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
// Service role is required here to read every user's rows (bypasses RLS).
// This runs server-side only — never ship the service key to the browser.
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const RESEND_FROM = Deno.env.get("RESEND_FROM") ?? "SubTrack <onboarding@resend.dev>";

const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

function fmt(amount: number, currency: string) {
  const sym: Record<string, string> = { THB: "฿", USD: "$", EUR: "€", GBP: "£", JPY: "¥" };
  return `${sym[currency] ?? ""}${amount}${sym[currency] ? "" : " " + currency}`;
}

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: RESEND_FROM, to, subject, html }),
  });
  if (!res.ok) console.error("Resend error", await res.text());
}

Deno.serve(async () => {
  const today = new Date();

  // Users who want email reminders
  const { data: prefs } = await admin
    .from("notification_prefs")
    .select("user_id, days_before, email_on")
    .eq("email_on", true);

  let sent = 0;

  for (const p of prefs ?? []) {
    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() + (p as any).days_before);

    const { data: subs } = await admin
      .from("subscriptions")
      .select("name, amount, currency, next_billing, source")
      .eq("user_id", (p as any).user_id)
      .eq("status", "active")
      .gte("next_billing", today.toISOString().slice(0, 10))
      .lte("next_billing", cutoff.toISOString().slice(0, 10));

    if (!subs || subs.length === 0) continue;

    // Resolve the user's email
    const { data: userRes } = await admin.auth.admin.getUserById((p as any).user_id);
    const email = userRes?.user?.email;
    if (!email) continue;

    const rows = subs
      .map(
        (s: any) =>
          `<tr><td style="padding:6px 12px">${s.name}</td>
           <td style="padding:6px 12px;color:#64748b">${s.next_billing}</td>
           <td style="padding:6px 12px;text-align:right;font-weight:600">${fmt(s.amount, s.currency)}</td></tr>`,
      )
      .join("");

    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:520px">
        <h2 style="color:#4f46e5">Upcoming subscription renewals</h2>
        <p>These renew within the next ${(p as any).days_before} days:</p>
        <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px">${rows}</table>
        <p style="color:#94a3b8;font-size:12px;margin-top:16px">Sent by SubTrack</p>
      </div>`;

    await sendEmail(email, `${subs.length} subscription${subs.length === 1 ? "" : "s"} renewing soon`, html);
    sent++;
  }

  return new Response(JSON.stringify({ ok: true, usersNotified: sent }), {
    headers: { "Content-Type": "application/json" },
  });
});
