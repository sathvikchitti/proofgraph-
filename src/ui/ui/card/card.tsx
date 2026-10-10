"use client";
/** Card, CardHeader, CardBody, CardFooter. Deps: react, radix-ui (Slot), lib/cn, lib/skin. */
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { Slot } from "radix-ui";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { AsChildProps } from "../../lib/types";
import { cardRecipe } from "./card.recipe";

export interface CardProps extends HTMLAttributes<HTMLDivElement>, AsChildProps {
  variant?: "outline" | "raised" | "sunken";
  /** Hover + focus styling. Pair with `asChild` on an <a>/<button> for real interactivity. */
  interactive?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card({ variant, interactive = false, asChild, className, ...rest }, ref) {
  const r = useRecipe("card", cardRecipe);
  const Comp = asChild ? Slot.Root : "div";
  return <Comp ref={ref} className={cn(r.card({ variant, interactive }), className)} {...rest} />;
});

export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}

export function CardHeader({ title, description, actions, className, children, ...rest }: CardHeaderProps) {
  const r = useRecipe("card", cardRecipe);
  return (
    <div className={cn(r.header(), className)} {...rest}>
      <div className={r.headerText()}>
        {title ? <div className={r.title()}>{title}</div> : null}
        {description ? <div className={r.description()}>{description}</div> : null}
        {children}
      </div>
      {actions ? <div className={r.actions()}>{actions}</div> : null}
    </div>
  );
}

export const CardBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function CardBody({ className, ...rest }, ref) {
  const r = useRecipe("card", cardRecipe);
  return <div ref={ref} className={cn(r.body(), className)} {...rest} />;
});

export function CardFooter({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  const r = useRecipe("card", cardRecipe);
  return <div className={cn(r.footer(), className)} {...rest} />;
}
