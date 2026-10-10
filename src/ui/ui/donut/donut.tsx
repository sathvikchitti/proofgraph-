"use client";
/** Donut (composition) and RadialProgress (single ring, a Meter). Deps: react, recharts, lib/*, ui/chart-frame, ui/meter. */
import type { ReactNode } from "react";
import { Cell, Pie, PieChart, Tooltip } from "recharts";
import { useRecipe } from "../../lib/skin";
import { seriesColor, toneColor } from "../../lib/tone";
import type { Tone } from "../../lib/types";
import { ChartFrame, ChartTooltip, usePrefersReducedMotion, type ChartFrameProps } from "../chart-frame";
import { Meter, type MeterProps } from "../meter";
import { donutRecipe } from "./donut.recipe";

export interface DonutDatum {
  name: string;
  value: number;
  tone?: Tone;
}

export interface DonutProps extends Pick<ChartFrameProps, "label" | "width" | "loading" | "isEmpty" | "emptyLabel" | "error" | "onRetry" | "className"> {
  data: DonutDatum[];
  /** Square size in px. */
  size?: number;
  /** Ring thickness as a fraction of the radius (0.3–0.8). */
  thickness?: number;
  centerValue?: ReactNode;
  centerCaption?: ReactNode;
  showLegend?: boolean;
  formatValue?: (v: number | string) => string;
}

export function Donut({ data, size = 200, thickness = 0.4, centerValue, centerCaption, showLegend = true, formatValue, label, ...frame }: DonutProps) {
  const r = useRecipe("donut", donutRecipe);
  const reduced = usePrefersReducedMotion();
  const colorOf = (d: DonutDatum, i: number) => (d.tone ? toneColor(d.tone) : seriesColor(i));
  const inner = `${Math.round((1 - thickness) * 100)}%`;
  return (
    <ChartFrame
      {...frame}
      label={label}
      height={size}
      isEmpty={frame.isEmpty ?? data.every((d) => d.value === 0)}
      legend={showLegend ? data.map((d, i) => ({ label: d.name, color: colorOf(d, i) })) : undefined}
      overlay={
        centerValue !== undefined || centerCaption !== undefined ? (
          <div className={r.center()}>
            {centerValue !== undefined ? <span className={r.value()}>{centerValue}</span> : null}
            {centerCaption ? <span className={r.caption()}>{centerCaption}</span> : null}
          </div>
        ) : undefined
      }
    >
      <PieChart>
        <Tooltip content={<ChartTooltip formatValue={formatValue} />} />
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={inner} outerRadius="96%" paddingAngle={data.length > 1 ? 2 : 0} startAngle={90} endAngle={-270} isAnimationActive={!reduced}>
          {data.map((d, i) => (
            <Cell key={d.name} fill={colorOf(d, i)} className={r.slice()} />
          ))}
        </Pie>
      </PieChart>
    </ChartFrame>
  );
}

/** A single value on a ring (quotas, readiness). Same element as Meter's radial variant. */
export function RadialProgress(props: Omit<MeterProps, "variant">) {
  return <Meter {...props} variant="radial" />;
}
