import { cva } from "class-variance-authority";

const gap = { none: "gap-0", xs: "gap-1", sm: "gap-2", md: "gap-(--gap-stack)", lg: "gap-6", xl: "gap-8" } as const;

export const stackRecipe = {
  stack: cva("flex min-w-0", {
    variants: {
      direction: { column: "flex-col", row: "flex-row" },
      gap,
      align: { start: "items-start", center: "items-center", end: "items-end", stretch: "items-stretch", baseline: "items-baseline" },
      justify: { start: "justify-start", center: "justify-center", end: "justify-end", between: "justify-between" },
      wrap: { true: "flex-wrap", false: "" },
    },
    defaultVariants: { direction: "column", gap: "md", align: "stretch", justify: "start", wrap: false },
  }),
  grid: cva("grid min-w-0", {
    variants: {
      gap,
      base: { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4", 6: "grid-cols-6" },
      sm: { 1: "sm:grid-cols-1", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-4", 6: "sm:grid-cols-6" },
      md: { 1: "md:grid-cols-1", 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-4", 6: "md:grid-cols-6" },
      lg: { 1: "lg:grid-cols-1", 2: "lg:grid-cols-2", 3: "lg:grid-cols-3", 4: "lg:grid-cols-4", 6: "lg:grid-cols-6" },
      auto: { true: "grid-cols-[repeat(auto-fill,minmax(min(var(--min-item,16rem),100%),1fr))]", false: "" },
    },
    defaultVariants: { gap: "md", auto: false },
  }),
  section: cva("flex min-w-0 flex-col", { variants: { spacing: { none: "gap-0", sm: "gap-3", md: "gap-4", lg: "gap-6" } }, defaultVariants: { spacing: "md" } }),
  sectionHead: cva("flex flex-wrap items-end justify-between gap-x-4 gap-y-2"),
  sectionTitle: cva("text-base font-semibold leading-snug text-fg"),
  sectionDescription: cva("mt-0.5 text-sm text-fg-muted"),
  sectionActions: cva("flex shrink-0 flex-wrap items-center gap-2"),
  container: cva("mx-auto w-full min-w-0", {
    variants: {
      size: { sm: "max-w-2xl", md: "max-w-4xl", lg: "max-w-6xl", xl: "max-w-7xl", full: "max-w-none" },
      padded: { true: "px-4 sm:px-6 lg:px-8", false: "" },
    },
    defaultVariants: { size: "lg", padded: true },
  }),
};
