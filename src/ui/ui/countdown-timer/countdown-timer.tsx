"use client";
/**
 * CountdownTimer — mm:ss with warning/danger phases, pause, onExpire and screen-reader milestones.
 * The ticking digits are not announced; a polite live region announces only the milestones and expiry.
 * Deps: react, lucide-react, lib/*, hooks/use-countdown, hooks/use-controllable-state.
 */
import { Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "../../lib/cn";
import { formatDuration } from "../../lib/format";
import { useRecipe } from "../../lib/skin";
import type { ClassNames, Size, StyleProps, Tone } from "../../lib/types";
import { useControllableState } from "../../hooks/use-controllable-state";
import { useCountdown } from "../../hooks/use-countdown";
import { countdownTimerRecipe } from "./countdown-timer.recipe";

const PHASE_TONE: Record<"normal" | "warning" | "danger", Tone> = { normal: "neutral", warning: "warning", danger: "danger" };

export interface CountdownTimerProps extends StyleProps {
  durationMs: number;
  size?: Size;
  autoStart?: boolean;
  /** Remaining ms at which the phase turns warning / danger. */
  warnAtMs?: number;
  dangerAtMs?: number;
  /** Shows a pause/resume control. */
  pausable?: boolean;
  paused?: boolean;
  defaultPaused?: boolean;
  onPausedChange?: (paused: boolean) => void;
  onExpire?: () => void;
  onTick?: (remainingMs: number) => void;
  showBar?: boolean;
  label?: string;
  /** Remaining-time marks (ms) announced to screen readers. */
  milestones?: number[];
  announce?: (remainingMs: number) => string;
  expiredLabel?: string;
  pauseLabel?: string;
  resumeLabel?: string;
  classNames?: ClassNames<"root" | "time" | "bar" | "label">;
}

const defaultAnnounce = (ms: number) => {
  const s = Math.round(ms / 1000);
  return s >= 60 ? `${Math.round(s / 60)} ${Math.round(s / 60) === 1 ? "minute" : "minutes"} remaining` : `${s} seconds remaining`;
};

export function CountdownTimer({
  durationMs,
  size = "md",
  autoStart = true,
  warnAtMs,
  dangerAtMs,
  pausable = false,
  paused,
  defaultPaused = false,
  onPausedChange,
  onExpire,
  onTick,
  showBar = true,
  label,
  milestones = [300_000, 60_000, 30_000, 10_000],
  announce = defaultAnnounce,
  expiredLabel = "Time is up",
  pauseLabel = "Pause timer",
  resumeLabel = "Resume timer",
  className,
  classNames,
}: CountdownTimerProps) {
  const r = useRecipe("countdownTimer", countdownTimerRecipe);
  const [message, setMessage] = useState("");
  const [isPaused, setPaused] = useControllableState({ value: paused, defaultValue: defaultPaused, onChange: onPausedChange });
  const cd = useCountdown({
    durationMs,
    autoStart: autoStart && !defaultPaused,
    warnAtMs,
    dangerAtMs,
    milestones,
    onMilestone: (ms) => setMessage(announce(ms)),
    onExpire: () => {
      setMessage(expiredLabel);
      onExpire?.();
    },
  });

  const { pause, resume, status, remainingMs } = cd;
  useEffect(() => {
    if (status === "running" && isPaused) pause();
    else if (status === "paused" && !isPaused) resume();
    else if (status === "idle" && !isPaused && autoStart) cd.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused, status]);
  useEffect(() => onTick?.(remainingMs), [remainingMs, onTick]);

  const expired = status === "expired";
  const tone = expired ? "danger" : PHASE_TONE[cd.phase];

  return (
    <div data-tone={tone} className={cn(r.root(), className, classNames?.root)}>
      {label ? <span className={cn(r.label(), classNames?.label)}>{label}</span> : null}
      <div className={r.row()}>
        <div role="timer" aria-label={label ?? "Time remaining"} className={cn(r.time({ size }), classNames?.time)}>
          <span aria-hidden>{formatDuration(Math.ceil(remainingMs / 1000) * 1000)}</span>
          <span className="sr-only">{expired ? expiredLabel : formatDuration(Math.ceil(remainingMs / 1000) * 1000)}</span>
        </div>
        {pausable && !expired ? (
          <button type="button" className={r.control()} aria-label={isPaused ? resumeLabel : pauseLabel} aria-pressed={isPaused} onClick={() => setPaused(!isPaused)}>
            {isPaused ? <Play className="size-4" aria-hidden /> : <Pause className="size-4" aria-hidden />}
          </button>
        ) : null}
      </div>
      {expired ? <span className={r.expired()}>{expiredLabel}</span> : null}
      {showBar ? (
        <div className={cn(r.bar(), classNames?.bar)} aria-hidden>
          <div className={r.barFill()} style={{ width: `${Math.max(0, Math.min(1, cd.progress)) * 100}%` }} />
        </div>
      ) : null}
      <span className="sr-only" role="status" aria-live="polite">
        {message}
      </span>
    </div>
  );
}
