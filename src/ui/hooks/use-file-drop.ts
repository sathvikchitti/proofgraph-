/** useFileDrop — drag-and-drop + picker with validation (accept, size, count). Deps: react. */
import { useCallback, useRef, useState, type ChangeEvent, type DragEvent, type KeyboardEvent } from "react";

export interface FileRejection {
  file: File;
  reason: "type" | "size" | "count";
}

export interface UseFileDropOptions {
  /** MIME types ("image/png", "image/*") and/or extensions (".pdf"). */
  accept?: string[];
  /** Bytes. */
  maxSize?: number;
  maxFiles?: number;
  /** Files already held by the caller; counts towards maxFiles. */
  currentCount?: number;
  multiple?: boolean;
  disabled?: boolean;
  onDrop?: (accepted: File[], rejected: FileRejection[]) => void;
}

export function matchesAccept(file: File, accept?: string[]): boolean {
  if (!accept || accept.length === 0) return true;
  const name = file.name.toLowerCase();
  return accept.some((a) => {
    const p = a.trim().toLowerCase();
    if (p.startsWith(".")) return name.endsWith(p);
    if (p.endsWith("/*")) return file.type.toLowerCase().startsWith(p.slice(0, -1));
    return file.type.toLowerCase() === p;
  });
}

export function useFileDrop({ accept, maxSize, maxFiles, currentCount = 0, multiple = true, disabled = false, onDrop }: UseFileDropOptions = {}) {
  const [isDragging, setDragging] = useState(false);
  const [rejections, setRejections] = useState<FileRejection[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const depth = useRef(0);

  const process = useCallback(
    (list: FileList | File[] | null) => {
      if (!list || disabled) return;
      let files = Array.from(list);
      if (!multiple) files = files.slice(0, 1);
      const accepted: File[] = [];
      const rejected: FileRejection[] = [];
      const room = maxFiles === undefined ? Infinity : Math.max(0, maxFiles - (multiple ? currentCount : 0));
      for (const file of files) {
        if (!matchesAccept(file, accept)) rejected.push({ file, reason: "type" });
        else if (maxSize !== undefined && file.size > maxSize) rejected.push({ file, reason: "size" });
        else if (accepted.length >= room) rejected.push({ file, reason: "count" });
        else accepted.push(file);
      }
      setRejections(rejected);
      onDrop?.(accepted, rejected);
    },
    [accept, maxSize, maxFiles, currentCount, multiple, disabled, onDrop],
  );

  const open = useCallback(() => {
    if (!disabled) inputRef.current?.click();
  }, [disabled]);

  const rootProps = {
    role: "button" as const,
    tabIndex: disabled ? -1 : 0,
    "aria-disabled": disabled || undefined,
    onClick: open,
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    },
    onDragEnter: (e: DragEvent) => {
      e.preventDefault();
      depth.current += 1;
      if (!disabled) setDragging(true);
    },
    onDragOver: (e: DragEvent) => {
      e.preventDefault();
    },
    onDragLeave: (e: DragEvent) => {
      e.preventDefault();
      depth.current = Math.max(0, depth.current - 1);
      if (depth.current === 0) setDragging(false);
    },
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      depth.current = 0;
      setDragging(false);
      process(e.dataTransfer?.files ?? null);
    },
  };

  const inputProps = {
    ref: inputRef,
    type: "file" as const,
    hidden: true,
    tabIndex: -1,
    multiple,
    accept: accept?.join(","),
    disabled,
    onChange: (e: ChangeEvent<HTMLInputElement>) => {
      process(e.target.files);
      e.target.value = "";
    },
  };

  return { isDragging, rootProps, inputProps, open, rejections, clearRejections: () => setRejections([]) };
}
