/** Error normalisation for ErrorState / AsyncBoundary / Toast. Handles `{detail}` API errors, Error, zod, strings. Deps: none. */

export interface NormalizedError {
  title: string;
  detail?: string;
  status?: number;
  /** Per-field messages when the error carries them (e.g. validation). */
  fields?: Record<string, string>;
}

export class AppError extends Error {
  status?: number;
  detail?: string;
  constructor(message: string, opts: { status?: number; detail?: string } = {}) {
    super(message);
    this.name = "AppError";
    this.status = opts.status;
    this.detail = opts.detail;
  }
}

type Json = Record<string, unknown>;
const isObject = (v: unknown): v is Json => typeof v === "object" && v !== null;

export function normalizeError(error: unknown, fallbackTitle = "Something went wrong"): NormalizedError {
  if (error == null) return { title: fallbackTitle };
  if (typeof error === "string") return { title: error };
  if (error instanceof AppError) return { title: error.message, detail: error.detail, status: error.status };

  if (isObject(error)) {
    const status = typeof error.status === "number" ? error.status : undefined;
    // FastAPI-style: { detail: "msg" } or { detail: [{ loc, msg }] }
    const detail = error.detail ?? (isObject(error.body) ? error.body.detail : undefined) ?? (isObject(error.data) ? error.data.detail : undefined);
    if (typeof detail === "string") return { title: detail, status };
    if (Array.isArray(detail)) {
      const fields: Record<string, string> = {};
      for (const item of detail) {
        if (isObject(item) && typeof item.msg === "string") {
          const loc = Array.isArray(item.loc) ? item.loc.filter((p) => p !== "body").join(".") : "";
          fields[loc || "_"] = item.msg;
        }
      }
      const first = Object.values(fields)[0];
      return { title: first ?? fallbackTitle, status, fields };
    }
    // zod-style: { issues: [{ path, message }] }
    if (Array.isArray(error.issues)) {
      const fields: Record<string, string> = {};
      for (const issue of error.issues) {
        if (isObject(issue) && typeof issue.message === "string") {
          const path = Array.isArray(issue.path) ? issue.path.join(".") : "";
          fields[path || "_"] = issue.message;
        }
      }
      return { title: Object.values(fields)[0] ?? fallbackTitle, fields };
    }
  }
  if (error instanceof Error) return { title: error.message || fallbackTitle, detail: error.name !== "Error" ? error.name : undefined };
  if (isObject(error) && typeof error.message === "string") return { title: error.message };
  return { title: fallbackTitle };
}
