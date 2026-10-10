/** Tone vocabulary. The *app* maps its domain statuses to these; the library never does (spec §5). */
export type Tone = "neutral" | "info" | "success" | "warning" | "danger";

export const TONES: readonly Tone[] = ["neutral", "info", "success", "warning", "danger"];

/** Scope attribute value: elements set `data-tone` so recipes can read the --t-* token family. */
export type ToneScope = Tone | "accent";

/** CSS color for a tone, for SVG/chart code that cannot use classes. Reads tokens only. */
export function toneColor(tone: Tone | "accent", part: "solid" | "subtle" | "fg" | "border" = "solid"): string {
  const base = tone === "accent" ? "accent" : tone;
  return part === "solid" ? `var(--${base})` : `var(--${base}-${part})`;
}

/** Categorical series color, 1-based, wrapping after 6. */
export function seriesColor(index: number): string {
  return `var(--series-${(index % 6) + 1})`;
}
