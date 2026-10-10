/** useMediaQuery — live match of a CSS media query; `defaultValue` is used on the server. Deps: react. */
import { useSyncExternalStore } from "react";

export function useMediaQuery(query: string, defaultValue = false): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mq = typeof window !== "undefined" ? window.matchMedia?.(query) : undefined;
      mq?.addEventListener?.("change", cb);
      return () => mq?.removeEventListener?.("change", cb);
    },
    () => (typeof window !== "undefined" && window.matchMedia ? window.matchMedia(query).matches : defaultValue),
    () => defaultValue,
  );
}
