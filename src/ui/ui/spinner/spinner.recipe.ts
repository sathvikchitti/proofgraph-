import { cva } from "class-variance-authority";

export const spinnerRecipe = {
  root: cva("inline-flex shrink-0 items-center justify-center", {
    variants: { colored: { true: "text-(color:--t)", false: "" } },
    defaultVariants: { colored: false },
  }),
  svg: cva("animate-spin motion-reduce:animate-none", {
    variants: { size: { sm: "size-3.5", md: "size-4", lg: "size-6" } },
    defaultVariants: { size: "md" },
  }),
  track: cva("opacity-25"),
  arc: cva("opacity-90"),
};
