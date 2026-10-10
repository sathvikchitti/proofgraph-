"use client";
/**
 * DotFieldBackground — canvas dot grid that bulges away from the cursor. Decorative; fills its positioned parent.
 * Colours come from --hx-dots-*; the grid holds still under prefers-reduced-motion.
 * No recipe: styling is the vendored animation CSS plus tokens. Deps: react, lib/cn, vendor/hex-animations.
 */
import "../../../vendor/hex-animations/dist/animations.css";
import { DotFieldBackground as HexDotField, type DotFieldProps } from "../../../vendor/hex-animations/dist/main-page.js";
import { cn } from "../../../lib/cn";
import type { StyleProps } from "../../../lib/types";
import { useSkinKey } from "../use-skin-key";

export type DotFieldBackgroundProps = StyleProps & Partial<Omit<DotFieldProps, "className">>;

export function DotFieldBackground({ className, ...dots }: DotFieldBackgroundProps) {
  const skin = useSkinKey();
  return (
    <div aria-hidden="true" data-part="dot-field" className={cn("absolute inset-0 overflow-hidden", className)}>
      <HexDotField key={skin} {...dots} />
    </div>
  );
}
