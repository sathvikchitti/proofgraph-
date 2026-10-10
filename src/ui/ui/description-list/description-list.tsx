"use client";
/** DescriptionList — label/value pairs on a semantic <dl>, with copyable values. Deps: react, lucide-react, lib/*, hooks/use-copy. */
import { Check, Copy } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { ClassNames, StyleProps } from "../../lib/types";
import { useCopy } from "../../hooks/use-copy";
import { descriptionListRecipe } from "./description-list.recipe";

export interface DescriptionItem {
  label: ReactNode;
  value?: ReactNode;
  hint?: ReactNode;
  href?: string;
  /** Adds a copy button; copies `copyValue` or the string value. */
  copyable?: boolean;
  copyValue?: string;
  /** Code font + tabular digits (SHAs, ids, numbers). */
  mono?: boolean;
}

export interface DescriptionListProps extends StyleProps {
  items: DescriptionItem[];
  layout?: "horizontal" | "stacked";
  divided?: boolean;
  /** Shown when a value is null/empty. */
  emptyValue?: string;
  copyLabel?: string;
  copiedLabel?: string;
  classNames?: ClassNames<"root" | "row" | "term" | "detail">;
}

function CopyButton({ text, copyLabel, copiedLabel }: { text: string; copyLabel: string; copiedLabel: string }) {
  const r = useRecipe("descriptionList", descriptionListRecipe);
  const { copy, copied } = useCopy();
  return (
    <button type="button" className={r.copy()} aria-label={copied ? copiedLabel : copyLabel} onClick={() => copy(text)}>
      {copied ? <Check className="size-3.5 text-success" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
    </button>
  );
}

export function DescriptionList({ items, layout = "horizontal", divided = false, emptyValue = "—", copyLabel = "Copy", copiedLabel = "Copied", className, classNames }: DescriptionListProps) {
  const r = useRecipe("descriptionList", descriptionListRecipe);
  return (
    <dl className={cn(r.root({ divided }), className, classNames?.root)}>
      {items.map((item, i) => {
        const empty = item.value === undefined || item.value === null || item.value === "";
        const text = item.copyValue ?? (typeof item.value === "string" || typeof item.value === "number" ? String(item.value) : undefined);
        return (
          <div key={i} className={cn(r.row({ layout }), classNames?.row)}>
            <dt className={cn(r.term(), classNames?.term)}>
              {item.label}
              {item.hint ? <span className={r.hint()}>{item.hint}</span> : null}
            </dt>
            <dd className={cn(r.detail(), classNames?.detail)}>
              {empty ? (
                <span className={r.empty()}>{emptyValue}</span>
              ) : item.href ? (
                <a href={item.href} className={cn(r.link(), item.mono && r.mono())}>
                  {item.value}
                </a>
              ) : (
                <span className={cn(item.mono && r.mono())}>{item.value}</span>
              )}
              {item.copyable && text && !empty ? <CopyButton text={text} copyLabel={copyLabel} copiedLabel={copiedLabel} /> : null}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
