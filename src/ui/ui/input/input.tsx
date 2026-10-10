"use client";
/** Input — prefix/suffix slots, loading, invalid. Deps: react, lib/cn, lib/skin, ui/field, ui/spinner. */
import { forwardRef, type ChangeEvent, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { ClassNames, Size, StyleProps } from "../../lib/types";
import { useFieldControl } from "../field";
import { Spinner } from "../spinner";
import { inputRecipe } from "./input.recipe";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "prefix">, StyleProps {
  size?: Size;
  variant?: "outline" | "filled";
  invalid?: boolean;
  loading?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
  /** Convenience over onChange: receives the string value. */
  onValueChange?: (value: string) => void;
  classNames?: ClassNames<"root" | "input" | "prefix" | "suffix">;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { size, variant, invalid: invalidProp, loading = false, prefix, suffix, onValueChange, onChange, className, classNames, disabled: disabledProp, required: requiredProp, id: idProp, "aria-describedby": describedByProp, ...rest },
  ref,
) {
  const r = useRecipe("input", inputRecipe);
  const field = useFieldControl({ id: idProp, disabled: disabledProp, invalid: invalidProp, required: requiredProp, "aria-describedby": describedByProp });
  const handle = (e: ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    onValueChange?.(e.target.value);
  };
  return (
    <div
      className={cn(r.root({ variant, size }), className, classNames?.root)}
      data-disabled={field.disabled || undefined}
      data-invalid={field.invalid || undefined}
    >
      {prefix ? <span className={cn(r.affix(), classNames?.prefix)}>{prefix}</span> : null}
      <input
        ref={ref}
        id={field.id}
        disabled={field.disabled}
        required={field.required}
        aria-invalid={field["aria-invalid"]}
        aria-describedby={field["aria-describedby"]}
        aria-busy={loading || undefined}
        className={cn(r.input(), classNames?.input)}
        onChange={handle}
        {...rest}
      />
      {loading ? <Spinner size="sm" /> : null}
      {suffix ? <span className={cn(r.affix(), classNames?.suffix)}>{suffix}</span> : null}
    </div>
  );
});
