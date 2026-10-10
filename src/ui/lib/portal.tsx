"use client";
/**
 * Portal container context. Overlays portal into this element when provided, so they inherit the
 * theme/density/skin scope of the subtree they were opened from (the playground matrix relies on it).
 * Without a provider they portal to document.body. Deps: react.
 */
import { createContext, useContext, type ReactNode } from "react";

const PortalContainerContext = createContext<HTMLElement | null>(null);

export function PortalContainerProvider({ container, children }: { container: HTMLElement | null; children: ReactNode }) {
  return <PortalContainerContext.Provider value={container}>{children}</PortalContainerContext.Provider>;
}

/** Pass the result to a Radix Portal `container` prop; `undefined` means document.body. */
export function usePortalContainer(): HTMLElement | undefined {
  return useContext(PortalContainerContext) ?? undefined;
}
