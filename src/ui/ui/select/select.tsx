"use client";
/** Select — grouped options, invalid/loading/empty. Deps: react, radix-ui (Select), lucide-react, lib/cn, lib/skin, lib/portal, ui/field. */
import { Check, ChevronDown } from "lucide-react";
import { Fragment, type ReactNode } from "react";
import { Select as S } from "radix-ui";
import { cn } from "../../lib/cn";
import { usePortalContainer } from "../../lib/portal";
import { useRecipe } from "../../lib/skin";
import type { ClassNames, Size, StyleProps } from "../../lib/types";
import { useFieldControl } from "../field";
import { Spinner } from "../spinner";
import { selectRecipe } from "./select.recipe";

export interface SelectOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
  /** Options sharing a group name render under one heading. */
  group?: string;
}

export interface SelectProps extends StyleProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  size?: Size;
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
  loading?: boolean;
  emptyLabel?: string;
  name?: string;
  id?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
  classNames?: ClassNames<"trigger" | "content" | "item">;
}

function groupOptions(options: SelectOption[]) {
  const groups: { name?: string; items: SelectOption[] }[] = [];
  for (const o of options) {
    let g = groups.find((x) => x.name === o.group);
    if (!g) groups.push((g = { name: o.group, items: [] }));
    g.items.push(o);
  }
  return groups;
}

export function Select({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Select…",
  size = "md",
  invalid,
  disabled,
  required,
  loading = false,
  emptyLabel = "No options",
  name,
  id,
  className,
  classNames,
  "aria-label": ariaLabel,
  "aria-describedby": describedBy,
}: SelectProps) {
  const r = useRecipe("select", selectRecipe);
  const container = usePortalContainer();
  const field = useFieldControl({ id, disabled, invalid, required, "aria-describedby": describedBy });
  const groups = groupOptions(options);

  return (
    <S.Root value={value} defaultValue={defaultValue} onValueChange={onValueChange} disabled={field.disabled} required={field.required} name={name}>
      <S.Trigger
        id={field.id}
        aria-label={ariaLabel}
        aria-invalid={field["aria-invalid"]}
        aria-describedby={field["aria-describedby"]}
        aria-busy={loading || undefined}
        className={cn(r.trigger({ size }), className, classNames?.trigger)}
      >
        <span className={r.value()}>
          <S.Value placeholder={placeholder} />
        </span>
        {loading ? (
          <Spinner size="sm" />
        ) : (
          <S.Icon asChild>
            <ChevronDown className={r.icon()} aria-hidden />
          </S.Icon>
        )}
      </S.Trigger>
      <S.Portal container={container}>
        <S.Content position="popper" sideOffset={4} className={cn(r.content(), classNames?.content)}>
          <S.Viewport className={r.viewport()}>
            {options.length === 0 ? <div className={r.empty()}>{emptyLabel}</div> : null}
            {groups.map((g, gi) => (
              <Fragment key={g.name ?? `g${gi}`}>
                {gi > 0 ? <S.Separator className={r.separator()} /> : null}
                <S.Group>
                  {g.name ? <S.Label className={r.label()}>{g.name}</S.Label> : null}
                  {g.items.map((o) => (
                    <S.Item key={o.value} value={o.value} disabled={o.disabled} className={cn(r.item(), classNames?.item)}>
                      <S.ItemText>{o.label}</S.ItemText>
                      <S.ItemIndicator className={r.indicator()}>
                        <Check className="size-4" aria-hidden />
                      </S.ItemIndicator>
                    </S.Item>
                  ))}
                </S.Group>
              </Fragment>
            ))}
          </S.Viewport>
        </S.Content>
      </S.Portal>
    </S.Root>
  );
}
