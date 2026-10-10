"use client";
/**
 * CommandPalette (⌘K) — grouped, searchable commands with recent items.
 * Deps: react, radix-ui (Dialog), cmdk, lucide-react, lib/*, hooks/use-controllable-state, hooks/use-hotkeys, ui/kbd.
 */
import { Command } from "cmdk";
import { Search } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Dialog as D } from "radix-ui";
import { cn } from "../../lib/cn";
import { usePortalContainer } from "../../lib/portal";
import { useRecipe } from "../../lib/skin";
import type { StyleProps } from "../../lib/types";
import { useControllableState } from "../../hooks/use-controllable-state";
import { useHotkeys } from "../../hooks/use-hotkeys";
import { Kbd } from "../kbd";
import { commandPaletteRecipe } from "./command-palette.recipe";

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  /** Shown on the right, e.g. ["G", "D"]. */
  shortcut?: string[];
  keywords?: string[];
  disabled?: boolean;
  onSelect?: () => void;
}

export interface CommandGroup {
  heading: string;
  items: CommandItem[];
}

export interface CommandPaletteProps extends StyleProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  groups: CommandGroup[];
  /** Shown first, under `recentLabel`, while the search box is empty. */
  recent?: CommandItem[];
  /** Global shortcut that toggles the palette. `false` disables it. */
  hotkey?: string | false;
  title?: string;
  placeholder?: string;
  emptyLabel?: string;
  recentLabel?: string;
  /** Called after any item runs (and the palette closes). */
  onRun?: (item: CommandItem) => void;
}

export function CommandPalette({
  open,
  defaultOpen = false,
  onOpenChange,
  groups,
  recent,
  hotkey = "mod+k",
  title = "Command palette",
  placeholder = "Type a command or search…",
  emptyLabel = "No results found.",
  recentLabel = "Recent",
  onRun,
  className,
}: CommandPaletteProps) {
  const r = useRecipe("commandPalette", commandPaletteRecipe);
  const container = usePortalContainer();
  const [isOpen, setOpen] = useControllableState({ value: open, defaultValue: defaultOpen, onChange: onOpenChange });
  const [query, setQuery] = useState("");

  useHotkeys(hotkey ? { [hotkey]: () => setOpen(!isOpen) } : {}, { enabled: !!hotkey, allowInInputs: true });

  const run = (item: CommandItem) => {
    setOpen(false);
    item.onSelect?.();
    onRun?.(item);
  };

  const renderItem = (item: CommandItem, prefix = "") => (
    <Command.Item
      key={`${prefix}${item.id}`}
      value={`${prefix}${item.id}`}
      keywords={[item.label, ...(item.keywords ?? [])]}
      disabled={item.disabled}
      onSelect={() => run(item)}
      className={r.item()}
    >
      {item.icon ? <span className={r.itemIcon()}>{item.icon}</span> : null}
      <span className={r.itemText()}>
        {item.label}
        {item.description ? <span className={r.description()}>{item.description}</span> : null}
      </span>
      {item.shortcut?.length ? <Kbd size="sm" keys={item.shortcut} /> : null}
    </Command.Item>
  );

  return (
    <D.Root
      open={isOpen}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setQuery("");
      }}
    >
      <D.Portal container={container}>
        <D.Overlay className={r.overlay()} />
        <D.Content aria-describedby={undefined} className={cn(r.content(), className)}>
          <D.Title className="sr-only">{title}</D.Title>
          <Command label={title} loop>
            <div className={r.searchRow()}>
              <Search className={r.searchIcon()} aria-hidden />
              <Command.Input value={query} onValueChange={setQuery} placeholder={placeholder} className={r.input()} />
            </div>
            <Command.List className={r.list()}>
              <Command.Empty className={r.empty()}>{emptyLabel}</Command.Empty>
              {!query && recent?.length ? (
                <Command.Group heading={recentLabel} className={r.group()}>
                  {recent.map((i) => renderItem(i, "recent:"))}
                </Command.Group>
              ) : null}
              {groups.map((g) => (
                <Command.Group key={g.heading} heading={g.heading} className={r.group()}>
                  {g.items.map((i) => renderItem(i))}
                </Command.Group>
              ))}
            </Command.List>
          </Command>
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}
