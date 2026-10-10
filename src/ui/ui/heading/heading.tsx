"use client";
/**
 * Heading — `level` picks the tag (h1–h6), `size` picks the look; they are independent.
 * The type scale needs five steps, so `size` goes beyond sm|md|lg here.
 * Deps: react, radix-ui (Slot), lib/cn, lib/skin.
 */
import type { HTMLAttributes } from "react";
import { Slot } from "radix-ui";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { AsChildProps } from "../../lib/types";
import { headingRecipe } from "./heading.recipe";

const DEFAULT_SIZE = { 1: "2xl", 2: "xl", 3: "lg", 4: "md", 5: "sm", 6: "sm" } as const;

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement>, AsChildProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  muted?: boolean;
}

export function Heading({ level = 2, size, muted = false, asChild, className, ...rest }: HeadingProps) {
  const recipe = useRecipe("heading", headingRecipe);
  const Tag = `h${level}` as const;
  const Comp = asChild ? Slot.Root : Tag;
  return <Comp className={cn(recipe({ size: size ?? DEFAULT_SIZE[level], muted }), className)} {...rest} />;
}
