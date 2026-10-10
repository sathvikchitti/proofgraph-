import { cva } from "class-variance-authority";

export const dialogRecipe = {
  overlay: cva("fixed inset-0 z-50 bg-bg-overlay data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out"),
  content: cva(
    "fixed left-1/2 top-1/2 z-50 flex max-h-[min(85vh,48rem)] w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-(--overlay-radius) bg-bg-raised text-fg shadow-overlay outline-none data-[state=open]:animate-pop-in data-[state=closed]:animate-pop-out",
    { variants: { size: { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" } }, defaultVariants: { size: "md" } },
  ),
  header: cva("flex items-start justify-between gap-4 px-5 pt-5"),
  title: cva("text-lg font-semibold leading-snug"),
  description: cva("mt-1 text-sm text-fg-muted"),
  body: cva("scroll-y min-h-0 flex-1 px-5 py-4 text-sm"),
  footer: cva("flex flex-col-reverse gap-2 border-t border-border px-5 py-3 sm:flex-row sm:justify-end"),
  close: cva("-mr-2 -mt-1 inline-flex size-8 shrink-0 items-center justify-center rounded-control text-fg-muted transition-colors hover:bg-bg-hover hover:text-fg focus-ring"),
};
