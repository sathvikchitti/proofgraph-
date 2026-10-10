"use client";
/** Checkbox — binary or indeterminate selection with Field wiring. Deps: react, radix-ui (Checkbox), lucide-react, lib/cn, lib/skin, ui/field. */
import { Check, Minus } from "lucide-react";
import type { ReactNode } from "react";
import { Checkbox as C } from "radix-ui";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { ClassNames, Size, StyleProps, Tone } from "../../lib/types";
import { useFieldControl } from "../field";
import { checkboxRecipe } from "./checkbox.recipe";

export type CheckedState = boolean | "indeterminate";
export interface CheckboxProps extends StyleProps {
  label?: ReactNode; description?: ReactNode; checked?: CheckedState; defaultChecked?: CheckedState;
  onCheckedChange?: (checked: CheckedState) => void; disabled?: boolean; required?: boolean; invalid?: boolean;
  name?: string; value?: string; id?: string; size?: Size; tone?: Tone; "aria-label"?: string; "aria-describedby"?: string;
  classNames?: ClassNames<"root" | "control" | "indicator" | "label" | "description">;
}

export function Checkbox({ label, description, checked, defaultChecked, onCheckedChange, disabled, required, invalid, name, value, id, size = "md", tone = "info", className, classNames, "aria-label": ariaLabel, "aria-describedby": describedBy }: CheckboxProps) {
  const r = useRecipe("checkbox", checkboxRecipe);
  const field = useFieldControl({ id, disabled, required, invalid, "aria-describedby": describedBy });
  const control = <C.Root id={field.id} name={name} value={value} checked={checked} defaultChecked={defaultChecked} onCheckedChange={onCheckedChange} disabled={field.disabled} required={field.required} aria-label={ariaLabel ?? (typeof label === "string" ? label : undefined)} aria-invalid={field["aria-invalid"]} aria-describedby={field["aria-describedby"]} className={cn(r.control({ size }), classNames?.control)}><C.Indicator className={cn(r.indicator(), classNames?.indicator)}>{checked === "indeterminate" || (checked === undefined && defaultChecked === "indeterminate") ? <Minus className={r.icon()} aria-hidden /> : <Check className={r.icon()} aria-hidden />}</C.Indicator></C.Root>;
  if (!label && !description) return <span data-tone={tone} className={cn(r.root({ disabled: field.disabled }), className, classNames?.root)}>{control}</span>;
  return <label data-tone={tone} className={cn(r.root({ disabled: field.disabled }), className, classNames?.root)}>{control}<span className={r.text()}>{label ? <span className={cn(r.label(), classNames?.label)}>{label}</span> : null}{description ? <span className={cn(r.description(), classNames?.description)}>{description}</span> : null}</span></label>;
}
