/**
 * Browser (Web Notifications) helpers + a small "already notified" ledger so a
 * given renewal only pops a desktop notification once per day.
 */

const LEDGER_KEY = "submanage.notified.v1";

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function notificationPermission(): NotificationPermission {
  return notificationsSupported() ? Notification.permission : "denied";
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return "denied";
  return Notification.requestPermission();
}

function ledger(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(LEDGER_KEY) ?? "{}");
  } catch {
    return {};
  }
}

/** Notify once per subscription per calendar day. Returns true if it fired. */
export function notifyRenewal(id: string, title: string, body: string): boolean {
  if (notificationPermission() !== "granted") return false;
  const today = new Date().toISOString().slice(0, 10);
  const seen = ledger();
  if (seen[id] === today) return false;
  new Notification(title, { body, icon: "/favicon.svg", tag: `renewal-${id}` });
  seen[id] = today;
  localStorage.setItem(LEDGER_KEY, JSON.stringify(seen));
  return true;
}
