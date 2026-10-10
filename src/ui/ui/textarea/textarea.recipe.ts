import { cva } from "class-variance-authority";

export const textareaRecipe = {
  root: cva("flex w-full min-w-0 flex-col gap-1"),
  field: cva(
    "w-full resize-y rounded-(--input-radius) border border-border-strong bg-bg-raised px-(--input-px) py-2 text-fg transition-colors duration-(--dur-fast) placeholder:text-fg-subtle hover:border-fg-subtle focus-ring disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-(color:--danger)",
    {
      variants: {
        size: { sm: "min-h-16 text-sm", md: "min-h-20 text-sm", lg: "min-h-28 text-base" },
        autoResize: { true: "resize-none overflow-y-auto", false: "" },
      },
      defaultVariants: { size: "md", autoResize: false },
    },
  ),
  counter: cva("tabular self-end text-xs text-fg-muted", {
    variants: { over: { true: "text-danger-fg", false: "" } },
    defaultVariants: { over: false },
  }),
};
