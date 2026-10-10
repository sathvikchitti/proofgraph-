/** An alternative skin may override any element recipe, but each override must keep the default's shape. */
import type { defaultSkin } from "./default";

export type Skin = Partial<typeof defaultSkin>;
