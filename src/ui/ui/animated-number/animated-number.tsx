"use client";
/**
 * AnimatedNumber — eases between values. Sighted users see the animation; assistive tech hears only the
 * final value, announced politely when it changes. Deps: react, lib/cn, lib/skin, lib/format, hooks/use-animated-number.
 */
import { cn } from "../../lib/cn";
import { formatNumber } from "../../lib/format";
import { useRecipe } from "../../lib/skin";
import type { StyleProps } from "../../lib/types";
import { useAnimatedNumber } from "../../hooks/use-animated-number";
import { animatedNumberRecipe } from "./animated-number.recipe";

export interface AnimatedNumberProps extends StyleProps {
  value: number;
  format?: (value: number) => string;
  /** Decimal places for the default formatter. */
  precision?: number;
  durationMs?: number;
  animate?: boolean;
}

export function AnimatedNumber({ value, format, precision = 0, durationMs = 600, animate = true, className }: AnimatedNumberProps) {
  const recipe = useRecipe("animatedNumber", animatedNumberRecipe);
  const shown = useAnimatedNumber(value, { durationMs, animate });
  const fmt = format ?? ((n: number) => formatNumber(n, { minimumFractionDigits: precision, maximumFractionDigits: precision }));
  return (
    <span className={cn(recipe, className)}>
      <span aria-hidden>{fmt(shown)}</span>
      <span className="sr-only" role="status" aria-live="polite">
        {fmt(value)}
      </span>
    </span>
  );
}
