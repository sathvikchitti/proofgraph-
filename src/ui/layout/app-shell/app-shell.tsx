"use client";
/**
 * AppShell — sidebar + topbar + main. The sidebar collapses to an icon rail on desktop (optionally persisted)
 * and becomes a Sheet below `lg`. Navigation comes from config (sections, icons, badges); bring your own router
 * through `renderLink`. Includes a skip-to-content link and aria-current on the active item.
 * Deps: react, lucide-react, lib/*, hooks/use-controllable-state, hooks/use-local-storage, hooks/use-media-query, ui/sheet, ui/tooltip.
 */
import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useEffect, useId, useState, type MouseEvent, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { ClassNames, StyleProps } from "../../lib/types";
import { useLocalStorage } from "../../hooks/use-local-storage";
import { useMediaQuery } from "../../hooks/use-media-query";
import { Sheet } from "../../ui/sheet";
import { Tooltip } from "../../ui/tooltip";
import { appShellRecipe } from "./app-shell.recipe";

export interface NavItem {
  id: string;
  label: string;
  icon?: ReactNode;
  href?: string;
  /** Number or node shown at the end (a dot when the rail is collapsed). */
  badge?: ReactNode;
  disabled?: boolean;
}

export interface NavSection {
  id?: string;
  label?: string;
  items: NavItem[];
}

export interface NavLinkRenderProps {
  item: NavItem;
  className: string;
  current: boolean;
  children: ReactNode;
  onClick?: (e: MouseEvent) => void;
}

export interface AppShellLabels {
  skipToContent: string;
  openNav: string;
  closeNav: string;
  navigation: string;
  collapse: string;
  expand: string;
}
const DEFAULT_LABELS: AppShellLabels = { skipToContent: "Skip to content", openNav: "Open navigation", closeNav: "Close", navigation: "Main navigation", collapse: "Collapse sidebar", expand: "Expand sidebar" };

export interface AppShellProps extends StyleProps {
  nav: NavSection[];
  /** Id of the current item. */
  activeId?: string;
  /** Logo / product name at the top of the sidebar. */
  brand?: ReactNode;
  /** Compact brand shown when the rail is collapsed. */
  brandCollapsed?: ReactNode;
  /** Under the brand, e.g. a WorkspaceSwitcher. Receives `collapsed`. */
  sidebarHeader?: ReactNode | ((ctx: { collapsed: boolean }) => ReactNode);
  sidebarFooter?: ReactNode | ((ctx: { collapsed: boolean }) => ReactNode);
  /** Topbar content (search, notifications, UserMenu…). */
  topbar?: ReactNode;
  children: ReactNode;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Remember the collapsed state in localStorage. */
  persistKey?: string;
  collapsible?: boolean;
  /** Called on nav clicks; call `e.preventDefault()` to route client-side. */
  onNavigate?: (item: NavItem, e: MouseEvent) => void;
  renderLink?: (props: NavLinkRenderProps) => ReactNode;
  /** Fill the parent's height instead of the viewport (for embedding in a page or story). */
  contained?: boolean;
  labels?: Partial<AppShellLabels>;
  classNames?: ClassNames<"root" | "sidebar" | "topbar" | "content">;
}

