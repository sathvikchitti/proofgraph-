"use client";
/**
 * Skin lookup. Deps: react.
 * Every element resolves its recipe with useRecipe("name", defaultRecipe). With no <SkinProvider>
 * mounted the element uses its own default recipe, so a single copied file still works anywhere.
 * Type safety for alternative skins lives in skins/types.ts (alt recipes must match the default's shape).
 */
import { createContext, useContext, type ReactNode } from "react";

export type SkinRecipes = Record<string, unknown>;

const SkinContext = createContext<SkinRecipes | null>(null);

export function SkinProvider({ skin, children }: { skin?: SkinRecipes | null; children: ReactNode }) {
  return <SkinContext.Provider value={skin ?? null}>{children}</SkinContext.Provider>;
}

export function useRecipe<T>(name: string, fallback: T): T {
  const skin = useContext(SkinContext);
  const override = skin?.[name];
  return (override as T | undefined) ?? fallback;
}
