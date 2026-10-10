"use client";
/**
 * ChartFrame + helpers shared by LineChart, AreaChart, BarChart and Donut: accessible figure, loading /
 * empty / error states, HTML legend, token-styled tooltip, and a viewport that is responsive (or fixed-size
 * for tests and print). Colors come from --series-* / tone tokens via `var()`.
 * Deps: react, recharts (ResponsiveContainer), lib/*, hooks/use-media-query, ui/skeleton, ui/empty-state, ui/error-state.
 */
import { cloneElement, type ReactElement, type ReactNode } from "react";
import { ResponsiveContainer } from "recharts";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import { seriesColor, toneColor } from "../../lib/tone";
import type { ClassNames, StyleProps, Tone } from "../../lib/types";
import { useMediaQuery } from "../../hooks/use-media-query";
import { EmptyState } from "../empty-state";
import { ErrorState } from "../error-state";
import { Skeleton } from "../skeleton";
import { chartFrameRecipe } from "./chart-frame.recipe";

export interface ChartSeries {
  /** Data key for this series. */
  key: string;
  label?: string;
  /** Color by tone; otherwise the next --series-N color. */
  tone?: Tone;
}

export const seriesColorOf = (s: ChartSeries, index: number) => (s.tone ? toneColor(s.tone) : seriesColor(index));

export function usePrefersReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

export interface ChartFrameProps extends StyleProps {
  /** Accessible summary of what the chart shows. */
  label: string;
  /** The recharts chart element (without width/height). */
  children: ReactElement;
  height?: number;
  /** Fixed width in px; omitted = fills the container. */
  width?: number;
  loading?: boolean;
  isEmpty?: boolean;
  emptyLabel?: ReactNode;
  error?: unknown;
  onRetry?: () => void;
  legend?: { label: string; color: string }[];
  /** Centered over the chart (e.g. a Donut total). Decorative: the figure's `label` must carry its meaning. */
  overlay?: ReactNode;
  loadingLabel?: string;
  classNames?: ClassNames<"root" | "viewport" | "legend">;
}

export function ChartFrame({ label, children, height = 240, width, loading = false, isEmpty = false, emptyLabel = "No data for this period.", error, onRetry, legend, overlay, loadingLabel = "Loading chart", className, classNames }: ChartFrameProps) {
  const r = useRecipe("chartFrame", chartFrameRecipe);
  let body: ReactNode;
  if (error !== undefined && error !== null) {
    body = (
      <div className={r.state()} style={{ minHeight: height }}>
        <ErrorState size="sm" error={error} onRetry={onRetry} title="Could not load chart" />
      </div>
    );
  } else if (loading) {
    body = (
      <div style={{ height }}>
        <Skeleton shape="rect" height="100%" label={loadingLabel} />
      </div>
    );
  } else if (isEmpty) {
    body = (
      <div className={r.state()} style={{ minHeight: height }}>
        <EmptyState size="sm" title={emptyLabel} />
      </div>
    );
  } else {
    body = (
      <div role="img" aria-label={label} className={cn(r.viewport(), classNames?.viewport)} style={{ height }}>
        {width ? cloneElement(children, { width, height } as object) : (
          <ResponsiveContainer width="100%" height="100%" debounce={50}>
            {children}
          </ResponsiveContainer>
        )}
        {overlay ? <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-center">{overlay}</div> : null}
      </div>
    );
  }
  return (
    <figure className={cn(r.root(), className, classNames?.root)} aria-busy={loading || undefined}>
      <figcaption className="sr-only">{label}</figcaption>
      {body}
      {legend && legend.length > 0 && !loading && !isEmpty ? (
        <ul className={cn(r.legend(), classNames?.legend)} aria-label="Legend">
          {legend.map((l) => (
            <li key={l.label} className={r.legendItem()}>
              <span aria-hidden className={r.swatch()} style={{ background: l.color }} />
              {l.label}
            </li>
          ))}
        </ul>
      ) : null}
    </figure>
  );
}

interface TooltipPayload {
  name?: string | number;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
  payload?: Record<string, unknown>;
}

/** Pass as `<Tooltip content={<ChartTooltip formatValue={…} />} />`. */
export function ChartTooltip({ active, payload, label, formatValue, formatLabel }: { active?: boolean; payload?: TooltipPayload[]; label?: string | number; formatValue?: (v: number | string) => string; formatLabel?: (l: string | number) => string }) {
  const r = useRecipe("chartFrame", chartFrameRecipe);
  if (!active || !payload?.length) return null;
  const title = label !== undefined ? (formatLabel ? formatLabel(label) : String(label)) : undefined;
  return (
    <div className={r.tooltip()}>
      {title ? <div className={r.tooltipTitle()}>{title}</div> : null}
      {payload.map((p, i) => (
        <div key={`${p.dataKey ?? p.name}-${i}`} className={r.tooltipRow()}>
          <span className={r.tooltipName()}>
            <span aria-hidden className={r.swatch()} style={{ background: p.color }} />
            {p.name}
          </span>
          <span className={r.tooltipValue()}>{p.value === undefined ? "—" : formatValue ? formatValue(p.value) : String(p.value)}</span>
        </div>
      ))}
    </div>
  );
}
