import { cva } from "class-variance-authority";

/** Shared look for every Cartesian/polar chart: frame, legend, tooltip, axes, grid. */
export const chartFrameRecipe = {
  root: cva("m-0 flex min-w-0 flex-col gap-3"),
  viewport: cva("relative min-w-0 w-full [&_.recharts-surface]:overflow-visible"),
  state: cva("flex items-center justify-center rounded-control"),
  legend: cva("m-0 flex list-none flex-wrap items-center gap-x-4 gap-y-1 p-0 text-xs text-fg-muted"),
  legendItem: cva("inline-flex items-center gap-1.5"),
  swatch: cva("size-2.5 shrink-0 rounded-chip"),
  tooltip: cva("min-w-32 rounded-control bg-bg-raised px-3 py-2 text-xs text-fg shadow-float"),
  tooltipTitle: cva("mb-1 font-medium text-fg"),
  tooltipRow: cva("flex items-center justify-between gap-4 py-0.5"),
  tooltipName: cva("inline-flex items-center gap-1.5 text-fg-muted"),
  tooltipValue: cva("tabular font-medium text-fg"),
  grid: cva("stroke-border [stroke-dasharray:var(--chart-grid-dash)]"),
  axisLine: cva("stroke-border-strong"),
  tick: cva("fill-fg-muted text-xs tabular"),
  line: cva("[stroke-width:var(--chart-line-width)]"),
  area: cva("[fill-opacity:var(--chart-area-opacity)] [stroke-width:var(--chart-line-width)]"),
  cursor: cva("stroke-border-strong"),
  barCursor: cva("fill-bg-hover"),
  reference: cva("stroke-fg-subtle [stroke-dasharray:var(--chart-grid-dash)]"),
  referenceLabel: cva("fill-fg-muted text-xs"),
};
