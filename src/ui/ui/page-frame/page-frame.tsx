"use client";
/** PageFrame (centered column framed by vertical guide lines) and GuideLine (hairline rule). Deps: react, lib/cn, lib/skin. */
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { StyleProps } from "../../lib/types";
import { pageFrameRecipe } from "./page-frame.recipe";

export interface PageFrameProps extends StyleProps {
  /** Landmark or plain container. */
  as?: "div" | "main" | "section";
  children?: ReactNode;
}

export function PageFrame({ as: Tag = "div", className, children }: PageFrameProps) {
  const r = useRecipe("pageFrame", pageFrameRecipe);
  return <Tag className={cn(r.frame(), className)}>{children}</Tag>;
}

export interface GuideLineProps extends StyleProps {
  orientation?: "horizontal" | "vertical";
  dashed?: boolean;
}

/** Decorative. A vertical line is absolutely positioned: place it in a relative parent and set `left`/`right` via className. */
export function GuideLine({ orientation = "horizontal", dashed = false, className }: GuideLineProps) {
  const r = useRecipe("pageFrame", pageFrameRecipe);
  return <div aria-hidden="true" data-orientation={orientation} className={cn(r.line({ orientation, dashed }), className)} />;
}
