"use client";
/** List / ListItem — leading, title, meta, trailing actions; loading and empty states. Deps: react, lib/cn, lib/skin, ui/skeleton. */
import type { MouseEventHandler, ReactNode } from "react";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { ClassNames, StyleProps } from "../../lib/types";
import { Skeleton } from "../skeleton";
import { listRecipe } from "./list.recipe";

export interface ListProps extends StyleProps {
  children?: ReactNode;
  variant?: "plain" | "card";
  divided?: boolean;
  loading?: boolean;
  /** Rows to show while loading. */
  loadingRows?: number;
  /** Shown instead of the children when `isEmpty`. */
  empty?: ReactNode;
  isEmpty?: boolean;
  loadingLabel?: string;
  "aria-label"?: string;
}

export function List({ children, variant, divided, loading = false, loadingRows = 4, empty, isEmpty = false, loadingLabel = "Loading", className, "aria-label": ariaLabel }: ListProps) {
  const r = useRecipe("list", listRecipe);
  if (isEmpty && !loading && empty) return <div className={cn(r.root({ variant, divided: false }), className)}>{empty}</div>;
  return (
    <ul className={cn(r.root({ variant, divided }), className)} aria-label={ariaLabel} aria-busy={loading || undefined}>
      {loading
        ? Array.from({ length: loadingRows }, (_, i) => (
            <li key={i} className={r.skeletonRow()}>
              <Skeleton shape="circle" width={32} height={32} label={i === 0 ? loadingLabel : ""} />
              <div className="flex-1">
                <Skeleton lines={2} label="" />
              </div>
            </li>
          ))
        : children}
    </ul>
  );
}

export interface ListItemProps extends StyleProps {
  leading?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  trailing?: ReactNode;
  /** Makes the row a link. */
  href?: string;
  /** Makes the row a button. */
  onClick?: MouseEventHandler<HTMLElement>;
  selected?: boolean;
  /** Dot before the title. */
  unread?: boolean;
  unreadLabel?: string;
  classNames?: ClassNames<"row" | "title" | "description" | "meta" | "trailing">;
}

export function ListItem({ leading, title, description, meta, trailing, href, onClick, selected = false, unread = false, unreadLabel = "Unread", className, classNames }: ListItemProps) {
  const r = useRecipe("list", listRecipe);
  const interactive = !!(href || onClick);
  const rowClass = cn(r.row({ interactive, selected }), classNames?.row);
  const inner = (
    <>
      {leading ? <span className={r.leading()}>{leading}</span> : null}
      <span className={r.body()}>
        <span className={cn("block", r.title(), classNames?.title)}>
          {unread ? (
            <>
              <span className={r.unread()} aria-hidden />
              <span className="sr-only">{unreadLabel}: </span>
            </>
          ) : null}
          {title}
        </span>
        {description ? <span className={cn("block", r.description(), classNames?.description)}>{description}</span> : null}
      </span>
      {meta ? <span className={cn(r.meta(), classNames?.meta)}>{meta}</span> : null}
    </>
  );
  return (
    <li className={cn(r.item(), className)}>
      {/* trailing actions stay outside the link/button so they never nest interactive elements */}
      <div className="flex items-center">
        {href ? (
          <a href={href} aria-current={selected ? "true" : undefined} className={cn(rowClass, "flex-1")}>
            {inner}
          </a>
        ) : onClick ? (
          <button type="button" onClick={onClick} aria-pressed={selected || undefined} className={cn(rowClass, "flex-1")}>
            {inner}
          </button>
        ) : (
          <div className={cn(rowClass, "flex-1")}>{inner}</div>
        )}
        {trailing ? <div className={cn(r.trailing(), "pr-3", classNames?.trailing)}>{trailing}</div> : null}
      </div>
    </li>
  );
}
