"use client";
/** DisplayHeading — large expanded headline; wrap a phrase in <em> for the serif italic accent. Deps: react, lib/cn, lib/skin. */
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { Size, StyleProps } from "../../lib/types";
import { displayHeadingRecipe } from "./display-heading.recipe";

export interface DisplayHeadingProps extends StyleProps {
  /** Which heading level to render; size is independent. */
  as?: "h1" | "h2" | "h3";
  size?: Size;
  children: ReactNode;
}

export function DisplayHeading({ as: Tag = "h2", size = "md", className, children }: DisplayHeadingProps) {
  const recipe = useRecipe("displayHeading", displayHeadingRecipe);
  return <Tag className={cn(recipe({ size }), className)}>{children}</Tag>;
}
