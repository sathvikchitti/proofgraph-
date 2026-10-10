/** Formatting helpers. Pure functions, no dependencies. */

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function formatNumber(n: number, options?: Intl.NumberFormatOptions, locale?: string): string {
  return new Intl.NumberFormat(locale, options).format(n);
}

export function formatCompact(n: number, locale?: string): string {
  return new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

/** `ratio` is 0–1 unless `isPercent` is true (then 0–100). */
export function formatPercent(value: number, opts: { digits?: number; isPercent?: boolean; locale?: string } = {}): string {
  const { digits = 0, isPercent = false, locale } = opts;
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(isPercent ? value / 100 : value);
}

export function formatBytes(bytes: number, digits = 1): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${i === 0 ? v : v.toFixed(digits)} ${units[i]}`;
}

/** 83_000 → "1:23"; 3_725_000 → "1:02:05". */
export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export function formatDate(
  value: Date | string | number,
  options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" },
  locale?: string,
): string {
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : new Intl.DateTimeFormat(locale, options).format(d);
}

export function formatRelativeTime(value: Date | string | number, now: Date | number = Date.now(), locale?: string): string {
  const d = value instanceof Date ? value : new Date(value);
  const diffSec = Math.round((d.getTime() - (typeof now === "number" ? now : now.getTime())) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, secs] of steps) {
    if (Math.abs(diffSec) >= secs) return rtf.format(Math.round(diffSec / secs), unit);
  }
  return rtf.format(diffSec, "second");
}

export function initials(name: string, max = 2): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  const letters = parts.length === 1 ? [...(parts[0] ?? "")].slice(0, max) : parts.map((p) => [...p][0] ?? "");
  return letters.slice(0, max).join("").toUpperCase();
}

export function truncateMiddle(text: string, max = 24): string {
  if (text.length <= max) return text;
  const keep = Math.max(1, Math.floor((max - 1) / 2));
  return `${text.slice(0, keep)}…${text.slice(text.length - keep)}`;
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
