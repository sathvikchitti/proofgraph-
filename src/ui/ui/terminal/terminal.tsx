"use client";
/** Terminal — preformatted command output with coloured tokens and an optional caret. Deps: react, lib/cn, lib/skin. */
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { StyleProps } from "../../lib/types";
import { terminalRecipe } from "./terminal.recipe";

export type TerminalTokenKind = "key" | "value" | "url" | "muted";

export interface TerminalProps extends StyleProps {
  /** Accessible name; the block is focusable so keyboard users can scroll long lines. */
  "aria-label"?: string;
  /** Show a trailing caret. */
  caret?: boolean;
  children?: ReactNode;
}

export function Terminal({ "aria-label": ariaLabel = "Terminal output", caret = false, className, children }: TerminalProps) {
  const r = useRecipe("terminal", terminalRecipe);
  return (
    <pre tabIndex={0} aria-label={ariaLabel} className={cn(r.root(), className)}>
      {children}
      {caret ? <span aria-hidden="true" className={r.caret()} /> : null}
    </pre>
  );
}

export function TerminalToken({ kind = "key", children }: { kind?: TerminalTokenKind; children: ReactNode }) {
  const r = useRecipe("terminal", terminalRecipe);
  return <span className={r.token({ kind })}>{children}</span>;
}
