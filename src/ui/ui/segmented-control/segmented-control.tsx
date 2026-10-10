"use client";
/** SegmentedControl — 2–5 mutually exclusive options. Deps: react, radix-ui (ToggleGroup), lib/cn, lib/skin, hooks/use-controllable-state. */
import type { ReactNode } from "react";
import { ToggleGroup } from "radix-ui";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { ClassNames, Size, StyleProps } from "../../lib/types";
import { useControllableState } from "../../hooks/use-controllable-state";
import { segmentedControlRecipe } from "./segmented-control.recipe";

export interface SegmentedOption<T extends string = string> {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  /** Accessible name when `label` is not text. */
  "aria-label"?: string;
}

export interface SegmentedControlProps<T extends string = string> extends StyleProps {
  options: SegmentedOption<T>[];
  value?: T;
  defaultValue?: T;
  onValueChange?: (value: T) => void;
  size?: Size;
  fullWidth?: boolean;
  disabled?: boolean;
  /** Accessible name for the group. */
  label: string;
  classNames?: ClassNames<"root" | "item">;
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  defaultValue,
  onValueChange,
  size = "md",
  fullWidth = false,
  disabled,
  label,
  className,
  classNames,
}: SegmentedControlProps<T>) {
  const r = useRecipe("segmentedControl", segmentedControlRecipe);
  const [current, setCurrent] = useControllableState<T | undefined>({
    value,
    defaultValue: defaultValue ?? options[0]?.value,
    onChange: (v) => v !== undefined && onValueChange?.(v),
  });
  return (
    <ToggleGroup.Root
      type="single"
      value={current}
      onValueChange={(v) => v && setCurrent(v as T)}
      disabled={disabled}
      aria-label={label}
      className={cn(r.root({ fullWidth }), className, classNames?.root)}
    >
      {options.map((o) => (
        <ToggleGroup.Item key={o.value} value={o.value} disabled={o.disabled} aria-label={o["aria-label"]} className={cn(r.item({ size }), classNames?.item)}>
          {o.icon}
          {o.label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}
