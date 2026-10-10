import { cva } from "class-variance-authority";

export const timelineRecipe = {
  root: cva("m-0 flex list-none flex-col p-0"),
  item: cva("relative grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-3 pb-5 last:pb-0 before:absolute before:bottom-0 before:left-3 before:top-6 before:w-px before:-translate-x-1/2 before:bg-border last:before:hidden"),
  marker: cva("relative z-10 mt-0.5 flex size-6 items-center justify-center", {
    variants: { variant: { dot: "", icon: "rounded-full border border-(color:--t-border) bg-(--t-subtle) text-(color:--t-fg) [&>svg]:size-3.5" } },
    defaultVariants: { variant: "dot" },
  }),
  dot: cva("size-2.5 rounded-full bg-(--t) ring-4 ring-bg"),
  body: cva("min-w-0"),
  head: cva("flex flex-wrap items-baseline gap-x-2 gap-y-0.5"),
  title: cva("font-medium text-fg"),
  time: cva("tabular text-xs text-fg-subtle"),
  description: cva("mt-0.5 text-sm text-fg-muted"),
  skeleton: cva("flex gap-3 pb-5"),
};
