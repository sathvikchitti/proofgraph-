import { cva } from "class-variance-authority";

export const asyncBoundaryRecipe = {
  root: cva("min-w-0", {
    variants: { refetching: { true: "opacity-70 transition-opacity", false: "" } },
    defaultVariants: { refetching: false },
  }),
};
