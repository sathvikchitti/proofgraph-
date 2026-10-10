import { cva } from "class-variance-authority";

export const meterRecipe = {
  root: cva("flex min-w-0 flex-col gap-1.5"),
  header: cva("flex items-baseline justify-between gap-2 text-sm"),
  label: cva("font-medium text-fg"),
  value: cva("tabular text-fg-muted"),
  track: cva("relative w-full", {
    variants: { size: { sm: "h-(--meter-linear-height-sm)", md: "h-(--meter-linear-height-md)", lg: "h-(--meter-linear-height-lg)" } },
    defaultVariants: { size: "md" },
  }),
  trackBg: cva("absolute inset-0 overflow-hidden rounded-pill bg-bg-active"),
  fill: cva("h-full rounded-pill bg-(--t) transition-[width] duration-(--dur) ease-out"),
  cap: cva("absolute -bottom-1 -top-1 w-0.5 -translate-x-1/2 rounded-pill bg-fg"),
  capLabel: cva("absolute top-full mt-1.5 -translate-x-1/2 whitespace-nowrap text-xs text-fg-muted"),
  radialRoot: cva("relative inline-flex shrink-0 items-center justify-center", {
    variants: { size: { sm: "size-16", md: "size-24", lg: "size-32" } },
    defaultVariants: { size: "md" },
  }),
  radialSvg: cva("size-full -rotate-90 overflow-visible"),
  radialTrack: cva("fill-none stroke-bg-active [stroke-width:var(--meter-radial-stroke)]"),
  radialArc: cva("fill-none stroke-(--t) [stroke-linecap:round] [stroke-width:var(--meter-radial-stroke)] transition-[stroke-dasharray] duration-(--dur)"),
  radialCap: cva("stroke-fg [stroke-linecap:round] [stroke-width:2.5]"),
  radialCenter: cva("tabular absolute inset-0 flex flex-col items-center justify-center font-semibold leading-none text-fg", {
    variants: { size: { sm: "text-sm", md: "text-xl", lg: "text-3xl" } },
    defaultVariants: { size: "md" },
  }),
  radialUnit: cva("mt-0.5 text-[0.625em] font-normal text-fg-muted"),
  radialLabel: cva("text-sm font-medium text-fg"),
};
