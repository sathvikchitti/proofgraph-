"use client";
/** Code — inline code. Block code lives in CodeViewer. Deps: react, lib/cn, lib/skin. */
import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { Tone } from "../../lib/types";
import { codeRecipe } from "./code.recipe";

export interface CodeProps extends HTMLAttributes<HTMLElement> {
  variant?: "subtle" | "outline";
  tone?: Tone;
}

export function Code({ variant, tone, className, ...rest }: CodeProps) {
  const recipe = useRecipe("code", codeRecipe);
  return <code data-tone={tone} className={cn(recipe({ variant, colored: !!tone }), className)} {...rest} />;
}
