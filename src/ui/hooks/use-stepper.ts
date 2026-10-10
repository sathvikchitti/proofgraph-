/**
 * useStepper — headless multi-step flow: current index, per-step status, async validation gate,
 * linear or free navigation. Deps: react, hooks/use-controllable-state.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useControllableState } from "./use-controllable-state";

export type StepStatus = "completed" | "current" | "upcoming" | "error";

/** true = valid; false = invalid; a string = invalid with that message. */
export type ValidationResult = boolean | string | void;

export interface UseStepperOptions<S extends { id: string }> {
  steps: S[];
  value?: number;
  defaultValue?: number;
  onValueChange?: (index: number) => void;
  /** Runs before moving forward from a step. */
  validate?: (step: S, index: number) => ValidationResult | Promise<ValidationResult>;
  /** Linear: later steps unlock only after earlier ones passed. Default true. */
  linear?: boolean;
}

export function useStepper<S extends { id: string }>({ steps, value, defaultValue = 0, onValueChange, validate, linear = true }: UseStepperOptions<S>) {
  const [current, setCurrent] = useControllableState({ value, defaultValue, onChange: onValueChange });
  const [completed, setCompleted] = useState<ReadonlySet<number>>(new Set());
  const [validating, setValidating] = useState(false);
  const [failure, setFailure] = useState<{ index: number; message?: string } | null>(null);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const last = steps.length - 1;
  const firstIncomplete = (() => {
    let i = 0;
    while (completed.has(i)) i++;
    return i;
  })();

  const canGoTo = useCallback((i: number) => i >= 0 && i <= last && (!linear || i <= current || i <= firstIncomplete), [linear, current, firstIncomplete, last]);

  const goTo = useCallback(
    (i: number) => {
      if (!canGoTo(i)) return false;
      setFailure(null);
      setCurrent(i);
      return true;
    },
    [canGoTo, setCurrent],
  );

  /** Validate the current step and advance. On the last step it validates and marks it complete, returning true. */
  const next = useCallback(async (): Promise<boolean> => {
    const step = steps[current];
    if (!step) return false;
    if (validate) {
      setValidating(true);
      let result: ValidationResult;
      try {
        result = await validate(step, current);
      } catch (e) {
        result = e instanceof Error ? e.message : false;
      }
      if (!alive.current) return false;
      setValidating(false);
      if (result === false || typeof result === "string") {
        setFailure({ index: current, message: typeof result === "string" ? result : undefined });
        return false;
      }
    }
    setFailure(null);
    setCompleted((prev) => new Set(prev).add(current));
    if (current < last) setCurrent(current + 1);
    return true;
  }, [steps, current, validate, last, setCurrent]);

  const back = useCallback(() => {
    if (current > 0) {
      setFailure(null);
      setCurrent(current - 1);
    }
  }, [current, setCurrent]);

  const reset = useCallback(() => {
    setCompleted(new Set());
    setFailure(null);
    setCurrent(0);
  }, [setCurrent]);

  const statusOf = (i: number): StepStatus => (failure?.index === i ? "error" : i === current ? "current" : completed.has(i) ? "completed" : "upcoming");

  return {
    current,
    step: steps[current],
    steps: steps.map((s, index) => ({ ...s, index, status: statusOf(index) })),
    isFirst: current === 0,
    isLast: current === last,
    progress: steps.length ? completed.size / steps.length : 0,
    validating,
    error: failure,
    canGoTo,
    goTo,
    next,
    back,
    reset,
  };
}
