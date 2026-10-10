import { cva } from "class-variance-authority";

export const headingRecipe = cva("font-semibold tracking-tight text-fg", {
  variants: {
    size: {
      sm: "text-base leading-snug",
      md: "text-lg leading-snug",
      lg: "text-xl leading-tight",
      xl: "text-2xl leading-tight",
      "2xl": "text-3xl leading-tight",
    },
    muted: { true: "text-fg-muted", false: "" },
  },
  defaultVariants: { size: "lg", muted: false },
});
