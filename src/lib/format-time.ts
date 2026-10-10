const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [["day", 86_400_000], ["hour", 3_600_000], ["minute", 60_000]];

/** "8 minutes ago", "yesterday". Falls back to the date for anything older than a week. */
export function timeAgo(iso: string, now = Date.now()): string {
  const diff = new Date(iso).getTime() - now;
  if (Number.isNaN(diff)) return "";
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (Math.abs(diff) < 60_000) return "just now";
  if (Math.abs(diff) > 7 * 86_400_000) return new Date(iso).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" });
  for (const [unit, ms] of UNITS) if (Math.abs(diff) >= ms) return rtf.format(Math.round(diff / ms), unit);
  return "";
}
