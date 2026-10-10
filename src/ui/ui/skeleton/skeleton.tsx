"use client";
/** Skeleton — loading placeholder. Deps: react, lib/cn, lib/skin. Announces `label` to assistive tech; an empty label makes it purely decorative. */
import type { CSSProperties } from "react";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { StyleProps } from "../../lib/types";
import { skeletonRecipe } from "./skeleton.recipe";

export interface SkeletonProps extends StyleProps {
  shape?: "line" | "rect" | "circle";
  /** Number of text lines (shape "line" only). The last line is shorter. */
  lines?: number;
  width?: number | string;
  height?: number | string;
  label?: string;
}

export function Skeleton({ shape = "line", lines = 1, width, height, label = "Loading", className }: SkeletonProps) {
  const r = useRecipe("skeleton", skeletonRecipe);
  const style: CSSProperties = { width, height };
  if (shape === "line" && lines > 1) {
    return (
      <div role={label ? "status" : undefined} aria-hidden={label ? undefined : true} aria-busy={label ? true : undefined} className={cn(r.stack(), className)}>
        {label ? <span className="sr-only">{label}</span> : null}
        {Array.from({ length: lines }, (_, i) => (
          <span key={i} aria-hidden className={r.root({ shape })} style={i === lines - 1 ? { width: "60%" } : undefined} />
        ))}
      </div>
    );
  }
  if (!label) return <span aria-hidden className={cn(r.root({ shape }), className)} style={style} />;
  return (
    <span role="status" aria-busy="true" className="contents">
      <span className="sr-only">{label}</span>
      <span aria-hidden className={cn(r.root({ shape }), className)} style={style} />
    </span>
  );
}
