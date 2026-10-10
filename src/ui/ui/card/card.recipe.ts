import { cva } from "class-variance-authority";

export const cardRecipe = {
  card: cva("flex min-w-0 flex-col rounded-(--card-radius) border text-fg", {
    variants: {
      variant: {
        outline: "border-border bg-bg-raised",
        raised: "border-border-strong bg-bg-raised",
        sunken: "border-transparent bg-bg-subtle",
      },
      interactive: {
        true: "cursor-pointer transition-colors duration-(--dur-fast) hover:border-border-strong hover:bg-bg-hover focus-ring",
        false: "",
      },
    },
    defaultVariants: { variant: "outline", interactive: false },
  }),
  header: cva("flex items-start justify-between gap-3 px-(--card-padding) pt-(--card-padding)"),
  headerText: cva("min-w-0"),
  title: cva("truncate text-base font-semibold leading-snug"),
  description: cva("mt-0.5 text-sm text-fg-muted"),
  actions: cva("flex shrink-0 items-center gap-2"),
  body: cva("min-w-0 flex-1 p-(--card-padding)"),
  footer: cva("flex items-center justify-end gap-2 border-t border-border px-(--card-padding) py-3"),
};
