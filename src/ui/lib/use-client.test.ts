import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Elements read their recipe with useRecipe (React context), so every module that uses a hook, context or useRecipe must be a
 * client module. Without the directive a Next.js Server Component that renders the element fails to build.
 */
const ROOT = join(__dirname, "..");
const DIRS = ["ui", "blocks", "layout", "lib"];
const HOOK = /\b(useState|useEffect|useLayoutEffect|useContext|createContext|useRef|useId|useMemo|useCallback|useReducer|useSyncExternalStore|useImperativeHandle|useTransition|useDeferredValue|useRecipe)\s*[(<]/;

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === "__tests__" ? [] : walk(path);
    return /\.tsx$/.test(name) && !/\.test\.tsx$/.test(name) ? [path] : [];
  });
}

describe("client directive", () => {
  it("is present on every .tsx module that uses hooks or useRecipe", () => {
    const missing = DIRS.flatMap((d) => walk(join(ROOT, d)))
      .filter((file) => {
        const source = readFileSync(file, "utf8");
        const code = source.replace(/\/\*[\s\S]*?\*\//g, "");
        return HOOK.test(code) && !/^\s*(\/\*[\s\S]*?\*\/\s*)?["']use client["']/.test(source);
      })
      .map((file) => file.slice(ROOT.length + 1));
    expect(missing).toEqual([]);
  });
});
