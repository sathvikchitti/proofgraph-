"use client";
/**
 * Link — internal and external. External links open in a new tab with a safe rel and an
 * announced hint. Pass `asChild` to wrap a router link. Deps: react, radix-ui (Slot), lucide-react, lib/cn, lib/skin.
 */
import { forwardRef, type AnchorHTMLAttributes } from "react";
import { ExternalLink } from "lucide-react";
import { Slot } from "radix-ui";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { AsChildProps } from "../../lib/types";
import { linkRecipe } from "./link.recipe";

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement>, AsChildProps {
  variant?: "default" | "muted" | "plain";
  underline?: "always" | "hover" | "none";
  /** Force external behavior; by default an absolute http(s) href is external. */
  external?: boolean;
  externalLabel?: string;
}

const isExternalHref = (href?: string) => !!href && /^https?:\/\//i.test(href);

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { variant, underline, external, externalLabel = "(opens in a new tab)", asChild, className, children, ...rest },
  ref,
) {
  const recipe = useRecipe("link", linkRecipe);
  const href = rest.href;
  const isExternal = external ?? isExternalHref(href);
  const classes = cn(recipe({ variant, underline }), className);
  if (asChild) {
    return (
      <Slot.Root ref={ref} className={classes} {...rest}>
        {children}
      </Slot.Root>
    );
  }
  return (
    <a
      ref={ref}
      className={classes}
      {...rest}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
      {isExternal ? (
        <>
          <ExternalLink className="size-3 shrink-0" aria-hidden />
          <span className="sr-only">{externalLabel}</span>
        </>
      ) : null}
    </a>
  );
});
