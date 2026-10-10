import { cva } from "class-variance-authority";

export const fieldRecipe = {
  root: cva("flex min-w-0 flex-col gap-1.5"),
  label: cva("text-sm font-medium text-fg", {
    variants: { disabled: { true: "text-fg-disabled", false: "" } },
    defaultVariants: { disabled: false },
  }),
  required: cva("ml-0.5 text-danger-fg"),
  hint: cva("text-xs text-fg-muted"),
  error: cva("flex items-start gap-1 text-xs text-danger-fg"),
};
