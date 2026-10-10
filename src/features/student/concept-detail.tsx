"use client";
import Link from "next/link";
import { useMemo } from "react";
import { Mic, Target } from "lucide-react";
import { AppPage } from "../../components/app-page";
import { asyncQuery } from "../../lib/async";
import { conceptName, conceptStatus, EVIDENCE_HINT, SIGNALS, signalDescription, signalLabel, STATUS_HINT } from "../../lib/domain/concepts";
import { indexGraph, locator, type EvidenceRecord } from "../../lib/domain/proof-graph";
import { timeAgo } from "../../lib/format-time";
import { useConceptNames, useProofGraph, useScoreEvents, useScores } from "../../lib/queries";
import { Accordion } from "../../ui/ui/accordion";
import { AsyncBoundary } from "../../ui/ui/async-boundary";
import { Badge } from "../../ui/ui/badge";
import { Button } from "../../ui/ui/button";
import { Card, CardBody, CardHeader } from "../../ui/ui/card";
import { Checklist } from "../../ui/ui/checklist";
import { EmptyState } from "../../ui/ui/empty-state";
import { LineChart } from "../../ui/ui/line-chart";
import { Meter } from "../../ui/ui/meter";
import { Tabs } from "../../ui/ui/tabs";
import { Timeline } from "../../ui/ui/timeline";
import { ValueChange } from "../../ui/ui/value-change";
import { ConceptBreakdown, ConceptStatusBadge, EvidenceSnippet, EvidenceStateBadge, StrengthBadge, WithStudent } from "./shared";

function EvidenceList({ records, open }: { records: EvidenceRecord[]; open: number }) {
  if (!records.length) return <EmptyState size="sm" title="None" />;
  return (
    <Accordion
      defaultValue={records.slice(0, open).map((r) => r.id)}
      items={records.map((r) => ({
        value: r.id,
        title: (
          <span id={`ev-${r.id}`} className="flex min-w-0 flex-1 flex-wrap items-center gap-2 text-left">
            <span className="text-sm font-medium">{signalLabel(r.signal)}</span>
            <StrengthBadge strength={r.strength} />
            <span className="min-w-0 truncate font-mono text-xs text-fg-muted">{locator(r)}</span>
          </span>
        ),
        content: (
          <div className="grid gap-3">
            <div className="flex flex-wrap items-center gap-2 text-sm text-fg-muted">
              <EvidenceStateBadge state={r.state} />
              <span>{EVIDENCE_HINT[r.state]}</span>
              {r.ownershipRatio !== null ? <Badge size="sm" tone={r.ownershipRatio >= 50 ? "success" : "danger"}>{r.ownershipRatio}% authored by you</Badge> : null}
              {r.detector ? <span className="font-mono text-xs">{r.detector}</span> : null}
              {r.replacesId ? <span className="text-xs">continues {r.replacesId.slice(0, 12)}</span> : null}
            </div>
            <EvidenceSnippet evidence={r} />
          </div>
        ),
      }))}
    />
  );
}

