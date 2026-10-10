"use client";
/** EmptyState — "nothing here yet" with an optional icon and actions. Deps: react, lib/cn, lib/skin. */
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { ClassNames, Size, StyleProps } from "../../lib/types";
import { emptyStateRecipe } from "./empty-state.recipe";

export interface EmptyStateProps extends StyleProps {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  /** Primary action, e.g. a Button. */
  action?: ReactNode;
  secondaryAction?: ReactNode;
  size?: Size;
  /** Dashed outline, for use inside a page instead of a card. */
  bordered?: boolean;
  classNames?: ClassNames<"root" | "icon" | "title" | "description" | "actions">;
}

export function EmptyState({ title, description, icon, action, secondaryAction, size = "md", bordered = false, className, classNames }: EmptyStateProps) {
  const r = useRecipe("emptyState", emptyStateRecipe);
  return (
    <div className={cn(r.root({ size, bordered }), className, classNames?.root)}>
      {icon ? (
        <div className={cn(r.icon({ size }), classNames?.icon)} aria-hidden>
          {icon}
        </div>
      ) : null}
      <div className={cn(r.title({ size }), classNames?.title)}>{title}</div>
      {description ? <p className={cn(r.description(), classNames?.description)}>{description}</p> : null}
      {action || secondaryAction ? (
        <div className={cn(r.actions(), classNames?.actions)}>
          {action}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  );
}
