"use client";
/**
 * FileDropzone — drag-and-drop / click / keyboard picker with accept & size validation and an upload list.
 * The list is data: `value` / `defaultValue` / `onValueChange`. Newly accepted files are appended as
 * `status: "idle"` items; the app uploads them (see onFilesAdded) and updates `progress`/`status`.
 * Deps: react, lucide-react, lib/cn, lib/skin, lib/format, hooks/use-file-drop, hooks/use-controllable-state, ui/field, ui/button, ui/progress.
 */
import { AlertCircle, CheckCircle2, File as FileIcon, UploadCloud, X } from "lucide-react";
import { useRef } from "react";
import { cn } from "../../lib/cn";
import { formatBytes } from "../../lib/format";
import { useRecipe } from "../../lib/skin";
import type { ClassNames, StyleProps } from "../../lib/types";
import { useControllableState } from "../../hooks/use-controllable-state";
import { useFileDrop, type FileRejection } from "../../hooks/use-file-drop";
import { IconButton } from "../button";
import { useFieldControl } from "../field";
import { Progress } from "../progress";
import { fileDropzoneRecipe } from "./file-dropzone.recipe";

export interface UploadItem {
  id: string;
  name: string;
  size?: number;
  /** 0–100 while uploading. */
  progress?: number;
  status?: "idle" | "uploading" | "done" | "error";
  error?: string;
  file?: File;
}

export interface FileDropzoneProps extends StyleProps {
  accept?: string[];
  /** Bytes. */
  maxSize?: number;
  maxFiles?: number;
  multiple?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  value?: UploadItem[];
  defaultValue?: UploadItem[];
  onValueChange?: (items: UploadItem[]) => void;
  /** Fires with the validated File objects so the app can start uploading. */
  onFilesAdded?: (files: File[], items: UploadItem[]) => void;
  onRemove?: (item: UploadItem) => void;
  title?: string;
  browseLabel?: string;
  hint?: string;
  removeLabel?: string;
  doneLabel?: string;
  formatRejection?: (r: FileRejection) => string;
  id?: string;
  "aria-describedby"?: string;
  classNames?: ClassNames<"root" | "zone" | "list" | "item">;
}

let seq = 0;
const newId = () => `file-${Date.now().toString(36)}-${++seq}`;

export function FileDropzone({
  accept,
  maxSize,
  maxFiles,
  multiple = true,
  disabled,
  invalid,
  value,
  defaultValue = [],
  onValueChange,
  onFilesAdded,
  onRemove,
  title = "Drag files here or",
  browseLabel = "browse",
  hint,
  removeLabel = "Remove",
  doneLabel = "Uploaded",
  formatRejection,
  id,
  className,
  classNames,
  "aria-describedby": describedBy,
}: FileDropzoneProps) {
  const r = useRecipe("fileDropzone", fileDropzoneRecipe);
  const field = useFieldControl({ id, disabled, invalid, "aria-describedby": describedBy });
  const [items, setItems] = useControllableState<UploadItem[]>({ value, defaultValue, onChange: onValueChange });
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const defaultHint = [accept?.length ? accept.join(", ") : null, maxSize ? `up to ${formatBytes(maxSize, 0)}` : null].filter(Boolean).join(" · ");
  const describe =
    formatRejection ??
    ((rej: FileRejection) =>
      rej.reason === "type"
        ? `${rej.file.name}: file type not allowed`
        : rej.reason === "size"
          ? `${rej.file.name}: larger than ${formatBytes(maxSize ?? 0, 0)}`
          : `${rej.file.name}: too many files`);

  const { isDragging, rootProps, inputProps, rejections } = useFileDrop({
    accept,
    maxSize,
    maxFiles,
    multiple,
    currentCount: items.length,
    disabled: field.disabled,
    onDrop: (accepted) => {
      if (accepted.length === 0) return;
      const added: UploadItem[] = accepted.map((file) => ({ id: newId(), name: file.name, size: file.size, status: "idle", file }));
      setItems(multiple ? [...itemsRef.current, ...added] : added);
      onFilesAdded?.(accepted, added);
    },
  });

  const remove = (item: UploadItem) => {
    setItems(itemsRef.current.filter((i) => i.id !== item.id));
    onRemove?.(item);
  };

  return (
    <div className={cn(r.root(), className, classNames?.root)}>
      <div
        {...rootProps}
        id={field.id}
        aria-describedby={field["aria-describedby"]}
        aria-invalid={field["aria-invalid"]}
        className={cn(r.zone({ state: field.disabled ? "disabled" : isDragging ? "dragging" : "idle", invalid: field.invalid }), classNames?.zone)}
        data-dragging={isDragging || undefined}
      >
        <UploadCloud className={r.icon()} aria-hidden />
        <span className={r.title()}>
          {title} <span className={r.browse()}>{browseLabel}</span>
        </span>
        {(hint ?? defaultHint) ? <span className={r.hint()}>{hint ?? defaultHint}</span> : null}
        <input {...inputProps} aria-hidden />
      </div>

      {rejections.length > 0 ? (
        <ul className={r.rejections()} role="alert">
          {rejections.map((rej, i) => (
            <li key={`${rej.file.name}-${i}`} className={r.rejection()}>
              <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden />
              {describe(rej)}
            </li>
          ))}
        </ul>
      ) : null}

      {items.length > 0 ? (
        <ul className={cn(r.list(), classNames?.list)}>
          {items.map((item) => (
            <li key={item.id} className={cn(r.item(), classNames?.item)}>
              <FileIcon className={r.itemIcon()} aria-hidden />
              <div className={r.itemBody()}>
                <div className={r.itemHead()}>
                  <span className={r.itemName()} title={item.name}>
                    {item.name}
                  </span>
                  <span className={r.itemMeta()}>
                    {item.status === "done" ? (
                      <span className="inline-flex items-center gap-1 text-success-fg">
                        <CheckCircle2 className="size-3.5" aria-hidden />
                        {doneLabel}
                      </span>
                    ) : item.size !== undefined ? (
                      formatBytes(item.size)
                    ) : null}
                  </span>
                </div>
                {item.status === "uploading" ? <Progress size="sm" value={item.progress ?? null} aria-label={`${item.name} upload progress`} /> : null}
                {item.status === "error" ? (
                  <span className={r.itemError()} role="alert">
                    {item.error ?? "Upload failed"}
                  </span>
                ) : null}
              </div>
              <IconButton size="sm" label={`${removeLabel} ${item.name}`} onClick={() => remove(item)}>
                <X className="size-4" aria-hidden />
              </IconButton>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
