import { cva } from "class-variance-authority";

export const codeRecipe = cva("rounded-chip px-1.5 py-0.5 font-mono text-[0.8125em] [overflow-wrap:anywhere]", {
  variants: {
    variant: {
      subtle: "bg-bg-subtle text-fg",
      outline: "border border-border bg-transparent text-fg",
    },
    colored: { true: "bg-(--t-subtle) text-(color:--t-fg)", false: "" },
  },
  defaultVariants: { variant: "subtle", colored: false },
});
