"use client";
/**
 * ThoughtLine — an agent's "Thinking…" line: breathing glyph, shimmer, live timer and steps; settles into "Thought for 4.2s".
 * Colours come from --hx-thought-*. Set `working={false}` to settle. Reduced motion is handled inside.
 * No recipe: styling is the vendored animation CSS plus tokens. Deps: react, vendor/hex-animations.
 */
import "../../../vendor/hex-animations/dist/animations.css";
import { HxThoughtLine, type ThoughtLineProps as HexThoughtLineProps } from "../../../vendor/hex-animations/dist/micro-animations.js";
import { useSkinKey } from "../use-skin-key";

export type ThoughtLineProps = HexThoughtLineProps;

export function ThoughtLine(props: ThoughtLineProps) {
  const skin = useSkinKey();
  return <HxThoughtLine key={skin} {...props} />;
}
