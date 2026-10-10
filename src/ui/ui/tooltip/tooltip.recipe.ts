import { cva } from "class-variance-authority";

export const tooltipRecipe = {
  content: cva(
    "z-50 flex max-w-xs items-center gap-2 rounded-control bg-fg px-2 py-1 text-xs font-medium text-bg shadow-float data-[state=delayed-open]:animate-fade-in data-[state=instant-open]:animate-fade-in data-[state=closed]:animate-fade-out",
  ),
  kbd: cva("rounded-chip bg-[color-mix(in_srgb,var(--bg)_22%,transparent)] px-1 font-mono text-[0.6875rem]"),
};
