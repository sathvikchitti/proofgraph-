import { cva } from "class-variance-authority";

export const tagRecipe = {
  root: cva("inline-flex max-w-full items-center gap-1 rounded-chip border font-medium transition-colors duration-(--dur-fast)", {
    variants: {
      variant: {
        subtle: "border-(color:--t-border) bg-(--t-subtle) text-(color:--t-fg)",
        outline: "border-(color:--t-border) bg-transparent text-(color:--t-fg)",
      },
      size: { sm: "h-6 pl-2 pr-2 text-xs", md: "h-7 pl-2.5 pr-2.5 text-sm", lg: "h-8 pl-3 pr-3 text-sm" },
      selected: { true: "border-(color:--t) bg-(--t) text-(color:--t-solid-fg)", false: "" },
      disabled: { true: "pointer-events-none opacity-50", false: "" },
      removable: { true: "pr-1", false: "" },
    },
    defaultVariants: { variant: "subtle", size: "md", selected: false, disabled: false, removable: false },
  }),
  main: cva("inline-flex min-w-0 items-center gap-1.5 rounded-chip focus-ring"),
  label: cva("truncate"),
  remove: cva("inline-flex size-5 shrink-0 items-center justify-center rounded-chip opacity-70 transition hover:bg-[color-mix(in_srgb,currentColor_15%,transparent)] hover:opacity-100 focus-ring"),
};
