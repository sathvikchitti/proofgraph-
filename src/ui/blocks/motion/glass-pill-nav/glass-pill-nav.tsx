"use client";
/**
 * GlassPillNav — frosted-glass pill navigation: hover floods the pill, on phones it becomes a menu button.
 * Colours come from --hx-glass-*. It is absolutely positioned (top: 1em) — mount it inside a positioned header.
 * Pass `LinkComponent` (e.g. next/link) for client-side routing; without it items are plain anchors.
 * Deps: react, vendor/hex-animations.
 */
import "../../../vendor/hex-animations/dist/animations.css";
import { HxPillNav, type PillNavItem as HexPillNavItem, type PillNavProps } from "../../../vendor/hex-animations/dist/micro-animations.js";
import { useSkinKey } from "../use-skin-key";

export type GlassPillNavItem = HexPillNavItem;
export type GlassPillNavProps = PillNavProps;

export function GlassPillNav(props: GlassPillNavProps) {
  const skin = useSkinKey();
  return <HxPillNav key={skin} {...props} />;
}
