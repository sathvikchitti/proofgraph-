"use client";
/** Stack, Grid, Section, Container — gap-based spacing helpers (density-aware). Deps: react, radix-ui (Slot), lib/cn, lib/skin. */
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { Slot } from "radix-ui";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { AsChildProps, ClassNames } from "../../lib/types";
import { stackRecipe } from "./stack.recipe";

type Gap = "none" | "xs" | "sm" | "md" | "lg" | "xl";

export interface StackProps extends HTMLAttributes<HTMLElement>, AsChildProps {
  as?: "div" | "ul" | "ol" | "section" | "nav" | "header" | "footer";
  direction?: "column" | "row";
  /** "md" follows the density token --gap-stack. */
  gap?: Gap;
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  justify?: "start" | "center" | "end" | "between";
  wrap?: boolean;
}

export function Stack({ as: Tag = "div", direction, gap, align, justify, wrap, asChild, className, ...rest }: StackProps) {
  const r = useRecipe("stack", stackRecipe);
  const Comp = asChild ? Slot.Root : Tag;
  return <Comp className={cn(r.stack({ direction, gap, align, justify, wrap: !!wrap }), className)} {...rest} />;
}

type Cols = 1 | 2 | 3 | 4 | 6;
export interface GridProps extends HTMLAttributes<HTMLDivElement>, AsChildProps {
  /** Columns per breakpoint (mobile first). Default: 1 → sm 2 → lg 3 when only `columns` is a number. */
  columns?: Cols | { base?: Cols; sm?: Cols; md?: Cols; lg?: Cols };
  /** Auto-fill as many columns as fit, each at least this wide (CSS length). Overrides `columns`. */
  minItemWidth?: string;
  gap?: Gap;
}

export function Grid({ columns = 3, minItemWidth, gap, asChild, className, style, ...rest }: GridProps) {
  const r = useRecipe("stack", stackRecipe);
  const c = typeof columns === "number" ? { base: 1 as Cols, sm: (columns >= 2 ? 2 : 1) as Cols, lg: columns } : columns;
  const Comp = asChild ? Slot.Root : "div";
  return (
    <Comp
      className={cn(r.grid({ gap, base: minItemWidth ? undefined : c.base ?? 1, sm: minItemWidth ? undefined : c.sm, md: minItemWidth ? undefined : c.md, lg: minItemWidth ? undefined : c.lg, auto: !!minItemWidth }), className)}
      style={minItemWidth ? ({ ...style, "--min-item": minItemWidth } as CSSProperties) : style}
      {...rest}
    />
  );
}

export interface SectionProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  /** Heading level for the title (visual size is unchanged). */
  headingLevel?: 2 | 3 | 4;
  spacing?: "none" | "sm" | "md" | "lg";
  classNames?: ClassNames<"head" | "title" | "description">;
}

export function Section({ title, description, actions, headingLevel = 2, spacing, className, classNames, children, ...rest }: SectionProps) {
  const r = useRecipe("stack", stackRecipe);
  const H = `h${headingLevel}` as const;
  return (
    <section className={cn(r.section({ spacing }), className)} {...rest}>
      {title || actions ? (
        <div className={cn(r.sectionHead(), classNames?.head)}>
          <div className="min-w-0">
            {title ? <H className={cn(r.sectionTitle(), classNames?.title)}>{title}</H> : null}
            {description ? <p className={cn(r.sectionDescription(), classNames?.description)}>{description}</p> : null}
          </div>
          {actions ? <div className={r.sectionActions()}>{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export interface ContainerProps extends HTMLAttributes<HTMLDivElement>, AsChildProps {
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /** Horizontal page padding (default true). */
  padded?: boolean;
}

export function Container({ size, padded, asChild, className, ...rest }: ContainerProps) {
  const r = useRecipe("stack", stackRecipe);
  const Comp = asChild ? Slot.Root : "div";
  return <Comp className={cn(r.container({ size, padded }), className)} {...rest} />;
}
