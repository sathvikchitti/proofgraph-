"use client";
/** The agent trace: the backend's scan events as an EventFeed, one row renderer per event type, a fallback for new ones. */
import type { ComponentType } from "react";
import { Bot, Gauge, Map as MapIcon, Network, ScanSearch, ShieldCheck, UserCheck } from "lucide-react";
import type { ScanEvent } from "../../lib/api";
import { conceptName, EVIDENCE_TONE } from "../../lib/domain/concepts";
import type { StreamStatus } from "../../ui/hooks/use-event-stream";
import { Badge } from "../../ui/ui/badge";
import { EventFeed, type EventRowProps } from "../../ui/ui/event-feed";
import { ValueChange } from "../../ui/ui/value-change";

export const ACTORS: { name: string; icon: ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" }>; does: string }[] = [
  { name: "Repo Cartographer", icon: MapIcon, does: "Maps the tracked files at the pinned commit." },
  { name: "Code Auditor", icon: ScanSearch, does: "Runs the structural detectors; reuses cached analyses for unchanged blobs." },
  { name: "Authorship Agent", icon: UserCheck, does: "Checks who wrote each finding with git blame against your verified emails." },
  { name: "Evidence Verifier", icon: ShieldCheck, does: "Accepts, rejects, replaces or supersedes evidence." },
  { name: "Score Engine", icon: Gauge, does: "Recomputes concept scores from accepted evidence (rules v1)." },
  { name: "ProofGraph Builder", icon: Network, does: "Projects the evidence into the ProofGraph." },
];

export function actorIcon(name: string) {
  return ACTORS.find((a) => a.name === name)?.icon ?? Bot;
}

const num = (v: unknown) => (typeof v === "number" ? v : undefined);
const str = (v: unknown) => (typeof v === "string" ? v : undefined);

function Shell({ event, children }: { event: ScanEvent; children?: React.ReactNode }) {
  const Icon = actorIcon(event.actor);
  return (
    <div className="flex min-w-0 flex-1 items-start gap-3">
      <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md border border-border bg-bg-subtle text-fg-muted">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="grid min-w-0 flex-1 gap-1">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-medium text-fg">{event.display_title}</span>
          <span className="text-xs text-fg-subtle">{event.actor}</span>
          <span className="ml-auto font-mono text-xs tabular text-fg-subtle">#{event.sequence_number}</span>
        </div>
        <p className="m-0 break-words text-sm text-fg-muted">{event.display_detail}</p>
        {children}
      </div>
    </div>
  );
}

const Generic = ({ event }: EventRowProps<ScanEvent>) => <Shell event={event} />;

const ScoreChanged = ({ event }: EventRowProps<ScanEvent>) => {
  const m = event.metadata;
  const from = num(m.previous_score) ?? 0;
  const to = num(m.new_score) ?? 0;
  return (
    <Shell event={event}>
      <span className="flex flex-wrap items-center gap-2 text-sm">
        <Badge size="sm" variant="outline">{conceptName(str(m.concept_id) ?? "")}</Badge>
        <ValueChange from={from} to={to} size="sm" />
      </span>
    </Shell>
  );
};

const Authorship = ({ event }: EventRowProps<ScanEvent>) => {
  const m = event.metadata;
  const ratio = num(m.ownership_ratio);
  const reason = str(m.reason);
  return (
    <Shell event={event}>
      <span className="flex flex-wrap items-center gap-2">
        {ratio !== undefined ? <Badge size="sm" tone={ratio >= 50 ? "success" : "danger"}>{ratio}% yours</Badge> : null}
        {reason ? <Badge size="sm" tone="danger" variant="outline">{reason.replace(/_/g, " ")}</Badge> : null}
        {str(m.concept_id) ? <span className="text-xs text-fg-subtle">{conceptName(str(m.concept_id)!)}</span> : null}
      </span>
    </Shell>
  );
};

const evidenceRow = (state: string) =>
  function EvidenceRow({ event }: EventRowProps<ScanEvent>) {
    return (
      <Shell event={event}>
        <span>
          <Badge size="sm" variant="outline" tone={EVIDENCE_TONE[state] ?? "neutral"}>{state}</Badge>
        </span>
      </Shell>
    );
  };

const Metrics = ({ event }: EventRowProps<ScanEvent>) => {
  const m = event.metadata;
  const chips = [
    ["analysed", num(m.blobs_analysed)],
    ["cache hits", num(m.detector_cache_hits)],
    ["accepted", num(m.evidence_accepted)],
    ["rejected", num(m.evidence_rejected)],
  ].filter(([, v]) => v !== undefined) as [string, number][];
  return (
    <Shell event={event}>
      {chips.length ? (
        <span className="flex flex-wrap gap-1.5">
          {chips.map(([label, v]) => (
            <Badge key={label} size="sm" variant="subtle">{v} {label}</Badge>
          ))}
        </span>
      ) : null}
    </Shell>
  );
};

const RENDERERS: Record<string, ComponentType<EventRowProps<ScanEvent>>> = {
  "score.changed": ScoreChanged,
  "authorship.checked": Authorship,
  "evidence.accepted": Metrics,
  "evidence.replaced": evidenceRow("replaced"),
  "evidence.superseded": evidenceRow("superseded"),
  "evidence.rejected": evidenceRow("rejected"),
  "analysis.completed": Metrics,
  "proofgraph.projected": Metrics,
};

export function AgentTrace({ events, status, onReplay, groupByActor }: { events: ScanEvent[]; status: StreamStatus; onReplay?: () => void; groupByActor?: boolean }) {
  return (
    <EventFeed<ScanEvent>
      title="Agent trace"
      events={events}
      status={status}
      getKey={(e) => e.sequence_number}
      getType={(e) => e.event_type}
      renderers={RENDERERS}
      fallback={Generic}
      groupBy={groupByActor ? (e) => e.actor : undefined}
      onReconnect={onReplay}
      autoScroll
      fixedHeight
      labels={{ done: "Finished", reconnect: "Replay", empty: "No events yet." }}
    />
  );
}
