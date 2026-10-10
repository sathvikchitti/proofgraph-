import { cva } from "class-variance-authority";

export const avatarRecipe = {
  root: cva("relative inline-flex shrink-0 select-none align-middle", {
    variants: { size: { sm: "size-7 text-xs", md: "size-9 text-sm", lg: "size-12 text-base" } },
    defaultVariants: { size: "md" },
  }),
  frame: cva("inline-flex size-full items-center justify-center overflow-hidden bg-(--t-subtle) font-medium text-(color:--t-fg)", {
    variants: { shape: { circle: "rounded-full", square: "rounded-control" } },
    defaultVariants: { shape: "circle" },
  }),
  image: cva("size-full object-cover"),
  fallback: cva("inline-flex size-full items-center justify-center"),
  status: cva("absolute bottom-0 right-0 size-2.5 rounded-full bg-(--t) ring-2 ring-bg-raised"),
  group: cva("inline-flex items-center"),
  groupItem: cva("-ml-2 first:ml-0 rounded-full ring-2 ring-bg-raised"),
  overflow: cva("inline-flex shrink-0 items-center justify-center rounded-full bg-bg-active font-medium text-fg-muted"),
};
