"use client";
/** VisuallyHidden — readable by assistive tech only. Deps: react, radix-ui (Slot), lib/cn, lib/skin. */
import type { HTMLAttributes } from "react";
import { Slot } from "radix-ui";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { AsChildProps } from "../../lib/types";
import { visuallyHiddenRecipe } from "./visually-hidden.recipe";

export function VisuallyHidden({ asChild, className, ...rest }: HTMLAttributes<HTMLSpanElement> & AsChildProps) {
  const recipe = useRecipe("visuallyHidden", visuallyHiddenRecipe);
  const Comp = asChild ? Slot.Root : "span";
  return <Comp className={cn(recipe, className)} {...rest} />;
}
