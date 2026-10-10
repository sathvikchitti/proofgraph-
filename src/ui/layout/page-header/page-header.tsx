"use client";
/** PageHeader — breadcrumbs, title, description, badges, actions and a tabs slot. Deps: react, lib/*, layout/breadcrumbs. */
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { ClassNames, StyleProps } from "../../lib/types";
import { Breadcrumbs, type BreadcrumbItem } from "../breadcrumbs";
import { pageHeaderRecipe } from "./page-header.recipe";

export interface PageHeaderProps extends StyleProps {
  title: ReactNode;
  description?: ReactNode;
  /** A trail (rendered with Breadcrumbs) or your own element. */
  breadcrumbs?: BreadcrumbItem[] | ReactNode;
  /** Next to the title, e.g. a status Badge. */
  meta?: ReactNode;
  /** Right side, e.g. Buttons. */
  actions?: ReactNode;
  /** Below the heading, e.g. <Tabs/>. */
  tabs?: ReactNode;
  /** Hairline under the tabs slot. */
  bordered?: boolean;
  classNames?: ClassNames<"root" | "title" | "description" | "actions">;
}

export function PageHeader({ title, description, breadcrumbs, meta, actions, tabs, bordered = false, className, classNames }: PageHeaderProps) {
  const r = useRecipe("pageHeader", pageHeaderRecipe);
  return (
    <header className={cn(r.root({ bordered: bordered && !!tabs }), className, classNames?.root)}>
      {Array.isArray(breadcrumbs) ? <Breadcrumbs items={breadcrumbs as BreadcrumbItem[]} /> : breadcrumbs}
      <div className={r.top()}>
        <div className={r.heading()}>
          <div className={r.titleRow()}>
            <h1 className={cn(r.title(), classNames?.title)}>{title}</h1>
            {meta}
          </div>
          {description ? <p className={cn(r.description(), classNames?.description)}>{description}</p> : null}
        </div>
        {actions ? <div className={cn(r.actions(), classNames?.actions)}>{actions}</div> : null}
      </div>
      {tabs ? <div className={r.tabs()}>{tabs}</div> : null}
    </header>
  );
}
