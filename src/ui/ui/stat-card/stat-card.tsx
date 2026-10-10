"use client";
/** StatCard — label, animated value, unit, delta and a sparkline slot, with loading and error states. Deps: react, lucide-react, lib/*, ui/card, ui/animated-number, ui/skeleton. */
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { formatNumber } from "../../lib/format";
import { useRecipe } from "../../lib/skin";
import type { ClassNames, Size, StyleProps, Tone } from "../../lib/types";
import { AnimatedNumber } from "../animated-number";
import { Card, CardBody } from "../card";
import { Skeleton } from "../skeleton";
import { statCardRecipe } from "./stat-card.recipe";

export interface StatCardProps extends StyleProps {
  label: ReactNode;
  value?: number | string;
  /** Formatter for numeric values. */
  format?: (value: number) => string;
  precision?: number;
  unit?: string;
  /** Percent change, e.g. 12.5 for +12.5%. */
  delta?: number;
  deltaLabel?: string;
  /** Which direction is good news; colors the delta. */
  deltaGood?: "up" | "down";
  formatDelta?: (delta: number) => string;
  /** Slot for a Sparkline (step 8) or any small chart. */
  sparkline?: ReactNode;
  icon?: ReactNode;
  hint?: ReactNode;
  loading?: boolean;
  /** Replaces the value with an error message. */
  error?: ReactNode;
  size?: Size;
  variant?: "outline" | "raised" | "sunken";
  loadingLabel?: string;
  classNames?: ClassNames<"root" | "label" | "value" | "delta" | "sparkline">;
}

export function StatCard({
  label,
  value,
  format,
  precision = 0,
  unit,
  delta,
  deltaLabel,
  deltaGood = "up",
  formatDelta = (d) => `${formatNumber(d, { maximumFractionDigits: 1, signDisplay: "exceptZero" })}%`,
  sparkline,
  icon,
  hint,
  loading = false,
  error,
  size = "md",
  variant,
  loadingLabel = "Loading",
  className,
  classNames,
}: StatCardProps) {
  const r = useRecipe("statCard", statCardRecipe);
  const tone: Tone = delta === undefined || delta === 0 ? "neutral" : (delta > 0) === (deltaGood === "up") ? "success" : "danger";
  const DeltaIcon = delta === undefined || delta === 0 ? Minus : delta > 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <Card variant={variant} className={cn(className, classNames?.root)} aria-busy={loading || undefined}>
      <CardBody className={r.root()}>
        <div className={r.head()}>
          <span className={cn(r.label(), classNames?.label)}>{label}</span>
          {icon ? <span className={r.icon()}>{icon}</span> : null}
        </div>
        {loading ? (
          <div className="flex flex-col gap-2 pt-1">
            <Skeleton width="45%" height={size === "lg" ? 36 : 28} label={loadingLabel} />
            <Skeleton width="30%" label="" />
          </div>
        ) : error ? (
          <div role="alert" className={r.error()}>
            {error}
          </div>
        ) : (
          <>
            <div className={r.valueRow()}>
              <span className={cn(r.value({ size }), classNames?.value)}>
                {typeof value === "number" ? <AnimatedNumber value={value} format={format} precision={precision} /> : (value ?? "—")}
              </span>
              {unit ? <span className={r.unit()}>{unit}</span> : null}
            </div>
            <div className={r.foot()}>
              <div className="flex min-w-0 flex-col gap-0.5">
                {delta !== undefined ? (
                  <span data-tone={tone} className={cn(r.delta(), classNames?.delta)}>
                    <DeltaIcon className="size-3.5" aria-hidden />
                    {formatDelta(delta)}
                    {deltaLabel ? <span className={r.deltaLabel()}>{deltaLabel}</span> : null}
                  </span>
                ) : null}
                {hint ? <span className={r.hint()}>{hint}</span> : null}
              </div>
              {sparkline ? <div className={cn(r.sparkline(), classNames?.sparkline)}>{sparkline}</div> : null}
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}
