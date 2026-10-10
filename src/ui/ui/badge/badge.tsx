"use client";
/** Badge — deps: react, radix-ui (Slot), lib/cn, lib/skin. */
import { forwardRef, type HTMLAttributes } from "react";
import { Slot } from "radix-ui";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { AsChildProps, Size, Tone } from "../../lib/types";
import { badgeRecipe } from "./badge.recipe";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, AsChildProps {
  variant?: "subtle" | "solid" | "outline";
  tone?: Tone;
  size?: Size;
  /** Leading status dot in the badge's color. */
  dot?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { variant, tone = "neutral", size, dot = false, asChild, className, children, ...rest },
  ref,
) {
  const r = useRecipe("badge", badgeRecipe);
  const Comp = asChild ? Slot.Root : "span";
  return (
    <Comp ref={ref} data-tone={tone} className={cn(r.badge({ variant, size }), className)} {...rest}>
      {asChild ? (
        children
      ) : (
        <>
          {dot ? <span className={r.dot()} aria-hidden /> : null}
          {children}
        </>
      )}
    </Comp>
  );
});
