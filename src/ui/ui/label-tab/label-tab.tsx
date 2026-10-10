"use client";
/** LabelTab — mono caption tab that sits on top of a window (AppWindow squares its top-left corner after it). Deps: react, lib/cn, lib/skin. */
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { StyleProps } from "../../lib/types";
import { labelTabRecipe } from "./label-tab.recipe";

export interface LabelTabProps extends StyleProps {
  children?: ReactNode;
}

export function LabelTab({ className, children }: LabelTabProps) {
  const recipe = useRecipe("labelTab", labelTabRecipe);
  return (
    <div data-part="label-tab" className={cn(recipe(), className)}>
      {children}
    </div>
  );
}
