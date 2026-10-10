/** Test render helper: wraps in the active skin so every behavior test can run under each skin. */
import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";
import { SkinProvider } from "../lib/skin";
import { skins, type SkinName } from "../skins";

/** `SKIN=hex npm test` runs every behavior test under that skin (default: no overrides). */
const skinName = (process.env.SKIN ?? "default") as SkinName;

export function renderUI(ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) {
  return render(ui, {
    wrapper: ({ children }) => <SkinProvider skin={skins[skinName]}>{children}</SkinProvider>,
    ...options,
  });
}
