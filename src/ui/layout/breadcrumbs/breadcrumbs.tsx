"use client";
/**
 * Breadcrumbs — trail with the current page last. Long trails collapse the middle into a "…" menu
 * (`maxItems`); labels truncate. Deps: react, lucide-react, lib/*, ui/dropdown-menu, ui/button.
 */
import { ChevronRight, MoreHorizontal } from "lucide-react";
import { Fragment, type MouseEvent, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { StyleProps } from "../../lib/types";
import { DropdownMenu } from "../../ui/dropdown-menu";
import { breadcrumbsRecipe } from "./breadcrumbs.recipe";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: (e: MouseEvent) => void;
}

export interface BreadcrumbsProps extends StyleProps {
  items: BreadcrumbItem[];
  /** Collapse the middle when there are more than this many items (first and last two stay). */
  maxItems?: number;
  separator?: ReactNode;
  label?: string;
  moreLabel?: string;
}

export function Breadcrumbs({ items, maxItems = 4, separator, label = "Breadcrumb", moreLabel = "Show hidden pages", className }: BreadcrumbsProps) {
  const r = useRecipe("breadcrumbs", breadcrumbsRecipe);
  const collapsed = items.length > maxItems;
  const head = collapsed ? items.slice(0, 1) : items;
  const hidden = collapsed ? items.slice(1, items.length - 2) : [];
  const tail = collapsed ? items.slice(items.length - 2) : [];
  const sep = <span aria-hidden>{separator ?? <ChevronRight className={r.separator()} />}</span>;
  const lastIndex = items.length - 1;

  const crumb = (item: BreadcrumbItem, index: number) => {
    const isLast = index === lastIndex;
    return (
      <li key={`${item.label}-${index}`} className={r.item()}>
        {isLast ? (
          <span aria-current="page" className={r.current()}>
            {item.label}
          </span>
        ) : (
          <a href={item.href} onClick={item.onClick} className={r.link()}>
            {item.label}
          </a>
        )}
        {!isLast ? sep : null}
      </li>
    );
  };

  return (
    <nav aria-label={label} className={className}>
      <ol className={cn(r.list())}>
        {head.map((it, i) => crumb(it, i))}
        {collapsed ? (
          <Fragment>
            <li className={r.item()}>
              <DropdownMenu
                aria-label={moreLabel}
                trigger={
                  <button type="button" className={r.more()} aria-label={moreLabel}>
                    <MoreHorizontal className="size-4" aria-hidden />
                  </button>
                }
                items={hidden.map((h) => ({ label: h.label, href: h.href, onSelect: h.onClick ? () => h.onClick?.({} as MouseEvent) : undefined }))}
              />
              {sep}
            </li>
            {tail.map((it, i) => crumb(it, items.length - 2 + i))}
          </Fragment>
        ) : null}
      </ol>
    </nav>
  );
}
