import { cva } from "class-variance-authority";

export const textRecipe = cva("", {
  variants: {
    size: { xs: "text-xs", sm: "text-sm", md: "text-sm leading-relaxed", lg: "text-base leading-relaxed" },
    emphasis: { default: "text-fg", muted: "text-fg-muted", subtle: "text-fg-subtle" },
    colored: { true: "text-(color:--t-fg)", false: "" },
    weight: { regular: "font-normal", medium: "font-medium", semibold: "font-semibold" },
    mono: { true: "font-mono", false: "" },
    numeric: { true: "tabular", false: "" },
    truncate: { true: "truncate", false: "" },
  },
  defaultVariants: { size: "md", emphasis: "default", colored: false, weight: "regular", mono: false, numeric: false, truncate: false },
});
