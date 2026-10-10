import { cva } from "class-variance-authority";

export const separatorRecipe = {
  line: cva("shrink-0 bg-border", {
    variants: { orientation: { horizontal: "h-px w-full", vertical: "h-full w-px self-stretch" } },
    defaultVariants: { orientation: "horizontal" },
  }),
  labelled: cva("flex w-full items-center gap-3 text-xs text-fg-subtle"),
  rule: cva("h-px flex-1 bg-border"),
};
