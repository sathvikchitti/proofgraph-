/* Type declarations for hex-ui's prebuilt dist (not part of hex-ui). */
import type { ComponentType, ElementType, ReactNode } from "react";

export interface ThoughtLineProps {
  label?: string;
  doneLabel?: string;
  glyph?: string;
  steps?: string[];
  collapsible?: boolean;
  collapseOnSettle?: boolean;
  color?: string;
  glyphColor?: string;
  fontSize?: number;
  shimmer?: boolean;
  working?: boolean;
  settleAfter?: number;
  elapsed?: number;
  showTimer?: boolean;
  onSettle?: (seconds: number) => void;
  className?: string;
}
export const HxThoughtLine: ComponentType<ThoughtLineProps>;

export interface SpringCheckProps {
  label?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  boxSize?: number;
  boxRadius?: number;
  fontSize?: number;
  bounce?: number;
  doneOpacity?: number;
  strike?: "left" | "center" | "right";
  ariaLabel?: string;
  className?: string;
}
export const HxCheckbox: ComponentType<SpringCheckProps>;

export interface PillNavItem {
  label: string;
  href: string;
}
export interface PillNavProps {
  logo?: ReactNode | string;
  logoAlt?: string;
  items: PillNavItem[];
  activeHref?: string;
  className?: string;
  ease?: string;
  LinkComponent?: ElementType;
  onMobileMenuClick?: () => void;
  initialLoadAnimation?: boolean;
  glass?: boolean;
}
/** Glass PillNav: colours from --hx-glass-* tokens. Positioned absolutely inside a positioned parent. */
export const HxPillNav: ComponentType<PillNavProps>;
