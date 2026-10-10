"use client";
/** Timeline — time, title, tone, icon. Vertical, with loading and empty states. Deps: react, lib/cn, lib/skin, ui/skeleton. */
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { ClassNames, StyleProps, Tone } from "../../lib/types";
import { Skeleton } from "../skeleton";
import { timelineRecipe } from "./timeline.recipe";

export interface TimelineItem {
  id: string;
  title: ReactNode;
  /** Pre-formatted text, or a Date/ISO string passed through `formatTime`. */
  time?: ReactNode;
  description?: ReactNode;
  tone?: Tone;
  icon?: ReactNode;
  /** Extra content under the description (links, badges). */
  extra?: ReactNode;
}

export interface TimelineProps extends StyleProps {
  items: TimelineItem[];
  variant?: "dot" | "icon";
  /** Newest first. */
  reverse?: boolean;
  loading?: boolean;
  loadingRows?: number;
  emptyLabel?: ReactNode;
  loadingLabel?: string;
  "aria-label"?: string;
  classNames?: ClassNames<"root" | "item" | "title" | "time" | "description">;
}

export function Timeline({
  items,
  variant = "dot",
  reverse = false,
  loading = false,
  loadingRows = 3,
  emptyLabel = "No activity yet.",
  loadingLabel = "Loading",
  className,
  classNames,
  "aria-label": ariaLabel,
}: TimelineProps) {
  const r = useRecipe("timeline", timelineRecipe);
  if (loading) {
    return (
      <div className={cn("flex flex-col", className)} aria-busy="true">
        {Array.from({ length: loadingRows }, (_, i) => (
          <div key={i} className={r.skeleton()}>
            <Skeleton shape="circle" width={24} height={24} label={i === 0 ? loadingLabel : ""} />
            <div className="flex-1">
              <Skeleton lines={2} label="" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (items.length === 0) return <p className={cn("text-sm text-fg-muted", className)}>{emptyLabel}</p>;
  const list = reverse ? [...items].reverse() : items;
  return (
    <ol aria-label={ariaLabel} className={cn(r.root(), className, classNames?.root)}>
      {list.map((it) => (
        <li key={it.id} data-tone={it.tone ?? "neutral"} className={cn(r.item(), classNames?.item)}>
          <span className={r.marker({ variant })} aria-hidden>
            {variant === "icon" && it.icon ? it.icon : <span className={r.dot()} />}
          </span>
          <div className={r.body()}>
            <div className={r.head()}>
              <span className={cn(r.title(), classNames?.title)}>{it.title}</span>
              {it.time ? <span className={cn(r.time(), classNames?.time)}>{it.time}</span> : null}
            </div>
            {it.description ? <div className={cn(r.description(), classNames?.description)}>{it.description}</div> : null}
            {it.extra ? <div className="mt-1">{it.extra}</div> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
