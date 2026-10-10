"use client";
import Link from "next/link";
import { useMemo } from "react";
import { AppPage } from "../../components/app-page";
import { asyncQuery } from "../../lib/async";
import { CONCEPT_IDS, conceptName } from "../../lib/domain/concepts";
import { timeAgo } from "../../lib/format-time";
import { useConceptNames, useScoreEvents } from "../../lib/queries";
import { AsyncBoundary } from "../../ui/ui/async-boundary";
import { Card, CardBody, CardHeader } from "../../ui/ui/card";
import { EmptyState } from "../../ui/ui/empty-state";
import { LineChart } from "../../ui/ui/line-chart";
import { StatCard } from "../../ui/ui/stat-card";
import { Timeline } from "../../ui/ui/timeline";
import { ValueChange } from "../../ui/ui/value-change";
import { WithStudent } from "./shared";

function Growth({ studentId }: { studentId: string }) {
  const events = useScoreEvents(studentId);
  const names = useConceptNames();
  const asc = useMemo(() => [...(events.data ?? [])].sort((a, b) => a.timestamp.localeCompare(b.timestamp)), [events.data]);
  const changes = asc.filter((e) => e.previous_score !== e.new_score);

  // One row per scan: the running score of every concept after that scan's events.
  const series = useMemo(() => {
    const current: Record<string, number> = Object.fromEntries(CONCEPT_IDS.map((c) => [c, 0]));
    const rows: Record<string, string | number>[] = [];
    let lastScan: string | null | undefined;
    for (const e of asc) {
      current[e.concept_id] = e.new_score;
      if (e.scan_id !== lastScan) {
        rows.push({ at: new Date(e.timestamp).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" }) });
        lastScan = e.scan_id;
      }
      Object.assign(rows[rows.length - 1]!, current);
    }
    return rows;
  }, [asc]);

  const ups = changes.filter((e) => e.new_score > e.previous_score);
  const downs = changes.filter((e) => e.new_score < e.previous_score);
  const firstProven = new Set(ups.filter((e) => e.previous_score === 0).map((e) => e.concept_id));
  const scansCount = new Set(asc.map((e) => e.scan_id)).size;

  return (
    <AsyncBoundary query={asyncQuery(events, events.data?.length === 0)} empty={<EmptyState title="No history yet" description="Your timeline starts with your first scan." />}>
      <div className="grid gap-6">
        <section aria-label="Growth summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Scans scored" value={scansCount} />
          <StatCard label="Concepts newly proven" value={firstProven.size} hint={[...firstProven].map((c) => conceptName(c, names)).join(", ") || undefined} />
          <StatCard label="Score increases" value={ups.length} />
          <StatCard label="Score decreases" value={downs.length} hint={downs.length ? "Removed code takes its points with it" : undefined} />
        </section>
        <Card>
          <CardHeader title={<h2 className="text-base font-semibold">Scores after each scan</h2>} />
          <CardBody>
            <LineChart
              label="Concept scores over time"
              data={series}
              xKey="at"
              series={CONCEPT_IDS.map((c) => ({ key: c, label: conceptName(c, names) }))}
              curve="step"
              showDots
              showLegend
              yDomain={[0, 100]}
              thresholds={[{ value: 70, label: "Evidence ceiling", tone: "warning" }]}
              height={320}
            />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title={<h2 className="text-base font-semibold">Every change, with its reason</h2>} />
          <CardBody>
            <Timeline
              aria-label="Score changes"
              reverse
              items={changes.map((e) => ({
                id: e.id,
                title: (
                  <span className="flex flex-wrap items-center gap-2">
                    <Link className="underline-offset-4 hover:underline" href={`/student/skill-graph/${e.concept_id}`}>{conceptName(e.concept_id, names)}</Link>
                    <ValueChange from={e.previous_score} to={e.new_score} size="sm" />
                  </span>
                ),
                description: e.reason,
                time: timeAgo(e.timestamp),
                tone: e.new_score > e.previous_score ? "success" : "danger",
              }))}
            />
          </CardBody>
        </Card>
      </div>
    </AsyncBoundary>
  );
}

export function GrowthTimelinePage() {
  return (
    <AppPage role="student" title="Growth timeline" description="Score history from every scan, newly proven skills, and the reason for each change.">
      <WithStudent>{(id) => <Growth studentId={id} />}</WithStudent>
    </AppPage>
  );
}
