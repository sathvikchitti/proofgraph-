import { cva } from "class-variance-authority";

export const donutRecipe = {
  center: cva("flex flex-col items-center justify-center leading-tight"),
  value: cva("tabular text-2xl font-semibold text-fg"),
  caption: cva("text-xs text-fg-muted"),
  slice: cva("stroke-bg-raised [stroke-width:2]"),
};
