"use client";
/**
 * HeroWaves — WebGL wave field for hero backgrounds. Decorative; fills its positioned parent.
 * Colours come from --hx-waves-*; motion stops under prefers-reduced-motion (handled by the hex wrapper).
 * No recipe: styling is the vendored animation CSS plus tokens. Deps: react, lib/cn, vendor/hex-animations.
 */
import "../../../vendor/hex-animations/dist/animations.css";
import { HeroWaves as HexHeroWaves, type GradientWavesProps } from "../../../vendor/hex-animations/dist/main-page.js";
import { cn } from "../../../lib/cn";
import type { StyleProps } from "../../../lib/types";
import { useSkinKey } from "../use-skin-key";

export type HeroWavesProps = StyleProps & Partial<Omit<GradientWavesProps, "className">>;

export function HeroWaves({ className, ...wave }: HeroWavesProps) {
  const skin = useSkinKey();
  return (
    <div aria-hidden="true" data-part="hero-waves" className={cn("absolute inset-0 overflow-hidden", className)}>
      <HexHeroWaves key={skin} {...wave} />
    </div>
  );
}
