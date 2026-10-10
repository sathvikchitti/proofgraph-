import { cva } from "class-variance-authority";

export const questionCardRecipe = {
  head: cva("flex items-start justify-between gap-3"),
  eyebrow: cva("tabular text-xs font-medium uppercase tracking-wide text-fg-muted"),
  prompt: cva("mt-1 text-lg font-semibold leading-snug text-fg"),
  hint: cva("mt-1 text-sm text-fg-muted"),
  timer: cva("shrink-0"),
  answer: cva("mt-4 flex flex-col gap-3"),
  choices: cva("flex flex-col gap-2"),
  choice: cva(
    "flex w-full cursor-pointer items-start gap-3 rounded-control border border-border-strong bg-bg-raised p-3 text-left text-sm transition-colors duration-(--dur-fast) hover:bg-bg-hover focus-ring data-[state=checked]:border-(color:--accent) data-[state=checked]:bg-accent-subtle data-[disabled]:cursor-not-allowed data-[disabled]:opacity-70 data-[verdict=correct]:border-(color:--success) data-[verdict=correct]:bg-success-subtle data-[verdict=incorrect]:border-(color:--danger) data-[verdict=incorrect]:bg-danger-subtle",
  ),
  radio: cva("mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-border-strong bg-bg-raised"),
  radioDot: cva("size-2 rounded-full bg-accent"),
  choiceText: cva("min-w-0 flex-1"),
  choiceDescription: cva("block text-xs text-fg-muted"),
  verdict: cva("shrink-0 text-xs font-medium"),
  result: cva("mt-4 rounded-control border border-(color:--t-border) bg-(--t-subtle) p-3 text-sm"),
  resultTitle: cva("flex items-center gap-1.5 font-medium text-(color:--t-fg)"),
  resultBody: cva("mt-1 text-fg"),
  actions: cva("mt-4 flex flex-wrap items-center justify-between gap-2"),
};
