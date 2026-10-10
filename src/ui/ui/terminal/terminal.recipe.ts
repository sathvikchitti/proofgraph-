import { cva } from "class-variance-authority";

export const terminalRecipe = {
  root: cva("m-0 overflow-x-auto whitespace-pre p-3 font-mono text-[0.8125rem] leading-[1.6] text-fg focus-ring"),
  token: cva("", {
    variants: {
      kind: {
        key: "text-fg-muted",
        value: "text-success-fg",
        url: "text-info-fg underline underline-offset-2",
        muted: "text-fg-subtle",
      },
    },
    defaultVariants: { kind: "key" },
  }),
  caret: cva("inline-block h-[1.1em] w-[0.6em] animate-pulse bg-fg align-text-bottom motion-reduce:animate-none"),
};
