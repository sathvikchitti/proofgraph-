import { altSkin } from "./alt";
import { defaultSkin } from "./default";
import { hexSkin } from "./hex";

/** Skin name (the value of <html data-skin>) → recipe overrides. "default" has no attribute and no overrides. */
export const skins = { default: defaultSkin, alt: altSkin, hex: hexSkin } as const;
export type SkinName = keyof typeof skins;
