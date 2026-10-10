/** Class names handed to sonner's `toastOptions.classNames` (sonner runs `unstyled`). */
export const toastRecipe = {
  toast:
    "flex w-[calc(100vw-2rem)] items-start gap-3 rounded-(--overlay-radius) border border-border bg-bg-raised p-3 text-sm text-fg shadow-float sm:w-[22rem] data-[type=success]:border-success-border data-[type=error]:border-danger-border data-[type=warning]:border-warning-border data-[type=info]:border-info-border",
  content: "flex min-w-0 flex-1 flex-col gap-0.5",
  title: "font-medium leading-snug",
  description: "text-fg-muted",
  icon: "mt-0.5 size-4 shrink-0",
  success: "[&_[data-icon]]:text-success",
  error: "[&_[data-icon]]:text-danger",
  warning: "[&_[data-icon]]:text-warning",
  info: "[&_[data-icon]]:text-info",
  actionButton:
    "ml-auto inline-flex h-7 shrink-0 items-center rounded-control bg-accent px-2.5 text-xs font-medium text-fg-on-accent hover:bg-accent-hover focus-ring",
  cancelButton:
    "inline-flex h-7 shrink-0 items-center rounded-control border border-border-strong px-2.5 text-xs font-medium text-fg hover:bg-bg-hover focus-ring",
  closeButton:
    "absolute -right-2 -top-2 inline-flex size-5 items-center justify-center rounded-full border border-border bg-bg-raised text-fg-muted hover:text-fg focus-ring",
};
