import { cva } from "class-variance-authority";

export const graphViewRecipe = {
  root: cva("relative min-w-0 overflow-hidden rounded-(--card-radius) border border-border bg-bg-raised focus-ring"),
  canvas: cva("relative size-full"),
  controls: cva("absolute right-2 top-2 z-10 flex flex-col gap-1 rounded-control border border-border bg-bg-raised p-1 shadow-float"),
  controlButton: cva(
    "inline-flex size-7 items-center justify-center rounded-chip text-fg-muted transition-colors hover:bg-bg-hover hover:text-fg focus-ring disabled:opacity-50",
  ),
  minimap: cva("absolute bottom-2 left-2 z-10 overflow-hidden rounded-control border border-border bg-bg-raised/90 shadow-float"),
  minimapNode: cva("fill-fg-subtle"),
  minimapView: cva("fill-accent-subtle stroke-accent [stroke-width:1.5]"),
  legend: cva("absolute bottom-2 right-2 z-10 flex max-w-[60%] flex-wrap justify-end gap-x-3 gap-y-1 rounded-control border border-border bg-bg-raised/90 px-2 py-1 text-xs text-fg-muted"),
  legendItem: cva("inline-flex items-center gap-1.5"),
  swatch: cva("size-2.5 rounded-full"),
  status: cva("absolute inset-0 flex items-center justify-center p-4"),
  selected: cva("absolute left-2 top-2 z-10 max-w-[60%] truncate rounded-control border border-border bg-bg-raised px-2 py-1 text-xs font-medium text-fg shadow-float"),
};
