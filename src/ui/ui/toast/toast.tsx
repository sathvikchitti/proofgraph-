"use client";
/**
 * Toast — sonner, themed through recipe class names. Mount <Toaster /> once; call `toast.success(...)`,
 * `toast.error("Could not save", { action: { label: "Retry", onClick } })`, etc. anywhere.
 * Deps: react, sonner, lucide-react, lib/skin, ui/spinner.
 */
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { Toaster as Sonner, toast } from "sonner";
import { useRecipe } from "../../lib/skin";
import { toastRecipe } from "./toast.recipe";

export { toast };

export interface ToasterProps {
  position?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
  duration?: number;
  visibleToasts?: number;
  closeButton?: boolean;
  /** Accessible name of the notifications region. */
  label?: string;
}

export function Toaster({ position = "bottom-right", duration = 5000, visibleToasts = 4, closeButton = false, label = "Notifications" }: ToasterProps) {
  const r = useRecipe("toast", toastRecipe);
  return (
    <Sonner
      position={position}
      duration={duration}
      visibleToasts={visibleToasts}
      closeButton={closeButton}
      containerAriaLabel={label}
      icons={{
        success: <CheckCircle2 data-icon className={r.icon} aria-hidden />,
        error: <XCircle data-icon className={r.icon} aria-hidden />,
        warning: <AlertTriangle data-icon className={r.icon} aria-hidden />,
        info: <Info data-icon className={r.icon} aria-hidden />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: r.toast,
          content: r.content,
          title: r.title,
          description: r.description,
          success: r.success,
          error: r.error,
          warning: r.warning,
          info: r.info,
          actionButton: r.actionButton,
          cancelButton: r.cancelButton,
          closeButton: r.closeButton,
        },
      }}
    />
  );
}
