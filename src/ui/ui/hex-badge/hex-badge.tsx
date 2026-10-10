"use client";
/** HexBadge — hexagonal icon badge. Decorative unless `label` is set. Deps: react, lib/cn, lib/skin. */
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { Size, StyleProps } from "../../lib/types";
import { hexBadgeRecipe } from "./hex-badge.recipe";

export interface HexBadgeProps extends StyleProps {
  size?: Size;
  /** Accessible name. Without it the badge is hidden from assistive technology. */
  label?: string;
  /** An icon (any single svg element). */
  children?: ReactNode;
}

export function HexBadge({ size = "md", label, className, children }: HexBadgeProps) {
  const r = useRecipe("hexBadge", hexBadgeRecipe);
  return (
    <span
      className={cn(r.root({ size }), className)}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    >
      <span className={r.icon()}>{children}</span>
    </span>
  );
}
