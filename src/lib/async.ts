import type { UseQueryResult } from "@tanstack/react-query";
import type { AsyncQuery } from "../ui/ui/async-boundary";

/** Adapts a TanStack query to AsyncBoundary's contract (loading, error, empty, refetching, retry). */
export function asyncQuery(q: Pick<UseQueryResult<unknown>, "isPending" | "error" | "isRefetching" | "refetch">, isEmpty = false): AsyncQuery {
  return { isLoading: q.isPending, error: q.error ?? undefined, isEmpty, isRefetching: q.isRefetching && !q.isPending, onRetry: () => void q.refetch() };
}
