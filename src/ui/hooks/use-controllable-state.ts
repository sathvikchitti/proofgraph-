/** useControllableState — value / defaultValue / onChange pattern (spec §3 rule 4). Deps: react. */
import { useCallback, useRef, useState } from "react";

export interface ControllableOptions<T> {
  value?: T;
  defaultValue: T;
  onChange?: (value: T) => void;
}

export function useControllableState<T>({ value, defaultValue, onChange }: ControllableOptions<T>) {
  const [inner, setInner] = useState<T>(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? (value as T) : inner;

  const latest = useRef({ current, controlled, onChange });
  latest.current = { current, controlled, onChange };

  const set = useCallback((next: T | ((prev: T) => T)) => {
    const { current: cur, controlled: isControlled, onChange: cb } = latest.current;
    const resolved = typeof next === "function" ? (next as (p: T) => T)(cur) : next;
    if (Object.is(resolved, cur)) return;
    if (!isControlled) setInner(resolved);
    cb?.(resolved);
  }, []);

  return [current, set, controlled] as const;
}
