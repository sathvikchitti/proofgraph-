"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Radar, Target } from "lucide-react";
import { AppPage } from "../../components/app-page";
import { asyncQuery } from "../../lib/async";
import { conceptName } from "../../lib/domain/concepts";
import { missionsFrom } from "../../lib/domain/missions";
import { useConceptNames, useScores } from "../../lib/queries";
import { AsyncBoundary } from "../../ui/ui/async-boundary";
import { Badge } from "../../ui/ui/badge";
import { Button } from "../../ui/ui/button";
import { Card, CardBody, CardFooter, CardHeader } from "../../ui/ui/card";
import { EmptyState } from "../../ui/ui/empty-state";
import { FacetFilter } from "../../ui/ui/filter-bar";
import { StatCard } from "../../ui/ui/stat-card";
import { ConceptStatusBadge, WithStudent } from "./shared";

function Missions({ studentId, initialConcept }: { studentId: string; initialConcept?: string }) {
  const scores = useScores(studentId);
  const names = useConceptNames();
  const all = useMemo(() => missionsFrom(scores.data ?? []), [scores.data]);
  const [concepts, setConcepts] = useState<string[]>(initialConcept ? [initialConcept] : []);
  const shown = concepts.length ? all.filter((m) => concepts.includes(m.conceptId)) : all;
  const conceptIds = [...new Set(all.map((m) => m.conceptId))];
  const firstEvidence = all.filter((m) => m.effort === "M");

  return (
    <AsyncBoundary query={asyncQuery(scores, all.length === 0)} empty={<EmptyState icon={<Target aria-hidden="true" />} title="No missions left" description="Every signal the detectors look for is in your code. Take the vivas to verify it." />}>
      <div className="grid gap-6">
        <section aria-label="Mission summary" className="grid gap-4 md:grid-cols-3">
          <StatCard label="Open missions" value={all.length} hint={`Across ${conceptIds.length} concepts`} />
          <StatCard label="First evidence" value={firstEvidence.length} hint="Missions on concepts still at 0" />
          <StatCard label="Points available" value={Math.min(all.reduce((n, m) => n + m.estimatedGain, 0), conceptIds.length * 70)} hint="Estimated from the scoring rules" />
        </section>
        <div className="flex flex-wrap items-center gap-3">
          <FacetFilter label="Concept" options={conceptIds.map((c) => ({ value: c, label: conceptName(c, names) }))} value={concepts} onValueChange={setConcepts} />
          {concepts.length ? <Button size="sm" variant="ghost" onClick={() => setConcepts([])}>Clear</Button> : null}
          <span className="ml-auto text-sm text-fg-muted">{shown.length} shown</span>
        </div>
        <ul className="m-0 grid list-none gap-4 p-0 lg:grid-cols-2 2xl:grid-cols-3">
          {shown.map((m) => {
            const score = scores.data?.find((s) => s.concept_id === m.conceptId);
            return (
              <li key={m.id} className="min-w-0">
                <Card className="h-full">
                  <CardHeader
                    title={<h2 className="m-0 text-sm font-semibold">{m.title}</h2>}
                    description={<span className="flex flex-wrap items-center gap-2"><ConceptStatusBadge score={score} /><Badge size="sm" variant="outline">Effort {m.effort}</Badge><Badge size="sm" tone="success" variant="subtle">up to +{m.estimatedGain}</Badge></span>}
                  />
                  <CardBody>
                    <ol className="m-0 grid gap-1.5 pl-5 text-sm text-fg-muted">
                      {m.steps.map((s) => <li key={s}>{s}</li>)}
                    </ol>
                  </CardBody>
                  <CardFooter className="flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline"><Link href={`/student/skill-graph/${m.conceptId}`}>Current evidence</Link></Button>
                    <Button asChild size="sm" variant="ghost" leading={<Radar className="size-4" aria-hidden="true" />}><Link href="/student/scans">Rescan after pushing</Link></Button>
                  </CardFooter>
                </Card>
              </li>
            );
          })}
        </ul>
      </div>
    </AsyncBoundary>
  );
}

export function MissionsPage({ concept }: { concept?: string }) {
  return (
    <AppPage role="student" title="Missions" description="Small tasks in your own repository that turn a missing signal into evidence. Push, rescan, and the score moves.">
      <WithStudent>{(id) => <Missions studentId={id} initialConcept={concept} />}</WithStudent>
    </AppPage>
  );
}
