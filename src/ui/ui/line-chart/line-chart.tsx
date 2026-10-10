"use client";
/** LineChart — one or more series over a category/time axis, with optional threshold lines. Deps: react, recharts, lib/*, ui/chart-frame. */
import { CartesianGrid, Line, LineChart as RLineChart, ReferenceLine, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import { toneColor } from "../../lib/tone";
import type { StyleProps, Tone } from "../../lib/types";
import { ChartFrame, ChartTooltip, seriesColorOf, usePrefersReducedMotion, chartFrameRecipe, type ChartFrameProps, type ChartSeries } from "../chart-frame";
import { lineChartRecipe } from "./line-chart.recipe";

export interface ChartThreshold {
  value: number;
  label?: string;
  tone?: Tone;
}

export interface LineChartProps extends StyleProps, Pick<ChartFrameProps, "label" | "height" | "width" | "loading" | "isEmpty" | "emptyLabel" | "error" | "onRetry"> {
  data: Record<string, unknown>[];
  xKey: string;
  series: ChartSeries[];
  curve?: "linear" | "monotone" | "step";
  showGrid?: boolean;
  showDots?: boolean;
  showLegend?: boolean;
  formatX?: (value: string | number) => string;
  formatY?: (value: number | string) => string;
  yDomain?: [number | "auto", number | "auto"];
  /** Horizontal reference lines (e.g. a score cap). */
  thresholds?: ChartThreshold[];
}

export function LineChart({ data, xKey, series, curve = "monotone", showGrid = true, showDots = false, showLegend, formatX, formatY, yDomain, thresholds, className, ...frame }: LineChartProps) {
  const f = useRecipe("chartFrame", chartFrameRecipe);
  const r = useRecipe("lineChart", lineChartRecipe);
  const reduced = usePrefersReducedMotion();
  const legendOn = showLegend ?? series.length > 1;
  return (
    <ChartFrame
      {...frame}
      className={className}
      isEmpty={frame.isEmpty ?? data.length === 0}
      legend={legendOn ? series.map((s, i) => ({ label: s.label ?? s.key, color: seriesColorOf(s, i) })) : undefined}
    >
      <RLineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        {showGrid ? <CartesianGrid vertical={false} className={f.grid()} /> : null}
        <XAxis dataKey={xKey} tickLine={false} axisLine={{ className: f.axisLine() }} tick={{ className: f.tick() }} tickFormatter={formatX} tickMargin={8} minTickGap={16} />
        <YAxis width="auto" tickLine={false} axisLine={false} tick={{ className: f.tick() }} tickFormatter={formatY} domain={yDomain} />
        <Tooltip content={<ChartTooltip formatValue={formatY} formatLabel={formatX} />} cursor={{ className: f.cursor() }} />
        {thresholds?.map((t) => (
          <ReferenceLine key={t.value} y={t.value} className={f.reference()} stroke={t.tone ? toneColor(t.tone) : undefined} label={t.label ? { value: t.label, position: "insideTopRight", className: f.referenceLabel() } : undefined} />
        ))}
        {series.map((s, i) => (
          <Line
            key={s.key}
            type={curve}
            dataKey={s.key}
            name={s.label ?? s.key}
            stroke={seriesColorOf(s, i)}
            className={cn(f.line())}
            dot={showDots ? { className: r.dot(), stroke: seriesColorOf(s, i) } : false}
            activeDot={{ r: 4 }}
            isAnimationActive={!reduced}
          />
        ))}
      </RLineChart>
    </ChartFrame>
  );
}