function Concept({ studentId, conceptId }: { studentId: string; conceptId: string }) {
  const scores = useScores(studentId);
  const graph = useProofGraph(studentId);
  const events = useScoreEvents(studentId);
  const names = useConceptNames();
  const name = conceptName(conceptId, names);
  const score = scores.data?.find((s) => s.concept_id === conceptId);
  const index = useMemo(() => (graph.data ? indexGraph(graph.data) : null), [graph.data]);
  const records = index?.byConcept.get(conceptId) ?? [];
  const byState = (st: string) => records.filter((r) => r.state === st);
  const present = new Set(byState("accepted").map((r) => r.signal));
  const allSignals = [...new Set([...Object.keys(SIGNALS[conceptId] ?? {}), ...present, ...(score?.missing_signals ?? [])])];
  const history = (events.data ?? []).filter((e) => e.concept_id === conceptId).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  const status = conceptStatus(score);

  if (scores.data && !score) {
    return <Card variant="outline"><EmptyState title={`No score for ${name}`} description="This concept has not been scored for your active repository yet." action={<Button asChild variant="outline"><Link href="/student/skill-graph">Back to the skill graph</Link></Button>} /></Card>;
  }

  return (
    <AsyncBoundary query={asyncQuery(scores)}>
      {score ? (
        <div className="grid gap-6">
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <Card>
              <CardBody className="grid gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <ConceptStatusBadge score={score} size="md" />
                  <span className="text-sm text-fg-muted">{STATUS_HINT[status]}</span>
                </div>
                <Meter value={score.score} max={100} cap={70} capLabel="Evidence ceiling (70)" showValue size="lg" aria-label={`${name} score`} />
                <ConceptBreakdown score={score} conceptName={name} evidenceHref={(id) => `#ev-${id}`} />
                <p className="m-0 text-xs text-fg-subtle">Rules {score.scoring_version}. {score.badge}</p>
              </CardBody>
            </Card>
            <Card>
              <CardHeader title={<h2 className="text-base font-semibold">Signals</h2>} description="What the detectors look for in this concept." />
              <CardBody className="grid gap-4">
                <Checklist items={allSignals.map((sig) => ({ id: sig, label: signalLabel(sig), description: signalDescription(conceptId, sig), done: present.has(sig), disabled: true }))} />
                <div className="flex flex-wrap gap-2">
                  {status === "weak" ? (
                    <Button asChild size="sm" leading={<Mic className="size-4" aria-hidden="true" />}><Link href={`/student/viva?concept=${conceptId}`}>Take the viva</Link></Button>
                  ) : null}
                  {score.missing_signals.length ? (
                    <Button asChild size="sm" variant="outline" leading={<Target className="size-4" aria-hidden="true" />}><Link href={`/student/missions?concept=${conceptId}`}>Missions</Link></Button>
                  ) : null}
                </div>
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardHeader title={<h2 className="text-base font-semibold">Evidence trail</h2>} description="The exact lines behind the score, read from the immutable Git blob." />
            <CardBody>
              <AsyncBoundary query={asyncQuery(graph)}>
                <Tabs
                  label="Evidence by state"
                  items={(["accepted", "replaced", "superseded", "rejected"] as const).map((st) => ({ value: st, label: st[0]!.toUpperCase() + st.slice(1), count: byState(st).length, content: <EvidenceList records={byState(st)} open={st === "accepted" ? 2 : 0} /> }))}
                />
              </AsyncBoundary>
            </CardBody>
          </Card>

          <div className="grid items-start gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader title={<h2 className="text-base font-semibold">Score history</h2>} />
              <CardBody>
                <LineChart
                  label={`${name} score over time`}
                  data={history.map((e) => ({ at: new Date(e.timestamp).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }), score: e.new_score }))}
                  xKey="at"
                  series={[{ key: "score", label: "Score", tone: "info" }]}
                  yDomain={[0, 100]}
                  thresholds={[{ value: 70, label: "Evidence ceiling", tone: "warning" }]}
                  curve="step"
                  showDots
                  height={220}
                  isEmpty={!history.length}
                  emptyLabel="No history yet"
                  loading={events.isPending}
                />
              </CardBody>
            </Card>
            <Card>
              <CardHeader title={<h2 className="text-base font-semibold">Why it changed</h2>} />
              <CardBody>
                <Timeline
                  aria-label="Score changes"
                  emptyLabel="No changes yet."
                  loading={events.isPending}
                  reverse
                  items={history.map((e) => ({
                    id: e.id,
                    title: <ValueChange from={e.previous_score} to={e.new_score} size="sm" />,
                    description: e.reason,
                    time: timeAgo(e.timestamp),
                    tone: e.new_score > e.previous_score ? "success" : e.new_score < e.previous_score ? "danger" : "neutral",
                  }))}
                />
              </CardBody>
            </Card>
          </div>
        </div>
      ) : null}
    </AsyncBoundary>
  );
}

export function ConceptDetailPage({ conceptId }: { conceptId: string }) {
  const names = useConceptNames();
  return (
    <AppPage role="student" title={conceptName(conceptId, names)} description="Score, evidence and history for one concept." parents={[{ label: "Skill graph", href: "/student/skill-graph" }]}>
      <WithStudent>{(id) => <Concept studentId={id} conceptId={conceptId} />}</WithStudent>
    </AppPage>
  );
}
