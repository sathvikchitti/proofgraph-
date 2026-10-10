import { cva } from "class-variance-authority";

export const confirmDialogRecipe = {
  error: cva("mt-3 flex items-start gap-1.5 rounded-control border border-danger-border bg-danger-subtle px-3 py-2 text-sm text-danger-fg"),
};
