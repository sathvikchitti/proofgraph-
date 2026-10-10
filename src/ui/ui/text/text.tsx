"use client";
/** Text — body copy on the type scale. Deps: react, radix-ui (Slot), lib/cn, lib/skin. */
import type { HTMLAttributes } from "react";
import { Slot } from "radix-ui";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { AsChildProps, Tone } from "../../lib/types";
import { textRecipe } from "./text.recipe";

export interface TextProps extends HTMLAttributes<HTMLElement>, AsChildProps {
  as?: "p" | "span" | "div" | "label" | "small";
  size?: "xs" | "sm" | "md" | "lg";
  /** Foreground strength. */
  emphasis?: "default" | "muted" | "subtle";
  /** Status color; overrides emphasis. */
  tone?: Tone;
  weight?: "regular" | "medium" | "semibold";
  /** Code font (SHAs, ids). */
  mono?: boolean;
  /** Tabular numbers for aligned digits. */
  numeric?: boolean;
  truncate?: boolean;
}

export function Text({ as: Tag = "p", size, emphasis, tone, weight, mono, numeric, truncate, asChild, className, ...rest }: TextProps) {
  const recipe = useRecipe("text", textRecipe);
  const Comp = asChild ? Slot.Root : Tag;
  return (
    <Comp
      data-tone={tone}
      className={cn(recipe({ size, emphasis, colored: !!tone, weight, mono: !!mono, numeric: !!numeric, truncate: !!truncate }), className)}
      {...rest}
    />
  );
}
