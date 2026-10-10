"use client";
/**
 * StaggeredText — text that staggers in by letter, word or line when it scrolls into view. Inherits colour and type:
 * pass className (e.g. a DisplayHeading's classes). Screen readers get the whole sentence once. hex-ui's own implementation
 * of the React Bits Pro prop list. Deps: react, vendor/hex-animations.
 */
import "../../../vendor/hex-animations/dist/animations.css";
import { StaggeredText as HexStaggeredText, type StaggeredTextProps } from "../../../vendor/hex-animations/dist/text-animations.js";

export type { StaggeredTextProps };

export function StaggeredText(props: StaggeredTextProps) {
  return <HexStaggeredText {...props} />;
}
