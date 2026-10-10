import { cva } from "class-variance-authority";

export const workspaceSwitcherRecipe = {
  trigger: cva(
    "flex w-full min-w-0 items-center gap-2.5 rounded-control border border-border bg-bg-raised p-1.5 text-left transition-colors duration-(--dur-fast) hover:bg-bg-hover focus-ring data-[state=open]:bg-bg-hover",
    { variants: { compact: { true: "w-auto justify-center border-transparent bg-transparent p-1", false: "" } }, defaultVariants: { compact: false } },
  ),
  logo: cva("flex size-8 shrink-0 items-center justify-center rounded-chip bg-accent-subtle text-accent-fg [&>svg]:size-4"),
  text: cva("min-w-0 flex-1"),
  name: cva("block truncate text-sm font-medium leading-tight text-fg"),
  role: cva("block truncate text-xs text-fg-muted"),
  chevron: cva("size-4 shrink-0 text-fg-subtle"),
  option: cva("flex min-w-0 items-center gap-2"),
  optionText: cva("min-w-0"),
  optionName: cva("block truncate font-medium"),
  optionDescription: cva("block truncate text-xs text-fg-muted"),
};
