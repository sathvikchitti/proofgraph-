import { cva } from "class-variance-authority";

export const kbdRecipe = {
  kbd: cva("inline-flex items-center justify-center rounded-chip border border-border-strong bg-bg-subtle font-mono font-medium text-fg-muted", {
    variants: { size: { sm: "h-5 min-w-5 px-1 text-[0.6875rem]", md: "h-6 min-w-6 px-1.5 text-xs", lg: "h-7 min-w-7 px-2 text-sm" } },
    defaultVariants: { size: "md" },
  }),
  group: cva("inline-flex items-center gap-1"),
};
