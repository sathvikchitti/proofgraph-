"use client";
/**
 * SplitView — primary pane plus a resizable side panel (drag or arrow keys); stacks on mobile.
 * The handle is an accessible separator (Left/Right, Home/End). Size can persist via `persistKey`.
 * Deps: react, lib/*, hooks/use-controllable-state, hooks/use-local-storage.
 */
import { useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import { clamp } from "../../lib/format";
import { useRecipe } from "../../lib/skin";
import type { ClassNames, StyleProps } from "../../lib/types";
import { useControllableState } from "../../hooks/use-controllable-state";
import { useLocalStorage } from "../../hooks/use-local-storage";
import { splitViewRecipe } from "./split-view.recipe";

export interface SplitViewProps extends StyleProps {
  primary: ReactNode;
  secondary: ReactNode;
  side?: "left" | "right";
  /** Width of the side panel in px. */
  size?: number;
  defaultSize?: number;
  onSizeChange?: (size: number) => void;
  minSize?: number;
  maxSize?: number;
  /** Remember the size in localStorage under this key. */
  persistKey?: string;
  /** Accessible name of the resize handle. */
  handleLabel?: string;
  classNames?: ClassNames<"root" | "primary" | "secondary" | "handle">;
}

const STEP = 16;

export function SplitView({
  primary,
  secondary,
  side = "right",
  size,
  defaultSize = 320,
  onSizeChange,
  minSize = 200,
  maxSize = 640,
  persistKey,
  handleLabel = "Resize panel",
  className,
  classNames,
}: SplitViewProps) {
  const r = useRecipe("splitView", splitViewRecipe);
  const [stored, setStored] = useLocalStorage<number>(persistKey ?? null, defaultSize);
  const [current, setCurrent] = useControllableState({
    value: size,
    defaultValue: persistKey ? stored : defaultSize,
    onChange: (n) => {
      if (persistKey) setStored(n);
      onSizeChange?.(n);
    },
  });
  const value = size === undefined && persistKey ? stored : current;
  const root = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const limit = (n: number) => clamp(n, minSize, maxSize);
  const apply = (n: number) => {
    if (persistKey && size === undefined) setStored(limit(n));
    setCurrent(limit(n));
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDragging(true);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging || !root.current) return;
    const rect = root.current.getBoundingClientRect();
    apply(side === "right" ? rect.right - e.clientX : e.clientX - rect.left);
  };
  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    setDragging(false);
  };
  const onKeyDown = (e: KeyboardEvent) => {
    const grow = side === "right" ? "ArrowLeft" : "ArrowRight";
    const shrink = side === "right" ? "ArrowRight" : "ArrowLeft";
    const step = e.shiftKey ? STEP * 4 : STEP;
    if (e.key === grow) apply(value + step);
    else if (e.key === shrink) apply(value - step);
    else if (e.key === "Home") apply(minSize);
    else if (e.key === "End") apply(maxSize);
    else return;
    e.preventDefault();
  };

  const handle = (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={handleLabel}
      aria-valuenow={Math.round(limit(value))}
      aria-valuemin={minSize}
      aria-valuemax={maxSize}
      tabIndex={0}
      data-dragging={dragging || undefined}
      className={cn(r.handle(), "focus-ring", classNames?.handle)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={onKeyDown}
    >
      <span className={r.grip()} aria-hidden />
    </div>
  );

  return (
    <div ref={root} style={{ "--split-size": `${limit(value)}px` } as CSSProperties} className={cn(r.root({ side }), className, classNames?.root)}>
      {side === "left" ? (
        <>
          <div className={cn(r.secondary(), "order-2 md:order-none", classNames?.secondary)}>{secondary}</div>
          {handle}
          <div className={cn(r.primary(), "order-1 md:order-none", classNames?.primary)}>{primary}</div>
        </>
      ) : (
        <>
          <div className={cn(r.primary(), classNames?.primary)}>{primary}</div>
          {handle}
          <div className={cn(r.secondary(), classNames?.secondary)}>{secondary}</div>
        </>
      )}
    </div>
  );
}
