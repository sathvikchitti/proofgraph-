/** useCopy — copy text to the clipboard with a transient `copied` flag. Deps: react. */
import { useCallback, useEffect, useRef, useState } from "react";

function legacyCopy(text: string) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(ta);
  if (!ok) throw new Error("Copy failed");
}

export function useCopy({ resetMs = 1800 }: { resetMs?: number } = {}) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(
    async (text: string) => {
      try {
        if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
        else legacyCopy(text);
        setError(null);
        setCopied(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), resetMs);
        return true;
      } catch (e) {
        setError(e instanceof Error ? e : new Error("Copy failed"));
        setCopied(false);
        return false;
      }
    },
    [resetMs],
  );

  return { copy, copied, error };
}
