import { cva } from "class-variance-authority";

export const paperGrainRecipe = cva(
  "pointer-events-none inset-0 bg-(image:--grain-image) opacity-(--grain-opacity) [mix-blend-mode:var(--grain-blend)]",
  {
    variants: { fixed: { true: "fixed z-40", false: "absolute z-0" } },
    defaultVariants: { fixed: true },
  },
);
