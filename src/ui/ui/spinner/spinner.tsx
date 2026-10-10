"use client";
/** Spinner — deps: react, lib/cn, lib/skin. Without `label` it is decorative (aria-hidden). */
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { Size, StyleProps, Tone } from "../../lib/types";
import { spinnerRecipe } from "./spinner.recipe";

export interface SpinnerProps extends StyleProps {
  size?: Size;
  /** Colors the spinner with a tone; omitted it inherits the surrounding text color. */
  tone?: Tone;
  /** Accessible status text; when set the spinner becomes a status live region. */
  label?: string;
}

export function Spinner({ size = "md", tone, label, className }: SpinnerProps) {
  const r = useRecipe("spinner", spinnerRecipe);
  return (
    <span
      className={cn(r.root({ colored: !!tone }), className)}
      data-tone={tone}
      role={label ? "status" : undefined}
    >
      <svg viewBox="0 0 24 24" fill="none" className={r.svg({ size })} aria-hidden>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" className={r.track()} />
        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className={r.arc()} />
      </svg>
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  );
}
