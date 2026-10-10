"use client";
/**
 * CodeViewer — line numbers, tone-highlighted ranges, context folding, header slot (path, SHA, copy),
 * wrap toggle and lazy syntax highlighting. Code scrolls inside its own container.
 * Deps: react, lucide-react, lib/*, hooks/use-controllable-state, hooks/use-copy, hooks/use-highlighted-code (shiki, lazy), ui/skeleton.
 */
import { Check, ChevronsUpDown, Copy, WrapText } from "lucide-react";
import { createContext, useContext, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { ClassNames, StyleProps, Tone } from "../../lib/types";
import { useControllableState } from "../../hooks/use-controllable-state";
import { useCopy } from "../../hooks/use-copy";
import { useHighlightedCode, type HighlightToken } from "../../hooks/use-highlighted-code";
import { Skeleton } from "../skeleton";
import { codeViewerRecipe } from "./code-viewer.recipe";

export interface CodeHighlight {
  /** Absolute line numbers (respecting `startLine`), inclusive. */
  from: number;
  to: number;
  tone?: Tone;
  /** Announced to screen readers at the start of the range. */
  label?: string;
}

export interface CodeViewerLabels {
  region: string;
  wrap: string;
  hiddenLines: (n: number) => string;
  empty: string;
  loading: string;
  highlighted: string;
}

const DEFAULT_LABELS: CodeViewerLabels = {
  region: "Code",
  wrap: "Wrap long lines",
  hiddenLines: (n) => `${n} ${n === 1 ? "line" : "lines"} hidden`,
  empty: "No code to display.",
  loading: "Loading code",
  highlighted: "Highlighted",
};

const CodeContext = createContext<{ text: string; language?: string }>({ text: "" });

export interface CodeViewerProps extends StyleProps {
  /** Either `lines` or `code`. */
  lines?: string[];
  code?: string;
  startLine?: number;
  language?: string;
  highlights?: CodeHighlight[];
  /** Fold lines further than N from every highlight into expandable blocks. */
  contextCollapse?: number;
  header?: ReactNode;
  wrap?: boolean;
  defaultWrap?: boolean;
  onWrapChange?: (wrap: boolean) => void;
  wrapToggle?: boolean;
  lineNumbers?: boolean;
  /** Syntax highlighting (lazy). Needs `language`. */
  syntax?: boolean;
  loading?: boolean;
  /** Replaces the code with an error element. */
  error?: ReactNode;
  /** CSS max-height of the code area; it scrolls beyond that. */
  maxHeight?: string | number;
  labels?: Partial<CodeViewerLabels>;
  classNames?: ClassNames<"root" | "header" | "scroller" | "row" | "gutter" | "code">;
}

type Item = { kind: "line"; index: number } | { kind: "fold"; start: number; end: number };

const fontClass = (fs?: number) => cn(fs && fs & 1 && "italic", fs && fs & 2 && "font-semibold", fs && fs & 4 && "underline");

function renderTokens(tokens: HighlightToken[] | undefined, text: string): ReactNode {
  if (!tokens || tokens.map((t) => t.content).join("") !== text) return text;
  return tokens.map((t, i) => (
    <span key={i} className={fontClass(t.fontStyle)} style={t.color ? ({ color: t.color } as CSSProperties) : undefined}>
      {t.content}
    </span>
  ));
}

export function CodeViewer({
  lines: linesProp,
  code,
  startLine = 1,
  language,
  highlights = [],
  contextCollapse,
  header,
  wrap,
  defaultWrap = false,
  onWrapChange,
  wrapToggle = true,
  lineNumbers = true,
  syntax = true,
  loading = false,
  error,
  maxHeight,
  labels: labelOverrides,
  className,
  classNames,
}: CodeViewerProps) {
  const r = useRecipe("codeViewer", codeViewerRecipe);
  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const lines = useMemo(() => linesProp ?? (code === undefined ? [] : code.split("\n")), [linesProp, code]);
  const text = useMemo(() => lines.join("\n"), [lines]);
  const [isWrapped, setWrapped] = useControllableState({ value: wrap, defaultValue: defaultWrap, onChange: onWrapChange });
  const [expanded, setExpanded] = useState<ReadonlySet<number>>(new Set());
  const tokens = useHighlightedCode(text, language, syntax && !loading && !error);

  const items = useMemo<Item[]>(() => {
    const total = lines.length;
    if (contextCollapse === undefined || highlights.length === 0) return lines.map((_, index) => ({ kind: "line", index }));
    const keep = new Array<boolean>(total).fill(false);
    for (const h of highlights) {
      for (let n = h.from - contextCollapse; n <= h.to + contextCollapse; n++) {
        const i = n - startLine;
        if (i >= 0 && i < total) keep[i] = true;
      }
    }
    const out: Item[] = [];
    let i = 0;
    while (i < total) {
      if (keep[i] || expanded.has(i)) {
        out.push({ kind: "line", index: i++ });
        continue;
      }
      const start = i;
      while (i < total && !keep[i] && !expanded.has(i)) i++;
      out.push({ kind: "fold", start, end: i - 1 });
    }
    return out;
  }, [lines, highlights, contextCollapse, startLine, expanded]);

  const highlightFor = (lineNo: number) => highlights.find((h) => lineNo >= h.from && lineNo <= h.to);

  let body: ReactNode;
  if (error) body = <div className={r.state()}>{error}</div>;
  else if (loading)
    body = (
      <div className={r.skeleton()}>
        <Skeleton lines={5} label={labels.loading} />
      </div>
    );
  else if (lines.length === 0) body = <div className={r.state()}>{labels.empty}</div>;
  else
    body = (
      <div
        className={cn(r.scroller(), classNames?.scroller)}
        style={maxHeight === undefined ? undefined : { maxHeight }}
        tabIndex={0}
        role="region"
        aria-label={labels.region}
      >
        <div className={r.inner()}>
          {items.map((item) => {
            if (item.kind === "fold") {
              const count = item.end - item.start + 1;
              return (
                <button
                  key={`fold-${item.start}`}
                  type="button"
                  aria-expanded={false}
                  className={r.fold()}
                  onClick={() =>
                    setExpanded((prev) => {
                      const next = new Set(prev);
                      for (let k = item.start; k <= item.end; k++) next.add(k);
                      return next;
                    })
                  }
                >
                  <ChevronsUpDown className="size-3.5" aria-hidden />
                  {labels.hiddenLines(count)}
                </button>
              );
            }
            const lineNo = startLine + item.index;
            const hl = highlightFor(lineNo);
            const first = hl && lineNo === hl.from;
            const lineText = lines[item.index] ?? "";
            return (
              <div
                key={item.index}
                data-line={lineNo}
                data-highlighted={hl ? true : undefined}
                data-tone={hl ? (hl.tone ?? "accent") : undefined}
                className={cn(r.row({ wrap: isWrapped, highlighted: !!hl }), classNames?.row)}
              >
                {lineNumbers ? (
                  <span aria-hidden className={cn(r.gutter(), !hl && r.gutterBg(), classNames?.gutter)}>
                    {lineNo}
                  </span>
                ) : null}
                <span className={cn(r.code(), classNames?.code)}>
                  {first ? <span className="sr-only">{hl.label ?? labels.highlighted}: </span> : null}
                  {renderTokens(tokens?.[item.index], lineText) || " "}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );

  return (
    <CodeContext.Provider value={{ text, language }}>
      <div className={cn(r.root(), className, classNames?.root)}>
        {header || wrapToggle ? (
          <div className={cn(r.header(), classNames?.header)}>
            <div className={r.headerMain()}>{header ?? (language ? <span className={r.language()}>{language}</span> : null)}</div>
            {wrapToggle ? (
              <button type="button" className={r.toolButton()} aria-pressed={isWrapped} aria-label={labels.wrap} title={labels.wrap} onClick={() => setWrapped(!isWrapped)}>
                <WrapText className="size-4" aria-hidden />
              </button>
            ) : null}
          </div>
        ) : null}
        {body}
      </div>
    </CodeContext.Provider>
  );
}

export interface CodeHeaderProps {
  path?: string;
  /** e.g. a short commit SHA. */
  meta?: ReactNode;
  language?: string;
  /** Adds a copy-code button (copies the surrounding CodeViewer's text). */
  copy?: boolean;
  copyLabel?: string;
  copiedLabel?: string;
  children?: ReactNode;
}

/** Header content for CodeViewer: file path, SHA/meta, language and a copy button. */
export function CodeHeader({ path, meta, language, copy = false, copyLabel = "Copy code", copiedLabel = "Copied", children }: CodeHeaderProps) {
  const r = useRecipe("codeViewer", codeViewerRecipe);
  const ctx = useContext(CodeContext);
  const { copy: doCopy, copied } = useCopy();
  return (
    <>
      {path ? (
        <span className={r.path()} title={path}>
          {path}
        </span>
      ) : null}
      {meta ? <span className={r.meta()}>{meta}</span> : null}
      {language ?? ctx.language ? <span className={r.language()}>{language ?? ctx.language}</span> : null}
      {children}
      {copy ? (
        <button type="button" className={cn(r.toolButton(), "ml-auto")} aria-label={copied ? copiedLabel : copyLabel} title={copied ? copiedLabel : copyLabel} onClick={() => doCopy(ctx.text)}>
          {copied ? <Check className="size-4 text-success" aria-hidden /> : <Copy className="size-4" aria-hidden />}
        </button>
      ) : null}
    </>
  );
}
