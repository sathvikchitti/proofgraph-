"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Play } from "lucide-react";
import { toast } from "sonner";
import { AppPage } from "../../components/app-page";
import type { Scan } from "../../lib/api";
import { asyncQuery } from "../../lib/async";
import { shortSha } from "../../lib/domain/concepts";
import { timeAgo } from "../../lib/format-time";
import { useActiveRepository, useScans, useStartScan, useWatcher } from "../../lib/queries";
import { AsyncBoundary } from "../../ui/ui/async-boundary";
import { Badge } from "../../ui/ui/badge";
import { Button } from "../../ui/ui/button";
import { Card, CardBody, CardHeader } from "../../ui/ui/card";
import { DataTable, type DataColumn } from "../../ui/ui/data-table";
import { EmptyState } from "../../ui/ui/empty-state";
import { StatCard } from "../../ui/ui/stat-card";
import { ACTORS } from "./agent-trace";
import { WithStudent } from "./shared";

export const SCAN_TONE: Record<string, "success" | "info" | "danger" | "neutral" | "warning"> = { completed: "success", running: "info", queued: "neutral", failed: "danger" };
export const TRIGGER_LABEL: Record<string, string> = { manual: "Manual", github_connect: "Connected", github_poll: "New commit", push: "Push" };

export function formatMs(ms: number | undefined): string {
  if (ms === undefined) return "—";
  return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1)} s`;
}

function ScanList() {
  const repo = useActiveRepository();
  const scans = useScans(repo?.id);
  const watcher = useWatcher(repo?.id);
  const start = useStartScan();
  const router = useRouter();
  const sha = watcher.data?.latest_observed_sha ?? repo?.latest_observed_sha ?? null;
  const latest = scans.data?.[0];
  const m = latest?.metrics ?? {};

  const run = () => {
    if (!repo || !sha) return;
    start.mutate({ repositoryId: repo.id, commitSha: sha }, { onSuccess: (scan) => router.push(`/student/scans/${scan.id}?live=1`), onError: (e) => toast.error(e.message) });
  };

  const columns: DataColumn<Scan>[] = [
    { key: "created_at", header: "Started", sortable: true, cell: (s) => <Link className="underline-offset-4 hover:underline" href={`/student/scans/${s.id}`}>{timeAgo(s.created_at)}</Link> },
    { key: "trigger_type", header: "Trigger", cell: (s) => TRIGGER_LABEL[s.trigger_type] ?? s.trigger_type },
    { key: "status", header: "Status", cell: (s) => <Badge size="sm" tone={SCAN_TONE[s.status] ?? "neutral"} dot>{s.status}</Badge> },
    { key: "files", header: "Analysed / reused", align: "right", cell: (s) => <span className="tabular">{s.metrics.blobs_analysed ?? "—"} / {s.metrics.detector_cache_hits ?? "—"}</span> },
    { key: "evidence", header: "Accepted / rejected", align: "right", cell: (s) => <span className="tabular">{s.metrics.evidence_accepted ?? "—"} / {s.metrics.evidence_rejected ?? "—"}</span> },
    { key: "duration", header: "Duration", align: "right", cell: (s) => <span className="tabular">{formatMs(s.metrics.total_duration_ms)}</span> },
    { key: "open", header: "", align: "right", cell: (s) => <Button asChild size="sm" variant="ghost"><Link href={`/student/scans/${s.id}`}>Trace</Link></Button> },
  ];

  if (!repo) {
    return (
      <Card variant="outline">
        <EmptyState title="No repository yet" description="Connect a repository to run your first scan." action={<Button asChild><Link href="/student/repositories">Choose a repository</Link></Button>} />
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      <section aria-label="Latest scan" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Files tracked" value={m.total_tracked_files} hint={latest ? `${m.eligible_files ?? "—"} eligible for analysis` : "No scans yet"} loading={scans.isPending} />
        <StatCard label="Changed blobs analysed" value={m.blobs_analysed} hint={m.detector_cache_hits !== undefined ? `${m.detector_cache_hits} reused from cache` : undefined} loading={scans.isPending} />
        <StatCard label="Evidence accepted" value={m.evidence_accepted} hint={m.evidence_rejected ? `${m.evidence_rejected} rejected (foreign author)` : "None rejected"} loading={scans.isPending} />
        <StatCard label="Scan time" value={m.total_duration_ms === undefined ? undefined : m.total_duration_ms / 1000} precision={2} unit="s" loading={scans.isPending} />
      </section>
      <Card>
        <CardHeader
          title={<h2 className="text-base font-semibold">Scans of {repo.owner ? `${repo.owner}/` : ""}{repo.name}</h2>}
          description={sha ? `Latest commit ${shortSha(sha, 12)} on ${repo.default_branch ?? "the default branch"}. New commits are picked up by the watcher.` : "Waiting for the watcher to see a commit."}
          actions={<Button leading={<Play className="size-4" aria-hidden="true" />} disabled={!sha} loading={start.isPending} onClick={run}>Scan latest commit</Button>}
        />
        <CardBody>
          <AsyncBoundary query={asyncQuery(scans, scans.data?.length === 0)} empty={<EmptyState size="sm" title="No scans yet" description="Scan the latest commit to see the agent trace." />}>
            {scans.data ? <DataTable ariaLabel="Scans" columns={columns} data={scans.data} getRowId={(s) => s.id} pageSize={10} /> : null}
          </AsyncBoundary>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title={<h2 className="text-base font-semibold">Who does what</h2>} description="Six deterministic backend components. No model decides a score." />
        <CardBody>
          <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 xl:grid-cols-3">
            {ACTORS.map((a) => (
              <li key={a.name} className="flex gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-md border border-border bg-bg-subtle text-fg-muted"><a.icon className="size-4" aria-hidden="true" /></span>
                <span className="grid gap-0.5">
                  <span className="text-sm font-medium">{a.name}</span>
                  <span className="text-sm text-fg-muted">{a.does}</span>
                </span>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}

export function ScansPage() {
  return (
    <AppPage role="student" title="Live scan" description="Every scan runs the same six agents on a pinned commit. Watch them work, then follow any score change to its evidence.">
      <WithStudent>{() => <ScanList />}</WithStudent>
    </AppPage>
  );
}
