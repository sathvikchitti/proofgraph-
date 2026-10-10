"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { AppPage } from "../../components/app-page";
import type { ConceptScore, ProofGraphData } from "../../lib/api";
import { asyncQuery } from "../../lib/async";
import { conceptName, conceptStatus, shortSha, signalDescription, signalLabel, STATUS_LABEL } from "../../lib/domain/concepts";
import { indexGraph, locator } from "../../lib/domain/proof-graph";
import { useConceptNames, useProofGraph, useScores } from "../../lib/queries";
import { AsyncBoundary } from "../../ui/ui/async-boundary";
import { Badge } from "../../ui/ui/badge";
import { Button } from "../../ui/ui/button";
import { Card, CardBody, CardHeader } from "../../ui/ui/card";
import { DescriptionList } from "../../ui/ui/description-list";
import { EmptyState } from "../../ui/ui/empty-state";
import { GraphView, type GraphEdge, type GraphNode, type GraphStyleMap } from "../../ui/ui/graph-view";
import { Meter } from "../../ui/ui/meter";
import { SegmentedControl } from "../../ui/ui/segmented-control";
import { ConceptStatusBadge, EvidenceSnippet, EvidenceStateBadge, StrengthBadge, WithStudent } from "./shared";

type View = "concepts" | "gaps" | "evidence" | "full";

const STYLE: GraphStyleMap = {
  nodes: {
    Student: { tone: "info", shape: "hexagon", label: "Student" },
    "Concept:verified": { tone: "success", shape: "round-rectangle", label: "Verified" },
    "Concept:weak": { tone: "warning", shape: "round-rectangle", label: "Evidence-backed" },
    "Concept:unverified": { tone: "neutral", shape: "round-rectangle", label: "Unverified" },
    Claim: { tone: "info", shape: "diamond", label: "Claim" },
    "Evidence:accepted": { tone: "success", shape: "ellipse", label: "Evidence: accepted" },
    "Evidence:rejected": { tone: "danger", shape: "ellipse", label: "Evidence: rejected" },
    "Evidence:superseded": { tone: "neutral", shape: "ellipse", label: "Evidence: superseded" },
    "Evidence:replaced": { tone: "info", shape: "ellipse", label: "Evidence: replaced" },
    SourceLocation: { tone: "neutral", shape: "rectangle", label: "Source lines" },
    Signal: { tone: "warning", shape: "triangle", label: "Missing signal" },
    Detector: { tone: "neutral", shape: "star", label: "Detector" },
    RepositorySnapshot: { tone: "neutral", shape: "rectangle", label: "Snapshot" },
  },
  edges: {
    CLAIMS: { tone: "info", directed: true },
    ASSERTS: { tone: "info", directed: true, dashed: true },
    SCORED_AS: { directed: true },
    SUPPORTS: { tone: "success", directed: true },
    MISSING_SIGNAL: { tone: "warning", dashed: true },
    REPLACES: { tone: "info", dashed: true, directed: true },
  },
};

const VIEW_TYPES: Record<View, Set<string>> = {
  concepts: new Set(["Student", "Concept", "Claim"]),
  gaps: new Set(["Concept", "Signal"]),
  evidence: new Set(["Student", "Concept", "Evidence"]),
  full: new Set(["Student", "Concept", "Claim", "Signal", "Evidence", "SourceLocation", "Detector", "RepositorySnapshot"]),
};

const s = (v: unknown) => (typeof v === "string" ? v : "");

