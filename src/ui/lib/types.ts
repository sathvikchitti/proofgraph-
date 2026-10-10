/** Shared prop vocabulary (spec §3 rule 3). No runtime code. */
import type { Tone } from "./tone";

export type Size = "sm" | "md" | "lg";
export type { Tone };

/** Per-part class overrides for multi-part elements: `classNames={{ root, header, … }}`. */
export type ClassNames<Part extends string> = Partial<Record<Part, string>>;

/** Props shared by most styled elements. */
export interface StyleProps {
  className?: string;
}

export interface AsChildProps {
  /** Render as the single child element instead of the default tag (Radix Slot). */
  asChild?: boolean;
}

export type Density = "comfortable" | "compact";
