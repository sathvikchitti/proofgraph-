import { cva } from "class-variance-authority";

export const skeletonRecipe = {
  root: cva("block animate-pulse bg-bg-active motion-reduce:animate-none", {
    variants: {
      shape: {
        line: "h-3.5 w-full rounded-chip",
        rect: "h-24 w-full rounded-control",
        circle: "size-10 rounded-full",
      },
    },
    defaultVariants: { shape: "line" },
  }),
  stack: cva("flex w-full flex-col gap-2"),
};
