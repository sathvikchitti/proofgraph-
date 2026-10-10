import { cva } from "class-variance-authority";

export const stepperRecipe = {
  root: cva("m-0 flex list-none p-0", {
    variants: { orientation: { horizontal: "w-full flex-row items-start", vertical: "flex-col" } },
    defaultVariants: { orientation: "horizontal" },
  }),
  item: cva("relative flex min-w-0", {
    variants: {
      orientation: {
        horizontal: "flex-1 flex-col items-start pr-2 last:flex-none last:pr-0",
        vertical: "flex-row items-stretch gap-3 pb-6 last:pb-0",
      },
    },
    defaultVariants: { orientation: "horizontal" },
  }),
  head: cva("flex items-center", { variants: { orientation: { horizontal: "w-full", vertical: "shrink-0 flex-col self-stretch" } }, defaultVariants: { orientation: "horizontal" } }),
  trigger: cva("group inline-flex min-w-0 items-center gap-2 rounded-control text-left focus-ring disabled:cursor-default", {
    variants: { orientation: { horizontal: "", vertical: "flex-col" } },
    defaultVariants: { orientation: "horizontal" },
  }),
  marker: cva(
    "tabular inline-flex shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors duration-(--dur-fast) border-border-strong bg-bg-raised text-fg-muted group-data-[status=current]:border-(color:--accent) group-data-[status=current]:bg-accent group-data-[status=current]:text-fg-on-accent group-data-[status=completed]:border-(color:--success) group-data-[status=completed]:bg-success-subtle group-data-[status=completed]:text-success-fg group-data-[status=error]:border-(color:--danger) group-data-[status=error]:bg-danger-subtle group-data-[status=error]:text-danger-fg",
    {
      variants: { size: { sm: "size-6", md: "size-8", lg: "size-10 text-sm" } },
      defaultVariants: { size: "md" },
    },
  ),
  connector: cva("bg-border group-data-[status=completed]:bg-success", {
    variants: { orientation: { horizontal: "ml-2 h-px min-w-4 flex-1", vertical: "mt-1 w-px flex-1 min-h-4" } },
    defaultVariants: { orientation: "horizontal" },
  }),
  text: cva("min-w-0", { variants: { orientation: { horizontal: "mt-2", vertical: "pt-1" } }, defaultVariants: { orientation: "horizontal" } }),
  label: cva("block truncate text-sm font-medium text-fg-muted group-data-[status=current]:text-fg group-data-[status=error]:text-danger-fg"),
  description: cva("block text-xs text-fg-subtle"),
  optional: cva("ml-1 text-xs font-normal text-fg-subtle"),
  wizard: cva("flex min-w-0 flex-col gap-6"),
  panel: cva("min-w-0 rounded-(--card-radius) border border-border bg-bg-raised p-(--card-padding) outline-none focus-visible:outline-(length:--ring-width) focus-visible:outline-ring"),
  panelTitle: cva("mb-3 text-base font-semibold"),
  footer: cva("flex flex-wrap items-center justify-between gap-2"),
  progressText: cva("tabular text-sm text-fg-muted"),
};
