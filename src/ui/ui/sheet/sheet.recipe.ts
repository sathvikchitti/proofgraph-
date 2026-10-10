import { cva } from "class-variance-authority";

export const sheetRecipe = {
  overlay: cva("fixed inset-0 z-50 bg-bg-overlay data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out"),
  content: cva(
    "fixed z-50 flex flex-col bg-bg-raised text-fg shadow-overlay outline-none data-[state=open]:animate-slide-in data-[state=closed]:animate-slide-out",
    {
      variants: {
        side: {
          right: "inset-y-0 right-0 h-full w-[calc(100vw-2rem)] [--slide-from:100%_0]",
          left: "inset-y-0 left-0 h-full w-[calc(100vw-2rem)] [--slide-from:-100%_0]",
          bottom: "inset-x-0 bottom-0 max-h-[85vh] w-full rounded-t-(--overlay-radius) [--slide-from:0_100%]",
          top: "inset-x-0 top-0 max-h-[85vh] w-full rounded-b-(--overlay-radius) [--slide-from:0_-100%]",
        },
        size: { sm: "", md: "", lg: "" },
      },
      compoundVariants: [
        { side: ["right", "left"], size: "sm", class: "max-w-xs" },
        { side: ["right", "left"], size: "md", class: "max-w-md" },
        { side: ["right", "left"], size: "lg", class: "max-w-2xl" },
      ],
      defaultVariants: { side: "right", size: "md" },
    },
  ),
  header: cva("flex items-start justify-between gap-4 border-b border-border px-5 py-4"),
  title: cva("text-base font-semibold leading-snug"),
  description: cva("mt-1 text-sm text-fg-muted"),
  body: cva("scroll-y min-h-0 flex-1 px-5 py-4 text-sm"),
  footer: cva("flex flex-col-reverse gap-2 border-t border-border px-5 py-3 sm:flex-row sm:justify-end"),
  close: cva("-mr-2 -mt-1 inline-flex size-8 shrink-0 items-center justify-center rounded-control text-fg-muted transition-colors hover:bg-bg-hover hover:text-fg focus-ring"),
};
