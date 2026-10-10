"use client";
/** Tabs — underline or pill, with counts. Deps: react, radix-ui (Tabs), lib/cn, lib/skin, hooks/use-controllable-state. */
import type { ReactNode } from "react";
import { Tabs as T } from "radix-ui";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { ClassNames, Size, StyleProps } from "../../lib/types";
import { useControllableState } from "../../hooks/use-controllable-state";
import { tabsRecipe } from "./tabs.recipe";

export interface TabItem {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  /** Numeric badge after the label. */
  count?: number;
  disabled?: boolean;
  content?: ReactNode;
}

export interface TabsProps extends StyleProps {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  variant?: "underline" | "pill";
  size?: Size;
  /** Accessible name for the tab list. */
  label: string;
  /** Render content for every tab at once (hidden when inactive) instead of mounting on demand. */
  keepMounted?: boolean;
  classNames?: ClassNames<"root" | "list" | "trigger" | "count" | "content">;
}

export function Tabs({ items, value, defaultValue, onValueChange, variant = "underline", size = "md", label, keepMounted = false, className, classNames }: TabsProps) {
  const r = useRecipe("tabs", tabsRecipe);
  const [current, setCurrent] = useControllableState({ value, defaultValue: defaultValue ?? items[0]?.value ?? "", onChange: onValueChange });
  return (
    <T.Root value={current} onValueChange={setCurrent} className={cn(r.root(), className, classNames?.root)}>
      <T.List aria-label={label} className={cn(r.list({ variant }), classNames?.list)}>
        {items.map((i) => (
          <T.Trigger key={i.value} value={i.value} disabled={i.disabled} className={cn(r.trigger({ variant, size }), classNames?.trigger)}>
            {i.icon}
            {i.label}
            {i.count !== undefined ? <span className={cn(r.count(), classNames?.count)}>{i.count}</span> : null}
          </T.Trigger>
        ))}
      </T.List>
      {items.map((i) =>
        i.content !== undefined ? (
          <T.Content key={i.value} value={i.value} forceMount={keepMounted ? true : undefined} hidden={keepMounted && current !== i.value ? true : undefined} className={cn(r.content(), classNames?.content)}>
            {i.content}
          </T.Content>
        ) : null,
      )}
    </T.Root>
  );
}
