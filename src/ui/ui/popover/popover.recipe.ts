import { cva } from "class-variance-authority";

export const popoverRecipe = {
  content: cva(
    "z-50 max-w-[calc(100vw-1rem)] rounded-(--overlay-radius) bg-bg-raised p-3 text-sm text-fg shadow-float outline-none data-[state=open]:animate-pop-in data-[state=closed]:animate-pop-out",
    { variants: { width: { auto: "w-auto", sm: "w-56", md: "w-72", lg: "w-96" } }, defaultVariants: { width: "md" } },
  ),
};
