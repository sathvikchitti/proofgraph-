import { cva } from "class-variance-authority";

export const badgeRecipe = {
  badge: cva("inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-(--badge-radius) border font-medium", {
    variants: {
      variant: {
        subtle: "border-(color:--t-border) bg-(--t-subtle) text-(color:--t-fg)",
        solid: "border-transparent bg-(--t) text-(color:--t-solid-fg)",
        outline: "border-(color:--t-border) bg-transparent text-(color:--t-fg)",
      },
      size: { sm: "h-5 px-1.5 text-xs", md: "h-6 px-2 text-xs", lg: "h-7 px-2.5 text-sm" },
    },
    defaultVariants: { variant: "subtle", size: "md" },
  }),
  dot: cva("size-1.5 shrink-0 rounded-full bg-current"),
};
