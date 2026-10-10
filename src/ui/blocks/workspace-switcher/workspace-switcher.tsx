"use client";
/**
 * WorkspaceSwitcher — switch role or organization (Student / College / Company / Admin).
 * Deps: react, lucide-react, lib/*, hooks/use-controllable-state, ui/dropdown-menu.
 */
import { ChevronsUpDown, Plus } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { StyleProps } from "../../lib/types";
import { useControllableState } from "../../hooks/use-controllable-state";
import { DropdownMenu, type MenuEntry } from "../../ui/dropdown-menu";
import { workspaceSwitcherRecipe } from "./workspace-switcher.recipe";

export interface Workspace {
  id: string;
  name: string;
  /** e.g. "Admin", "Student". */
  role?: string;
  description?: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface WorkspaceSwitcherProps extends StyleProps {
  workspaces: Workspace[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  /** Icon-only trigger (for a collapsed sidebar). */
  compact?: boolean;
  menuLabel?: string;
  onCreate?: () => void;
  createLabel?: string;
  align?: "start" | "center" | "end";
}

export function WorkspaceSwitcher({ workspaces, value, defaultValue, onValueChange, compact = false, menuLabel = "Switch workspace", onCreate, createLabel = "Create workspace", align = "start", className }: WorkspaceSwitcherProps) {
  const r = useRecipe("workspaceSwitcher", workspaceSwitcherRecipe);
  const [id, setId] = useControllableState({ value, defaultValue: defaultValue ?? workspaces[0]?.id ?? "", onChange: onValueChange });
  const current = workspaces.find((w) => w.id === id) ?? workspaces[0];

  const items: MenuEntry[] = [
    { type: "label", label: menuLabel },
    {
      type: "radio",
      value: id,
      onValueChange: setId,
      options: workspaces.map((w) => ({
        value: w.id,
        disabled: w.disabled,
        label: (
          <span className={r.option()}>
            {w.icon ? <span className={r.logo()}>{w.icon}</span> : null}
            <span className={r.optionText()}>
              <span className={r.optionName()}>{w.name}</span>
              {w.description || w.role ? <span className={r.optionDescription()}>{w.description ?? w.role}</span> : null}
            </span>
          </span>
        ),
      })),
    },
    ...(onCreate ? ([{ type: "separator" }, { label: createLabel, icon: <Plus className="size-4" />, onSelect: onCreate }] as MenuEntry[]) : []),
  ];

  return (
    <DropdownMenu
      aria-label={menuLabel}
      trigger={
        <button type="button" className={cn(r.trigger({ compact }), className)} aria-label={compact && current ? `${menuLabel}: ${current.name}` : undefined}>
          {current?.icon ? <span className={r.logo()}>{current.icon}</span> : null}
          {compact ? null : (
            <>
              <span className={r.text()}>
                <span className={r.name()}>{current?.name}</span>
                {current?.role ? <span className={r.role()}>{current.role}</span> : null}
              </span>
              <ChevronsUpDown className={r.chevron()} aria-hidden />
            </>
          )}
        </button>
      }
      items={items}
      align={align}
    />
  );
}
