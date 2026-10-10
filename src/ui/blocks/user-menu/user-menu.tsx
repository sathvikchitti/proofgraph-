"use client";
/** UserMenu — avatar dropdown: identity, your items, theme choice and sign out. Deps: react, lucide-react, lib/*, hooks/use-theme, ui/avatar, ui/dropdown-menu. */
import { LogOut } from "lucide-react";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { Size, StyleProps } from "../../lib/types";
import { useTheme, type ThemeMode } from "../../hooks/use-theme";
import { Avatar } from "../../ui/avatar";
import { DropdownMenu, type MenuEntry } from "../../ui/dropdown-menu";
import { userMenuRecipe } from "./user-menu.recipe";

export interface UserMenuProps extends StyleProps {
  user: { name: string; email?: string; avatarUrl?: string };
  /** Extra entries between the identity header and the theme section (Profile, Settings…). */
  items?: MenuEntry[];
  onSignOut?: () => void;
  size?: Size;
  /** Hide the theme choice (e.g. when the topbar already has a ThemeToggle). */
  hideTheme?: boolean;
  /** Controlled theme instead of the document theme store. */
  theme?: ThemeMode;
  onThemeChange?: (theme: ThemeMode) => void;
  labels?: { account?: string; theme?: string; light?: string; dark?: string; system?: string; signOut?: string };
  align?: "start" | "center" | "end";
}

export function UserMenu({ user, items = [], onSignOut, size = "md", hideTheme = false, theme, onThemeChange, labels, align = "end", className }: UserMenuProps) {
  const r = useRecipe("userMenu", userMenuRecipe);
  const store = useTheme();
  const t = { account: "Account menu", theme: "Theme", light: "Light", dark: "Dark", system: "System", signOut: "Sign out", ...labels };
  const currentTheme = theme ?? store.theme;
  const pick = (v: string) => {
    if (theme === undefined) store.setTheme(v as ThemeMode);
    onThemeChange?.(v as ThemeMode);
  };

  const entries: MenuEntry[] = [
    {
      type: "label",
      label: (
        <span className={r.header()}>
          <span className={r.name()}>{user.name}</span>
          {user.email ? <span className={r.email()}>{user.email}</span> : null}
        </span>
      ),
    },
    ...(items.length ? ([{ type: "separator" }, ...items] as MenuEntry[]) : []),
    ...(hideTheme
      ? []
      : ([
          { type: "separator" },
          { type: "label", label: t.theme },
          { type: "radio", value: currentTheme, onValueChange: pick, options: [{ value: "light", label: t.light }, { value: "dark", label: t.dark }, { value: "system", label: t.system }] },
        ] as MenuEntry[])),
    ...(onSignOut ? ([{ type: "separator" }, { label: t.signOut, icon: <LogOut className="size-4" />, onSelect: onSignOut }] as MenuEntry[]) : []),
  ];

  return (
    <DropdownMenu
      aria-label={t.account}
      align={align}
      trigger={
        <button type="button" className={cn(r.trigger(), className)} aria-label={`${t.account}: ${user.name}`}>
          <Avatar name={user.name} src={user.avatarUrl} size={size} />
        </button>
      }
      items={entries}
    />
  );
}
