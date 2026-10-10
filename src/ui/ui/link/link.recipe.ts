import { cva } from "class-variance-authority";

export const linkRecipe = cva(
  "inline-flex items-center gap-1 rounded-chip underline-offset-[3px] transition-colors duration-(--dur-fast) [text-decoration-line:var(--link-decoration)] focus-ring",
  {
    variants: {
      variant: {
        default: "text-fg-link hover:text-accent-hover",
        muted: "text-fg-muted hover:text-fg",
        plain: "text-inherit",
      },
      underline: {
        always: "decoration-1",
        hover: "[text-decoration-line:none] hover:[text-decoration-line:var(--link-decoration)]",
        none: "[text-decoration-line:none]",
      },
    },
    defaultVariants: { variant: "default", underline: "always" },
  },
);
