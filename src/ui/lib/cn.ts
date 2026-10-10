/** cn — class merging. Deps: clsx, tailwind-merge. */
import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      rounded: [{ rounded: ["control", "chip", "card", "overlay", "pill"] }],
      shadow: [{ shadow: ["float", "overlay"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
