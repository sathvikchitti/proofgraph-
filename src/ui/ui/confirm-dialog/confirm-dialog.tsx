"use client";
/**
 * ConfirmDialog — alertdialog with an async confirm: the button shows loading while `onConfirm` runs,
 * the dialog closes on success and stays open with the error on failure.
 * Deps: react, radix-ui (AlertDialog), lucide-react, lib/*, hooks/use-controllable-state, ui/dialog (recipe), ui/button.
 */
import { AlertCircle } from "lucide-react";
import { useState, type ReactNode } from "react";
import { AlertDialog as A } from "radix-ui";
import { cn } from "../../lib/cn";
import { normalizeError } from "../../lib/errors";
import { usePortalContainer } from "../../lib/portal";
import { useRecipe } from "../../lib/skin";
import type { Tone } from "../../lib/types";
import { useControllableState } from "../../hooks/use-controllable-state";
import { Button } from "../button";
import { dialogRecipe } from "../dialog/dialog.recipe";
import { confirmDialogRecipe } from "./confirm-dialog.recipe";

export interface ConfirmDialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** "danger" styles the confirm button as destructive. */
  tone?: Extract<Tone, "danger" | "warning" | "neutral">;
  /** May be async. A rejection keeps the dialog open and shows the error. */
  onConfirm: () => void | Promise<void>;
  className?: string;
}

export function ConfirmDialog({
  open,
  defaultOpen = false,
  onOpenChange,
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone,
  onConfirm,
  className,
}: ConfirmDialogProps) {
  const d = useRecipe("dialog", dialogRecipe);
  const r = useRecipe("confirmDialog", confirmDialogRecipe);
  const container = usePortalContainer();
  const [isOpen, setOpen] = useControllableState({ value: open, defaultValue: defaultOpen, onChange: onOpenChange });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirm = async () => {
    setPending(true);
    setError(null);
    try {
      await onConfirm();
      setOpen(false);
    } catch (e) {
      setError(normalizeError(e).title);
    } finally {
      setPending(false);
    }
  };

  return (
    <A.Root
      open={isOpen}
      onOpenChange={(o) => {
        if (pending) return;
        if (!o) setError(null);
        setOpen(o);
      }}
    >
      {trigger ? <A.Trigger asChild>{trigger}</A.Trigger> : null}
      <A.Portal container={container}>
        <A.Overlay className={d.overlay()} />
        <A.Content {...(description ? {} : { "aria-describedby": undefined })} className={cn(d.content({ size: "sm" }), className)}>
          <div className={d.header()}>
            <div className="min-w-0">
              <A.Title className={d.title()}>{title}</A.Title>
              {description ? <A.Description className={d.description()}>{description}</A.Description> : null}
            </div>
          </div>
          {error ? (
            <div className="px-5">
              <div role="alert" className={r.error()}>
                <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>{error}</span>
              </div>
            </div>
          ) : null}
          <div className={cn(d.footer(), "mt-4")}>
            <A.Cancel asChild>
              <Button variant="outline" tone="neutral" disabled={pending}>
                {cancelLabel}
              </Button>
            </A.Cancel>
            <Button tone={tone === "danger" ? "danger" : tone} loading={pending} onClick={confirm}>
              {confirmLabel}
            </Button>
          </div>
        </A.Content>
      </A.Portal>
    </A.Root>
  );
}
