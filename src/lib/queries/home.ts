"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import type { Role } from "../config";
import { queryKeys } from "./keys";

export function useHome(role: Role) {
  return useQuery({ queryKey: queryKeys.home(role), queryFn: () => api.getHome(role) });
}
