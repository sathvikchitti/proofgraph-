"use client";
/**
 * Stepper (indicator) and Wizard (indicator + panel + Back/Next/Finish with a validation gate).
 * Deps: react, lucide-react, lib/*, hooks/use-stepper, ui/button, ui/alert.
 */
import { Check, X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { ClassNames, Size, StyleProps } from "../../lib/types";
import { useStepper, type StepStatus, type ValidationResult } from "../../hooks/use-stepper";
import { Alert } from "../alert";
import { Button } from "../button";
import { stepperRecipe } from "./stepper.recipe";

export interface StepperStep {
  id: string;
  label: ReactNode;
  description?: ReactNode;
  optional?: boolean;
  status?: StepStatus;
}

export interface StepperProps extends StyleProps {
  steps: StepperStep[];
  /** Index of the current step. */
  current: number;
  orientation?: "horizontal" | "vertical";
  size?: Size;
  /** Makes reachable steps clickable. */
  onStepClick?: (index: number) => void;
  canGoTo?: (index: number) => boolean;
  optionalLabel?: string;
  /** Accessible name of the list. */
  label?: string;
  classNames?: ClassNames<"root" | "item" | "marker" | "label">;
}

export function Stepper({ steps, current, orientation = "horizontal", size = "md", onStepClick, canGoTo, optionalLabel = "Optional", label = "Progress", className, classNames }: StepperProps) {
  const r = useRecipe("stepper", stepperRecipe);
  return (
    <ol aria-label={label} className={cn(r.root({ orientation }), className, classNames?.root)}>
      {steps.map((s, i) => {
        const status: StepStatus = s.status ?? (i === current ? "current" : i < current ? "completed" : "upcoming");
        const clickable = !!onStepClick && i !== current && (canGoTo ? canGoTo(i) : true);
        const inner = (
          <>
            <span className={cn(r.marker({ size }), classNames?.marker)} aria-hidden>
              {status === "completed" ? <Check className="size-4" /> : status === "error" ? <X className="size-4" /> : i + 1}
            </span>
          </>
        );
        const text = (
          <span className={r.text({ orientation })}>
            <span className={cn(r.label(), classNames?.label)}>
              {s.label}
              {s.optional ? <span className={r.optional()}>({optionalLabel})</span> : null}
            </span>
            {s.description ? <span className={r.description()}>{s.description}</span> : null}
          </span>
        );
        const isLast = i === steps.length - 1;
        return (
          <li key={s.id} data-status={status} aria-current={status === "current" || status === "error" ? "step" : undefined} className={cn("group", r.item({ orientation }), classNames?.item)}>
            <div className={r.head({ orientation })}>
              {clickable ? (
                <button type="button" className={r.trigger({ orientation })} onClick={() => onStepClick?.(i)}>
                  {inner}
                </button>
              ) : (
                <span className={r.trigger({ orientation })}>{inner}</span>
              )}
              {!isLast ? <span aria-hidden className={r.connector({ orientation })} /> : null}
            </div>
            {text}
            <span className="sr-only">
              {status === "completed" ? ", completed" : status === "error" ? ", needs attention" : ""}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export interface WizardStep {
  id: string;
  label: ReactNode;
  description?: ReactNode;
  optional?: boolean;
  content: ReactNode;
  /** Gate for leaving this step forward: true/undefined = ok, false = blocked, string = blocked with message. */
  validate?: () => ValidationResult | Promise<ValidationResult>;
}

export interface WizardLabels {
  back: string;
  next: string;
  finish: string;
  stepOf: (index: number, total: number) => string;
  invalid: string;
}

const DEFAULT_LABELS: WizardLabels = {
  back: "Back",
  next: "Next",
  finish: "Finish",
  stepOf: (i, n) => `Step ${i} of ${n}`,
  invalid: "Please fix the issues on this step before continuing.",
};

export interface WizardProps extends StyleProps {
  steps: WizardStep[];
  value?: number;
  defaultValue?: number;
  onValueChange?: (index: number) => void;
  onFinish?: () => void | Promise<void>;
  orientation?: "horizontal" | "vertical";
  size?: Size;
  linear?: boolean;
  /** Shown in the footer while the final onFinish runs. */
  finishing?: boolean;
  labels?: Partial<WizardLabels>;
  classNames?: ClassNames<"root" | "panel" | "footer">;
}

export function Wizard({ steps, value, defaultValue, onValueChange, onFinish, orientation = "horizontal", size, linear = true, finishing = false, labels: labelOverrides, className, classNames }: WizardProps) {
  const r = useRecipe("stepper", stepperRecipe);
  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const s = useStepper<WizardStep>({ steps, value, defaultValue, onValueChange, linear, validate: (step) => step.validate?.() });
  const panel = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const stepIndex = s.current;
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    panel.current?.focus();
  }, [stepIndex]);

  const finish = async () => {
    if (await s.next()) await onFinish?.();
  };
  const busy = s.validating || finishing;
  const step = s.step;

  return (
    <div className={cn(r.wizard(), className, classNames?.root)}>
      <Stepper steps={s.steps} current={s.current} orientation={orientation} size={size} onStepClick={(i) => s.goTo(i)} canGoTo={s.canGoTo} />
      <div ref={panel} tabIndex={-1} role="group" aria-label={typeof step?.label === "string" ? step.label : undefined} className={cn(r.panel(), classNames?.panel)}>
        {s.error ? (
          <div className="mb-3">
            <Alert tone="danger">{s.error.message ?? labels.invalid}</Alert>
          </div>
        ) : null}
        {step?.content}
      </div>
      <div className={cn(r.footer(), classNames?.footer)}>
        <span className={r.progressText()}>{labels.stepOf(s.current + 1, steps.length)}</span>
        <div className="flex gap-2">
          <Button variant="outline" tone="neutral" disabled={s.isFirst || busy} onClick={s.back}>
            {labels.back}
          </Button>
          {s.isLast ? (
            <Button loading={busy} onClick={finish}>
              {labels.finish}
            </Button>
          ) : (
            <Button loading={s.validating} onClick={() => void s.next()}>
              {labels.next}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
