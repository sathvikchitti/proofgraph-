"use client";
/** PaperGrain — decorative paper texture overlay. Deps: react, lib/cn, lib/skin. */
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { StyleProps } from "../../lib/types";
import { paperGrainRecipe } from "./paper-grain.recipe";

export interface PaperGrainProps extends StyleProps {
  /** Cover the viewport (default) or fill the nearest positioned parent. */
  fixed?: boolean;
}

export function PaperGrain({ fixed = true, className }: PaperGrainProps) {
  const recipe = useRecipe("paperGrain", paperGrainRecipe);
  return <div aria-hidden="true" data-part="paper-grain" className={cn(recipe({ fixed }), className)} />;
}
