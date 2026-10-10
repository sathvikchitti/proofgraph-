import { cva } from "class-variance-authority";

export const themeToggleRecipe = {
  root: cva("inline-flex items-center gap-0.5 rounded-control border border-border bg-bg-raised p-0.5"),
  item: cva(
    "inline-flex items-center justify-center rounded-chip text-fg-muted transition-colors duration-(--dur-fast) hover:bg-bg-hover hover:text-fg focus-ring data-[state=on]:bg-accent-subtle data-[state=on]:text-accent-fg",
    { variants: { size: { sm: "size-6", md: "size-8", lg: "size-10" } }, defaultVariants: { size: "md" } },
  ),
  cycle: cva(
    "inline-flex items-center justify-center rounded-control border border-border bg-bg-raised text-fg-muted transition-colors duration-(--dur-fast) hover:bg-bg-hover hover:text-fg focus-ring",
    { variants: { size: { sm: "size-7", md: "size-9", lg: "size-11" } }, defaultVariants: { size: "md" } },
  ),
  icon: cva("shrink-0", { variants: { size: { sm: "size-3.5", md: "size-4", lg: "size-5" } }, defaultVariants: { size: "md" } }),
};
