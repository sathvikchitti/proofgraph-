import { cva } from "class-variance-authority";

export const bannerRecipe = {
  root: cva("flex w-full items-center gap-3 px-4 py-2 text-sm", {
    variants: {
      variant: {
        subtle: "border-b border-(color:--t-border) bg-(--t-subtle) text-fg",
        solid: "bg-(--t) text-(color:--t-solid-fg)",
      },
      sticky: { true: "sticky top-0 z-40", false: "" },
    },
    defaultVariants: { variant: "subtle", sticky: false },
  }),
  icon: cva("size-4 shrink-0"),
  body: cva("min-w-0 flex-1 text-balance"),
  action: cva("shrink-0"),
  dismiss: cva("-mr-1 inline-flex size-7 shrink-0 items-center justify-center rounded-control opacity-80 hover:bg-[color-mix(in_srgb,currentColor_14%,transparent)] hover:opacity-100 focus-ring"),
};
