import { cva } from "class-variance-authority";

export const statCardRecipe = {
  root: cva("flex min-w-0 flex-col gap-2", {
    variants: { interactive: { true: "", false: "" } },
    defaultVariants: { interactive: false },
  }),
  head: cva("flex items-center justify-between gap-2 text-sm text-fg-muted"),
  label: cva("truncate font-medium"),
  icon: cva("shrink-0 text-fg-subtle [&>svg]:size-4"),
  valueRow: cva("flex items-baseline gap-1.5"),
  value: cva("tabular font-semibold leading-none tracking-tight text-fg", { variants: { size: { sm: "text-xl", md: "text-3xl", lg: "text-4xl" } }, defaultVariants: { size: "md" } }),
  unit: cva("text-sm font-medium text-fg-muted"),
  foot: cva("flex items-end justify-between gap-3"),
  delta: cva("tabular inline-flex items-center gap-1 text-xs font-medium text-(color:--t-fg)"),
  deltaLabel: cva("font-normal text-fg-muted"),
  hint: cva("text-xs text-fg-muted"),
  sparkline: cva("ml-auto h-8 w-24 shrink-0"),
  error: cva("text-sm text-danger-fg"),
};
