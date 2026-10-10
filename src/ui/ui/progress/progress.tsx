"use client";
/** Progress — linear, determinate or indeterminate. Deps: react, radix-ui (Progress), lib/cn, lib/skin, lib/format. */
import { Progress as P } from "radix-ui";
import { cn } from "../../lib/cn";
import { formatPercent } from "../../lib/format";
import { useRecipe } from "../../lib/skin";
import type { ClassNames, Size, StyleProps, Tone } from "../../lib/types";
import { progressRecipe } from "./progress.recipe";

export interface ProgressProps extends StyleProps {
  /** null/undefined = indeterminate. */
  value?: number | null;
  max?: number;
  size?: Size;
  tone?: Tone;
  /** Visible label; also the accessible name. */
  label?: string;
  /** Accessible name when no visible label is shown. */
  "aria-label"?: string;
  showValue?: boolean;
  formatValue?: (value: number, max: number) => string;
  classNames?: ClassNames<"root" | "header" | "label" | "value" | "track" | "indicator">;
}

export function Progress({
  value,
  max = 100,
  size = "md",
  tone,
  label,
  showValue = false,
  formatValue = (v, m) => formatPercent(v / m),
  className,
  classNames,
  "aria-label": ariaLabel,
}: ProgressProps) {
  const r = useRecipe("progress", progressRecipe);
  const indeterminate = value == null;
  const pct = indeterminate ? 0 : Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={cn(r.root(), className, classNames?.root)} data-tone={tone ?? "accent"}>
      {label || (showValue && !indeterminate) ? (
        <div className={cn(r.header(), classNames?.header)}>
          {label ? <span className={cn(r.label(), classNames?.label)}>{label}</span> : <span />}
          {showValue && !indeterminate ? <span className={cn(r.value(), classNames?.value)}>{formatValue(value, max)}</span> : null}
        </div>
      ) : null}
      <P.Root
        value={indeterminate ? null : value}
        max={max}
        aria-label={label ?? ariaLabel ?? "Progress"}
        className={cn(r.track({ size }), classNames?.track)}
      >
        <P.Indicator
          className={cn(r.indicator({ indeterminate }), classNames?.indicator)}
          style={indeterminate ? undefined : { transform: `translateX(-${100 - pct}%)` }}
        />
      </P.Root>
    </div>
  );
}
