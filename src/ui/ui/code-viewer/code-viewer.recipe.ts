import { cva } from "class-variance-authority";

export const codeViewerRecipe = {
  root: cva("flex min-w-0 flex-col overflow-hidden rounded-(--card-radius) border border-border bg-bg-raised text-fg"),
  header: cva("flex items-center justify-between gap-3 border-b border-border bg-bg-subtle px-3 py-1.5 text-xs"),
  headerMain: cva("flex min-w-0 flex-1 items-center gap-2"),
  path: cva("truncate font-mono text-fg"),
  meta: cva("tabular shrink-0 rounded-chip bg-bg-active px-1.5 py-0.5 font-mono text-fg-muted"),
  language: cva("shrink-0 text-fg-subtle"),
  toolButton: cva(
    "inline-flex size-7 shrink-0 items-center justify-center rounded-control text-fg-muted transition-colors hover:bg-bg-hover hover:text-fg focus-ring aria-pressed:bg-accent-subtle aria-pressed:text-accent-fg",
  ),
  scroller: cva("overflow-x-auto overflow-y-auto focus-ring"),
  inner: cva("inline-block min-w-full py-1 align-top font-mono text-[0.8125rem] leading-6"),
  row: cva("group flex min-w-full", {
    variants: {
      wrap: { true: "whitespace-pre-wrap [overflow-wrap:anywhere]", false: "w-max whitespace-pre" },
      highlighted: { true: "bg-(--t-subtle) shadow-[inset_3px_0_0_var(--t)]", false: "" },
    },
    defaultVariants: { wrap: false, highlighted: false },
  }),
  gutter: cva(
    "tabular sticky left-0 z-[1] w-12 shrink-0 select-none bg-inherit pr-3 text-right text-fg-subtle group-data-[highlighted=true]:text-(color:--t-fg)",
  ),
  gutterBg: cva("bg-bg-raised"),
  code: cva("min-w-0 flex-1 pl-2 pr-4"),
  fold: cva(
    "flex w-full items-center gap-2 border-y border-border bg-bg-subtle px-3 py-0.5 text-left font-mono text-xs text-fg-muted transition-colors hover:bg-bg-hover hover:text-fg focus-ring",
  ),
  state: cva("flex min-h-24 items-center justify-center px-4 py-6 text-sm text-fg-muted"),
  skeleton: cva("flex flex-col gap-2 p-3"),
};
