"use client";
/** Sparkline — tiny trend line (plain SVG: cheap in tables, SSR-safe, no layout measuring). Deps: react, lib/*. */
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { StyleProps, Tone } from "../../lib/types";
import { sparklineRecipe } from "./sparkline.recipe";

export interface SparklineProps extends StyleProps {
  data: number[];
  tone?: Tone;
  /** Fill under the line. */
  area?: boolean;
  /** Dot on the latest value. */
  showLast?: boolean;
  /** Fixed domain; defaults to the data's min/max. */
  min?: number;
  max?: number;
  /** Accessible text, e.g. "Score trend, up 12 points". */
  label?: string;
}

const W = 100;
const H = 30;
const PAD = 2;

export function Sparkline({ data, tone, area = false, showLast = false, min, max, label = "Trend", className }: SparklineProps) {
  const r = useRecipe("sparkline", sparklineRecipe);
  const clean = data.filter((n) => Number.isFinite(n));
  if (clean.length === 0) return <span className={cn(r.root(), className)} role="img" aria-label={label} />;
  const lo = min ?? Math.min(...clean);
  const hi = max ?? Math.max(...clean);
  const span = hi - lo || 1;
  const pts = clean.map((v, i) => [clean.length === 1 ? W / 2 : (i / (clean.length - 1)) * W, PAD + (1 - (v - lo) / span) * (H - PAD * 2)] as const);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");
  const last = pts[pts.length - 1]!;
  return (
    <span data-tone={tone ?? "accent"} className={cn(r.root(), className)} role="img" aria-label={label}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className={r.svg()} aria-hidden>
        {area ? <path d={`${line} L${W} ${H} L0 ${H} Z`} className={r.area()} /> : null}
        <path d={line} className={r.line()} />
      </svg>
      {showLast ? <span aria-hidden className={r.last()} style={{ left: `${(last[0] / W) * 100}%`, top: `${(last[1] / H) * 100}%` }} /> : null}
    </span>
  );
}
