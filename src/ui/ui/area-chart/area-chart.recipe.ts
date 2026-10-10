import { cva } from "class-variance-authority";

export const areaChartRecipe = {
  area: cva("[fill-opacity:var(--chart-area-opacity)] [stroke-width:var(--chart-line-width)]"),
};
