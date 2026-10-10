"use client";
/** Alert / Callout — inline message with tone, optional actions and dismiss. Deps: react, lucide-react, lib/cn, lib/skin. */
import { AlertOctagon, AlertTriangle, CheckCircle2, Info, X, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { ClassNames, StyleProps, Tone } from "../../lib/types";
import { alertRecipe } from "./alert.recipe";

const ICONS: Record<Tone, LucideIcon> = { neutral: Info, info: Info, success: CheckCircle2, warning: AlertTriangle, danger: AlertOctagon };

export interface AlertProps extends StyleProps {
  tone?: Tone;
  /** "callout" = left accent bar. */
  variant?: "subtle" | "outline" | "callout";
  title?: ReactNode;
  children?: ReactNode;
  /** Replace the default icon, or `false` to hide it. */
  icon?: ReactNode | false;
  actions?: ReactNode;
  onDismiss?: () => void;
  dismissLabel?: string;
  /** Defaults: "alert" for warning/danger, "status" otherwise. */
  role?: "alert" | "status" | "note";
  classNames?: ClassNames<"root" | "icon" | "title" | "description" | "actions" | "dismiss">;
}

export function Alert({ tone = "info", variant, title, children, icon, actions, onDismiss, dismissLabel = "Dismiss", role, className, classNames }: AlertProps) {
  const r = useRecipe("alert", alertRecipe);
  const Glyph = ICONS[tone];
  return (
    <div
      data-tone={tone}
      role={role ?? (tone === "danger" || tone === "warning" ? "alert" : "status")}
      className={cn(r.root({ variant }), className, classNames?.root)}
    >
      {icon === false ? null : <span className={cn(r.icon(), classNames?.icon)}>{icon ?? <Glyph className="size-4" aria-hidden />}</span>}
      <div className={r.body()}>
        {title ? <div className={cn(r.title(), classNames?.title)}>{title}</div> : null}
        {children ? <div className={cn(title ? r.description() : "text-fg", classNames?.description)}>{children}</div> : null}
        {actions ? <div className={cn(r.actions(), classNames?.actions)}>{actions}</div> : null}
      </div>
      {onDismiss ? (
        <button type="button" aria-label={dismissLabel} className={cn(r.dismiss(), classNames?.dismiss)} onClick={onDismiss}>
          <X className="size-4" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
