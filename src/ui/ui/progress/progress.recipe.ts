import { cva } from "class-variance-authority";

export const progressRecipe = {
  root: cva("flex w-full flex-col gap-1.5"),
  header: cva("flex items-baseline justify-between gap-2 text-sm"),
  label: cva("font-medium text-fg"),
  value: cva("tabular text-fg-muted"),
  track: cva("relative w-full overflow-hidden rounded-pill bg-bg-active", {
    variants: { size: { sm: "h-1", md: "h-2", lg: "h-3" } },
    defaultVariants: { size: "md" },
  }),
  indicator: cva("h-full w-full rounded-pill bg-(--t) transition-transform duration-(--dur) ease-out", {
    variants: { indeterminate: { true: "origin-left animate-indeterminate motion-reduce:w-1/3 motion-reduce:animate-none motion-reduce:translate-x-0", false: "" } },
    defaultVariants: { indeterminate: false },
  }),
};
