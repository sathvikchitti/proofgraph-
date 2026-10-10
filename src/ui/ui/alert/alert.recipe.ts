import { cva } from "class-variance-authority";

export const alertRecipe = {
  root: cva("relative flex w-full gap-3 rounded-control border p-3 text-sm", {
    variants: {
      variant: {
        subtle: "border-(color:--t-border) bg-(--t-subtle)",
        outline: "border-(color:--t-border) bg-bg-raised",
        callout: "rounded-l-none border-y-0 border-r-0 border-l-4 border-(color:--t) bg-bg-subtle",
      },
    },
    defaultVariants: { variant: "subtle" },
  }),
  icon: cva("mt-0.5 size-4 shrink-0 text-(color:--t-fg)"),
  body: cva("min-w-0 flex-1"),
  title: cva("font-medium leading-snug text-(color:--t-fg)"),
  description: cva("mt-0.5 text-fg"),
  actions: cva("mt-2 flex flex-wrap gap-2"),
  dismiss: cva("-m-1 inline-flex size-7 shrink-0 items-center justify-center rounded-control text-fg-muted hover:bg-bg-hover hover:text-fg focus-ring"),
};
