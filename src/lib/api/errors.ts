/** Errors from the API layer. FastAPI reports failures as `{ "detail": string | [{ loc, msg, type }] }`. */
export class ApiError extends Error {
  readonly status: number;
  readonly detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/** Turns a FastAPI error body into one readable sentence. */
export function detailMessage(body: unknown, fallback: string): string {
  if (typeof body !== "object" || body === null || !("detail" in body)) return fallback;
  const { detail } = body as { detail: unknown };
  if (typeof detail === "string" && detail.trim()) return detail;
  if (Array.isArray(detail)) {
    const parts = detail
      .map((item) => {
        if (typeof item !== "object" || item === null) return null;
        const { loc, msg } = item as { loc?: unknown; msg?: unknown };
        if (typeof msg !== "string") return null;
        const path = Array.isArray(loc) ? loc.filter((p) => p !== "body").join(".") : "";
        return path ? `${path}: ${msg}` : msg;
      })
      .filter((p): p is string => p !== null);
    if (parts.length) return parts.join("; ");
  }
  return fallback;
}

/** Reads an error response without throwing, whatever the body is. */
export async function errorFromResponse(response: Response): Promise<ApiError> {
  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    /* not JSON: use the status text */
  }
  return new ApiError(response.status, detailMessage(body, response.statusText || `Request failed (${response.status})`));
}
