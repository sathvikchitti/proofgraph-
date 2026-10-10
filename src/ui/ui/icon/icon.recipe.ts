import { cva } from "class-variance-authority";

export const iconRecipe = cva("inline-block shrink-0", {
  variants: {
    size: { sm: "size-3.5", md: "size-4", lg: "size-5" },
    colored: { true: "text-(color:--t-fg)", false: "" },
  },
  defaultVariants: { size: "md", colored: false },
});
