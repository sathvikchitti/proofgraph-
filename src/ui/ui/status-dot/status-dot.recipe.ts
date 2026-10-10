import { cva } from "class-variance-authority";

export const statusDotRecipe = cva("relative inline-block shrink-0 rounded-full bg-(--t)", {
  variants: {
    size: { sm: "size-1.5", md: "size-2", lg: "size-2.5" },
    pulse: {
      true: "after:absolute after:inset-0 after:rounded-full after:bg-(--t) after:animate-ping motion-reduce:after:animate-none",
      false: "",
    },
  },
  defaultVariants: { size: "md", pulse: false },
});
