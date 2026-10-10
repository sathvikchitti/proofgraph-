"use client";
import { useMemo, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Eye, Settings } from "lucide-react";
import { FEATURES, PRODUCT_NAME, ROLE_LABEL, ROLES, type Role } from "../lib/config";
import { markSigningOut, useRequireSession } from "../lib/auth";
import { activeEntry, homeHref, NAV } from "../lib/nav/nav-config";
import { useSignOut, useSwitchRole, useUnreadCount } from "../lib/queries";
import { AppShell, type NavSection } from "../ui/layout/app-shell";
import { UserMenu } from "../ui/blocks/user-menu";
import { WorkspaceSwitcher } from "../ui/blocks/workspace-switcher";
import { IconButton } from "../ui/ui/button";
import { HexBadge } from "../ui/ui/hex-badge";
import { Spinner } from "../ui/ui/spinner";
import { ThemeToggle } from "../ui/ui/theme-toggle";

function sectionsFor(role: Role, unread: number): NavSection[] {
  return NAV[role].map((group, i) => ({
    id: group.label ?? `group-${i}`,
    label: group.label,
    items: group.items.map((e) => ({
      id: e.id,
      label: e.label,
      href: e.href,
      icon: <e.icon className="size-4" aria-hidden="true" />,
      badge: e.id === "notifications" && unread > 0 ? unread : undefined,
    })),
  }));
}

/** The signed-in frame: sidebar from the role's nav config, workspace switcher (demo), topbar, then the page. */
export function AppFrame({ children }: { children: ReactNode }) {
  const session = useRequireSession();
  const pathname = usePathname();
  const router = useRouter();
  const unread = useUnreadCount();
  const signOut = useSignOut();
  const switchRole = useSwitchRole();
  const role = session.status === "ready" ? session.user.role : undefined;
  const nav = useMemo(() => (role ? sectionsFor(role, unread) : []), [role, unread]);

  if (session.status === "loading" || !role) {
    return (
      <div className="grid min-h-screen place-items-center bg-bg">
        <Spinner label="Loading" size="lg" />
      </div>
    );
  }
  const { user } = session;

  return (
    <AppShell
      nav={nav}
      activeId={activeEntry(role, pathname)?.id ?? (pathname === "/notifications" ? "notifications" : pathname === "/settings" ? "settings" : "home")}
      persistKey="pg.sidebar"
      brand={
        <Link href={homeHref(role)} className="flex items-center gap-2 font-(family-name:--font-display) text-sm font-bold tracking-[-0.03em] [font-stretch:118%]">
          <HexBadge size="sm" className="-my-1 scale-75"><Eye /></HexBadge>
          {PRODUCT_NAME}
        </Link>
      }
      brandCollapsed={<HexBadge size="sm" className="scale-75"><Eye /></HexBadge>}
      sidebarHeader={({ collapsed }) =>
        FEATURES.demoWorkspaceSwitcher ? (
          <WorkspaceSwitcher
            compact={collapsed}
            menuLabel="Switch demo workspace"
            value={role}
            workspaces={ROLES.map((r) => ({ id: r, name: ROLE_LABEL[r], role: "Demo workspace" }))}
            onValueChange={(next) => switchRole.mutate(next as Role, { onSuccess: () => router.push(homeHref(next as Role)) })}
          />
        ) : null
      }
      renderLink={({ item, className, current, children: label, onClick }) => (
        <Link href={item.href ?? "#"} className={className} aria-current={current ? "page" : undefined} onClick={onClick}>
          {label}
        </Link>
      )}
      topbar={
        <div className="ml-auto flex items-center gap-1.5">
          <IconButton asChild label={unread ? `Notifications, ${unread} unread` : "Notifications"} variant="ghost">
            <Link href="/notifications" className="relative">
              <Bell className="size-4" aria-hidden="true" />
              {unread > 0 ? <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-accent ring-2 ring-bg-raised" aria-hidden="true" /> : null}
            </Link>
          </IconButton>
          <ThemeToggle variant="cycle" size="sm" />
          <UserMenu
            user={{ name: user.name, email: user.email }}
            hideTheme
            items={[{ label: "Settings", icon: <Settings className="size-4" aria-hidden="true" />, onSelect: () => router.push("/settings") }]}
            labels={{ signOut: "Sign out" }}
            onSignOut={() => {
              markSigningOut();
              signOut.mutate();
            }}
          />
        </div>
      }
    >
      {children}
    </AppShell>
  );
}

