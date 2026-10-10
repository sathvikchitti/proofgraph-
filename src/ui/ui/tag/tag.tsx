"use client";
/** Tag / Chip — removable and/or selectable. Deps: react, lucide-react, lib/cn, lib/skin, hooks/use-controllable-state. */
import { X } from "lucide-react";
import type { KeyboardEvent, ReactNode } from "react";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { ClassNames, Size, StyleProps, Tone } from "../../lib/types";
import { useControllableState } from "../../hooks/use-controllable-state";
import { tagRecipe } from "./tag.recipe";

export interface TagProps extends StyleProps {
  children: ReactNode;
  variant?: "subtle" | "outline";
  tone?: Tone;
  size?: Size;
  leading?: ReactNode;
  disabled?: boolean;
  /** Shows a remove button; Backspace/Delete on the focused chip also removes. */
  onRemove?: () => void;
  removeLabel?: string;
  /** Makes the chip a toggle button. */
  selectable?: boolean;
  selected?: boolean;
  defaultSelected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
  classNames?: ClassNames<"root" | "main" | "label" | "remove">;
}

export function Tag({
  children,
  variant,
  tone = "neutral",
  size = "md",
  leading,
  disabled = false,
  onRemove,
  removeLabel = "Remove",
  selectable = false,
  selected,
  defaultSelected = false,
  onSelectedChange,
  className,
  classNames,
}: TagProps) {
  const r = useRecipe("tag", tagRecipe);
  const [isSelected, setSelected] = useControllableState({ value: selected, defaultValue: defaultSelected, onChange: onSelectedChange });
  const text = typeof children === "string" ? children : undefined;

  const onKeyDown = (e: KeyboardEvent) => {
    if (onRemove && !disabled && (e.key === "Backspace" || e.key === "Delete")) {
      e.preventDefault();
      onRemove();
    }
  };

  const content = (
    <>
      {leading}
      <span className={cn(r.label(), classNames?.label)}>{children}</span>
    </>
  );

  return (
    <span
      data-tone={tone}
      data-selected={selectable ? isSelected : undefined}
      className={cn(r.root({ variant, size, selected: selectable && isSelected, disabled, removable: !!onRemove }), className, classNames?.root)}
      onKeyDown={onKeyDown}
    >
      {selectable ? (
        <button
          type="button"
          aria-pressed={isSelected}
          disabled={disabled}
          className={cn(r.main(), classNames?.main)}
          onClick={() => setSelected(!isSelected)}
        >
          {content}
        </button>
      ) : (
        <span className={cn(r.main(), "focus-visible:outline-none", classNames?.main)}>{content}</span>
      )}
      {onRemove ? (
        <button
          type="button"
          disabled={disabled}
          aria-label={text ? `${removeLabel} ${text}` : removeLabel}
          className={cn(r.remove(), classNames?.remove)}
          onClick={onRemove}
        >
          <X className="size-3" aria-hidden />
        </button>
      ) : null}
    </span>
  );
}
