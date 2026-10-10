"use client";
/**
 * AsyncBoundary — one place for loading / error / empty / content. Works with any query library:
 * pass `{ isLoading, error, isEmpty, onRetry }`. Deps: react, lib/cn, lib/skin, ui/skeleton, ui/error-state.
 */
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { StyleProps } from "../../lib/types";
import { ErrorState } from "../error-state";
import { Skeleton } from "../skeleton";
import { asyncBoundaryRecipe } from "./async-boundary.recipe";

export interface AsyncQuery {
  isLoading: boolean;
  error?: unknown;
  /** True when loaded successfully but there is nothing to show. */
  isEmpty?: boolean;
  /** True while refreshing data that is already on screen (dims the content, keeps it visible). */
  isRefetching?: boolean;
  onRetry?: () => void;
}

export interface AsyncBoundaryProps extends StyleProps {
  query: AsyncQuery;
  children: ReactNode;
  /** Shown while loading. Defaults to a three-line Skeleton. */
  skeleton?: ReactNode;
  empty?: ReactNode;
  /** Replace the default ErrorState. */
  errorState?: (error: unknown, retry?: () => void) => ReactNode;
  loadingLabel?: string;
}

export function AsyncBoundary({ query, children, skeleton, empty, errorState, loadingLabel = "Loading", className }: AsyncBoundaryProps) {
  const r = useRecipe("asyncBoundary", asyncBoundaryRecipe);
  const { isLoading, error, isEmpty, isRefetching, onRetry } = query;

  let body: ReactNode;
  if (error !== undefined && error !== null && error !== false) {
    body = errorState ? errorState(error, onRetry) : <ErrorState error={error} onRetry={onRetry} bordered />;
  } else if (isLoading) {
    body = skeleton ?? <Skeleton lines={3} label={loadingLabel} />;
  } else if (isEmpty && empty) {
    body = empty;
  } else {
    body = children;
  }
  return (
    <div className={cn(r.root({ refetching: !!isRefetching }), className)} aria-busy={isLoading || isRefetching || undefined}>
      {body}
    </div>
  );
}
