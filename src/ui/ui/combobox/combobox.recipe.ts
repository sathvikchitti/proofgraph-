import { cva } from "class-variance-authority";

export const comboboxRecipe = {
  root: cva("relative w-full min-w-0"),
  trigger: cva(
    "flex w-full min-w-0 items-center justify-between gap-2 rounded-(--input-radius) border border-border-strong bg-bg-raised px-(--input-px) text-left text-fg transition-colors duration-(--dur-fast) hover:border-fg-subtle focus-ring disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-(color:--danger)",
    {
      variants: {
        size: { sm: "h-(--input-height-sm) text-sm", md: "h-(--input-height-md) text-sm", lg: "h-(--input-height-lg) text-base" },
        clearable: { true: "pr-9", false: "" },
      },
      defaultVariants: { size: "md", clearable: false },
    },
  ),
  value: cva("truncate", { variants: { placeholder: { true: "text-fg-subtle", false: "" } }, defaultVariants: { placeholder: false } }),
  icon: cva("size-4 shrink-0 text-fg-subtle"),
  clear: cva("absolute right-7 top-1/2 inline-flex size-5 -translate-y-1/2 items-center justify-center rounded-chip text-fg-subtle hover:bg-bg-hover hover:text-fg focus-ring"),
  content: cva("z-50 w-(--radix-popover-trigger-width) min-w-56 overflow-hidden rounded-overlay bg-bg-raised text-fg shadow-float"),
  searchRow: cva("flex items-center gap-2 border-b border-border px-3"),
  searchIcon: cva("size-4 shrink-0 text-fg-subtle"),
  input: cva("h-10 w-full bg-transparent text-sm outline-none placeholder:text-fg-subtle"),
  list: cva("max-h-64 overflow-y-auto overscroll-contain p-1"),
  group: cva("[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-fg-subtle"),
  item: cva(
    "relative flex cursor-default select-none items-center gap-2 rounded-chip px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:bg-bg-hover",
  ),
  itemText: cva("min-w-0 flex-1"),
  description: cva("block truncate text-xs text-fg-muted"),
  status: cva("flex items-center justify-center gap-2 px-2 py-4 text-sm text-fg-muted"),
};
