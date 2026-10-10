"use client";
/** Kbd — one key, or a combo via `keys`. Deps: react, lib/cn, lib/skin. */
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { Size, StyleProps } from "../../lib/types";
import { kbdRecipe } from "./kbd.recipe";

export interface KbdProps extends StyleProps {
  size?: Size;
  /** A combo, e.g. ["⌘", "K"]. Each entry becomes its own key cap. */
  keys?: string[];
  children?: ReactNode;
}

export function Kbd({ size = "md", keys, className, children }: KbdProps) {
  const r = useRecipe("kbd", kbdRecipe);
  if (keys?.length) {
    return (
      <span className={cn(r.group(), className)}>
        {keys.map((k, i) => (
          <kbd key={`${k}-${i}`} className={r.kbd({ size })}>
            {k}
          </kbd>
        ))}
      </span>
    );
  }
  return <kbd className={cn(r.kbd({ size }), className)}>{children}</kbd>;
}
