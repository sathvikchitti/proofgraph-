import { cva } from "class-variance-authority";

export const pageHeaderRecipe = {
  root: cva("flex min-w-0 flex-col gap-3", { variants: { bordered: { true: "border-b border-border pb-0", false: "" } }, defaultVariants: { bordered: false } }),
  top: cva("flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"),
  heading: cva("min-w-0"),
  titleRow: cva("flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1"),
  title: cva("min-w-0 text-2xl font-semibold leading-tight tracking-tight text-fg [overflow-wrap:anywhere]"),
  description: cva("mt-1 max-w-prose text-sm text-fg-muted"),
  actions: cva("flex shrink-0 flex-wrap items-center gap-2"),
  tabs: cva("-mb-px min-w-0"),
};
