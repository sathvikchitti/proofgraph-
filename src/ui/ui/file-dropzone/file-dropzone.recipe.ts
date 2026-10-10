import { cva } from "class-variance-authority";

export const fileDropzoneRecipe = {
  root: cva("flex w-full min-w-0 flex-col gap-3"),
  zone: cva(
    "flex flex-col items-center justify-center gap-1 rounded-card border-2 border-dashed px-4 py-8 text-center transition-colors duration-(--dur-fast) focus-ring",
    {
      variants: {
        state: {
          idle: "border-border-strong bg-bg-raised hover:border-fg-subtle hover:bg-bg-hover",
          dragging: "border-(color:--accent) bg-accent-subtle",
          disabled: "cursor-not-allowed border-border bg-bg-subtle opacity-60",
        },
        invalid: { true: "border-(color:--danger)", false: "" },
      },
      defaultVariants: { state: "idle", invalid: false },
    },
  ),
  icon: cva("mb-1 size-6 text-fg-subtle"),
  title: cva("text-sm font-medium text-fg"),
  browse: cva("text-fg-link underline underline-offset-2"),
  hint: cva("text-xs text-fg-muted"),
  rejections: cva("flex flex-col gap-1"),
  rejection: cva("flex items-start gap-1.5 text-xs text-danger-fg"),
  list: cva("flex flex-col gap-2"),
  item: cva("flex min-w-0 items-center gap-3 rounded-control border border-border bg-bg-raised p-2.5"),
  itemIcon: cva("size-5 shrink-0 text-fg-subtle"),
  itemBody: cva("flex min-w-0 flex-1 flex-col gap-1"),
  itemHead: cva("flex items-baseline justify-between gap-2"),
  itemName: cva("truncate text-sm font-medium text-fg"),
  itemMeta: cva("tabular shrink-0 text-xs text-fg-muted"),
  itemError: cva("text-xs text-danger-fg"),
};
