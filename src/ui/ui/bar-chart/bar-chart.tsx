"use client";
/** BarChart — grouped or stacked, vertical or horizontal bars. Deps: react, recharts, lib/*, ui/chart-frame, ui/line-chart (types). */
import { Bar, BarChart as RBarChart, CartesianGrid, ReferenceLine, Tooltip, XAxis, YAxis } from "recharts";
import { useRecipe } from "../../lib/skin";
import { toneColor } from "../../lib/tone";
import { ChartFrame, ChartTooltip, seriesColorOf, usePrefersReducedMotion, chartFrameRecipe } from "../chart-frame";
import type { LineChartProps } from "../line-chart";
import { barChartRecipe } from "./bar-chart.recipe";

export interface BarChartProps extends Omit<LineChartProps, "curve" | "showDots"> {
  stacked?: boolean;
  /** "horizontal" draws bars left-to-right with categories on the vertical axis. */
  orientation?: "vertical" | "horizontal";
  /** Width of the category axis labels when horizontal. */
  categoryWidth?: number;
}

export function BarChart({ data, xKey, series, showGrid = true, showLegend, formatX, formatY, yDomain, thresholds, stacked = false, orientation = "vertical", categoryWidth = 96, className, ...frame }: BarChartProps) {
  const f = useRecipe("chartFrame", chartFrameRecipe);
  const r = useRecipe("barChart", barChartRecipe);
  const reduced = usePrefersReducedMotion();
  const horizontal = orientation === "horizontal";
  const legendOn = showLegend ?? series.length > 1;
  const category = horizontal ? (
    <YAxis type="category" dataKey={xKey} width={categoryWidth} tickLine={false} axisLine={{ className: f.axisLine() }} tick={{ className: f.tick() }} tickFormatter={formatX} />
  ) : (
    <XAxis dataKey={xKey} tickLine={false} axisLine={{ className: f.axisLine() }} tick={{ className: f.tick() }} tickFormatter={formatX} tickMargin={8} minTickGap={8} />
  );
  const value = horizontal ? (
    <XAxis type="number" tickLine={false} axisLine={false} tick={{ className: f.tick() }} tickFormatter={formatY} domain={yDomain} />
  ) : (
    <YAxis width="auto" tickLine={false} axisLine={false} tick={{ className: f.tick() }} tickFormatter={formatY} domain={yDomain} />
  );
  return (
    <ChartFrame
      {...frame}
      className={className}
      isEmpty={frame.isEmpty ?? data.length === 0}
      legend={legendOn ? series.map((s, i) => ({ label: s.label ?? s.key, color: seriesColorOf(s, i) })) : undefined}
    >
      <RBarChart data={data} layout={horizontal ? "vertical" : "horizontal"} margin={{ top: 8, right: 12, bottom: 0, left: 0 }} barCategoryGap="22%">
        {showGrid ? <CartesianGrid vertical={horizontal} horizontal={!horizontal} className={f.grid()} /> : null}
        {category}
        {value}
        <Tooltip content={<ChartTooltip formatValue={formatY} formatLabel={formatX} />} cursor={{ className: f.barCursor() }} />
        {thresholds?.map((t) =>
          horizontal ? (
            <ReferenceLine key={t.value} x={t.value} className={f.reference()} stroke={t.tone ? toneColor(t.tone) : undefined} />
          ) : (
            <ReferenceLine key={t.value} y={t.value} className={f.reference()} stroke={t.tone ? toneColor(t.tone) : undefined} label={t.label ? { value: t.label, position: "insideTopRight", className: f.referenceLabel() } : undefined} />
          ),
        )}
        {series.map((s, i) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.label ?? s.key}
            stackId={stacked ? "stack" : undefined}
            fill={seriesColorOf(s, i)}
            className={r.bar()}
            radius={stacked ? 0 : horizontal ? [0, 3, 3, 0] : [3, 3, 0, 0]}
            isAnimationActive={!reduced}
          />
        ))}
      </RBarChart>
    </ChartFrame>
  );
}
