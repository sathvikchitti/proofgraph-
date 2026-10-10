"use client";
/** AreaChart — filled series, optionally stacked. Deps: react, recharts, lib/*, ui/chart-frame, ui/line-chart (types). */
import { Area, AreaChart as RAreaChart, CartesianGrid, ReferenceLine, Tooltip, XAxis, YAxis } from "recharts";
import { useRecipe } from "../../lib/skin";
import { toneColor } from "../../lib/tone";
import { ChartFrame, ChartTooltip, seriesColorOf, usePrefersReducedMotion, chartFrameRecipe } from "../chart-frame";
import type { LineChartProps } from "../line-chart";
import { areaChartRecipe } from "./area-chart.recipe";

export interface AreaChartProps extends Omit<LineChartProps, "showDots"> {
  stacked?: boolean;
}

export function AreaChart({ data, xKey, series, curve = "monotone", showGrid = true, showLegend, formatX, formatY, yDomain, thresholds, stacked = false, className, ...frame }: AreaChartProps) {
  const f = useRecipe("chartFrame", chartFrameRecipe);
  const r = useRecipe("areaChart", areaChartRecipe);
  const reduced = usePrefersReducedMotion();
  const legendOn = showLegend ?? series.length > 1;
  return (
    <ChartFrame
      {...frame}
      className={className}
      isEmpty={frame.isEmpty ?? data.length === 0}
      legend={legendOn ? series.map((s, i) => ({ label: s.label ?? s.key, color: seriesColorOf(s, i) })) : undefined}
    >
      <RAreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        {showGrid ? <CartesianGrid vertical={false} className={f.grid()} /> : null}
        <XAxis dataKey={xKey} tickLine={false} axisLine={{ className: f.axisLine() }} tick={{ className: f.tick() }} tickFormatter={formatX} tickMargin={8} minTickGap={16} />
        <YAxis width="auto" tickLine={false} axisLine={false} tick={{ className: f.tick() }} tickFormatter={formatY} domain={yDomain} />
        <Tooltip content={<ChartTooltip formatValue={formatY} formatLabel={formatX} />} cursor={{ className: f.cursor() }} />
        {thresholds?.map((t) => (
          <ReferenceLine key={t.value} y={t.value} className={f.reference()} stroke={t.tone ? toneColor(t.tone) : undefined} label={t.label ? { value: t.label, position: "insideTopRight", className: f.referenceLabel() } : undefined} />
        ))}
        {series.map((s, i) => (
          <Area
            key={s.key}
            type={curve}
            dataKey={s.key}
            name={s.label ?? s.key}
            stackId={stacked ? "stack" : undefined}
            stroke={seriesColorOf(s, i)}
            fill={seriesColorOf(s, i)}
            className={r.area()}
            activeDot={{ r: 4 }}
            isAnimationActive={!reduced}
          />
        ))}
      </RAreaChart>
    </ChartFrame>
  );
}
