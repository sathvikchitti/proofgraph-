import { cva } from "class-variance-authority";

export const scoreBreakdownRecipe = {
  root: cva("flex min-w-0 flex-col gap-3"),
  head: cva("flex items-baseline justify-between gap-2"),
  title: cva("text-sm font-medium text-fg-muted"),
  total: cva("tabular text-2xl font-semibold tracking-tight text-fg"),
  max: cva("text-sm font-normal text-fg-muted"),
  bar: cva("flex w-full gap-px overflow-hidden rounded-pill bg-bg-active", {
    variants: { size: { sm: "h-2", md: "h-3", lg: "h-4" } },
    defaultVariants: { size: "md" },
  }),
  segment: cva("h-full min-w-px first:rounded-l-pill last:rounded-r-pill"),
  list: cva("flex flex-col divide-y divide-border"),
  row: cva("flex items-center gap-2.5 py-2 text-sm"),
  swatch: cva("size-2.5 shrink-0 rounded-chip"),
  rowLabel: cva("min-w-0 flex-1 truncate text-fg"),
  link: cva("inline-flex items-center gap-1 rounded-chip text-fg-link underline-offset-2 hover:underline focus-ring"),
  rowValue: cva("tabular shrink-0 font-medium text-fg"),
  totalRow: cva("flex items-center justify-between gap-2 border-t border-border-strong pt-2 text-sm font-semibold"),
};
