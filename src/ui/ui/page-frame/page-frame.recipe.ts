import { cva } from "class-variance-authority";

export const pageFrameRecipe = {
  frame: cva("relative mx-auto w-full max-w-7xl border-x border-(color:--guide) px-4 sm:px-8"),
  line: cva("shrink-0", {
    variants: {
      orientation: {
        horizontal: "h-0 w-full border-t",
        vertical: "absolute inset-y-0 w-0 border-l",
      },
      dashed: { true: "border-dashed border-(color:--guide-dash)", false: "border-solid border-(color:--guide)" },
    },
    defaultVariants: { orientation: "horizontal", dashed: false },
  }),
};
