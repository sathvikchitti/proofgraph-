import { cva } from "class-variance-authority";

export const eventFeedRecipe = {
  root: cva("relative flex min-w-0 flex-col overflow-hidden rounded-(--card-radius) border border-border bg-bg-raised"),
  header: cva("flex items-center justify-between gap-3 border-b border-border px-3 py-2 text-sm"),
  title: cva("min-w-0 truncate font-medium text-fg"),
  status: cva("inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-xs text-fg-muted"),
  count: cva("tabular text-fg-subtle"),
  scroller: cva("scroll-y relative max-h-96 min-h-32 flex-1 focus-ring", {
    variants: { height: { auto: "", fixed: "h-96" } },
    defaultVariants: { height: "auto" },
  }),
  list: cva("m-0 list-none p-0"),
  group: cva("border-b border-border last:border-b-0"),
  groupHeader: cva("sticky top-0 z-10 bg-bg-subtle px-3 py-1 text-xs font-semibold uppercase tracking-wide text-fg-muted"),
  row: cva("flex min-w-0 items-start gap-2 border-b border-border px-3 py-2 text-sm last:border-b-0", {
    variants: { fresh: { true: "animate-fade-in", false: "" } },
    defaultVariants: { fresh: false },
  }),
  rowType: cva("shrink-0 font-mono text-xs text-fg-subtle"),
  rowBody: cva("min-w-0 flex-1 truncate font-mono text-xs text-fg-muted"),
  status_empty: cva("flex min-h-32 flex-col items-center justify-center gap-2 px-4 py-8 text-center text-sm text-fg-muted"),
  jump: cva("absolute bottom-3 left-1/2 z-20 -translate-x-1/2"),
  jumpButton: cva(
    "inline-flex h-8 items-center gap-1.5 rounded-pill bg-accent px-3 text-xs font-medium text-fg-on-accent shadow-float transition-colors hover:bg-accent-hover focus-ring",
  ),
};
