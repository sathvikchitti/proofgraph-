"use client";
/** Textarea — auto-resize and character counter. Deps: react, lib/cn, lib/skin, hooks/use-controllable-state, ui/field. */
import { forwardRef, useCallback, useId, useLayoutEffect, useRef, type ChangeEvent, type TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { ClassNames, Size, StyleProps } from "../../lib/types";
import { useControllableState } from "../../hooks/use-controllable-state";
import { useFieldControl } from "../field";
import { textareaRecipe } from "./textarea.recipe";

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "defaultValue" | "onChange">, StyleProps {
  size?: Size;
  invalid?: boolean;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  /** Grow with content up to `maxRows`. */
  autoResize?: boolean;
  maxRows?: number;
  /** Show "n/max" using `maxLength`. */
  showCounter?: boolean;
  formatCounter?: (length: number, max: number) => string;
  classNames?: ClassNames<"root" | "field" | "counter">;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { size, invalid: invalidProp, value, defaultValue = "", onValueChange, onChange, autoResize = false, maxRows = 12, showCounter = false, formatCounter = (n, m) => `${n}/${m}`, maxLength, className, classNames, disabled, required, id, "aria-describedby": describedByProp, ...rest },
  forwardedRef,
) {
  const r = useRecipe("textarea", textareaRecipe);
  const counterId = useId();
  const field = useFieldControl({ id, disabled, invalid: invalidProp, required, "aria-describedby": [describedByProp, showCounter && maxLength ? counterId : undefined].filter(Boolean).join(" ") || undefined });
  const [text, setText] = useControllableState({ value, defaultValue, onChange: onValueChange });
  const innerRef = useRef<HTMLTextAreaElement | null>(null);

  const setRef = useCallback(
    (el: HTMLTextAreaElement | null) => {
      innerRef.current = el;
      if (typeof forwardedRef === "function") forwardedRef(el);
      else if (forwardedRef) forwardedRef.current = el;
    },
    [forwardedRef],
  );

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!autoResize || !el) return;
    el.style.height = "auto";
    const cs = getComputedStyle(el);
    const line = parseFloat(cs.lineHeight) || 20;
    const pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const max = line * maxRows + pad;
    el.style.height = `${Math.min(el.scrollHeight, max)}px`;
  }, [text, autoResize, maxRows]);

  const length = text.length;
  return (
    <div className={cn(r.root(), className, classNames?.root)}>
      <textarea
        ref={setRef}
        id={field.id}
        value={text}
        maxLength={maxLength}
        disabled={field.disabled}
        required={field.required}
        aria-invalid={field["aria-invalid"]}
        aria-describedby={field["aria-describedby"]}
        className={cn(r.field({ size, autoResize }), classNames?.field)}
        onChange={(e) => {
          setText(e.target.value);
          onChange?.(e);
        }}
        {...rest}
      />
      {showCounter && maxLength ? (
        <span id={counterId} className={cn(r.counter({ over: length >= maxLength }), classNames?.counter)}>
          {formatCounter(length, maxLength)}
        </span>
      ) : null}
    </div>
  );
});
