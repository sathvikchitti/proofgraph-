import { cva } from "class-variance-authority";

export const commandPaletteRecipe = {
  overlay: cva("fixed inset-0 z-50 bg-bg-overlay data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out"),
  content: cva(
    "fixed left-1/2 top-[12vh] z-50 w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-(--overlay-radius) bg-bg-raised text-fg shadow-overlay outline-none data-[state=open]:animate-pop-in data-[state=closed]:animate-pop-out",
  ),
  searchRow: cva("flex items-center gap-2 border-b border-border px-4"),
  searchIcon: cva("size-4 shrink-0 text-fg-subtle"),
  input: cva("h-12 w-full bg-transparent text-base outline-none placeholder:text-fg-subtle"),
  list: cva("scroll-y max-h-[min(60vh,24rem)] p-2"),
  group: cva("[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-fg-subtle"),
  item: cva(
    "flex cursor-default select-none items-center gap-3 rounded-control px-2 py-2 text-sm outline-none data-[disabled=true]:opacity-50 data-[selected=true]:bg-bg-hover",
  ),
  itemIcon: cva("size-4 shrink-0 text-fg-subtle"),
  itemText: cva("min-w-0 flex-1"),
  description: cva("block truncate text-xs text-fg-muted"),
  empty: cva("px-2 py-8 text-center text-sm text-fg-muted"),
  footer: cva("flex items-center gap-4 border-t border-border px-4 py-2 text-xs text-fg-muted"),
};
