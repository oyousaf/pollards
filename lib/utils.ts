export { cn } from "cn";

export const PRACTICE_TIME_ZONE = "Europe/London";

const formatter = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: PRACTICE_TIME_ZONE, ...options });

const dateTimeFmt = formatter({
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
const dateFmt = formatter({ weekday: "long", day: "numeric", month: "long", year: "numeric" });
const timeFmt = formatter({ hour: "2-digit", minute: "2-digit" });

/** Formats a date in the practice's time zone (UK), regardless of server/browser locale. */
export function formatDateTime(value: Date | string) {
  const date = new Date(value);
  return {
    dateTime: dateTimeFmt.format(date),
    dateOnly: dateFmt.format(date),
    timeOnly: timeFmt.format(date),
  };
}

export function initials(name: string) {
  return name
    .replace(/["']/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** "jane.smith@gmail.com" → "ja•••@gmail.com" — confirms where a code went without exposing it. */
export function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  return `${local.slice(0, Math.min(2, local.length))}•••@${domain}`;
}
