import { cva } from "class-variance-authority";

export const composerRecipe = {
  root: cva(
    "flex border border-border bg-bg-raised transition-shadow duration-(--dur) focus-within:border-transparent focus-within:shadow-[0_0_0_1px_var(--accent-border),0_0_0_4px_var(--accent-subtle)]",
    {
      variants: {
        variant: {
          box: "flex-col gap-2 rounded-card p-2.5",
          inline: "flex-row items-center gap-2 rounded-overlay py-1 pl-3 pr-1",
        },
        disabled: { true: "opacity-60", false: "" },
      },
      defaultVariants: { variant: "box", disabled: false },
    },
  ),
  input: cva(
    "min-h-5 max-h-40 w-full flex-1 resize-none bg-transparent p-0 text-sm text-fg outline-none [field-sizing:content] placeholder:text-fg-subtle disabled:cursor-not-allowed",
  ),
  foot: cva("flex items-center gap-2"),
  spacer: cva("flex-1"),
};
