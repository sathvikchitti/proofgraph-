"use client";
/** Tooltip — wraps a single focusable child; shows on hover and keyboard focus. Deps: react, radix-ui (Tooltip), lib/cn, lib/skin, lib/portal. */
import type { ReactElement, ReactNode } from "react";
import { Tooltip as T } from "radix-ui";
import { cn } from "../../lib/cn";
import { usePortalContainer } from "../../lib/portal";
import { useRecipe } from "../../lib/skin";
import type { StyleProps } from "../../lib/types";
import { tooltipRecipe } from "./tooltip.recipe";

export interface TooltipProps extends StyleProps {
  content: ReactNode;
  children: ReactElement;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  delayDuration?: number;
  /** Shortcut keys shown after the text, e.g. ["⌘", "S"]. */
  shortcut?: string[];
  disabled?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/** Share one delay across many tooltips (optional; each Tooltip also works alone). */
export const TooltipProvider = T.Provider;

export function Tooltip({ content, children, side = "top", align = "center", delayDuration = 300, shortcut, disabled = false, open, defaultOpen, onOpenChange, className }: TooltipProps) {
  const r = useRecipe("tooltip", tooltipRecipe);
  const container = usePortalContainer();
  if (disabled || content == null || content === "") return children;
  return (
    <T.Provider delayDuration={delayDuration}>
      <T.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
        <T.Trigger asChild>{children}</T.Trigger>
        <T.Portal container={container}>
          <T.Content side={side} align={align} sideOffset={6} collisionPadding={8} className={cn(r.content(), className)}>
            {content}
            {shortcut?.length ? (
              <span className="inline-flex gap-1">
                {shortcut.map((k, i) => (
                  <kbd key={`${k}-${i}`} className={r.kbd()}>
                    {k}
                  </kbd>
                ))}
              </span>
            ) : null}
          </T.Content>
        </T.Portal>
      </T.Root>
    </T.Provider>
  );
}
