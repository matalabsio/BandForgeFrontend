/**
 * Stable date/time formatting for SSR + hydration.
 * Do not use `toLocaleString(undefined, …)` — server (Node) and browser locales differ.
 */

/** Primary audience timezone; keeps SSR and client output identical. */
export const APP_TIME_ZONE = "Asia/Kolkata";

const DATE_TIME_FMT = new Intl.DateTimeFormat("en-GB", {
  timeZone: APP_TIME_ZONE,
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const DATE_FMT = new Intl.DateTimeFormat("en-GB", {
  timeZone: APP_TIME_ZONE,
  day: "numeric",
  month: "short",
});

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return DATE_TIME_FMT.format(d);
}

export function formatDateShort(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return DATE_FMT.format(d);
}

/** Hour of day in APP_TIME_ZONE — safe for SSR hydration with timeGreeting(). */
export function appTimeHour(now: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: APP_TIME_ZONE,
    hour: "numeric",
    hour12: false,
  }).formatToParts(now);
  const hour = parts.find((p) => p.type === "hour")?.value;
  return hour ? parseInt(hour, 10) : now.getUTCHours();
}
