import type { ReactElement, ReactNode } from "react";
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Session } from "../lib/api";
import { queryKeys } from "../lib/queries";
import { SkinProvider } from "../ui/lib/skin";
import { hexSkin } from "../ui/skins/hex";

/** Renders with a query cache already holding the given session (null = signed out), so no request is made. */
export function renderWithSession(ui: ReactElement, session: Session) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
  client.setQueryData(queryKeys.session, session);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <SkinProvider skin={hexSkin}>{children}</SkinProvider>
    </QueryClientProvider>
  );
  return { client, ...render(ui, { wrapper }) };
}

export const sessionFor = (role: "student" | "college" | "company" | "admin"): Session => ({
  user: { id: `u-${role}`, name: "Test User", email: "t@example.com", role },
});
