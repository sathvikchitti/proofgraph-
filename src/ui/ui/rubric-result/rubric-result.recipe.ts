import { cva } from "class-variance-authority";

export const rubricResultRecipe = {
  root: cva("flex min-w-0 flex-col gap-4"),
  overall: cva("flex items-center gap-4 rounded-(--card-radius) border border-(color:--t-border) bg-(--t-subtle) p-4"),
  overallScore: cva("tabular text-4xl font-semibold leading-none tracking-tight text-(color:--t-fg)"),
  overallMax: cva("text-base font-normal text-fg-muted"),
  overallLabel: cva("text-sm font-medium text-fg"),
  summary: cva("mt-0.5 text-sm text-fg-muted"),
  list: cva("m-0 flex list-none flex-col divide-y divide-border p-0"),
  criterion: cva("flex flex-col gap-1.5 py-3 first:pt-0"),
  criterionHead: cva("flex items-center justify-between gap-3"),
  criterionLabel: cva("text-sm font-medium text-fg"),
  scoreText: cva("tabular shrink-0 text-sm font-semibold text-(color:--t-fg)"),
  segments: cva("flex gap-1"),
  segment: cva("h-1.5 flex-1 rounded-pill bg-bg-active data-[filled=true]:bg-(--t)"),
  feedback: cva("text-sm text-fg-muted"),
  followUp: cva("rounded-(--card-radius) border border-dashed border-border-strong p-3"),
  followUpTitle: cva("mb-2 text-sm font-medium text-fg"),
};
