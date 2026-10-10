"use client";
/** Arcs — concentric hairline arcs, a decorative backdrop for showcase layouts. Deps: react, lib/cn, lib/skin. */
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { StyleProps } from "../../lib/types";
import { arcsRecipe } from "./arcs.recipe";

/** Fills its nearest positioned parent; place content above it. */
export function Arcs({ className }: StyleProps) {
  const recipe = useRecipe("arcs", arcsRecipe);
  return <div aria-hidden="true" data-part="arcs" className={cn(recipe(), className)} />;
}
