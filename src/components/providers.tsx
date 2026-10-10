"use client";
import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { isApiError } from "../lib/api";
import { SkinProvider } from "../ui/lib/skin";
import { hexSkin } from "../ui/skins/hex";
import { PaperGrain } from "../ui/ui/paper-grain";
import { Toaster } from "../ui/ui/toast";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // A 4xx will not fix itself; only retry server and network failures, and only once.
        retry: (count, error) => count < 1 && !(isApiError(error) && error.status < 500),
        refetchOnWindowFocus: false,
      },
    },
  });
}

/** Query cache, the hex skin's recipes and the toast region. The hex tokens are selected by <html data-skin="hex">. */
export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(makeQueryClient);
  return (
    <QueryClientProvider client={client}>
      <SkinProvider skin={hexSkin}>
        {children}
        <PaperGrain />
        <Toaster />
      </SkinProvider>
    </QueryClientProvider>
  );
}
