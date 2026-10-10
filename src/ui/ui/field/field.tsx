"use client";
/**
 * Field — label, hint, error, required marker, auto-wired ids. Wraps every control.
 * Controls call useFieldControl(props) to pick up id, aria-describedby, invalid, disabled and required.
 * Deps: react, lucide-react, lib/cn, lib/skin.
 */
import { AlertCircle } from "lucide-react";
import { createContext, useContext, useId, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { ClassNames, StyleProps } from "../../lib/types";
import { fieldRecipe } from "./field.recipe";

interface FieldContextValue {
  id: string;
  describedBy?: string;
  invalid: boolean;
  disabled: boolean;
  required: boolean;
}
const FieldContext = createContext<FieldContextValue | null>(null);

export interface FieldProps extends StyleProps {
  label?: ReactNode;
  hint?: ReactNode;
  /** A truthy error marks the control invalid and is announced politely. */
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  /** Visually hide the label but keep it for assistive tech. */
  hideLabel?: boolean;
  /** Text read after the label when required (the asterisk itself is decorative). */
  requiredLabel?: string;
  id?: string;
  classNames?: ClassNames<"root" | "label" | "hint" | "error">;
  children: ReactNode;
}

export function Field({
  label,
  hint,
  error,
  required = false,
  disabled = false,
  hideLabel = false,
  requiredLabel = "required",
  id: idProp,
  className,
  classNames,
  children,
}: FieldProps) {
  const r = useRecipe("field", fieldRecipe);
  const auto = useId();
  const id = idProp ?? `field-${auto.replace(/:/g, "")}`;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <FieldContext.Provider value={{ id, describedBy, invalid: !!error, disabled, required }}>
      <div className={cn(r.root(), className, classNames?.root)}>
        {label ? (
          <label htmlFor={id} className={cn(r.label({ disabled }), hideLabel && "sr-only", classNames?.label)}>
            {label}
            {required ? (
              <>
                <span className={r.required()} aria-hidden>
                  *
                </span>
                <span className="sr-only"> ({requiredLabel})</span>
              </>
            ) : null}
          </label>
        ) : null}
        {children}
        {hint ? (
          <p id={hintId} className={cn(r.hint(), classNames?.hint)}>
            {hint}
          </p>
        ) : null}
        <p id={errorId} aria-live="polite" className={cn(error ? r.error() : "sr-only", classNames?.error)}>
          {error ? (
            <>
              <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden />
              <span>{error}</span>
            </>
          ) : null}
        </p>
      </div>
    </FieldContext.Provider>
  );
}

interface ControlProps {
  id?: string;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
  "aria-describedby"?: string;
}

/** Merge a control's own props with the surrounding Field (own props win). */
export function useFieldControl(props: ControlProps) {
  const field = useContext(FieldContext);
  const invalid = props.invalid ?? field?.invalid ?? false;
  return {
    id: props.id ?? field?.id,
    disabled: props.disabled ?? field?.disabled,
    required: props.required ?? field?.required,
    invalid,
    "aria-invalid": invalid || undefined,
    "aria-describedby": [props["aria-describedby"], field?.describedBy].filter(Boolean).join(" ") || undefined,
  };
}
