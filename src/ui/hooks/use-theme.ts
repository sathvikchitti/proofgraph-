/** useTheme — light | dark | system, persisted, applied as data-theme on <html>. Deps: react. */
import { useSyncExternalStore } from "react";

export type ThemeMode = "light" | "dark" | "system";
const KEY = "ui-theme";
const listeners = new Set<() => void>();

function read(): ThemeMode {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

let current: ThemeMode = typeof window === "undefined" ? "system" : read();

function apply(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (mode === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", mode);
}
apply(current);

export function setTheme(mode: ThemeMode) {
  current = mode;
  try {
    if (mode === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, mode);
  } catch {
    /* storage unavailable: still apply for this page view */
  }
  apply(mode);
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function systemPrefersDark() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, () => current, () => "system" as ThemeMode);
  const resolvedTheme: "light" | "dark" = theme === "system" ? (systemPrefersDark() ? "dark" : "light") : theme;
  return { theme, resolvedTheme, setTheme };
}
