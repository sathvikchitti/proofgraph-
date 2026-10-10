import { cva } from "class-variance-authority";

export const appShellRecipe = {
  root: cva("flex min-w-0 bg-bg text-fg", { variants: { contained: { true: "h-full overflow-hidden", false: "min-h-screen" } }, defaultVariants: { contained: false } }),
  skip: cva(
    "sr-only rounded-control bg-accent px-3 py-2 text-sm font-medium text-fg-on-accent shadow-float focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus-ring",
  ),
  sidebar: cva("hidden shrink-0 flex-col border-r border-border bg-bg-raised transition-[width] duration-(--dur) ease-out lg:flex", {
    variants: {
      collapsed: { true: "w-(--sidebar-width-collapsed)", false: "w-(--sidebar-width)" },
      contained: { true: "h-full", false: "sticky top-0 h-screen" },
    },
    defaultVariants: { collapsed: false, contained: false },
  }),
  brand: cva("flex h-(--topbar-height) shrink-0 items-center gap-2 border-b border-border px-3", {
    variants: { collapsed: { true: "justify-center px-0", false: "" } },
    defaultVariants: { collapsed: false },
  }),
  head: cva("shrink-0 border-b border-border p-2"),
  nav: cva("scroll-y flex-1 px-2 py-3"),
  section: cva("mb-4 last:mb-0"),
  sectionLabel: cva("px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-fg-subtle"),
  list: cva("m-0 flex list-none flex-col gap-0.5 p-0"),
  item: cva(
    "relative flex h-9 items-center gap-3 rounded-control px-2.5 text-sm font-medium text-fg-muted transition-colors duration-(--dur-fast) hover:bg-bg-hover hover:text-fg focus-ring aria-[current=page]:bg-accent-subtle aria-[current=page]:text-accent-fg aria-disabled:pointer-events-none aria-disabled:opacity-50",
    { variants: { collapsed: { true: "justify-center px-0", false: "" } }, defaultVariants: { collapsed: false } },
  ),
  icon: cva("size-4 shrink-0"),
  itemLabel: cva("min-w-0 flex-1 truncate"),
  badge: cva("tabular ml-auto shrink-0 rounded-pill bg-bg-active px-1.5 text-xs font-medium text-fg-muted group-aria-[current=page]:bg-bg-raised"),
  dot: cva("absolute right-1.5 top-1.5 size-2 rounded-full bg-accent ring-2 ring-bg-raised"),
  footer: cva("shrink-0 border-t border-border p-2"),
  collapseButton: cva(
    "inline-flex h-8 w-full items-center gap-2 rounded-control px-2.5 text-sm text-fg-muted transition-colors hover:bg-bg-hover hover:text-fg focus-ring",
    { variants: { collapsed: { true: "justify-center px-0", false: "" } }, defaultVariants: { collapsed: false } },
  ),
  main: cva("flex min-w-0 flex-1 flex-col"),
  topbar: cva("z-30 flex h-(--topbar-height) shrink-0 items-center gap-3 border-b border-border bg-bg-raised px-3 sm:px-4", {
    variants: { contained: { true: "", false: "sticky top-0" } },
    defaultVariants: { contained: false },
  }),
  menuButton: cva("inline-flex size-9 shrink-0 items-center justify-center rounded-control text-fg-muted hover:bg-bg-hover hover:text-fg focus-ring lg:hidden"),
  topbarContent: cva("flex min-w-0 flex-1 items-center gap-3"),
  content: cva("min-w-0 flex-1 p-4 outline-none sm:p-6", { variants: { contained: { true: "scroll-y", false: "" } }, defaultVariants: { contained: false } }),
  sheetNav: cva("-mx-5 -my-4 flex h-full flex-col"),
};
