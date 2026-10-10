"use client";
/** AppWindow — framed app mockup with an app bar (logo, title, actions) or a macOS-style chrome bar. Deps: react, lib/cn, lib/skin. */
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { ClassNames, StyleProps } from "../../lib/types";
import { appWindowRecipe } from "./app-window.recipe";

export type AppWindowPart = "root" | "bar" | "title" | "body";

export interface AppWindowProps extends StyleProps {
  /** Bar title. A string also names the window for assistive technology. */
  title?: ReactNode;
  /** Accessible name when `title` is not a string. */
  "aria-label"?: string;
  /** App bar only: brand mark at the start. */
  logo?: ReactNode;
  /** App bar: controls at the end. Chrome bar: a small trailing icon. */
  actions?: ReactNode;
  /** macOS-style bar with traffic-light dots and a centered mono title. */
  chrome?: boolean;
  /** Chrome bar only: where the title sits. */
  titleAlign?: "center" | "start";
  /** Hide the bar entirely. */
  bare?: boolean;
  classNames?: ClassNames<AppWindowPart>;
  children?: ReactNode;
}

export function AppWindow({ title, "aria-label": ariaLabel, logo, actions, chrome = false, titleAlign = "center", bare = false, className, classNames, children }: AppWindowProps) {
  const r = useRecipe("appWindow", appWindowRecipe);
  const name = ariaLabel ?? (typeof title === "string" ? title : undefined);
  return (
    <div role="group" aria-label={name} className={cn(r.root(), className, classNames?.root)}>
      {bare ? null : (
        <div className={cn(r.bar({ chrome, align: titleAlign }), classNames?.bar)}>
          {chrome ? (
            <span className={r.traffic()} aria-hidden="true">
              <i className={r.dot()} />
              <i className={r.dot()} />
              <i className={r.dot()} />
            </span>
          ) : logo ? (
            <span className={r.logo()}>{logo}</span>
          ) : null}
          {title ? <span className={cn(r.title({ chrome }), classNames?.title)}>{title}</span> : null}
          {chrome ? (actions ? <span className={r.end()}>{actions}</span> : null) : (
            <>
              <span className={r.spacer()} />
              {actions ? <span className={r.actions()}>{actions}</span> : null}
            </>
          )}
        </div>
      )}
      <div className={cn(r.body(), classNames?.body)}>{children}</div>
    </div>
  );
}
