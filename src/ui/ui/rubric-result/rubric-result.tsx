"use client";
/** RubricResult — criteria scores (1–5 by default), feedback, overall score and a follow-up slot. Deps: react, lib/*. */
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { formatNumber } from "../../lib/format";
import { useRecipe } from "../../lib/skin";
import type { ClassNames, StyleProps, Tone } from "../../lib/types";
import { rubricResultRecipe } from "./rubric-result.recipe";

export interface RubricCriterion {
  id: string;
  label: ReactNode;
  score: number;
  /** Per-criterion scale; defaults to the `max` prop. */
  max?: number;
  feedback?: ReactNode;
}

export interface RubricResultProps extends StyleProps {
  criteria: RubricCriterion[];
  /** Scale for every criterion unless it sets its own. */
  max?: number;
  /** Overall score; when omitted the average of the criteria is shown. */
  overall?: number;
  overallLabel?: string;
  summary?: ReactNode;
  showOverall?: boolean;
  /** Slot for a follow-up question or action. */
  followUp?: ReactNode;
  followUpLabel?: string;
  /** Tone for a score; default: ≤40% danger, ≤70% warning, otherwise success. */
  toneFor?: (score: number, max: number) => Tone;
  /** Screen-reader text for a score. */
  describeScore?: (score: number, max: number) => string;
  classNames?: ClassNames<"root" | "overall" | "criterion" | "feedback">;
}

const defaultTone = (score: number, max: number): Tone => (score / max <= 0.4 ? "danger" : score / max <= 0.7 ? "warning" : "success");

export function RubricResult({
  criteria,
  max = 5,
  overall,
  overallLabel = "Overall",
  summary,
  showOverall = true,
  followUp,
  followUpLabel = "Follow-up",
  toneFor = defaultTone,
  describeScore = (s, m) => `${formatNumber(s)} out of ${m}`,
  className,
  classNames,
}: RubricResultProps) {
  const r = useRecipe("rubricResult", rubricResultRecipe);
  const avg = criteria.length ? criteria.reduce((s, c) => s + c.score / (c.max ?? max), 0) / criteria.length : 0;
  const overallScore = overall ?? avg * max;

  return (
    <div className={cn(r.root(), className, classNames?.root)}>
      {showOverall && criteria.length ? (
        <div data-tone={toneFor(overallScore, max)} className={cn(r.overall(), classNames?.overall)}>
          <div className={r.overallScore()} aria-label={`${overallLabel}: ${describeScore(Number(overallScore.toFixed(1)), max)}`}>
            {formatNumber(overallScore, { maximumFractionDigits: 1 })}
            <span className={r.overallMax()}> / {max}</span>
          </div>
          <div className="min-w-0">
            <div className={r.overallLabel()}>{overallLabel}</div>
            {summary ? <div className={r.summary()}>{summary}</div> : null}
          </div>
        </div>
      ) : null}
      <ul className={r.list()}>
        {criteria.map((c) => {
          const m = c.max ?? max;
          return (
            <li key={c.id} data-tone={toneFor(c.score, m)} className={cn(r.criterion(), classNames?.criterion)}>
              <div className={r.criterionHead()}>
                <span className={r.criterionLabel()}>{c.label}</span>
                <span className={r.scoreText()}>
                  {formatNumber(c.score)}/{m}
                </span>
              </div>
              <div className={r.segments()} role="img" aria-label={describeScore(c.score, m)}>
                {Array.from({ length: m }, (_, i) => (
                  <span key={i} className={r.segment()} data-filled={i < Math.round(c.score)} />
                ))}
              </div>
              {c.feedback ? <p className={cn(r.feedback(), classNames?.feedback)}>{c.feedback}</p> : null}
            </li>
          );
        })}
      </ul>
      {followUp ? (
        <div className={r.followUp()}>
          <div className={r.followUpTitle()}>{followUpLabel}</div>
          {followUp}
        </div>
      ) : null}
    </div>
  );
}
