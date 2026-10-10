"use client";
/**
 * ScoreBreakdown — parts that must sum to a total: stacked bar plus a list; items can link out.
 * Warns in development if the items do not add up to `total`. Deps: react, lucide-react, lib/*.
 */
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { devWarn } from "../../lib/dev";
import { formatNumber } from "../../lib/format";
import { useRecipe } from "../../lib/skin";
import { seriesColor, toneColor } from "../../lib/tone";
import type { ClassNames, Size, StyleProps, Tone } from "../../lib/types";
import { scoreBreakdownRecipe } from "./score-breakdown.recipe";

export interface ScoreItem {
  label: ReactNode;
  value: number;
  href?: string;
  /** Overrides the series color. */
  tone?: Tone;
}

export interface ScoreBreakdownProps extends StyleProps {
  total: number;
  max?: number;
  items: ScoreItem[];
  title?: ReactNode;
  totalLabel?: string;
  /** Text for the bar's accessible name. */
  barLabel?: string;
  size?: Size;
  /** Build the aria-label of the stacked bar from its parts. */
  describeBar?: (items: ScoreItem[], total: number, max: number) => string;
  classNames?: ClassNames<"root" | "bar" | "list" | "row">;
}

const textOf = (n: ReactNode) => (typeof n === "string" || typeof n === "number" ? String(n) : "item");

export function ScoreBreakdown({
  total,
  max = 100,
  items,
  title,
  totalLabel = "Total",
  barLabel = "Score breakdown",
  size = "md",
  describeBar,
  className,
  classNames,
}: ScoreBreakdownProps) {
  const r = useRecipe("scoreBreakdown", scoreBreakdownRecipe);
  const sum = items.reduce((s, i) => s + i.value, 0);
  devWarn(Math.abs(sum - total) > 1e-6, `ScoreBreakdown: items sum to ${sum} but total is ${total}.`);
  const aria = describeBar ? describeBar(items, total, max) : `${barLabel}: ${items.map((i) => `${textOf(i.label)} ${formatNumber(i.value)}`).join(", ")}; total ${formatNumber(total)} of ${formatNumber(max)}`;

  return (
    <div className={cn(r.root(), className, classNames?.root)}>
      <div className={r.head()}>
        {title ? <span className={r.title()}>{title}</span> : <span />}
        <span className={r.total()}>
          {formatNumber(total)}
          <span className={r.max()}> / {formatNumber(max)}</span>
        </span>
      </div>
      <div role="img" aria-label={aria} className={cn(r.bar({ size }), classNames?.bar)}>
        {items.map((i, idx) =>
          i.value > 0 ? <span key={idx} className={r.segment()} style={{ width: `${(i.value / (max || 1)) * 100}%`, background: i.tone ? toneColor(i.tone) : seriesColor(idx) }} /> : null,
        )}
      </div>
      <ul className={cn(r.list(), classNames?.list)}>
        {items.map((i, idx) => (
          <li key={idx} className={cn(r.row(), classNames?.row)}>
            <span aria-hidden className={r.swatch()} style={{ background: i.tone ? toneColor(i.tone) : seriesColor(idx) }} />
            <span className={r.rowLabel()}>
              {i.href ? (
                <a href={i.href} className={r.link()}>
                  {i.label}
                  <ArrowUpRight className="size-3.5" aria-hidden />
                </a>
              ) : (
                i.label
              )}
            </span>
            <span className={r.rowValue()}>{formatNumber(i.value, { signDisplay: "exceptZero" })}</span>
          </li>
        ))}
      </ul>
      <div className={r.totalRow()}>
        <span>{totalLabel}</span>
        <span className="tabular">
          {formatNumber(total)} / {formatNumber(max)}
        </span>
      </div>
    </div>
  );
}
