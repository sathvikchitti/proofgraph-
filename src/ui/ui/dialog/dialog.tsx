"use client";
/**
 * Dialog — modal with title, description, body and footer slots.
 * Deps: react, radix-ui (Dialog), lucide-react, lib/cn, lib/skin, lib/portal, hooks/use-controllable-state.
 */
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Dialog as D } from "radix-ui";
import { cn } from "../../lib/cn";
import { usePortalContainer } from "../../lib/portal";
import { useRecipe } from "../../lib/skin";
import type { ClassNames, Size, StyleProps } from "../../lib/types";
import { dialogRecipe } from "./dialog.recipe";

export interface DialogProps extends StyleProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Element that opens the dialog (rendered with asChild). */
  trigger?: ReactNode;
  /** Required: the dialog's accessible name. */
  title: ReactNode;
  /** Hide the title visually but keep it for assistive tech. */
  hideTitle?: boolean;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: Size;
  hideClose?: boolean;
  closeLabel?: string;
  classNames?: ClassNames<"overlay" | "content" | "header" | "title" | "description" | "body" | "footer" | "close">;
}

export function Dialog({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  title,
  hideTitle = false,
  description,
  children,
  footer,
  size = "md",
  hideClose = false,
  closeLabel = "Close",
  className,
  classNames,
}: DialogProps) {
  const r = useRecipe("dialog", dialogRecipe);
  const container = usePortalContainer();
  return (
    <D.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {trigger ? <D.Trigger asChild>{trigger}</D.Trigger> : null}
      <D.Portal container={container}>
        <D.Overlay className={cn(r.overlay(), classNames?.overlay)} />
        <D.Content
          {...(description ? {} : { "aria-describedby": undefined })}
          className={cn(r.content({ size }), className, classNames?.content)}
        >
          <div className={cn(r.header(), hideTitle && "pointer-events-none absolute right-3 top-3 z-10 border-0 p-0", classNames?.header)}>
            <div className="min-w-0">
              <D.Title className={cn(r.title(), hideTitle && "sr-only", classNames?.title)}>{title}</D.Title>
              {description ? <D.Description className={cn(r.description(), classNames?.description)}>{description}</D.Description> : null}
            </div>
            {hideClose ? null : (
              <D.Close aria-label={closeLabel} className={cn(r.close(), hideTitle && "pointer-events-auto m-0", classNames?.close)}>
                <X className="size-4" aria-hidden />
              </D.Close>
            )}
          </div>
          {children ? <div className={cn(r.body(), classNames?.body)}>{children}</div> : null}
          {footer ? <div className={cn(r.footer(), classNames?.footer)}>{footer}</div> : null}
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}

/** Close the surrounding dialog from any element inside it. */
export const DialogClose = D.Close;
