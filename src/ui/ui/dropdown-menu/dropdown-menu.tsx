"use client";
/** DropdownMenu — action menu from data. Deps: react, radix-ui (DropdownMenu), lib/cn, lib/skin, lib/portal. */
import type { ReactNode } from "react";
import { DropdownMenu as M } from "radix-ui";
import { cn } from "../../lib/cn";
import { usePortalContainer } from "../../lib/portal";
import { useRecipe } from "../../lib/skin";
import type { StyleProps } from "../../lib/types";
import { dropdownMenuRecipe } from "./dropdown-menu.recipe";
import { renderMenuEntries, type MenuEntry } from "./menu-entries";

export interface DropdownMenuProps extends StyleProps {
  /** Element that opens the menu (rendered with asChild). */
  trigger: ReactNode;
  items: MenuEntry[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  /** Accessible name for the menu. */
  "aria-label"?: string;
}

export function DropdownMenu({ trigger, items, open, defaultOpen, onOpenChange, side = "bottom", align = "start", className, "aria-label": ariaLabel }: DropdownMenuProps) {
  const r = useRecipe("dropdownMenu", dropdownMenuRecipe);
  const container = usePortalContainer();
  return (
    <M.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <M.Trigger asChild>{trigger}</M.Trigger>
      <M.Portal container={container}>
        <M.Content side={side} align={align} sideOffset={6} collisionPadding={8} aria-label={ariaLabel} className={cn(r.content(), className)}>
          {renderMenuEntries(M, items, r)}
        </M.Content>
      </M.Portal>
    </M.Root>
  );
}
