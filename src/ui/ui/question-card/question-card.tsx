"use client";
/**
 * QuestionCard — prompt, answer slot (text / choice / custom e.g. voice), timer slot and a result state.
 * Deps: react, radix-ui (RadioGroup), lucide-react, lib/*, hooks/use-controllable-state, ui/card, ui/textarea, ui/button.
 */
import { CheckCircle2, CircleDashed, MinusCircle, XCircle } from "lucide-react";
import { useState, type ReactNode } from "react";
import { RadioGroup } from "radix-ui";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { ClassNames, StyleProps, Tone } from "../../lib/types";
import { useControllableState } from "../../hooks/use-controllable-state";
import { Button } from "../button";
import { Card, CardBody } from "../card";
import { Textarea } from "../textarea";
import { questionCardRecipe } from "./question-card.recipe";

export interface QuestionChoice {
  value: string;
  label: ReactNode;
  description?: ReactNode;
}

export type QuestionVerdict = "correct" | "incorrect" | "partial" | "pending";

export interface QuestionResult {
  verdict: QuestionVerdict;
  /** Heading override; defaults to the verdict label. */
  title?: ReactNode;
  feedback?: ReactNode;
  /** For choice questions: marks the right answer. */
  correctValue?: string;
}

export interface QuestionCardLabels {
  progress: (index: number, total: number) => string;
  submit: string;
  skip: string;
  answerPlaceholder: string;
  answerLabel: string;
  verdicts: Record<QuestionVerdict, string>;
  correctChoice: string;
  incorrectChoice: string;
}

const DEFAULT_LABELS: QuestionCardLabels = {
  progress: (i, n) => `Question ${i} of ${n}`,
  submit: "Submit answer",
  skip: "Skip",
  answerPlaceholder: "Type your answer…",
  answerLabel: "Your answer",
  verdicts: { correct: "Correct", incorrect: "Not quite", partial: "Partially correct", pending: "Being reviewed" },
  correctChoice: "Correct answer",
  incorrectChoice: "Your answer",
};

const VERDICT_TONE: Record<QuestionVerdict, Tone> = { correct: "success", incorrect: "danger", partial: "warning", pending: "info" };
const VERDICT_ICON = { correct: CheckCircle2, incorrect: XCircle, partial: MinusCircle, pending: CircleDashed } as const;

export interface QuestionCardProps extends StyleProps {
  prompt: ReactNode;
  hint?: ReactNode;
  /** Position in the set, shown as "Question i of n". */
  index?: number;
  total?: number;
  mode?: "text" | "choice" | "custom";
  choices?: QuestionChoice[];
  /** Answer content for mode="custom" (e.g. a VoiceRecorder). */
  answer?: ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Slot at the top right, typically a CountdownTimer. */
  timer?: ReactNode;
  onSubmit?: (value: string) => void | Promise<void>;
  onSkip?: () => void;
  submitting?: boolean;
  /** Sets the card to its result state: inputs lock and feedback shows. */
  result?: QuestionResult;
  disabled?: boolean;
  /** Disable submit until there is an answer (default true; custom mode never blocks). */
  requireAnswer?: boolean;
  labels?: Partial<QuestionCardLabels>;
  classNames?: ClassNames<"root" | "prompt" | "answer" | "result" | "actions">;
}

export function QuestionCard({
  prompt,
  hint,
  index,
  total,
  mode = "text",
  choices = [],
  answer,
  value,
  defaultValue = "",
  onValueChange,
  timer,
  onSubmit,
  onSkip,
  submitting = false,
  result,
  disabled = false,
  requireAnswer = true,
  labels: labelOverrides,
  className,
  classNames,
}: QuestionCardProps) {
  const r = useRecipe("questionCard", questionCardRecipe);
  const labels = { ...DEFAULT_LABELS, ...labelOverrides, verdicts: { ...DEFAULT_LABELS.verdicts, ...labelOverrides?.verdicts } };
  const [text, setText] = useControllableState({ value, defaultValue, onChange: onValueChange });
  const [busy, setBusy] = useState(false);
  const locked = disabled || !!result || submitting || busy;
  const canSubmit = !requireAnswer || mode === "custom" || text.trim().length > 0;
  const tone = result ? VERDICT_TONE[result.verdict] : undefined;
  const ResultIcon = result ? VERDICT_ICON[result.verdict] : null;

  const submit = async () => {
    if (!canSubmit || locked) return;
    setBusy(true);
    try {
      await onSubmit?.(text);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className={cn(className, classNames?.root)} aria-busy={submitting || busy || undefined}>
      <CardBody>
        <div className={r.head()}>
          <div className="min-w-0">
            {index !== undefined && total !== undefined ? <div className={r.eyebrow()}>{labels.progress(index, total)}</div> : null}
            <h3 className={cn(r.prompt(), classNames?.prompt)}>{prompt}</h3>
            {hint ? <p className={r.hint()}>{hint}</p> : null}
          </div>
          {timer ? <div className={r.timer()}>{timer}</div> : null}
        </div>

        <div className={cn(r.answer(), classNames?.answer)}>
          {mode === "text" ? (
            <Textarea aria-label={labels.answerLabel} placeholder={labels.answerPlaceholder} value={text} onValueChange={setText} disabled={locked} autoResize maxRows={10} />
          ) : mode === "choice" ? (
            <RadioGroup.Root value={text} onValueChange={setText} disabled={locked} aria-label={labels.answerLabel} className={r.choices()}>
              {choices.map((c) => {
                const verdict = result?.correctValue !== undefined ? (c.value === result.correctValue ? "correct" : c.value === text ? "incorrect" : undefined) : undefined;
                return (
                  <RadioGroup.Item key={c.value} value={c.value} data-verdict={verdict} className={r.choice()}>
                    <span className={r.radio()} aria-hidden>
                      <RadioGroup.Indicator className={r.radioDot()} />
                    </span>
                    <span className={r.choiceText()}>
                      {c.label}
                      {c.description ? <span className={r.choiceDescription()}>{c.description}</span> : null}
                    </span>
                    {verdict ? (
                      <span className={r.verdict()}>{verdict === "correct" ? labels.correctChoice : labels.incorrectChoice}</span>
                    ) : null}
                  </RadioGroup.Item>
                );
              })}
            </RadioGroup.Root>
          ) : (
            answer
          )}
        </div>

        {result && ResultIcon ? (
          <div data-tone={tone} role="status" className={cn(r.result(), classNames?.result)}>
            <div className={r.resultTitle()}>
              <ResultIcon className="size-4" aria-hidden />
              {result.title ?? labels.verdicts[result.verdict]}
            </div>
            {result.feedback ? <div className={r.resultBody()}>{result.feedback}</div> : null}
          </div>
        ) : null}

        {!result && (onSubmit || onSkip) ? (
          <div className={cn(r.actions(), classNames?.actions)}>
            {onSkip ? (
              <Button variant="ghost" tone="neutral" disabled={locked} onClick={onSkip}>
                {labels.skip}
              </Button>
            ) : (
              <span />
            )}
            {onSubmit ? (
              <Button loading={submitting || busy} disabled={!canSubmit || disabled} onClick={submit}>
                {labels.submit}
              </Button>
            ) : null}
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}
