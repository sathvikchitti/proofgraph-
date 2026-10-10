import { cva } from "class-variance-authority";

export const listRecipe = {
  root: cva("m-0 flex min-w-0 list-none flex-col p-0", {
    variants: {
      variant: { plain: "", card: "overflow-hidden rounded-(--card-radius) border border-border bg-bg-raised" },
      divided: { true: "divide-y divide-border", false: "" },
    },
    defaultVariants: { variant: "plain", divided: true },
  }),
  item: cva("min-w-0"),
  row: cva("flex w-full min-w-0 items-center gap-3 px-3 py-2.5 text-left text-sm", {
    variants: {
      interactive: { true: "cursor-pointer transition-colors duration-(--dur-fast) hover:bg-bg-hover focus-ring", false: "" },
      selected: { true: "bg-accent-subtle", false: "" },
    },
    defaultVariants: { interactive: false, selected: false },
  }),
  leading: cva("flex shrink-0 items-center text-fg-subtle"),
  body: cva("min-w-0 flex-1"),
  title: cva("truncate font-medium text-fg"),
  unread: cva("mr-1.5 inline-block size-1.5 rounded-full bg-accent align-middle"),
  description: cva("truncate text-fg-muted"),
  meta: cva("tabular shrink-0 text-xs text-fg-subtle"),
  trailing: cva("flex shrink-0 items-center gap-2"),
  skeletonRow: cva("flex items-center gap-3 px-3 py-3"),
};
