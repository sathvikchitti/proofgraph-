"use client";
/** Icon — size and tone wrapper for lucide icons. Deps: react, lucide-react (types), lib/cn, lib/skin. */
import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { Size, StyleProps, Tone } from "../../lib/types";
import { iconRecipe } from "./icon.recipe";

export interface IconProps extends StyleProps {
  icon: LucideIcon;
  size?: Size;
  tone?: Tone;
  /** Accessible name. Omitted = decorative (aria-hidden). */
  label?: string;
  strokeWidth?: number;
}

export function Icon({ icon: Glyph, size = "md", tone, label, strokeWidth = 1.75, className }: IconProps) {
  const r = useRecipe("icon", iconRecipe);
  return (
    <Glyph
      data-tone={tone}
      className={cn(r({ size, colored: !!tone }), className)}
      strokeWidth={strokeWidth}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
