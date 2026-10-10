/** Development-only diagnostics that work under Vite (import.meta.env) and webpack/Next (process.env). */
function isDev(): boolean {
  try {
    const metaEnv = (import.meta as unknown as { env?: { DEV?: boolean } }).env;
    if (metaEnv && typeof metaEnv.DEV === "boolean") return metaEnv.DEV;
  } catch {
    /* not an ES-module bundler */
  }
  try {
    return typeof process !== "undefined" && process.env?.NODE_ENV !== "production";
  } catch {
    return false;
  }
}

/** console.warn once per message in development when `condition` is true. */
const seen = new Set<string>();
export function devWarn(condition: boolean, message: string) {
  if (!condition || !isDev() || seen.has(message)) return;
  seen.add(message);
  console.warn(`[ui] ${message}`);
}