export function AppShell({
  nav,
  activeId,
  brand,
  brandCollapsed,
  sidebarHeader,
  sidebarFooter,
  topbar,
  children,
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  persistKey,
  collapsible = true,
  onNavigate,
  renderLink,
  contained = false,
  labels: labelOverrides,
  className,
  classNames,
}: AppShellProps) {
  const r = useRecipe("appShell", appShellRecipe);
  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const mainId = useId().replace(/:/g, "");
  const [stored, setStored] = useLocalStorage<boolean>(persistKey ?? null, defaultCollapsed);
  const isCollapsed = collapsed ?? stored;
  const setCollapsed = (v: boolean) => {
    if (collapsed === undefined) setStored(v);
    onCollapsedChange?.(v);
  };
  const [sheetOpen, setSheetOpen] = useState(false);
  const desktop = useMediaQuery("(min-width: 1024px)");
  useEffect(() => {
    if (desktop) setSheetOpen(false);
  }, [desktop]);

  const renderItem = (item: NavItem, rail: boolean) => {
    const current = item.id === activeId;
    const className = cn("group", r.item({ collapsed: rail }));
    const content = (
      <>
        {item.icon ? <span className={r.icon()} aria-hidden>{item.icon}</span> : null}
        {rail ? <span className="sr-only">{item.label}</span> : <span className={r.itemLabel()}>{item.label}</span>}
        {item.badge !== undefined && item.badge !== null && item.badge !== false ? (rail ? <span className={r.dot()} aria-hidden /> : <span className={r.badge()}>{item.badge}</span>) : null}
      </>
    );
    const onClick = (e: MouseEvent) => {
      onNavigate?.(item, e);
      setSheetOpen(false);
    };
    const node = renderLink ? (
      renderLink({ item, className, current, children: content, onClick })
    ) : (
      <a href={item.href ?? "#"} className={className} aria-current={current ? "page" : undefined} aria-disabled={item.disabled || undefined} onClick={onClick}>
        {content}
      </a>
    );
    return (
      <li key={item.id}>
        {rail ? (
          <Tooltip content={item.label} side="right">
            {node as React.ReactElement}
          </Tooltip>
        ) : (
          node
        )}
      </li>
    );
  };

  const renderNav = (rail: boolean) => (
    <nav aria-label={labels.navigation} className={r.nav()}>
      {nav.map((section, i) => (
        <div key={section.id ?? i} className={r.section()}>
          {section.label && !rail ? <div className={r.sectionLabel()}>{section.label}</div> : null}
          <ul className={r.list()}>{section.items.map((it) => renderItem(it, rail))}</ul>
        </div>
      ))}
    </nav>
  );

  const slot = (s: AppShellProps["sidebarHeader"], rail: boolean) => (typeof s === "function" ? s({ collapsed: rail }) : s);

  return (
    <div className={cn(r.root({ contained }), className, classNames?.root)}>
      <a href={`#${mainId}`} className={r.skip()}>
        {labels.skipToContent}
      </a>
      <aside className={cn(r.sidebar({ collapsed: isCollapsed, contained }), classNames?.sidebar)}>
        <div className={r.brand({ collapsed: isCollapsed })}>{isCollapsed ? (brandCollapsed ?? brand) : brand}</div>
        {sidebarHeader ? <div className={r.head()}>{slot(sidebarHeader, isCollapsed)}</div> : null}
        {renderNav(isCollapsed)}
        <div className={r.footer()}>
          {slot(sidebarFooter, isCollapsed)}
          {collapsible ? (
            <button type="button" className={r.collapseButton({ collapsed: isCollapsed })} aria-pressed={isCollapsed} aria-label={isCollapsed ? labels.expand : labels.collapse} onClick={() => setCollapsed(!isCollapsed)}>
              {isCollapsed ? <PanelLeftOpen className="size-4" aria-hidden /> : <PanelLeftClose className="size-4" aria-hidden />}
              {isCollapsed ? null : <span>{labels.collapse}</span>}
            </button>
          ) : null}
        </div>
      </aside>

      <div className={r.main()}>
        <header className={cn(r.topbar({ contained }), classNames?.topbar)}>
          <Sheet
            side="left"
            size="sm"
            open={sheetOpen}
            onOpenChange={setSheetOpen}
            trigger={
              <button type="button" className={r.menuButton()} aria-label={labels.openNav}>
                <Menu className="size-5" aria-hidden />
              </button>
            }
            title={labels.navigation}
            hideTitle
            closeLabel={labels.closeNav}
          >
            <div className={r.sheetNav()}>
              <div className={r.brand()}>{brand}</div>
              {sidebarHeader ? <div className={r.head()}>{slot(sidebarHeader, false)}</div> : null}
              {renderNav(false)}
              {sidebarFooter ? <div className={r.footer()}>{slot(sidebarFooter, false)}</div> : null}
            </div>
          </Sheet>
          <div className={r.topbarContent()}>{topbar}</div>
        </header>
        <main id={mainId} tabIndex={-1} className={cn(r.content({ contained }), classNames?.content)}>
          {children}
        </main>
      </div>
    </div>
  );
}
