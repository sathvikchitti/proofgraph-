"use client";
/** Composer — message box with a send button. Enter sends, Shift+Enter adds a line. Deps: react, lucide-react, hooks/use-controllable-state, lib/cn, lib/skin, ui/button. */
import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { ArrowUp } from "lucide-react";
import { useControllableState } from "../../hooks/use-controllable-state";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { StyleProps } from "../../lib/types";
import { IconButton } from "../button";
import { composerRecipe } from "./composer.recipe";

export interface ComposerProps extends StyleProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Called with the trimmed text when the user sends. An uncontrolled composer clears itself afterwards. */
  onSubmit?: (value: string) => void;
  variant?: "box" | "inline";
  placeholder?: string;
  /** Accessible name of the text box. */
  label?: string;
  /** Accessible name of the send button. */
  submitLabel?: string;
  /** Box variant: controls at the start of the footer. */
  leading?: ReactNode;
  /** Controls before the send button (e.g. a source picker). */
  trailing?: ReactNode;
  disabled?: boolean;
  /** Blocks sending and shows the send button as busy. */
  loading?: boolean;
}

export function Composer({
  value,
  defaultValue = "",
  onValueChange,
  onSubmit,
  variant = "box",
  placeholder = "Ask another question…",
  label = "Message",
  submitLabel = "Send",
  leading,
  trailing,
  disabled = false,
  loading = false,
  className,
}: ComposerProps) {
  const r = useRecipe("composer", composerRecipe);
  const [text, setText, controlled] = useControllableState({ value, defaultValue, onChange: onValueChange });
  const ref = useRef<HTMLTextAreaElement>(null);
  const canSend = !disabled && !loading && text.trim().length > 0;

  const send = () => {
    if (!canSend) return;
    onSubmit?.(text.trim());
    if (!controlled) setText("");
    ref.current?.focus();
  };
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  const input = (
    <textarea
      ref={ref}
      rows={1}
      value={text}
      disabled={disabled}
      placeholder={placeholder}
      aria-label={label}
      className={r.input()}
      onChange={(e) => setText(e.target.value)}
      onKeyDown={onKeyDown}
    />
  );
  const button = (
    <IconButton label={submitLabel} variant="solid" size="sm" tone="neutral" disabled={!canSend} loading={loading} onClick={send}>
      <ArrowUp aria-hidden="true" className="size-4" />
    </IconButton>
  );

  return (
    <div className={cn(r.root({ variant, disabled }), className)}>
      {variant === "inline" ? (
        <>
          {input}
          {trailing}
          {button}
        </>
      ) : (
        <>
          {input}
          <div className={r.foot()}>
            {leading}
            <span className={r.spacer()} />
            {trailing}
            {button}
          </div>
        </>
      )}
    </div>
  );
}
