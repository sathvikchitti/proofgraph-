"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type Notification } from "../api";
import { queryKeys } from "./keys";
import { useSession } from "./session";

export function useNotifications() {
  const { data: session } = useSession();
  return useQuery({ queryKey: queryKeys.notifications, queryFn: () => api.listNotifications(), enabled: Boolean(session) });
}

export function useUnreadCount() {
  const { data } = useNotifications();
  return data ? data.filter((n) => !n.read).length : 0;
}

/** Optimistic: the row flips to read immediately and rolls back if the request fails. */
function useReadMutation<V>(mutationFn: (v: V) => Promise<void>, apply: (list: Notification[], v: V) => Notification[]) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onMutate: async (variables: V) => {
      await qc.cancelQueries({ queryKey: queryKeys.notifications });
      const previous = qc.getQueryData<Notification[]>(queryKeys.notifications);
      if (previous) qc.setQueryData(queryKeys.notifications, apply(previous, variables));
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) qc.setQueryData(queryKeys.notifications, context.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.notifications }),
  });
}

export function useMarkRead() {
  return useReadMutation(
    (id: string) => api.markNotificationRead(id),
    (list, id) => list.map((n) => (n.id === id ? { ...n, read: true } : n)),
  );
}

export function useMarkAllRead() {
  return useReadMutation(
    () => api.markAllNotificationsRead(),
    (list) => list.map((n) => ({ ...n, read: true })),
  );
}
