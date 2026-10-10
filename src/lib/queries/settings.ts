"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type SettingsPatch } from "../api";
import { queryKeys } from "./keys";
import { useSession } from "./session";

export function useSettings() {
  const { data: session } = useSession();
  return useQuery({ queryKey: queryKeys.settings, queryFn: () => api.getSettings(), enabled: Boolean(session) });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: SettingsPatch) => api.updateSettings(patch),
    onSuccess: (settings) => qc.setQueryData(queryKeys.settings, settings),
  });
}
