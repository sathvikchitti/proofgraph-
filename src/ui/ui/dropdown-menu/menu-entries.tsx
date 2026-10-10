/**
 * Renders MenuEntry data with either Radix DropdownMenu or ContextMenu primitives (same part names).
 * Deps: react, lucide-react, lib/cn, ./dropdown-menu.recipe.
 */
import { Check, ChevronRight, Circle } from "lucide-react";
import { Fragment, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import type { dropdownMenuRecipe } from "./dropdown-menu.recipe";

export type MenuEntry =
  | { type?: "item"; label: ReactNode; icon?: ReactNode; shortcut?: string; onSelect?: (e: Event) => void; disabled?: boolean; tone?: "danger"; href?: string }
  | { type: "checkbox"; label: ReactNode; checked: boolean; onCheckedChange: (checked: boolean) => void; disabled?: boolean }
  | { type: "radio"; value: string; onValueChange: (value: string) => void; options: { value: string; label: ReactNode; disabled?: boolean }[] }
  | { type: "label"; label: ReactNode }
  | { type: "separator" }
  | { type: "sub"; label: ReactNode; icon?: ReactNode; items: MenuEntry[]; disabled?: boolean };

/** The subset of a Radix menu namespace we render with (DropdownMenu and ContextMenu both satisfy it). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MenuPrimitives = Record<string, any>;

export function renderMenuEntries(P: MenuPrimitives, entries: MenuEntry[], r: typeof dropdownMenuRecipe): ReactNode {
  return entries.map((e, i) => {
    const key = `${e.type ?? "item"}-${i}`;
    switch (e.type) {
      case "separator":
        return <P.Separator key={key} className={r.separator()} />;
      case "label":
        return (
          <P.Label key={key} className={r.label()}>
            {e.label}
          </P.Label>
        );
      case "checkbox":
        return (
          <P.CheckboxItem key={key} checked={e.checked} onCheckedChange={e.onCheckedChange} disabled={e.disabled} className={cn(r.item(), r.checkItem())}>
            <span className={r.indicator()}>
              <P.ItemIndicator>
                <Check className="size-4" aria-hidden />
              </P.ItemIndicator>
            </span>
            {e.label}
          </P.CheckboxItem>
        );
      case "radio":
        return (
          <P.RadioGroup key={key} value={e.value} onValueChange={e.onValueChange}>
            {e.options.map((o) => (
              <P.RadioItem key={o.value} value={o.value} disabled={o.disabled} className={cn(r.item(), r.checkItem())}>
                <span className={r.indicator()}>
                  <P.ItemIndicator>
                    <Circle className="size-2 fill-current" aria-hidden />
                  </P.ItemIndicator>
                </span>
                {o.label}
              </P.RadioItem>
            ))}
          </P.RadioGroup>
        );
      case "sub":
        return (
          <P.Sub key={key}>
            <P.SubTrigger disabled={e.disabled} className={r.item()}>
              {e.icon ? <span className={r.icon()}>{e.icon}</span> : null}
              {e.label}
              <ChevronRight className={r.chevron()} aria-hidden />
            </P.SubTrigger>
            <P.Portal>
              <P.SubContent sideOffset={4} alignOffset={-4} className={r.content()}>
                {renderMenuEntries(P, e.items, r)}
              </P.SubContent>
            </P.Portal>
          </P.Sub>
        );
      default: {
        const item = (
          <Fragment>
            {e.icon ? <span className={r.icon()}>{e.icon}</span> : null}
            {e.label}
            {e.shortcut ? <span className={r.shortcut()}>{e.shortcut}</span> : null}
          </Fragment>
        );
        return (
          <P.Item key={key} disabled={e.disabled} data-tone={e.tone} onSelect={e.onSelect} asChild={!!e.href} className={r.item()}>
            {e.href ? <a href={e.href}>{item}</a> : item}
          </P.Item>
        );
      }
    }
  });
}
