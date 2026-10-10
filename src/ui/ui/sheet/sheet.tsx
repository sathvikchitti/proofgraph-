"use client";
/** Sheet / Drawer — side or bottom panel. Deps: react, radix-ui (Dialog), lucide-react, lib/cn, lib/skin, lib/portal. */
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Dialog as D } from "radix-ui";
import { cn } from "../../lib/cn";
import { usePortalContainer } from "../../lib/portal";
import { useRecipe } from "../../lib/skin";
import type { ClassNames, Size, StyleProps } from "../../lib/types";
import { sheetRecipe } from "./sheet.recipe";

export interface SheetProps extends StyleProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  side?: "right" | "left" | "bottom" | "top";
  size?: Size;
  /** Required: the panel's accessible name. */
  title: ReactNode;
  hideTitle?: boolean;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  closeLabel?: string;
  classNames?: ClassNames<"overlay" | "content" | "header" | "title" | "description" | "body" | "footer" | "close">;
}

export function Sheet({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  side = "right",
  size = "md",
  title,
  hideTitle = false,
  description,
  children,
  footer,
  closeLabel = "Close",
  className,
  classNames,
}: SheetProps) {
  const r = useRecipe("sheet", sheetRecipe);
  const container = usePortalContainer();
  return (
    <D.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {trigger ? <D.Trigger asChild>{trigger}</D.Trigger> : null}
      <D.Portal container={container}>
        <D.Overlay className={cn(r.overlay(), classNames?.overlay)} />
        <D.Content {...(description ? {} : { "aria-describedby": undefined })} className={cn(r.content({ side, size }), className, classNames?.content)}>
          <div className={cn(r.header(), hideTitle && "pointer-events-none absolute right-3 top-3 z-10 border-0 p-0", classNames?.header)}>
            <div className="min-w-0">
              <D.Title className={cn(r.title(), hideTitle && "sr-only", classNames?.title)}>{title}</D.Title>
              {description ? <D.Description className={cn(r.description(), classNames?.description)}>{description}</D.Description> : null}
            </div>
            <D.Close aria-label={closeLabel} className={cn(r.close(), hideTitle && "pointer-events-auto m-0", classNames?.close)}>
              <X className="size-4" aria-hidden />
            </D.Close>
          </div>
          <div className={cn(r.body(), classNames?.body)}>{children}</div>
          {footer ? <div className={cn(r.footer(), classNames?.footer)}>{footer}</div> : null}
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}

export const SheetClose = D.Close;
