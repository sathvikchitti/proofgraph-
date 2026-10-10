"use client";
/**
 * useSkinKey — a string that changes when <html data-skin> changes. The hex animations re-read their colour tokens
 * on theme changes (data-theme, class, OS scheme) but not on skin changes; remounting with this as `key` covers that.
 * Deps: react.
 */
import { useSyncExternalStore } from "react";

function subscribe(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-skin"] });
  return () => mo.disconnect();
}
const getSkin = () => document.documentElement.dataset.skin ?? "default";

export function useSkinKey() {
  return useSyncExternalStore(subscribe, getSkin, () => "default");
}
