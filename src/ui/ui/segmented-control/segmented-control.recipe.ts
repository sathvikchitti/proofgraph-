import { cva } from "class-variance-authority";

export const segmentedControlRecipe = {
  root: cva("inline-flex max-w-full items-center gap-0.5 rounded-control border border-border bg-bg-subtle p-0.5", {
    variants: { fullWidth: { true: "flex w-full", false: "" } },
    defaultVariants: { fullWidth: false },
  }),
  item: cva(
    "inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-chip font-medium text-fg-muted transition-colors duration-(--dur-fast) hover:text-fg focus-ring disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-bg-raised data-[state=on]:text-fg data-[state=on]:shadow-[0_0_0_1px_var(--border-strong)]",
    {
      variants: {
        size: {
          sm: "h-6 px-2 text-xs",
          md: "h-8 px-3 text-sm",
          lg: "h-10 px-4 text-base",
        },
      },
      defaultVariants: { size: "md" },
    },
  ),
};
