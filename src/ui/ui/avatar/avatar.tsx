"use client";
/** Avatar / AvatarGroup — initials fallback, optional status. Deps: react, radix-ui (Avatar), lib/cn, lib/skin, lib/format. */
import { Avatar as A } from "radix-ui";
import { cn } from "../../lib/cn";
import { initials } from "../../lib/format";
import { useRecipe } from "../../lib/skin";
import type { ClassNames, Size, StyleProps, Tone } from "../../lib/types";
import { avatarRecipe } from "./avatar.recipe";

export interface AvatarProps extends StyleProps {
  src?: string;
  /** Used for the initials fallback and the accessible name. */
  name?: string;
  alt?: string;
  size?: Size;
  shape?: "circle" | "square";
  /** Tints the fallback. */
  tone?: Tone;
  /** Presence dot. */
  status?: Tone;
  statusLabel?: string;
  classNames?: ClassNames<"root" | "frame" | "image" | "fallback" | "status">;
}

export function Avatar({ src, name = "", alt, size = "md", shape = "circle", tone = "neutral", status, statusLabel, className, classNames }: AvatarProps) {
  const r = useRecipe("avatar", avatarRecipe);
  return (
    <span className={cn(r.root({ size }), className, classNames?.root)} data-tone={tone}>
      <A.Root className={cn(r.frame({ shape }), classNames?.frame)} role="img" aria-label={alt ?? (name || "Avatar")}>
        {src ? <A.Image src={src} alt="" className={cn(r.image(), classNames?.image)} /> : null}
        <A.Fallback delayMs={src ? 300 : undefined} className={cn(r.fallback(), classNames?.fallback)} aria-hidden>
          {initials(name) || "?"}
        </A.Fallback>
      </A.Root>
      {status ? (
        <span data-tone={status} className={cn(r.status(), classNames?.status)} role={statusLabel ? "img" : undefined} aria-label={statusLabel} aria-hidden={statusLabel ? undefined : true} />
      ) : null}
    </span>
  );
}

export interface AvatarGroupProps extends StyleProps {
  items: AvatarProps[];
  max?: number;
  size?: Size;
  /** Overflow label, e.g. "+3 more". */
  overflowLabel?: (hidden: number) => string;
}

export function AvatarGroup({ items, max = 4, size = "md", overflowLabel = (n) => `${n} more`, className }: AvatarGroupProps) {
  const r = useRecipe("avatar", avatarRecipe);
  const shown = items.slice(0, max);
  const hidden = items.length - shown.length;
  return (
    <div role="group" className={cn(r.group(), className)}>
      {shown.map((item, i) => (
        <Avatar key={item.name ?? i} size={size} {...item} className={cn(r.groupItem(), item.className)} />
      ))}
      {hidden > 0 ? (
        <span
          className={cn(r.root({ size }), r.groupItem(), r.overflow())}
          role="img"
          aria-label={overflowLabel(hidden)}
          title={overflowLabel(hidden)}
        >
          +{hidden}
        </span>
      ) : null}
    </div>
  );
}
