/**
 * The API entry point. Pages and hooks import `api` from here and never choose a client themselves.
 * NEXT_PUBLIC_API_MODE=mock (default) uses fixtures; live uses the HTTP client and the /api rewrite.
 */
import { API_MODE, type ApiMode } from "../config";
import { liveApi } from "./client";
import { createMockApi } from "./mock-client";
import type { Api } from "./types";

export function createApi(mode: ApiMode): Api {
  return mode === "live" ? liveApi : createMockApi();
}

export const api: Api = createApi(API_MODE);

export { ApiError, isApiError } from "./errors";
export type { Api } from "./types";
export * from "./schemas";
export * from "./evidence-schemas";
export * from "./product-schemas";
export { scanStreamUrl } from "./client";
