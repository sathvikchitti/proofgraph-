import { cva } from "class-variance-authority";

/* Class names are written out in full: Tailwind only generates classes it can read literally in the source. */
export const hexBadgeRecipe = {
  root: cva(
    "relative inline-grid h-[calc(var(--hex-size)*1.12)] w-(--hex-size) shrink-0 place-items-center text-(color:--badge-icon) before:absolute before:inset-0 before:bg-(--badge-stroke) before:[clip-path:polygon(50%_0,100%_25%,100%_75%,50%_100%,0_75%,0_25%)] after:absolute after:inset-[1.5px] after:bg-(--badge-fill) after:[clip-path:polygon(50%_0,100%_25%,100%_75%,50%_100%,0_75%,0_25%)]",
    {
      variants: { size: { sm: "[--hex-size:36px]", md: "[--hex-size:52px]", lg: "[--hex-size:68px]" } },
      defaultVariants: { size: "md" },
    },
  ),
  icon: cva("relative z-10 inline-flex size-[46%] items-center justify-center [&>svg]:size-full"),
};
