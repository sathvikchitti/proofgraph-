"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ROLE_LABEL, type Role } from "../lib/config";
import { asyncQuery } from "../lib/async";
import { timeAgo } from "../lib/format-time";
import { useHome } from "../lib/queries";
import { NAV } from "../lib/nav/nav-config";
import { PageHeader } from "../ui/layout/page-header";
import { AsyncBoundary } from "../ui/ui/async-boundary";
import { Button } from "../ui/ui/button";
import { Card, CardBody, CardHeader } from "../ui/ui/card";
import { EmptyState } from "../ui/ui/empty-state";
import { Skeleton } from "../ui/ui/skeleton";
import { Sparkline } from "../ui/ui/sparkline";
import { StatCard } from "../ui/ui/stat-card";
import { Timeline } from "../ui/ui/timeline";

/** The template every role home fills: KPI row, what to do next, recent activity. Core features replace the data, not the layout. */
export function RoleHome({ role }: { role: Role }) {
  const home = useHome(role);
  const entry = NAV[role][0]!.items[0]!;
  const data = home.data;
  const query = asyncQuery(home);

  return (
    <div className="grid gap-6">
      <PageHeader title={entry.label} description={entry.description} meta={undefined} breadcrumbs={[{ label: ROLE_LABEL[role] }, { label: entry.label }]} />
      <AsyncBoundary
        query={query}
        skeleton={
          <div className="grid gap-6" aria-busy="true">
            <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <StatCard key={i} label="Loading" loading />
              ))}
            </div>
            <Skeleton lines={4} label="Loading" />
          </div>
        }
      >
        {data ? (
          <div className="grid gap-6">
            <section aria-label="Key numbers" className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
              {data.stats.map((s) => (
                <StatCard
                  key={s.id}
                  className="h-full"
                  label={s.label}
                  value={s.value}
                  unit={s.unit}
                  delta={s.delta}
                  deltaLabel={s.delta === undefined ? undefined : "vs last week"}
                  hint={s.hint}
                  sparkline={s.trend ? <Sparkline data={s.trend} showLast className="h-8 w-24" /> : undefined}
                />
              ))}
            </section>
            <div className="grid items-start gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader><h2 className="text-base font-semibold">What’s next</h2></CardHeader>
                <CardBody>
                  {data.next.length ? (
                    <ul className="m-0 grid list-none gap-4 p-0">
                      {data.next.map((n) => (
                        <li key={n.id} className="grid gap-1 border-b border-border pb-4 last:border-b-0 last:pb-0">
                          <h3 className="m-0 text-sm font-semibold">{n.title}</h3>
                          <p className="m-0 text-sm text-fg-muted">{n.description}</p>
                          {n.href ? (
                            <div className="mt-1">
                              <Button asChild size="sm" variant="outline" trailing={<ArrowRight className="size-4" aria-hidden="true" />}>
                                <Link href={n.href}>{n.cta ?? "Open"}</Link>
                              </Button>
                            </div>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <EmptyState size="sm" title="Nothing to do" description="You are all caught up." />
                  )}
                </CardBody>
              </Card>
              <Card>
                <CardHeader><h2 className="text-base font-semibold">Recent activity</h2></CardHeader>
                <CardBody>
                  <Timeline
                    aria-label="Recent activity"
                    emptyLabel="No activity yet."
                    items={data.activity.map((a) => ({ id: a.id, title: a.title, description: a.description, time: timeAgo(a.at), tone: a.tone }))}
                  />
                </CardBody>
              </Card>
            </div>
          </div>
        ) : null}
      </AsyncBoundary>
    </div>
  );
}
