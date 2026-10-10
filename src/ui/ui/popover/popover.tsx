"use client";
/** Popover — anchored floating panel. Deps: react, radix-ui (Popover), lib/cn, lib/skin, lib/portal. */
import type { ReactNode } from "react";
import { Popover as P } from "radix-ui";
import { cn } from "../../lib/cn";
import { usePortalContainer } from "../../lib/portal";
import { useRecipe } from "../../lib/skin";
import type { ClassNames, StyleProps } from "../../lib/types";
import { popoverRecipe } from "./popover.recipe";

export interface PopoverProps extends StyleProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Element that toggles the popover (rendered with asChild). */
  trigger: ReactNode;
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  width?: "auto" | "sm" | "md" | "lg";
  modal?: boolean;
  /** Accessible name for the panel when it has no heading. */
  "aria-label"?: string;
  classNames?: ClassNames<"content">;
}

export function Popover({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  children,
  side = "bottom",
  align = "start",
  sideOffset = 6,
  width = "md",
  modal = false,
  className,
  classNames,
  "aria-label": ariaLabel,
}: PopoverProps) {
  const r = useRecipe("popover", popoverRecipe);
  const container = usePortalContainer();
  return (
    <P.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} modal={modal}>
      <P.Trigger asChild>{trigger}</P.Trigger>
      <P.Portal container={container}>
        <P.Content side={side} align={align} sideOffset={sideOffset} collisionPadding={8} aria-label={ariaLabel} className={cn(r.content({ width }), className, classNames?.content)}>
          {children}
        </P.Content>
      </P.Portal>
    </P.Root>
  );
}

export const PopoverClose = P.Close;
