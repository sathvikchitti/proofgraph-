import { cva } from "class-variance-authority";

export const cropMarksRecipe = cva("crop-marks", {
  variants: { size: { sm: "[--crop-size:6px]", md: "[--crop-size:9px]", lg: "[--crop-size:14px]" } },
  defaultVariants: { size: "md" },
});
