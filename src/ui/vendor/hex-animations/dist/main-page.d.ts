/* Type declarations for hex-ui's prebuilt dist (not part of hex-ui). */
import type { ComponentType } from "react";

export interface GradientWavesProps {
  horizonColor?: string;
  waveColor?: string;
  crestColor?: string;
  speed?: number;
  amplitude?: number;
  waveScale?: number;
  waveRatio?: number;
  swell?: number;
  turbulence?: number;
  tilt?: number;
  zoom?: number;
  height?: number;
  fogDepth?: number;
  detail?: "low" | "medium" | "high";
  brightness?: number;
  opacity?: number;
  mouseInteraction?: boolean;
  parallaxStrength?: number;
  grain?: boolean;
  grainIntensity?: number;
  className?: string;
}
export const GradientWaves: ComponentType<GradientWavesProps>;
/** Theme-aware wrapper: colours from --hx-waves-* tokens. */
export const HeroWaves: ComponentType<Partial<GradientWavesProps>>;

export interface DotFieldProps {
  dotRadius?: number;
  dotSpacing?: number;
  bulgeStrength?: number;
  glowRadius?: number;
  sparkle?: boolean;
  waveAmplitude?: number;
  cursorRadius?: number;
  cursorForce?: number;
  gradientFrom?: string;
  gradientTo?: string;
  glowColor?: string;
  className?: string;
}
export const DotField: ComponentType<DotFieldProps>;
/** Theme-aware wrapper: colours from --hx-dots-* tokens. */
export const DotFieldBackground: ComponentType<Partial<DotFieldProps>>;