function toGraph(data: ProofGraphData, scores: ConceptScore[], names: Record<string, string>, view: View, currentOnly: boolean): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const keep = VIEW_TYPES[view];
  const scoreOf = new Map(scores.map((x) => [x.concept_id, x]));
  const nodes: GraphNode[] = [];
  for (const n of data.nodes) {
    if (!keep.has(n.type)) continue;
    if (currentOnly && n.type === "Evidence" && s(n.state) !== "accepted") continue;
    switch (n.type) {
      case "Concept": {
        const sc = scoreOf.get(s(n.concept_id));
        nodes.push({ id: n.id, type: `Concept:${conceptStatus(sc)}`, label: `${conceptName(s(n.concept_id), names)} · ${sc?.score ?? 0}`, weight: 1.6 });
        break;
      }
      case "Student":
        nodes.push({ id: n.id, type: "Student", label: s(n.name) || "You", weight: 2 });
        break;
      case "Evidence":
        nodes.push({ id: n.id, type: `Evidence:${s(n.state) || "accepted"}`, label: signalLabel(s(n.signal)), weight: s(n.strength) === "Deep" ? 1.1 : 0.8 });
        break;
      case "Signal":
        nodes.push({ id: n.id, type: "Signal", label: signalLabel(s(n.signal)), weight: 0.8 });
        break;
      case "SourceLocation":
        nodes.push({ id: n.id, type: n.type, label: `${s(n.file_path).split("/").pop()}:${n.line_start}`, weight: 0.7 });
        break;
      case "RepositorySnapshot":
        nodes.push({ id: n.id, type: n.type, label: `${shortSha(s(n.commit_sha))}${n.is_current ? " (current)" : ""}`, weight: 0.9 });
        break;
      case "Detector":
        nodes.push({ id: n.id, type: n.type, label: s(n.detector_id).split(":").pop() ?? "detector", weight: 0.6 });
        break;
      default:
        nodes.push({ id: n.id, type: n.type, label: n.type, weight: 0.7 });
    }
  }
  const ids = new Set(nodes.map((n) => n.id));
  const edges: GraphEdge[] = data.edges
    .filter((e) => ids.has(s(e.from)) && ids.has(s(e.to)))
    // In the overview the student links to concepts through claims and scores; AUTHORED_BY would tie every finding back to the student.
    .filter((e) => !(view !== "full" && e.type === "AUTHORED_BY"))
    .map((e) => ({ id: e.id, source: s(e.from), target: s(e.to), type: e.type }));
  return { nodes, edges };
}

function Details({ nodeId, graph, scores, names }: { nodeId: string; graph: ReturnType<typeof indexGraph>; scores: ConceptScore[]; names: Record<string, string> }) {
  const node = graph.nodes.get(nodeId);
  if (!node) return null;
  if (node.type === "Concept") {
    const id = s(node.concept_id);
    const sc = scores.find((x) => x.concept_id === id);
    const records = graph.byConcept.get(id) ?? [];
    return (
      <div className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="m-0 text-base font-semibold">{conceptName(id, names)}</h3>
          <ConceptStatusBadge score={sc} />
        </div>
        <Meter value={sc?.score ?? 0} max={100} cap={70} capLabel="Evidence ceiling" showValue aria-label="Score" />
        <DescriptionList
          items={[
            { label: "Accepted findings", value: records.filter((r) => r.state === "accepted").length },
            { label: "Other findings", value: records.filter((r) => r.state !== "accepted").length },
            { label: "Missing signals", value: sc?.missing_signals.length ? sc.missing_signals.map(signalLabel).join(", ") : "None" },
          ]}
        />
        <Button asChild trailing={<ArrowRight className="size-4" aria-hidden="true" />}>
          <Link href={`/student/skill-graph/${id}`}>Open evidence trail</Link>
        </Button>
      </div>
    );
  }
  if (node.type === "Evidence") {
    const ev = graph.evidence.find((e) => `evidence:${e.id}` === nodeId);
    if (!ev) return null;
    return (
      <div className="grid gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="m-0 text-base font-semibold">{signalLabel(ev.signal)}</h3>
          <EvidenceStateBadge state={ev.state} />
          <StrengthBadge strength={ev.strength} />
        </div>
        <p className="m-0 text-sm text-fg-muted">{signalDescription(ev.conceptId, ev.signal)} · {conceptName(ev.conceptId, names)}</p>
        <EvidenceSnippet evidence={ev} maxHeight={240} />
        <Button asChild variant="outline" size="sm">
          <Link href={`/student/skill-graph/${ev.conceptId}#ev-${ev.id}`}>See it with the concept</Link>
        </Button>
      </div>
    );
  }
  const rows = Object.entries(node)
    .filter(([k]) => !["id", "type"].includes(k))
    .map(([k, v]) => ({ label: k.replace(/_/g, " "), value: typeof v === "object" ? JSON.stringify(v) : String(v), mono: /sha|id|path/.test(k) }));
  return (
    <div className="grid gap-3">
      <h3 className="m-0 text-base font-semibold">{STYLE.nodes?.[node.type]?.label ?? node.type}</h3>
      {node.type === "Signal" ? <p className="m-0 text-sm text-fg-muted">{signalDescription(s(node.concept_id), s(node.signal))}. Add it to your code to raise the score.</p> : null}
      {node.type === "SourceLocation" ? <p className="m-0 font-mono text-sm">{locator({ filePath: s(node.file_path), lineStart: Number(node.line_start), lineEnd: Number(node.line_end) })}</p> : null}
      <DescriptionList items={rows} />
    </div>
  );
}

