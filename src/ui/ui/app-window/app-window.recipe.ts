import { cva } from "class-variance-authority";

export const appWindowRecipe = {
  root: cva(
    "relative flex min-w-0 flex-col overflow-hidden rounded-card border border-border bg-bg-raised text-sm text-fg shadow-overlay [[data-part=label-tab]+&]:rounded-tl-none",
  ),
  bar: cva("flex items-center border-b border-border", {
    variants: {
      chrome: { true: "relative min-h-8 px-3 py-1", false: "min-h-10 gap-2 px-3 py-1.5" },
      align: { center: "", start: "" },
    },
    compoundVariants: [
      { chrome: true, align: "center", class: "justify-center" },
      { chrome: true, align: "start", class: "justify-start pl-16" },
    ],
    defaultVariants: { chrome: false, align: "center" },
  }),
  logo: cva("flex shrink-0 items-center text-fg [&>svg]:h-3.5 [&>svg]:w-auto"),
  title: cva("min-w-0 truncate", {
    variants: {
      chrome: { true: "font-mono text-[0.8125rem] tracking-[0.06em] text-fg-muted", false: "font-medium" },
    },
    defaultVariants: { chrome: false },
  }),
  spacer: cva("flex-1"),
  actions: cva("flex shrink-0 items-center gap-1.5"),
  end: cva("absolute right-3 top-1/2 flex -translate-y-1/2 items-center text-fg-subtle"),
  traffic: cva("absolute left-3 top-1/2 flex -translate-y-1/2 gap-1.5"),
  dot: cva("block size-[9px] rounded-full bg-(--traffic)"),
  body: cva("scroll-y relative min-h-0 flex-1 p-3"),
};
