"use client";
/** Banner — page-wide notice, optionally dismissible. Deps: react, lucide-react, lib/cn, lib/skin, hooks/use-controllable-state. */
import { Info, X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { StyleProps, Tone } from "../../lib/types";
import { useControllableState } from "../../hooks/use-controllable-state";
import { bannerRecipe } from "./banner.recipe";

export interface BannerProps extends StyleProps {
  tone?: Tone;
  variant?: "subtle" | "solid";
  children: ReactNode;
  icon?: ReactNode | false;
  /** Right-aligned slot, e.g. a link or button. */
  action?: ReactNode;
  dismissible?: boolean;
  dismissLabel?: string;
  /** Visibility, controlled or uncontrolled. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  sticky?: boolean;
}

export function Banner({
  tone = "info",
  variant,
  children,
  icon,
  action,
  dismissible = false,
  dismissLabel = "Dismiss",
  open,
  defaultOpen = true,
  onOpenChange,
  sticky = false,
  className,
}: BannerProps) {
  const r = useRecipe("banner", bannerRecipe);
  const [visible, setVisible] = useControllableState({ value: open, defaultValue: defaultOpen, onChange: onOpenChange });
  if (!visible) return null;
  return (
    <div data-tone={tone} role="region" aria-label="Notice" className={cn(r.root({ variant, sticky }), className)}>
      {icon === false ? null : <span className={r.icon()}>{icon ?? <Info className="size-4" aria-hidden />}</span>}
      <div className={r.body()}>{children}</div>
      {action ? <div className={r.action()}>{action}</div> : null}
      {dismissible ? (
        <button type="button" aria-label={dismissLabel} className={r.dismiss()} onClick={() => setVisible(false)}>
          <X className="size-4" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
