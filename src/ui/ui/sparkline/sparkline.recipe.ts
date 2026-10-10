import { cva } from "class-variance-authority";

export const sparklineRecipe = {
  root: cva("relative inline-block h-8 w-24 align-middle"),
  svg: cva("size-full overflow-visible"),
  line: cva("fill-none stroke-(--t) [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:var(--chart-line-width)] [vector-effect:non-scaling-stroke]"),
  area: cva("fill-(--t) stroke-none [fill-opacity:var(--chart-area-opacity)]"),
  last: cva("absolute size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--t) ring-2 ring-bg-raised"),
};
