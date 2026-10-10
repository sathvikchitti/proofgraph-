"use client";
/**
 * Button, IconButton, ButtonGroup.
 * Deps: react, radix-ui (Slot), lib/cn, lib/skin, ui/spinner.
 * With `asChild`, `leading`/`trailing`/`loading` are ignored (the single child is the content).
 */
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Slot } from "radix-ui";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { AsChildProps, Size, StyleProps, Tone } from "../../lib/types";
import { Spinner } from "../spinner";
import { buttonRecipe } from "./button.recipe";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, AsChildProps {
  variant?: "solid" | "soft" | "outline" | "ghost" | "link";
  size?: Size;
  /** Omitted = the accent color. */
  tone?: Tone;
  loading?: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
  fullWidth?: boolean;
  iconOnly?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size = "md", tone, loading = false, leading, trailing, fullWidth, iconOnly, asChild, className, children, disabled, type, ...rest },
  ref,
) {
  const r = useRecipe("button", buttonRecipe);
  const classes = cn(r.button({ variant, size, iconOnly: !!iconOnly, fullWidth: !!fullWidth }), className);
  const common = { ref, "data-tone": tone ?? "accent", className: classes } as const;

  if (asChild) {
    return (
      <Slot.Root {...common} {...rest} aria-disabled={disabled || loading || undefined}>
        {children}
      </Slot.Root>
    );
  }
  return (
    <button {...common} {...rest} type={type ?? "button"} disabled={disabled || loading} aria-busy={loading || undefined}>
      {loading ? <Spinner size={size === "lg" ? "md" : "sm"} /> : leading}
      {children}
      {!loading ? trailing : null}
    </button>
  );
});

export interface IconButtonProps extends Omit<ButtonProps, "leading" | "trailing" | "iconOnly" | "fullWidth"> {
  /** Required accessible name (icon-only buttons have no text). */
  label: string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, variant = "ghost", tone = "neutral", ...rest },
  ref,
) {
  return <Button ref={ref} iconOnly variant={variant} tone={tone} aria-label={label} title={rest.title ?? label} {...rest} />;
});

export interface ButtonGroupProps extends StyleProps {
  attached?: boolean;
  orientation?: "horizontal" | "vertical";
  children: ReactNode;
  "aria-label"?: string;
}

export function ButtonGroup({ attached = true, orientation = "horizontal", className, children, ...rest }: ButtonGroupProps) {
  const r = useRecipe("button", buttonRecipe);
  return (
    <div role="group" className={cn(r.group({ attached, orientation }), className)} {...rest}>
      {children}
    </div>
  );
}
