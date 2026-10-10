import { cva } from "class-variance-authority";

export const chartCardRecipe = {
  head: cva("flex flex-wrap items-start justify-between gap-x-4 gap-y-2"),
  titleBlock: cva("min-w-0"),
  title: cva("text-base font-semibold leading-snug text-fg"),
  description: cva("mt-0.5 text-sm text-fg-muted"),
  tools: cva("flex shrink-0 flex-wrap items-center gap-2"),
  toolButton: cva(
    "inline-flex size-8 items-center justify-center rounded-control border border-border text-fg-muted transition-colors hover:bg-bg-hover hover:text-fg focus-ring aria-pressed:border-(color:--accent-border) aria-pressed:bg-accent-subtle aria-pressed:text-accent-fg",
  ),
  body: cva("mt-4 min-w-0"),
  legend: cva("m-0 mt-3 flex list-none flex-wrap items-center gap-x-4 gap-y-1 p-0 text-xs text-fg-muted"),
  legendItem: cva("inline-flex items-center gap-1.5"),
  swatch: cva("size-2.5 shrink-0 rounded-chip"),
  tableWrap: cva("max-h-80 overflow-auto rounded-control border border-border"),
  table: cva("w-full min-w-max border-collapse text-sm"),
  caption: cva("sr-only"),
  th: cva("sticky top-0 border-b border-border bg-bg-subtle px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-fg-muted", {
    variants: { align: { left: "text-left", right: "text-right" } },
    defaultVariants: { align: "left" },
  }),
  td: cva("tabular border-b border-border px-3 py-1.5 last-of-type:border-b-0", {
    variants: { align: { left: "text-left", right: "text-right" } },
    defaultVariants: { align: "left" },
  }),
  footer: cva("mt-4 text-xs text-fg-muted"),
};
