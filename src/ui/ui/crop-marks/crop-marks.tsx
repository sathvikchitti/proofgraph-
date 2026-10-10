"use client";
/** CropMarks — corner brackets around a box. Deps: react, radix-ui (Slot), lib/cn, lib/skin. */
import type { ReactNode } from "react";
import { Slot } from "radix-ui";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { AsChildProps, Size, StyleProps } from "../../lib/types";
import { cropMarksRecipe } from "./crop-marks.recipe";

export interface CropMarksProps extends StyleProps, AsChildProps {
  size?: Size;
  children?: ReactNode;
}

/** Wraps children in a div, or with `asChild` draws the marks on the single child element itself. */
export function CropMarks({ size = "md", asChild, className, children }: CropMarksProps) {
  const recipe = useRecipe("cropMarks", cropMarksRecipe);
  const Comp = asChild ? Slot.Root : "div";
  return <Comp className={cn(recipe({ size }), className)}>{children}</Comp>;
}
