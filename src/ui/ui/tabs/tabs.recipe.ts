import { cva } from "class-variance-authority";

export const tabsRecipe = {
  root: cva("flex min-w-0 flex-col"),
  list: cva("flex max-w-full shrink-0 overflow-x-auto", {
    variants: {
      variant: {
        underline: "gap-5 border-b border-border",
        pill: "w-fit gap-1 rounded-control bg-bg-subtle p-1",
      },
    },
    defaultVariants: { variant: "underline" },
  }),
  trigger: cva(
    "relative inline-flex shrink-0 items-center gap-2 whitespace-nowrap font-medium text-fg-muted transition-colors duration-(--dur-fast) hover:text-fg focus-ring disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-fg",
    {
      variants: {
        variant: {
          underline: "-mb-px border-b-2 border-transparent px-0.5 data-[state=active]:border-(color:--accent)",
          pill: "rounded-chip data-[state=active]:bg-bg-raised data-[state=active]:shadow-[0_0_0_1px_var(--border-strong)]",
        },
        size: { sm: "text-xs", md: "text-sm", lg: "text-base" },
      },
      compoundVariants: [
        { variant: "underline", size: "sm", class: "py-1.5" },
        { variant: "underline", size: "md", class: "py-2.5" },
        { variant: "underline", size: "lg", class: "py-3" },
        { variant: "pill", size: "sm", class: "h-6 px-2" },
        { variant: "pill", size: "md", class: "h-8 px-3" },
        { variant: "pill", size: "lg", class: "h-10 px-4" },
      ],
      defaultVariants: { variant: "underline", size: "md" },
    },
  ),
  count: cva("tabular rounded-pill bg-bg-active px-1.5 text-xs font-medium text-fg-muted"),
  content: cva("mt-4 outline-none focus-ring rounded-control"),
};
