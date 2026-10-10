"use client";
/**
 * AnimatedCheckbox — a task checkbox whose fill springs out, draws a tick and strikes through its label.
 * For checklists and to-dos only: a toggle that is not a task belongs on Switch. A real role="checkbox" button;
 * keyboard toggles skip the spring. Colours come from --hx-check-*. Deps: react, vendor/hex-animations.
 */
import "../../../vendor/hex-animations/dist/animations.css";
import { HxCheckbox, type SpringCheckProps } from "../../../vendor/hex-animations/dist/micro-animations.js";
import { useSkinKey } from "../use-skin-key";

export type AnimatedCheckboxProps = SpringCheckProps;

export function AnimatedCheckbox(props: AnimatedCheckboxProps) {
  const skin = useSkinKey();
  return <HxCheckbox key={skin} {...props} />;
}
