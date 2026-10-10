"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { AppPage } from "../../components/app-page";
import { scanStreamUrl, ScanEventSchema, type ScanEvent } from "../../lib/api";
import { asyncQuery } from "../../lib/async";
import { API_MODE } from "../../lib/config";
import { conceptName, shortSha } from "../../lib/domain/concepts";
import { useRefreshEvidence, useScan, useScanEvents } from "../../lib/queries";
import { useEventStream } from "../../ui/hooks/use-event-stream";
import { AsyncBoundary } from "../../ui/ui/async-boundary";
import { Badge } from "../../ui/ui/badge";
import { Card, CardBody, CardHeader } from "../../ui/ui/card";
import { EmptyState } from "../../ui/ui/empty-state";
import { Progress } from "../../ui/ui/progress";
import { StatCard } from "../../ui/ui/stat-card";
import { ValueChange } from "../../ui/ui/value-change";
import { AgentTrace } from "./agent-trace";
import { formatMs, SCAN_TONE, TRIGGER_LABEL } from "./scans";

const TERMINAL = new Set(["proofgraph.projected", "scan.completed", "scan.failed"]);

function Trace({ scanId, replayRequested }: { scanId: string; replayRequested: boolean }) {
  const scan = useScan(scanId);
  const refresh = useRefreshEvidence();
  const running = scan.data ? ["queued", "running"].includes(scan.data.status) : false;
  // Live: stream while the scan runs, otherwise read the stored trace. Mock: replay the stored trace when asked (?live=1).
  const streamLive = API_MODE === "live" && running;
  const stored = useScanEvents(scanId, Boolean(scan.data) && !streamLive);
  const replay = API_MODE === "mock" && replayRequested;

  const stream = useEventStream<ScanEvent>({
    url: streamLive ? scanStreamUrl(scanId) : undefined,
    mock: replay && stored.data ? { events: stored.data, intervalMs: 110 } : undefined,
    enabled: streamLive || (replay && Boolean(stored.data)),
    eventName: "scan_event",
    parse: (raw) => ScanEventSchema.parse(JSON.parse(raw)),
    idOf: (e) => e.sequence_number,
    isTerminal: (e) => TERMINAL.has(e.event_type),
  });

  const streaming = streamLive || replay;
  const events = useMemo(() => (streaming ? stream.events : (stored.data ?? [])), [streaming, stream.events, stored.data]);
  const status = streaming ? stream.status : stored.isPending ? "connecting" : "done";

  const refreshed = useRef(false);
  useEffect(() => {
    if (streaming && stream.status === "done" && !refreshed.current) {
      refreshed.current = true;
      refresh();
      void scan.refetch();
    }
  }, [streaming, stream.status, refresh, scan]);

  const changes = useMemo(() => events.filter((e) => e.event_type === "score.changed" && e.metadata.previous_score !== e.metadata.new_score), [events]);
  const total = stored.data?.length ?? 0;
  const s = scan.data;
  const m = s?.metrics ?? {};

  return (
    <AsyncBoundary query={asyncQuery(scan)}>
      {s ? (
        <div className="grid gap-6">
          <section aria-label="Scan numbers" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Files tracked" value={m.total_tracked_files} hint={`${m.eligible_files ?? "—"} eligible`} />
            <StatCard label="Analysed / reused" value={m.blobs_analysed} unit={m.detector_cache_hits !== undefined ? `/ ${m.detector_cache_hits}` : undefined} hint="Unchanged blobs reuse their cached analysis" />
            <StatCard label="Evidence accepted" value={m.evidence_accepted} hint={`${m.evidence_rejected ?? 0} rejected (foreign author)`} />
            <StatCard label="Scan time" value={formatMs(m.total_duration_ms)} hint={`Trigger: ${TRIGGER_LABEL[s.trigger_type] ?? s.trigger_type}`} />
          </section>
          {streaming && total ? <Progress value={Math.min(events.length, total)} max={total} label="Trace" showValue formatValue={(v, max) => `${v} of ${max} events`} /> : null}
          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
            <AgentTrace events={events} status={status} onReplay={streaming ? stream.reconnect : undefined} />
            <Card>
              <CardHeader title={<h2 className="text-base font-semibold">Score changes</h2>} description="Every change links to the concept's evidence." />
              <CardBody>
                {changes.length ? (
                  <ul className="m-0 grid list-none gap-3 p-0">
                    {changes.map((e) => {
                      const id = String(e.metadata.concept_id ?? "");
                      return (
                        <li key={e.sequence_number} className="flex items-center justify-between gap-3">
                          <Link href={`/student/skill-graph/${id}`} className="text-sm font-medium underline-offset-4 hover:underline">{conceptName(id)}</Link>
                          <ValueChange from={Number(e.metadata.previous_score ?? 0)} to={Number(e.metadata.new_score ?? 0)} size="sm" />
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <EmptyState size="sm" title={status === "done" ? "No score moved" : "Waiting for the Score Engine"} description={status === "done" ? "The evidence for every concept is the same as before." : undefined} />
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      ) : null}
    </AsyncBoundary>
  );
}

/** `replay` (from `?live=1`, set after starting a scan) replays the stored trace in mock mode as if it were streaming. */
export function ScanDetailPage({ scanId, replay = false }: { scanId: string; replay?: boolean }) {
  const scan = useScan(scanId);
  return (
    <AppPage
      role="student"
      title={`Scan ${shortSha(scanId, 8)}`}
      description={scan.data ? `Snapshot ${shortSha(scan.data.snapshot_id, 8)} · started ${scan.data.started_at ? new Date(scan.data.started_at).toLocaleString() : "—"}` : undefined}
      meta={scan.data ? <Badge tone={SCAN_TONE[scan.data.status] ?? "neutral"} dot>{scan.data.status}</Badge> : undefined}
      parents={[{ label: "Live scan", href: "/student/scans" }]}
    >
      <Trace scanId={scanId} replayRequested={replay} />
    </AppPage>
  );
}
