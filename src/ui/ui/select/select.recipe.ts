import { cva } from "class-variance-authority";

export const selectRecipe = {
  trigger: cva(
    "flex w-full min-w-0 items-center justify-between gap-2 rounded-(--input-radius) border border-border-strong bg-bg-raised px-(--input-px) text-left text-fg transition-colors duration-(--dur-fast) hover:border-fg-subtle focus-ring disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-(color:--danger) data-[placeholder]:text-fg-subtle",
    {
      variants: { size: { sm: "h-(--input-height-sm) text-sm", md: "h-(--input-height-md) text-sm", lg: "h-(--input-height-lg) text-base" } },
      defaultVariants: { size: "md" },
    },
  ),
  value: cva("truncate"),
  icon: cva("size-4 shrink-0 text-fg-subtle"),
  content: cva(
    "z-50 max-h-(--radix-select-content-available-height) min-w-(--radix-select-trigger-width) overflow-hidden rounded-overlay bg-bg-raised text-fg shadow-float",
  ),
  viewport: cva("p-1"),
  label: cva("px-2 py-1 text-xs font-semibold uppercase tracking-wide text-fg-subtle"),
  item: cva(
    "relative flex cursor-default select-none items-center gap-2 rounded-chip py-1.5 pl-2 pr-8 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-bg-hover data-[state=checked]:font-medium",
  ),
  indicator: cva("absolute right-2 inline-flex"),
  separator: cva("-mx-1 my-1 h-px bg-border"),
  empty: cva("px-2 py-3 text-center text-sm text-fg-muted"),
};
