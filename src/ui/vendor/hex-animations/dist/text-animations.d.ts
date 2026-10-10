/* Type declarations for hex-ui's prebuilt dist (not part of hex-ui). */
import type { ComponentType, CSSProperties } from "react";

export interface StaggeredTextProps {
  text: string;
  as?: "p" | "span" | "div" | "h1" | "h2" | "h3" | "h4";
  className?: string;
  style?: CSSProperties;
  segmentBy?: "chars" | "words" | "lines";
  separator?: string;
  /** Milliseconds between segments. */
  delay?: number;
  /** Seconds per segment. */
  duration?: number;
  easing?: (t: number) => number;
  threshold?: number;
  rootMargin?: string;
  direction?: "top" | "bottom" | "left" | "right";
  blur?: boolean;
  staggerDirection?: "forward" | "reverse" | "center";
  respectReducedMotion?: boolean;
  exitOnScrollOut?: boolean;
  onAnimationComplete?: () => void;
  onExitComplete?: () => void;
}
export const StaggeredText: ComponentType<StaggeredTextProps>;
