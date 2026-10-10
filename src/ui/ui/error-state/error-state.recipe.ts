import { cva } from "class-variance-authority";

export const errorStateRecipe = {
  root: cva("flex w-full min-w-0 flex-col items-center justify-center text-center", {
    variants: {
      size: { sm: "gap-1.5 px-4 py-6", md: "gap-2 px-6 py-10", lg: "gap-3 px-8 py-16" },
      bordered: { true: "rounded-card border border-danger-border bg-danger-subtle", false: "" },
    },
    defaultVariants: { size: "md", bordered: false },
  }),
  icon: cva("mb-1 flex items-center justify-center rounded-full bg-danger-subtle text-danger-fg", {
    variants: { size: { sm: "size-9 [&>svg]:size-4", md: "size-12 [&>svg]:size-5", lg: "size-16 [&>svg]:size-7" } },
    defaultVariants: { size: "md" },
  }),
  status: cva("tabular font-mono text-xs text-fg-subtle"),
  title: cva("font-semibold text-fg", { variants: { size: { sm: "text-sm", md: "text-base", lg: "text-lg" } }, defaultVariants: { size: "md" } }),
  description: cva("max-w-md text-sm text-fg-muted"),
  detail: cva("mt-1 max-w-md rounded-control bg-bg-subtle px-2 py-1 font-mono text-xs text-fg-muted [overflow-wrap:anywhere]"),
  actions: cva("mt-2 flex flex-wrap items-center justify-center gap-2"),
};
