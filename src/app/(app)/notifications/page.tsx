"use client";
import Link from "next/link";
import { BellOff, CheckCheck } from "lucide-react";
import { asyncQuery } from "../../../lib/async";
import { timeAgo } from "../../../lib/format-time";
import { useMarkAllRead, useMarkRead, useNotifications } from "../../../lib/queries";
import { PageHeader } from "../../../ui/layout/page-header";
import { AsyncBoundary } from "../../../ui/ui/async-boundary";
import { Badge } from "../../../ui/ui/badge";
import { Button } from "../../../ui/ui/button";
import { Card } from "../../../ui/ui/card";
import { EmptyState } from "../../../ui/ui/empty-state";

export default function NotificationsPage() {
  const query = useNotifications();
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();
  const items = query.data ?? [];
  const unread = items.filter((n) => !n.read).length;

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Notifications"
        description="Score changes, new missions and recruiter views."
        meta={unread ? <Badge tone="info">{unread} unread</Badge> : undefined}
        actions={
          <Button variant="outline" size="sm" disabled={!unread} loading={markAll.isPending} leading={<CheckCheck className="size-4" aria-hidden="true" />} onClick={() => markAll.mutate()}>
            Mark all as read
          </Button>
        }
      />
      <AsyncBoundary
        query={asyncQuery(query, items.length === 0)}
        empty={<Card><EmptyState icon={<BellOff aria-hidden="true" />} title="No notifications" description="When your score changes or something needs you, it shows up here." /></Card>}
      >
        <Card>
          <ul className="m-0 list-none p-0" aria-label="Notifications">
            {items.map((n) => (
              <li key={n.id} data-unread={!n.read} className="flex items-start gap-3 border-b border-border px-4 py-3 last:border-b-0 data-[unread=true]:bg-accent-subtle/40">
                <span aria-hidden="true" className={`mt-2 size-2 shrink-0 rounded-full ${n.read ? "bg-transparent" : "bg-accent"}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3">
                    <h2 className="m-0 text-sm font-semibold">
                      {n.href ? <Link className="hover:underline focus-ring rounded-chip" href={n.href} onClick={() => !n.read && markRead.mutate(n.id)}>{n.title}</Link> : n.title}
                      {!n.read ? <span className="sr-only"> (unread)</span> : null}
                    </h2>
                    <time dateTime={n.createdAt} className="font-mono text-[0.6875rem] text-fg-subtle">{timeAgo(n.createdAt)}</time>
                  </div>
                  <p className="m-0 mt-0.5 text-sm text-fg-muted">{n.body}</p>
                </div>
                {!n.read ? (
                  <Button size="sm" variant="ghost" onClick={() => markRead.mutate(n.id)} aria-label={`Mark "${n.title}" as read`}>
                    Mark read
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        </Card>
      </AsyncBoundary>
    </div>
  );
}
