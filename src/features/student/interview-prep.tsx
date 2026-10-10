"use client";
import { useMemo, useState } from "react";
import { AppPage } from "../../components/app-page";
import { asyncQuery } from "../../lib/async";
import { conceptName, signalDescription, signalLabel } from "../../lib/domain/concepts";
import { questionsFor } from "../../lib/domain/missions";
import { indexGraph, locator } from "../../lib/domain/proof-graph";
import { useConceptNames, useProofGraph } from "../../lib/queries";
import { Accordion } from "../../ui/ui/accordion";
import { AsyncBoundary } from "../../ui/ui/async-boundary";
import { Badge } from "../../ui/ui/badge";
import { Card, CardBody, CardHeader } from "../../ui/ui/card";
import { EmptyState } from "../../ui/ui/empty-state";
import { FacetFilter } from "../../ui/ui/filter-bar";
import { EvidenceSnippet, StrengthBadge, WithStudent } from "./shared";

const COVERS = [
  "Name the lines and what each does.",
  "Say why you chose this approach over the obvious alternative.",
  "Name one concrete failure and how the code handles it (or should).",
];

function Prep({ studentId }: { studentId: string }) {
  const graph = useProofGraph(studentId);
  const names = useConceptNames();
  const index = useMemo(() => (graph.data ? indexGraph(graph.data) : null), [graph.data]);
  // One strong, current finding per concept and signal: the code an interviewer would open.
  const picks = useMemo(() => {
    const seen = new Set<string>();
    return (index?.evidence ?? []).filter((e) => {
      const key = `${e.conceptId}:${e.signal}`;
      if (e.state !== "accepted" || !e.isCurrent || e.strength === "Trivial" || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [index]);
  const concepts = [...new Set(picks.map((p) => p.conceptId))];
  const [filter, setFilter] = useState<string[]>([]);
  const shown = filter.length ? picks.filter((p) => filter.includes(p.conceptId)) : picks;

  return (
    <AsyncBoundary query={asyncQuery(graph, Boolean(graph.data) && picks.length === 0)} empty={<EmptyState title="No questions yet" description="Questions come from your accepted evidence. Run a scan first." />}>
      <div className="grid gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <FacetFilter label="Concept" options={concepts.map((c) => ({ value: c, label: conceptName(c, names) }))} value={filter} onValueChange={setFilter} />
          <span className="ml-auto text-sm text-fg-muted">{shown.length} topics · {shown.length * 3} questions</span>
        </div>
        <ul className="m-0 grid list-none gap-4 p-0">
          {shown.map((ev) => (
            <li key={ev.id}>
              <Card>
                <CardHeader
                  title={<h2 className="m-0 text-sm font-semibold">{conceptName(ev.conceptId, names)}: {signalLabel(ev.signal)}</h2>}
                  description={<span className="flex flex-wrap items-center gap-2"><StrengthBadge strength={ev.strength} /><span className="font-mono text-xs">{locator(ev)}</span></span>}
                />
                <CardBody className="grid items-start gap-4 xl:grid-cols-2">
                  <EvidenceSnippet evidence={ev} maxHeight={260} />
                  <div className="grid gap-3">
                    <p className="m-0 text-sm text-fg-muted">{signalDescription(ev.conceptId, ev.signal)}. An interviewer looking at this code could ask:</p>
                    <Accordion
                      type="single"
                      items={questionsFor(ev).map((q, i) => ({
                        value: `${ev.id}-${i}`,
                        title: <span className="text-left text-sm">{q}</span>,
                        content: (
                          <div className="grid gap-2">
                            <Badge size="sm" variant="outline" className="justify-self-start">A strong answer</Badge>
                            <ul className="m-0 grid list-disc gap-1 pl-5 text-sm text-fg-muted">
                              {COVERS.map((c) => <li key={c}>{c}</li>)}
                            </ul>
                          </div>
                        ),
                      }))}
                    />
                  </div>
                </CardBody>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </AsyncBoundary>
  );
}

export function InterviewPrepPage() {
  return (
    <AppPage role="student" title="Interview prep" description="Questions an interviewer would ask about your own projects, next to the code they are about.">
      <WithStudent>{(id) => <Prep studentId={id} />}</WithStudent>
    </AppPage>
  );
}
