import { cva } from "class-variance-authority";

export const lineChartRecipe = {
  dot: cva("fill-bg-raised [stroke-width:var(--chart-line-width)]"),
};
