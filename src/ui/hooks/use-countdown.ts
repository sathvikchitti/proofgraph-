/**
 * useCountdown — drift-free countdown (wall-clock based) with pause/resume, warning phases and
 * milestone callbacks for screen-reader announcements. Deps: react.
 */
import { useCallback, useEffect, useRef, useState } from "react";

export type CountdownPhase = "normal" | "warning" | "danger";
export type CountdownStatus = "idle" | "running" | "paused" | "expired";

export interface UseCountdownOptions {
  durationMs: number;
  autoStart?: boolean;
  tickMs?: number;
  warnAtMs?: number;
  dangerAtMs?: number;
  /** Remaining-time marks (ms) that fire `onMilestone` once as they are crossed downward. */
  milestones?: number[];
  onMilestone?: (remainingMs: number) => void;
  onExpire?: () => void;
}

export function useCountdown({ durationMs, autoStart = true, tickMs = 250, warnAtMs, dangerAtMs, milestones, onMilestone, onExpire }: UseCountdownOptions) {
  const [remaining, setRemaining] = useState(durationMs);
  const [status, setStatus] = useState<CountdownStatus>(autoStart && durationMs > 0 ? "running" : durationMs <= 0 ? "expired" : "idle");
  const endAt = useRef(Date.now() + durationMs);
  const left = useRef(durationMs);
  const fired = useRef(new Set<number>());
  const expiredFired = useRef(false);
  const cb = useRef({ onMilestone, onExpire, milestones });
  cb.current = { onMilestone, onExpire, milestones };

  const start = useCallback((fromMs?: number) => {
    const ms = fromMs ?? left.current;
    left.current = ms;
    endAt.current = Date.now() + ms;
    expiredFired.current = false;
    setRemaining(ms);
    setStatus(ms > 0 ? "running" : "expired");
  }, []);
  const pause = useCallback(() => {
    setStatus((s) => {
      if (s !== "running") return s;
      left.current = Math.max(0, endAt.current - Date.now());
      setRemaining(left.current);
      return "paused";
    });
  }, []);
  const resume = useCallback(() => {
    setStatus((s) => {
      if (s !== "paused") return s;
      endAt.current = Date.now() + left.current;
      return "running";
    });
  }, []);
  const reset = useCallback((nextDurationMs?: number) => {
    const ms = nextDurationMs ?? durationMs;
    left.current = ms;
    fired.current = new Set();
    expiredFired.current = false;
    setRemaining(ms);
    setStatus("idle");
  }, [durationMs]);
  const restart = useCallback((nextDurationMs?: number) => {
    fired.current = new Set();
    start(nextDurationMs ?? durationMs);
  }, [durationMs, start]);

  useEffect(() => {
    if (status !== "running") return;
    const tick = () => {
      const rem = Math.max(0, endAt.current - Date.now());
      left.current = rem;
      setRemaining(rem);
      for (const m of [...(cb.current.milestones ?? [])].sort((a, b) => b - a)) {
        if (rem <= m && !fired.current.has(m)) {
          fired.current.add(m);
          if (m < durationMs) cb.current.onMilestone?.(m);
        }
      }
      if (rem <= 0) {
        clearInterval(id);
        setStatus("expired");
        if (!expiredFired.current) {
          expiredFired.current = true;
          cb.current.onExpire?.();
        }
      }
    };
    const id = setInterval(tick, tickMs);
    return () => clearInterval(id);
  }, [status, tickMs, durationMs]);

  const phase: CountdownPhase = dangerAtMs !== undefined && remaining <= dangerAtMs ? "danger" : warnAtMs !== undefined && remaining <= warnAtMs ? "warning" : "normal";
  return { remainingMs: remaining, status, phase, progress: durationMs > 0 ? remaining / durationMs : 0, start, pause, resume, reset, restart };
}
