"use client";
/**
 * Meter — value within a range, linear or radial, with threshold tones and a cap marker
 * (e.g. a score capped at 70 of 100). Deps: react, lib/cn, lib/skin, lib/format, lib/tone.
 */
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { clamp, formatNumber } from "../../lib/format";
import { useRecipe } from "../../lib/skin";
import type { ClassNames, Size, StyleProps, Tone } from "../../lib/types";
import { meterRecipe } from "./meter.recipe";

export interface MeterThreshold {
  /** Applies from this value upward. */
  at: number;
  tone: Tone;
}

export interface MeterProps extends StyleProps {
  value: number;
  min?: number;
  max?: number;
  variant?: "linear" | "radial";
  size?: Size;
  /** Tone steps; the highest `at` not above the value wins. */
  thresholds?: MeterThreshold[];
  /** Fixed tone (wins over thresholds). */
  tone?: Tone;
  /** Marker for a ceiling on the value. */
  cap?: number;
  capLabel?: string;
  label?: ReactNode;
  showValue?: boolean;
  formatValue?: (value: number, max: number) => string;
  /** Small suffix in the radial center (e.g. "/ 100"). */
  unit?: string;
  "aria-label"?: string;
  classNames?: ClassNames<"root" | "track" | "fill" | "cap" | "label" | "value">;
}

const polar = (r: number, deg: number) => [50 + r * Math.cos((deg * Math.PI) / 180), 50 + r * Math.sin((deg * Math.PI) / 180)] as const;

export function Meter({
  value,
  min = 0,
  max = 100,
  variant = "linear",
  size = "md",
  thresholds,
  tone,
  cap,
  capLabel,
  label,
  showValue = true,
  formatValue = (v, m) => `${formatNumber(v)} / ${formatNumber(m)}`,
  unit,
  className,
  classNames,
  "aria-label": ariaLabel,
}: MeterProps) {
  const r = useRecipe("meter", meterRecipe);
  const span = max - min || 1;
  const pct = clamp(((value - min) / span) * 100, 0, 100);
  const capPct = cap === undefined ? undefined : clamp(((cap - min) / span) * 100, 0, 100);
  const resolved =
    tone ?? [...(thresholds ?? [])].sort((a, b) => a.at - b.at).reduce<Tone | undefined>((acc, t) => (value >= t.at ? t.tone : acc), undefined);
  const text = formatValue(value, max);
  const name = ariaLabel ?? (typeof label === "string" ? label : "Meter");
  const aria = { role: "meter", "aria-valuemin": min, "aria-valuemax": max, "aria-valuenow": value, "aria-valuetext": cap !== undefined ? `${text} (cap ${formatNumber(cap)})` : text, "aria-label": name } as const;
  const capText = capLabel ?? (cap !== undefined ? `Cap ${formatNumber(cap)}` : "");

  if (variant === "radial") {
    const R = 42;
    const capAngle = capPct === undefined ? 0 : (capPct / 100) * 360; // the svg itself is rotated -90deg, so 0deg here = top
    const [x1, y1] = polar(R - 9, capAngle);
    const [x2, y2] = polar(R + 9, capAngle);
    return (
      <div className={cn("inline-flex flex-col items-center gap-1.5", className, classNames?.root)} data-tone={resolved ?? "accent"}>
        <div {...aria} className={r.radialRoot({ size })}>
          <svg viewBox="0 0 100 100" className={r.radialSvg()} aria-hidden>
            <circle cx="50" cy="50" r={R} className={cn(r.radialTrack(), classNames?.track)} />
            <circle cx="50" cy="50" r={R} pathLength={100} strokeDasharray={`${pct} 100`} className={cn(r.radialArc(), classNames?.fill)} />
            {capPct !== undefined ? <line x1={x1} y1={y1} x2={x2} y2={y2} className={cn(r.radialCap(), classNames?.cap)} /> : null}
          </svg>
          {showValue ? (
            <div className={cn(r.radialCenter({ size }), classNames?.value)} aria-hidden>
              {formatNumber(value)}
              {unit ? <span className={r.radialUnit()}>{unit}</span> : null}
            </div>
          ) : null}
        </div>
        {label ? <div className={cn(r.radialLabel(), classNames?.label)}>{label}</div> : null}
      </div>
    );
  }

  return (
    <div className={cn(r.root(), className, classNames?.root)} data-tone={resolved ?? "accent"}>
      {label || showValue ? (
        <div className={r.header()}>
          <span className={cn(r.label(), classNames?.label)}>{label}</span>
          {showValue ? <span className={cn(r.value(), classNames?.value)}>{text}</span> : null}
        </div>
      ) : null}
      <div {...aria} className={cn(r.track({ size }), capPct !== undefined && capText ? "mb-5" : "", classNames?.track)}>
        <div className={r.trackBg()}>
          <div className={cn(r.fill(), classNames?.fill)} style={{ width: `${pct}%` }} />
        </div>
        {capPct !== undefined ? (
          <>
            <span className={cn(r.cap(), classNames?.cap)} style={{ left: `${capPct}%` }} />
            {capText ? (
              <span className={r.capLabel()} style={{ left: `${capPct}%` }}>
                {capText}
              </span>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
