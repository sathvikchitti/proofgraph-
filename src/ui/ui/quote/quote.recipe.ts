import { cva } from "class-variance-authority";

export const quoteRecipe = {
  root: cva("m-0 grid max-w-sm grid-cols-[1.25rem_minmax(0,1fr)] gap-x-2"),
  mark: cva("mt-1 size-4 text-fg-subtle"),
  body: cva("m-0 border-l border-border pl-3 text-lg leading-snug text-fg-muted [&_strong]:font-medium [&_strong]:text-fg"),
  caption: cva("col-start-2 mt-3 pl-3 font-mono text-sm text-fg-subtle"),
  name: cva("text-fg"),
};
