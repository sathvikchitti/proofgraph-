import { cva } from "class-variance-authority";

export const splitViewRecipe = {
  root: cva("flex min-h-0 min-w-0 flex-col md:grid md:items-stretch", {
    variants: {
      side: {
        right: "md:grid-cols-[minmax(0,1fr)_auto_var(--split-size)]",
        left: "md:grid-cols-[var(--split-size)_auto_minmax(0,1fr)]",
      },
    },
    defaultVariants: { side: "right" },
  }),
  primary: cva("min-h-0 min-w-0"),
  secondary: cva("min-h-0 min-w-0 border-t border-border md:border-t-0"),
  handle: cva(
    "relative hidden w-px shrink-0 cursor-col-resize touch-none bg-border outline-none transition-colors duration-(--dur-fast) before:absolute before:inset-y-0 before:-left-1.5 before:-right-1.5 before:content-[''] hover:bg-accent focus-visible:bg-accent data-[dragging=true]:bg-accent md:block",
  ),
  grip: cva("absolute left-1/2 top-1/2 h-8 w-1 -translate-x-1/2 -translate-y-1/2 rounded-pill bg-border-strong"),
};
