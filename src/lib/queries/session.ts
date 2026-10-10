"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type Session, type SignInInput } from "../api";
import type { Role } from "../config";
import { queryKeys } from "./keys";

export function useSession() {
  return useQuery({ queryKey: queryKeys.session, queryFn: () => api.getSession(), staleTime: 60_000 });
}

/** After the identity changes, everything cached for the old identity is stale. */
function useAdoptSession() {
  const qc = useQueryClient();
  return (session: Session) => {
    qc.setQueryData(queryKeys.session, session);
    qc.removeQueries({ predicate: (q) => q.queryKey[0] !== queryKeys.session[0] });
  };
}

export function useSignIn() {
  const adopt = useAdoptSession();
  return useMutation({ mutationFn: (input: SignInInput) => api.signIn(input), onSuccess: adopt });
}

export function useSignOut() {
  const adopt = useAdoptSession();
  return useMutation({ mutationFn: () => api.signOut(), onSuccess: () => adopt(null) });
}

/** Demo convenience behind FEATURES.demoWorkspaceSwitcher. */
export function useSwitchRole() {
  const adopt = useAdoptSession();
  return useMutation({ mutationFn: (role: Role) => api.switchRole(role), onSuccess: adopt });
}
