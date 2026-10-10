import { cva } from "class-variance-authority";

export const inputRecipe = {
  root: cva(
    "flex w-full min-w-0 items-center gap-2 rounded-(--input-radius) border px-(--input-px) text-fg transition-colors duration-(--dur-fast) focus-ring-within data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-60 data-[invalid=true]:border-(color:--danger)",
    {
      variants: {
        variant: {
          outline: "border-border-strong bg-bg-raised hover:border-fg-subtle",
          filled: "border-transparent bg-bg-subtle hover:bg-bg-hover",
        },
        size: { sm: "h-(--input-height-sm) text-sm", md: "h-(--input-height-md) text-sm", lg: "h-(--input-height-lg) text-base" },
      },
      defaultVariants: { variant: "outline", size: "md" },
    },
  ),
  input: cva("min-w-0 flex-1 bg-transparent outline-none placeholder:text-fg-subtle disabled:cursor-not-allowed read-only:text-fg-muted"),
  affix: cva("flex shrink-0 items-center text-fg-subtle"),
};
