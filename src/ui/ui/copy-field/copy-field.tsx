"use client";
/** CopyField — read-only value with a copy button (and optional reveal for secrets). Deps: react, lucide-react, lib/cn, lib/skin, hooks/use-copy, ui/input, ui/button. */
import { Check, Copy, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { Size, StyleProps } from "../../lib/types";
import { useCopy } from "../../hooks/use-copy";
import { IconButton } from "../button";
import { Input } from "../input";
import { copyFieldRecipe } from "./copy-field.recipe";

export interface CopyFieldProps extends StyleProps {
  value: string;
  size?: Size;
  /** Hide the value behind dots until revealed (tokens, secrets). The real value is still what gets copied. */
  secret?: boolean;
  copyLabel?: string;
  copiedLabel?: string;
  revealLabel?: string;
  hideLabel?: string;
  onCopy?: (value: string) => void;
  id?: string;
  "aria-label"?: string;
}

export function CopyField({
  value,
  size = "md",
  secret = false,
  copyLabel = "Copy",
  copiedLabel = "Copied",
  revealLabel = "Show value",
  hideLabel = "Hide value",
  onCopy,
  id,
  className,
  "aria-label": ariaLabel,
}: CopyFieldProps) {
  const r = useRecipe("copyField", copyFieldRecipe);
  const { copy, copied } = useCopy();
  const [revealed, setRevealed] = useState(false);
  const masked = secret && !revealed;
  const btnSize = size === "lg" ? "md" : "sm";

  return (
    <div className={cn("w-full", className)}>
      <Input
        id={id}
        readOnly
        size={size}
        aria-label={ariaLabel}
        value={masked ? "•".repeat(Math.min(Math.max(value.length, 8), 32)) : value}
        onFocus={(e) => e.currentTarget.select()}
        classNames={{ input: r.input() }}
        suffix={
          <span className={r.actions()}>
            {secret ? (
              <IconButton size={btnSize} label={revealed ? hideLabel : revealLabel} aria-pressed={revealed} onClick={() => setRevealed((v) => !v)}>
                {revealed ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
              </IconButton>
            ) : null}
            <IconButton
              size={btnSize}
              label={copied ? copiedLabel : copyLabel}
              tone={copied ? "success" : "neutral"}
              onClick={async () => {
                if (await copy(value)) onCopy?.(value);
              }}
            >
              {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
            </IconButton>
          </span>
        }
      />
      <span role="status" className="sr-only">
        {copied ? copiedLabel : ""}
      </span>
    </div>
  );
}
