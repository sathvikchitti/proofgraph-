"use client";
/** StatusDot — deps: react, lib/cn, lib/skin. Decorative unless `label` is given. */
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { Size, StyleProps, Tone } from "../../lib/types";
import { statusDotRecipe } from "./status-dot.recipe";

export interface StatusDotProps extends StyleProps {
  tone?: Tone;
  size?: Size;
  /** Animated ring for live states. Respects reduced motion. */
  pulse?: boolean;
  /** Accessible text, e.g. "Live". Omit for a purely decorative dot. */
  label?: string;
}

export function StatusDot({ tone = "neutral", size = "md", pulse = false, label, className }: StatusDotProps) {
  const recipe = useRecipe("statusDot", statusDotRecipe);
  return (
    <span
      data-tone={tone}
      className={cn(recipe({ size, pulse }), className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
