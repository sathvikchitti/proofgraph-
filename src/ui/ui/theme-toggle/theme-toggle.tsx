"use client";
/**
 * ThemeToggle — light / dark / system switch.
 * Deps: react, radix-ui (ToggleGroup), lucide-react, ../../lib/cn, ../../lib/skin, ../../hooks/use-theme.
 * Uncontrolled: drives the document theme via useTheme. Controlled (`value`): purely presentational.
 */
import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { ToggleGroup } from "radix-ui";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { ClassNames, Size, StyleProps } from "../../lib/types";
import { useTheme, type ThemeMode } from "../../hooks/use-theme";
import { themeToggleRecipe } from "./theme-toggle.recipe";

const MODES: { mode: ThemeMode; icon: LucideIcon }[] = [
  { mode: "light", icon: Sun },
  { mode: "dark", icon: Moon },
  { mode: "system", icon: Monitor },
];

export interface ThemeToggleProps extends StyleProps {
  /** "segmented" shows all three modes; "cycle" is a single button that steps through them. */
  variant?: "segmented" | "cycle";
  size?: Size;
  value?: ThemeMode;
  onValueChange?: (value: ThemeMode) => void;
  labels?: { group?: string; light?: string; dark?: string; system?: string };
  classNames?: ClassNames<"root" | "item" | "icon">;
}

export function ThemeToggle({
  variant = "segmented",
  size = "md",
  value,
  onValueChange,
  labels,
  className,
  classNames,
}: ThemeToggleProps) {
  const r = useRecipe("themeToggle", themeToggleRecipe);
  const store = useTheme();
  const current = value ?? store.theme;
  const text = { group: "Theme", light: "Light", dark: "Dark", system: "System", ...labels };

  const select = (next: ThemeMode) => {
    if (value === undefined) store.setTheme(next);
    onValueChange?.(next);
  };

  if (variant === "cycle") {
    const idx = MODES.findIndex((m) => m.mode === current);
    const Icon = MODES[idx]?.icon ?? Monitor;
    const next = MODES[(idx + 1) % MODES.length]?.mode ?? "light";
    return (
      <button
        type="button"
        className={cn(r.cycle({ size }), className, classNames?.root)}
        aria-label={`${text.group}: ${text[current]}`}
        title={`${text.group}: ${text[current]}`}
        onClick={() => select(next)}
      >
        <Icon className={cn(r.icon({ size }), classNames?.icon)} aria-hidden />
      </button>
    );
  }

  return (
    <ToggleGroup.Root
      type="single"
      value={current}
      onValueChange={(v) => v && select(v as ThemeMode)}
      aria-label={text.group}
      className={cn(r.root(), className, classNames?.root)}
    >
      {MODES.map(({ mode, icon: Icon }) => (
        <ToggleGroup.Item
          key={mode}
          value={mode}
          aria-label={text[mode]}
          title={text[mode]}
          className={cn(r.item({ size }), classNames?.item)}
        >
          <Icon className={cn(r.icon({ size }), classNames?.icon)} aria-hidden />
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}
