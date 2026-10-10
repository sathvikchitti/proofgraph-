"use client";
/** ErrorState — failure with retry. Accepts any thrown value (`{detail}` API errors included). Deps: react, lucide-react, lib/*, ui/button. */
import { AlertTriangle, RotateCw } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { normalizeError } from "../../lib/errors";
import { useRecipe } from "../../lib/skin";
import type { ClassNames, Size, StyleProps } from "../../lib/types";
import { Button } from "../button";
import { errorStateRecipe } from "./error-state.recipe";

export interface ErrorStateProps extends StyleProps {
  /** Anything thrown; normalised for the message and status. */
  error?: unknown;
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  onRetry?: () => void;
  retrying?: boolean;
  retryLabel?: string;
  /** Extra actions beside Retry. */
  actions?: ReactNode;
  /** Show the error's technical detail line. */
  showDetail?: boolean;
  size?: Size;
  bordered?: boolean;
  classNames?: ClassNames<"root" | "icon" | "title" | "description" | "actions">;
}

export function ErrorState({
  error,
  title = "Something went wrong",
  description,
  icon,
  onRetry,
  retrying = false,
  retryLabel = "Try again",
  actions,
  showDetail = false,
  size = "md",
  bordered = false,
  className,
  classNames,
}: ErrorStateProps) {
  const r = useRecipe("errorState", errorStateRecipe);
  const err = error === undefined ? undefined : normalizeError(error);
  const message = description ?? err?.title;
  return (
    <div role="alert" className={cn(r.root({ size, bordered }), className, classNames?.root)}>
      <div className={cn(r.icon({ size }), classNames?.icon)} aria-hidden>
        {icon ?? <AlertTriangle />}
      </div>
      {err?.status ? <div className={r.status()}>{err.status}</div> : null}
      <div className={cn(r.title({ size }), classNames?.title)}>{title}</div>
      {message ? <p className={cn(r.description(), classNames?.description)}>{message}</p> : null}
      {showDetail && err?.detail ? <code className={r.detail()}>{err.detail}</code> : null}
      {onRetry || actions ? (
        <div className={cn(r.actions(), classNames?.actions)}>
          {onRetry ? (
            <Button variant="outline" size="sm" loading={retrying} leading={<RotateCw className="size-4" aria-hidden />} onClick={onRetry}>
              {retryLabel}
            </Button>
          ) : null}
          {actions}
        </div>
      ) : null}
    </div>
  );
}
