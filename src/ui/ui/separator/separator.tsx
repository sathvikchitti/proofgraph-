"use client";
/** Separator — optional centered label. Deps: react, radix-ui (Separator), lib/cn, lib/skin. */
import { Separator as S } from "radix-ui";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { StyleProps } from "../../lib/types";
import { separatorRecipe } from "./separator.recipe";

export interface SeparatorProps extends StyleProps {
  orientation?: "horizontal" | "vertical";
  /** Purely visual by default; set false to expose role="separator". */
  decorative?: boolean;
  /** Text shown in the middle of a horizontal separator. */
  label?: string;
}

export function Separator({ orientation = "horizontal", decorative = true, label, className }: SeparatorProps) {
  const r = useRecipe("separator", separatorRecipe);
  if (label && orientation === "horizontal") {
    return (
      <div role={decorative ? "presentation" : "separator"} aria-label={decorative ? undefined : label} className={cn(r.labelled(), className)}>
        <span className={r.rule()} />
        <span>{label}</span>
        <span className={r.rule()} />
      </div>
    );
  }
  return <S.Root decorative={decorative} orientation={orientation} className={cn(r.line({ orientation }), className)} />;
}
