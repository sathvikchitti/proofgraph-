import type { ReactNode } from "react";
import { ErrorPage } from "../ui/ui/error-page";

/** Centered full-screen wrapper for the 404 / 403 / 500 / maintenance states. */
export function StatusPage({ children }: { children: ReactNode }) {
  return <main className="grid min-h-screen place-items-center p-4"><div className="w-full max-w-lg">{children}</div></main>;
}
export { ErrorPage };
