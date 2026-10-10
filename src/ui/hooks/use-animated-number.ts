/** useAnimatedNumber — eases from the previous value to the next; instant under reduced motion. Deps: react. */
import { useEffect, useRef, useState } from "react";

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const prefersReducedMotion = () => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function useAnimatedNumber(target: number, { durationMs = 600, animate = true }: { durationMs?: number; animate?: boolean } = {}) {
  const [display, setDisplay] = useState(target);
  const from = useRef(target);
  const shown = useRef(target);
  shown.current = display;

  useEffect(() => {
    if (!animate || durationMs <= 0 || prefersReducedMotion() || typeof requestAnimationFrame === "undefined") {
      from.current = target;
      setDisplay(target);
      return;
    }
    let start: number | undefined;
    const origin = shown.current;
    from.current = origin;
    let raf = 0;
    const tick = (now: number) => {
      start ??= now;
      const t = Math.min(1, (now - start) / durationMs);
      setDisplay(origin + (target - origin) * easeOutCubic(t));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs, animate]);

  return display;
}
