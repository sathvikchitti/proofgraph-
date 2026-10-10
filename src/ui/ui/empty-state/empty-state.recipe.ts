import { cva } from "class-variance-authority";

export const emptyStateRecipe = {
  root: cva("flex w-full min-w-0 flex-col items-center justify-center text-center", {
    variants: {
      size: { sm: "gap-1.5 px-4 py-6", md: "gap-2 px-6 py-10", lg: "gap-3 px-8 py-16" },
      bordered: { true: "rounded-card border border-dashed border-border-strong", false: "" },
    },
    defaultVariants: { size: "md", bordered: false },
  }),
  icon: cva("mb-1 flex items-center justify-center rounded-full bg-bg-subtle text-fg-subtle", {
    variants: { size: { sm: "size-9 [&>svg]:size-4", md: "size-12 [&>svg]:size-5", lg: "size-16 [&>svg]:size-7" } },
    defaultVariants: { size: "md" },
  }),
  title: cva("font-semibold text-fg", { variants: { size: { sm: "text-sm", md: "text-base", lg: "text-lg" } }, defaultVariants: { size: "md" } }),
  description: cva("max-w-sm text-sm text-fg-muted"),
  actions: cva("mt-2 flex flex-wrap items-center justify-center gap-2"),
};
