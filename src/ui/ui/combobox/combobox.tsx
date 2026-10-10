"use client";
/**
 * Combobox — searchable single select with optional async search.
 * Local filtering by default; pass `onSearchChange` to filter on the server (then `options` is whatever you return).
 * Deps: react, radix-ui (Popover), cmdk, lucide-react, lib/cn, lib/skin, lib/portal, hooks/*, ui/field, ui/spinner.
 */
import { Command } from "cmdk";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { Popover } from "radix-ui";
import { cn } from "../../lib/cn";
import { usePortalContainer } from "../../lib/portal";
import { useRecipe } from "../../lib/skin";
import type { ClassNames, Size, StyleProps } from "../../lib/types";
import { useControllableState } from "../../hooks/use-controllable-state";
import { useDebounce } from "../../hooks/use-debounce";
import { useFieldControl } from "../field";
import { Spinner } from "../spinner";
import { comboboxRecipe } from "./combobox.recipe";

export interface ComboboxOption {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  group?: string;
  /** Extra text matched by local filtering. */
  keywords?: string[];
}

export interface ComboboxProps extends StyleProps {
  options: ComboboxOption[];
  /** "" = nothing selected. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Called (debounced) with the query; switches off local filtering. */
  onSearchChange?: (query: string) => void;
  debounceMs?: number;
  loading?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  loadingLabel?: string;
  clearable?: boolean;
  clearLabel?: string;
  size?: Size;
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
  classNames?: ClassNames<"trigger" | "content" | "item">;
}

const text = (n: ReactNode, fallback: string) => (typeof n === "string" ? n : fallback);

export function Combobox({
  options,
  value,
  defaultValue = "",
  onValueChange,
  onSearchChange,
  debounceMs = 250,
  loading = false,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyLabel = "No results",
  loadingLabel = "Loading…",
  clearable = false,
  clearLabel = "Clear selection",
  size = "md",
  invalid,
  disabled,
  required,
  name,
  id,
  className,
  classNames,
  "aria-label": ariaLabel,
  "aria-describedby": describedBy,
}: ComboboxProps) {
  const r = useRecipe("combobox", comboboxRecipe);
  const container = usePortalContainer();
  const field = useFieldControl({ id, disabled, invalid, required, "aria-describedby": describedBy });
  const [selected, setSelected] = useControllableState({ value, defaultValue, onChange: onValueChange });
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query, debounceMs);
  const cb = useRef(onSearchChange);
  cb.current = onSearchChange;
  useEffect(() => {
    if (open) cb.current?.(debounced);
  }, [debounced, open]);

  const current = options.find((o) => o.value === selected);
  const groups: { name?: string; items: ComboboxOption[] }[] = [];
  for (const o of options) {
    let g = groups.find((x) => x.name === o.group);
    if (!g) groups.push((g = { name: o.group, items: [] }));
    g.items.push(o);
  }

  const pick = (v: string) => {
    setSelected(v);
    setOpen(false);
  };

  return (
    <div className={cn(r.root(), className)}>
      <Popover.Root
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setQuery("");
        }}
      >
        <Popover.Trigger
          id={field.id}
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={ariaLabel}
          aria-invalid={field["aria-invalid"]}
          aria-describedby={field["aria-describedby"]}
          disabled={field.disabled}
          className={cn(r.trigger({ size, clearable: clearable && !!selected }), classNames?.trigger)}
        >
          <span className={r.value({ placeholder: !current })}>{current ? current.label : placeholder}</span>
          <ChevronsUpDown className={r.icon()} aria-hidden />
        </Popover.Trigger>
        {clearable && selected && !field.disabled ? (
          <button type="button" aria-label={clearLabel} className={r.clear()} onClick={() => setSelected("")}>
            <X className="size-3.5" aria-hidden />
          </button>
        ) : null}
        <Popover.Portal container={container}>
          <Popover.Content align="start" sideOffset={4} className={cn(r.content(), classNames?.content)}>
            <Command shouldFilter={!onSearchChange} label={ariaLabel ?? placeholder}>
              <div className={r.searchRow()}>
                <Search className={r.searchIcon()} aria-hidden />
                <Command.Input value={query} onValueChange={setQuery} placeholder={searchPlaceholder} className={r.input()} />
                {loading ? <Spinner size="sm" /> : null}
              </div>
              <Command.List className={r.list()}>
                {loading && options.length === 0 ? (
                  <div className={r.status()} role="status">
                    {loadingLabel}
                  </div>
                ) : (
                  <Command.Empty className={r.status()}>{emptyLabel}</Command.Empty>
                )}
                {groups.map((g, gi) => (
                  <Fragment key={g.name ?? `g${gi}`}>
                    <Command.Group heading={g.name} className={r.group()}>
                      {g.items.map((o) => (
                        <Command.Item
                          key={o.value}
                          value={o.value}
                          keywords={[text(o.label, o.value), ...(o.keywords ?? [])]}
                          disabled={o.disabled}
                          onSelect={() => pick(o.value)}
                          className={cn(r.item(), classNames?.item)}
                        >
                          <span className={r.itemText()}>
                            {o.label}
                            {o.description ? <span className={r.description()}>{o.description}</span> : null}
                          </span>
                          {o.value === selected ? <Check className="size-4 shrink-0" aria-hidden /> : null}
                        </Command.Item>
                      ))}
                    </Command.Group>
                  </Fragment>
                ))}
              </Command.List>
            </Command>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      {name ? <input type="hidden" name={name} value={selected} /> : null}
    </div>
  );
}
