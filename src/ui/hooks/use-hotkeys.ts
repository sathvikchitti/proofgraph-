/** useHotkeys — global keyboard shortcuts. "mod" = ⌘ on Apple platforms, Ctrl elsewhere. Deps: react. */
import { useEffect, useRef } from "react";

export type HotkeyMap = Record<string, (e: KeyboardEvent) => void>;

const isApple = () => typeof navigator !== "undefined" && /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent);

export function matchesCombo(e: KeyboardEvent, combo: string, apple = isApple()): boolean {
  const parts = combo.toLowerCase().split("+").map((p) => p.trim());
  const key = parts[parts.length - 1];
  const mods = new Set(parts.slice(0, -1));
  const wantMeta = mods.has("meta") || (mods.has("mod") && apple);
  const wantCtrl = mods.has("ctrl") || (mods.has("mod") && !apple);
  return (
    e.key.toLowerCase() === key &&
    e.metaKey === wantMeta &&
    e.ctrlKey === wantCtrl &&
    e.altKey === mods.has("alt") &&
    (key.length === 1 && !/[a-z0-9]/.test(key) ? true : e.shiftKey === mods.has("shift"))
  );
}

const isTyping = (t: EventTarget | null) => {
  const el = t as HTMLElement | null;
  return !!el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
};

export function useHotkeys(map: HotkeyMap, { enabled = true, allowInInputs = false }: { enabled?: boolean; allowInInputs?: boolean } = {}) {
  const ref = useRef(map);
  ref.current = map;
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      for (const [combo, handler] of Object.entries(ref.current)) {
        if (!matchesCombo(e, combo)) continue;
        const hasModifier = /(mod|ctrl|meta|alt)\+/i.test(combo);
        if (!allowInInputs && !hasModifier && isTyping(e.target)) continue;
        e.preventDefault();
        handler(e);
        return;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled, allowInInputs]);
}
