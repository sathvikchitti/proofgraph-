import { cva } from "class-variance-authority";

export const userMenuRecipe = {
  trigger: cva("inline-flex items-center gap-2 rounded-full focus-ring data-[state=open]:ring-2 data-[state=open]:ring-border-strong"),
  header: cva("flex min-w-0 flex-col normal-case tracking-normal"),
  name: cva("truncate text-sm font-medium text-fg"),
  email: cva("truncate text-xs font-normal text-fg-muted"),
};
