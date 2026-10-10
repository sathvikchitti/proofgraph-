/** useDebounce — debounced copy of a value, and a debounced callback. Deps: react. */
import { useEffect, useRef, useState } from "react";

export function useDebounce<T>(value: T, delayMs = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

/** Calls `fn` after `delayMs` of quiet; the latest `fn` is always used. Pending calls are cancelled on unmount. */
export function useDebouncedCallback<A extends unknown[]>(fn: (...args: A) => void, delayMs = 250) {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (...args: A) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fnRef.current(...args), delayMs);
  };
}
