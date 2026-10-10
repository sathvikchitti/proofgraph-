import { cva } from "class-variance-authority";

export const breadcrumbsRecipe = {
  list: cva("m-0 flex min-w-0 list-none flex-wrap items-center gap-1 p-0 text-sm text-fg-muted"),
  item: cva("inline-flex min-w-0 items-center gap-1"),
  link: cva("max-w-48 truncate rounded-chip text-fg-muted underline-offset-2 transition-colors hover:text-fg hover:underline focus-ring"),
  current: cva("max-w-56 truncate font-medium text-fg"),
  separator: cva("size-3.5 shrink-0 text-fg-subtle"),
  more: cva("inline-flex size-6 items-center justify-center rounded-chip text-fg-muted hover:bg-bg-hover hover:text-fg focus-ring"),
};
