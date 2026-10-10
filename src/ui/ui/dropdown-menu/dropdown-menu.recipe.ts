import { cva } from "class-variance-authority";

/** Shared by DropdownMenu and ContextMenu (ContextMenu reads the same recipe name "dropdownMenu"). */
export const dropdownMenuRecipe = {
  content: cva(
    "z-50 min-w-48 max-w-[calc(100vw-1rem)] overflow-hidden rounded-(--overlay-radius) bg-bg-raised p-1 text-sm text-fg shadow-float data-[state=open]:animate-pop-in data-[state=closed]:animate-pop-out",
  ),
  item: cva(
    "relative flex cursor-default select-none items-center gap-2 rounded-chip px-2 py-1.5 outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-bg-hover data-[tone=danger]:text-danger-fg data-[tone=danger]:data-[highlighted]:bg-danger-subtle",
  ),
  indicator: cva("absolute left-2 inline-flex size-4 items-center justify-center"),
  checkItem: cva("pl-8"),
  icon: cva("size-4 shrink-0 text-fg-subtle [[data-tone=danger]>&]:text-danger-fg"),
  shortcut: cva("ml-auto pl-4 text-xs tracking-wide text-fg-subtle"),
  label: cva("px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-fg-subtle"),
  separator: cva("-mx-1 my-1 h-px bg-border"),
  chevron: cva("ml-auto size-4 text-fg-subtle"),
};
