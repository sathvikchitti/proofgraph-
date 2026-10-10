import { cva } from "class-variance-authority";
export const switchRecipe = {
  root: cva("inline-flex items-start gap-2.5 text-fg", { variants: { disabled: { true: "cursor-not-allowed opacity-60", false: "cursor-pointer" } }, defaultVariants: { disabled: false } }),
  control: cva("relative mt-0.5 inline-flex shrink-0 items-center rounded-full border border-border-strong bg-bg-sunken transition-colors focus-ring data-[state=checked]:border-(color:--t) data-[state=checked]:bg-(--t) aria-[invalid=true]:border-(color:--danger)", { variants: { size: { sm: "h-4 w-7", md: "h-5 w-9", lg: "h-6 w-11" } }, defaultVariants: { size: "md" } }),
  thumb: cva("block rounded-full bg-bg-raised shadow-raised transition-transform data-[state=unchecked]:translate-x-0.5", { variants: { size: { sm: "size-3 data-[state=checked]:translate-x-3", md: "size-4 data-[state=checked]:translate-x-4", lg: "size-5 data-[state=checked]:translate-x-5" } }, defaultVariants: { size: "md" } }),
  text: cva("min-w-0"), label: cva("block text-sm font-medium leading-5"), description: cva("block text-xs leading-5 text-fg-muted"),
};