function Graph({ studentId }: { studentId: string }) {
  const graphQ = useProofGraph(studentId);
  const scoresQ = useScores(studentId);
  const names = useConceptNames();
  const [view, setView] = useState<View>("concepts");
  const [currentOnly, setCurrentOnly] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const scores = useMemo(() => scoresQ.data ?? [], [scoresQ.data]);
  const index = useMemo(() => (graphQ.data ? indexGraph(graphQ.data) : null), [graphQ.data]);
  const shown = useMemo(() => (graphQ.data ? toGraph(graphQ.data, scores, names, view, currentOnly) : { nodes: [], edges: [] }), [graphQ.data, scores, names, view, currentOnly]);
  const counts = Object.fromEntries((["verified", "weak", "unverified"] as const).map((st) => [st, scores.filter((x) => conceptStatus(x) === st).length]));

  return (
    <AsyncBoundary query={asyncQuery(graphQ, graphQ.data?.nodes.length === 0)} empty={<EmptyState title="Nothing to draw yet" description="The graph fills in after your first scan." />}>
      {index ? (
        <div className="grid gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <SegmentedControl<View>
              label="Graph view"
              value={view}
              onValueChange={(v) => { setView(v); setSelected(null); }}
              options={[{ value: "concepts", label: "Concepts" }, { value: "gaps", label: "Missing signals" }, { value: "evidence", label: "Evidence" }, { value: "full", label: "Full graph" }]}
            />
            {view === "evidence" || view === "full" ? (
              <SegmentedControl<"all" | "accepted">
                label="Evidence shown"
                size="sm"
                value={currentOnly ? "accepted" : "all"}
                onValueChange={(v) => setCurrentOnly(v === "accepted")}
                options={[{ value: "all", label: "All states" }, { value: "accepted", label: "Accepted only" }]}
              />
            ) : null}
            <span className="ml-auto flex flex-wrap gap-2 text-sm text-fg-muted">
              {(["verified", "weak", "unverified"] as const).map((st) => (
                <Badge key={st} size="sm" variant="outline">{counts[st]} {STATUS_LABEL[st]}</Badge>
              ))}
            </span>
          </div>
          <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
            <Card className="overflow-hidden">
              <GraphView
                nodes={shown.nodes}
                edges={shown.edges}
                styleMap={STYLE}
                layout={view === "concepts" ? "concentric" : view === "gaps" ? "breadthfirst" : "cose"}
                selectedId={selected}
                onSelect={setSelected}
                onActivate={(id) => setSelected(id)}
                dimOthers
                controls
                legend
                height={560}
                labels={{ region: "ProofGraph" }}
              />
            </Card>
            <Card>
              <CardHeader title={<h2 className="text-base font-semibold">{selected ? "Selected" : "How to read it"}</h2>} />
              <CardBody>
                {selected ? (
                  <Details nodeId={selected} graph={index} scores={scores} names={names} />
                ) : (
                  <ul className="m-0 grid list-disc gap-2 pl-5 text-sm text-fg-muted">
                    <li>You link to each concept you claim (diamonds) and each concept you are scored on.</li>
                    <li>Green ellipses are accepted findings; red were written by someone else; grey were removed from the latest commit.</li>
                    <li>Triangles are signals still missing. Each is a mission.</li>
                    <li>Select a node for details, or open a concept for its exact lines.</li>
                  </ul>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      ) : null}
    </AsyncBoundary>
  );
}

export function SkillGraphPage() {
  return (
    <AppPage role="student" title="Skill graph" description="Your ProofGraph: claims, concepts, the evidence behind each score and the signals still missing.">
      <WithStudent>{(id) => <Graph studentId={id} />}</WithStudent>
    </AppPage>
  );
}
