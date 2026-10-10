"use client";
/** ValueChange — "from → to" with a tone. Numbers pick a tone from the direction. Deps: react, lucide-react, lib/*. */
import { ArrowRight } from "lucide-react";
import { cn } from "../../lib/cn";
import { formatNumber } from "../../lib/format";
import { useRecipe } from "../../lib/skin";
import type { Size, StyleProps, Tone } from "../../lib/types";
import { valueChangeRecipe } from "./value-change.recipe";

export interface ValueChangeProps extends StyleProps {
  from: number | string;
  to: number | string;
  format?: (value: number | string) => string;
  /** Overrides the automatic tone. */
  tone?: Tone;
  /** Which direction is an improvement (numbers only). */
  goodDirection?: "up" | "down";
  /** Show "+15" next to the values. */
  showDelta?: boolean;
  size?: Size;
  /** Screen-reader sentence. */
  describe?: (from: string, to: string) => string;
}

export function ValueChange({
  from,
  to,
  format = (v) => (typeof v === "number" ? formatNumber(v) : v),
  tone,
  goodDirection = "up",
  showDelta = false,
  size = "md",
  describe = (f, t) => `changed from ${f} to ${t}`,
  className,
}: ValueChangeProps) {
  const r = useRecipe("valueChange", valueChangeRecipe);
  const numeric = typeof from === "number" && typeof to === "number";
  const diff = numeric ? to - from : 0;
  const resolved: Tone = tone ?? (!numeric || diff === 0 ? "neutral" : (diff > 0) === (goodDirection === "up") ? "success" : "danger");
  const f = format(from);
  const t = format(to);
  return (
    <span data-tone={resolved} className={cn(r.root({ size }), className)}>
      <span className="sr-only">{describe(f, t)}</span>
      <span aria-hidden className={r.from()}>
        {f}
      </span>
      <ArrowRight aria-hidden className={r.arrow()} />
      <span aria-hidden className={r.to()}>
        {t}
      </span>
      {showDelta && numeric ? (
        <span aria-hidden className={r.delta()}>
          {diff > 0 ? "+" : ""}
          {formatNumber(diff)}
        </span>
      ) : null}
    </span>
  );
}
