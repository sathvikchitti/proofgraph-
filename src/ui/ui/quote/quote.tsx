"use client";
/** Quote — pull quote with attribution. Wrap a run in <strong> to emphasise it. Deps: react, lucide-react, lib/cn, lib/skin. */
import type { ReactNode } from "react";
import { Quote as QuoteIcon } from "lucide-react";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { StyleProps } from "../../lib/types";
import { quoteRecipe } from "./quote.recipe";

export interface QuoteProps extends StyleProps {
  /** The quoted words. */
  children: ReactNode;
  author?: string;
  /** Role and organisation, shown after the author. */
  role?: string;
}

export function Quote({ children, author, role, className }: QuoteProps) {
  const r = useRecipe("quote", quoteRecipe);
  return (
    <figure className={cn(r.root(), className)}>
      <QuoteIcon className={r.mark()} aria-hidden="true" />
      <blockquote className={r.body()}>{children}</blockquote>
      {author || role ? (
        <figcaption className={r.caption()}>
          {author ? <span className={r.name()}>{author}</span> : null}
          {author && role ? " " : null}
          {role}
        </figcaption>
      ) : null}
    </figure>
  );
}
