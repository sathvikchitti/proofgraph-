/**
 * useLocalStorage — JSON value persisted in localStorage; safe when storage is blocked or unavailable
 * (private windows, SSR), synced across tabs and hook instances. A `null` key keeps the value in memory only.
 * Deps: react.
 */
import { useCallback, useMemo, useState, useSyncExternalStore } from "react";

const listeners = new Map<string, Set<() => void>>();
const notify = (key: string) => listeners.get(key)?.forEach((l) => l());

function readRaw(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function useLocalStorage<T>(key: string | null, initial: T) {
  const [memory, setMemory] = useState<T>(initial);
  const subscribe = useCallback(
    (cb: () => void) => {
      if (!key) return () => {};
      let set = listeners.get(key);
      if (!set) listeners.set(key, (set = new Set()));
      set.add(cb);
      const onStorage = (e: StorageEvent) => {
        if (e.key === key) cb();
      };
      window.addEventListener("storage", onStorage);
      return () => {
        set.delete(cb);
        window.removeEventListener("storage", onStorage);
      };
    },
    [key],
  );
  const raw = useSyncExternalStore(
    subscribe,
    () => (key ? readRaw(key) : null),
    () => null,
  );

  const stored = useMemo<T>(() => {
    if (raw === null) return initial;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return initial;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw]);

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      if (!key) return setMemory((prev) => (typeof next === "function" ? (next as (p: T) => T)(prev) : next));
      const prevRaw = readRaw(key);
      let prev = initial;
      try {
        if (prevRaw !== null) prev = JSON.parse(prevRaw) as T;
      } catch {
        /* keep initial */
      }
      const value = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        /* storage blocked: the change is dropped for this session */
      }
      notify(key);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );
  const remove = useCallback(() => {
    if (!key) return setMemory(initial);
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
    notify(key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [key ? stored : memory, set, remove] as const;
}
