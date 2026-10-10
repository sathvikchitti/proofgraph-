import { cva } from "class-variance-authority";

export const checkboxRecipe = {
  root: cva("group inline-flex items-start gap-2.5 text-fg", { variants: { disabled: { true: "cursor-not-allowed opacity-60", false: "cursor-pointer" } }, defaultVariants: { disabled: false } }),
  control: cva("mt-0.5 inline-flex shrink-0 items-center justify-center rounded-chip border border-border-strong bg-bg-raised text-(color:--t-solid-fg) transition focus-ring data-[state=checked]:border-(color:--t) data-[state=checked]:bg-(--t) data-[state=indeterminate]:border-(color:--t) data-[state=indeterminate]:bg-(--t) aria-[invalid=true]:border-(color:--danger)", { variants: { size: { sm: "size-4", md: "size-5", lg: "size-6" } }, defaultVariants: { size: "md" } }),
  indicator: cva("inline-flex items-center justify-center"),
  icon: cva("size-3.5"),
  text: cva("min-w-0"),
  label: cva("block text-sm font-medium leading-5"),
  description: cva("block text-xs leading-5 text-fg-muted"),
};
