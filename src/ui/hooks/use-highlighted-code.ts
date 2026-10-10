/**
 * useHighlightedCode — lazy syntax tokens via shiki's CSS-variables theme, so colors come from the
 * `--shiki-*` tokens (tokens/semantic.css), never from a bundled theme. The shiki chunk loads on first use.
 * Returns null until ready, when disabled, or if the language is unknown. Deps: react, shiki (dynamic import).
 */
import { useEffect, useState } from "react";

export interface HighlightToken {
  content: string;
  color?: string;
  /** Bit flags: 1 italic, 2 bold, 4 underline. */
  fontStyle?: number;
}

type Tokenizer = (code: string, lang: string) => Promise<HighlightToken[][]>;
let tokenizer: Promise<Tokenizer> | undefined;

function loadTokenizer(): Promise<Tokenizer> {
  tokenizer ??= import("shiki").then((shiki) => {
    const theme = shiki.createCssVariablesTheme({ name: "css-variables", variablePrefix: "--shiki-", variableDefaults: {}, fontStyle: true });
    return async (code, lang) => {
      const result = await shiki.codeToTokens(code, { lang: lang as never, theme });
      return result.tokens as HighlightToken[][];
    };
  });
  return tokenizer;
}

export function useHighlightedCode(code: string, language?: string, enabled = true): HighlightToken[][] | null {
  const [state, setState] = useState<{ key: string; tokens: HighlightToken[][] } | null>(null);
  const key = `${language}\u0000${code}`;

  useEffect(() => {
    if (!enabled || !language || !code) return;
    let cancelled = false;
    loadTokenizer()
      .then((tokenize) => tokenize(code, language))
      .then((tokens) => {
        if (!cancelled) setState({ key, tokens });
      })
      .catch(() => {
        if (!cancelled) setState(null);
      });
    return () => {
      cancelled = true;
    };
  }, [code, language, enabled, key]);

  return enabled && language && state?.key === key ? state.tokens : null;
}
