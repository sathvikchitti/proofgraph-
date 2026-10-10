import { cva } from "class-variance-authority";

export const valueChangeRecipe = {
  root: cva("tabular inline-flex items-center gap-1.5 whitespace-nowrap", { variants: { size: { sm: "text-xs", md: "text-sm", lg: "text-base" } }, defaultVariants: { size: "md" } }),
  from: cva("text-fg-muted line-through decoration-fg-subtle/60"),
  arrow: cva("size-3.5 shrink-0 text-fg-subtle"),
  to: cva("font-medium text-(color:--t-fg)"),
  delta: cva("rounded-pill bg-(--t-subtle) px-1.5 text-xs font-medium text-(color:--t-fg)"),
};
