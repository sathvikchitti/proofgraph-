import { cva } from "class-variance-authority";

export const displayHeadingRecipe = cva(
  "m-0 font-(family-name:--font-display) font-extrabold leading-[1.05] tracking-[-0.03em] text-fg text-balance [font-stretch:118%] [&_em]:font-(family-name:--font-serif) [&_em]:text-[1.22em] [&_em]:font-normal [&_em]:italic [&_em]:leading-none [&_em]:tracking-[-0.02em] [&_em]:[font-stretch:100%]",
  {
    variants: {
      size: {
        sm: "text-3xl",
        md: "text-4xl sm:text-5xl",
        lg: "text-5xl sm:text-6xl lg:text-7xl",
      },
    },
    defaultVariants: { size: "md" },
  },
);
