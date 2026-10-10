import { cva } from "class-variance-authority";

export const countdownTimerRecipe = {
  root: cva("inline-flex min-w-0 flex-col gap-1.5", { variants: { block: { true: "flex w-full", false: "" } }, defaultVariants: { block: false } }),
  row: cva("flex items-center gap-2"),
  label: cva("text-sm text-fg-muted"),
  time: cva("tabular font-mono font-semibold leading-none text-(color:--t-fg) transition-colors duration-(--dur)", {
    variants: { size: { sm: "text-lg", md: "text-2xl", lg: "text-4xl" } },
    defaultVariants: { size: "md" },
  }),
  expired: cva("text-sm font-medium text-(color:--t-fg)"),
  bar: cva("h-1 w-full overflow-hidden rounded-pill bg-bg-active"),
  barFill: cva("h-full rounded-pill bg-(--t) transition-[width] duration-(--dur) ease-linear"),
  control: cva("inline-flex size-7 items-center justify-center rounded-control text-fg-muted transition-colors hover:bg-bg-hover hover:text-fg focus-ring"),
};
