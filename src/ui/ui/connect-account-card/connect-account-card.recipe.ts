import { cva } from "class-variance-authority";

export const connectAccountCardRecipe = {
  body: cva("flex flex-col gap-3 sm:flex-row sm:items-center"),
  logo: cva("flex size-10 shrink-0 items-center justify-center rounded-control border border-border bg-bg-subtle text-fg [&>svg]:size-5"),
  info: cva("min-w-0 flex-1"),
  nameRow: cva("flex flex-wrap items-center gap-2"),
  name: cva("font-semibold text-fg"),
  description: cva("mt-0.5 text-sm text-fg-muted"),
  meta: cva("mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-fg-muted"),
  error: cva("mt-2 text-sm text-danger-fg"),
  actions: cva("flex shrink-0 flex-wrap items-center gap-2"),
};
