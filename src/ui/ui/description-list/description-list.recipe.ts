import { cva } from "class-variance-authority";

export const descriptionListRecipe = {
  root: cva("m-0 min-w-0 text-sm", {
    variants: { divided: { true: "divide-y divide-border", false: "" } },
    defaultVariants: { divided: false },
  }),
  row: cva("grid min-w-0 gap-x-4 gap-y-0.5", {
    variants: {
      layout: {
        horizontal: "grid-cols-1 py-2 sm:grid-cols-[minmax(7rem,11rem)_minmax(0,1fr)]",
        stacked: "grid-cols-1 py-2",
      },
    },
    defaultVariants: { layout: "horizontal" },
  }),
  term: cva("text-fg-muted"),
  hint: cva("block text-xs text-fg-subtle"),
  detail: cva("m-0 flex min-w-0 items-start gap-1.5 text-fg [overflow-wrap:anywhere]"),
  mono: cva("font-mono tabular"),
  link: cva("text-fg-link underline-offset-2 hover:underline focus-ring rounded-chip"),
  empty: cva("text-fg-subtle"),
  copy: cva("-my-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-chip text-fg-subtle transition-colors hover:bg-bg-hover hover:text-fg focus-ring"),
};
