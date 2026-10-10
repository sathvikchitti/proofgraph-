"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AppPage } from "../../components/app-page";
import { asyncQuery } from "../../lib/async";
import { CONCEPT_IDS, conceptName } from "../../lib/domain/concepts";
import { biggestGaps, readiness, ROLE_TEMPLATES, weightsFromJobDescription } from "../../lib/domain/roles";
import { useConceptNames, useHeadline, useScores } from "../../lib/queries";
import { AsyncBoundary } from "../../ui/ui/async-boundary";
import { Badge } from "../../ui/ui/badge";
import { BarChart } from "../../ui/ui/bar-chart";
import { Button } from "../../ui/ui/button";
import { Card, CardBody, CardHeader } from "../../ui/ui/card";
import { EmptyState } from "../../ui/ui/empty-state";
import { Field } from "../../ui/ui/field";
import { Meter } from "../../ui/ui/meter";
import { Textarea } from "../../ui/ui/textarea";
import { WithStudent } from "./shared";

const JD_SAMPLE = "We are hiring a backend engineer to build REST APIs in FastAPI, design PostgreSQL schemas, run background workers with Celery and Redis, and keep our GitHub Actions pipeline green with pytest.";
const THRESHOLDS = [{ at: 0, tone: "danger" as const }, { at: 40, tone: "warning" as const }, { at: 65, tone: "success" as const }];

function Fit({ studentId }: { studentId: string }) {
  const scoresQ = useScores(studentId);
  const headline = useHeadline(studentId);
  const names = useConceptNames();
  const scores = useMemo(() => Object.fromEntries((scoresQ.data ?? []).map((s) => [s.concept_id, s.score])), [scoresQ.data]);
  const [jd, setJd] = useState(JD_SAMPLE);
  const jdWeights = useMemo(() => weightsFromJobDescription(jd), [jd]);
  const jdScore = readiness(jdWeights, scores);
  const roles = ROLE_TEMPLATES.map((r) => ({ ...r, value: readiness(r.weights, scores), gaps: biggestGaps(r.weights, scores) }));

  return (
    <AsyncBoundary query={asyncQuery(scoresQ)}>
      <div className="grid gap-6">
        <section aria-label="Readiness by role" className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
          {roles.map((r) => (
            <Card key={r.id} className="h-full">
              <CardBody className="grid gap-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="m-0 text-sm font-semibold">{r.title}</h2>
                  {r.id === "backend-sde" && headline.data ? <Badge size="sm" variant="outline">Headline</Badge> : null}
                </div>
                <Meter value={r.id === "backend-sde" && headline.data ? headline.data.role_readiness : r.value} max={100} showValue thresholds={THRESHOLDS} aria-label={`${r.title} readiness`} />
                <p className="m-0 text-xs text-fg-muted">{r.summary}</p>
                {r.gaps.length ? (
                  <p className="m-0 text-xs">
                    Biggest gains:{" "}
                    {r.gaps.map((g, i) => (
                      <span key={g.concept}>
                        {i ? ", " : ""}
                        <Link className="underline underline-offset-4" href={`/student/missions?concept=${g.concept}`}>{conceptName(g.concept, names)}</Link>
                      </span>
                    ))}
                  </p>
                ) : null}
              </CardBody>
            </Card>
          ))}
        </section>
        <div className="grid items-start gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader title={<h2 className="text-base font-semibold">Match a job description</h2>} description="Paste any posting. Its wording becomes concept weights, scored with the same rules as your headline." />
            <CardBody className="grid gap-4">
              <Field label="Job description"><Textarea value={jd} onValueChange={setJd} rows={6} /></Field>
              {Object.keys(jdWeights).length ? (
                <div className="grid gap-3">
                  <Meter value={jdScore} max={100} showValue thresholds={THRESHOLDS} label="Your match" size="lg" />
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(jdWeights).sort((a, b) => b[1] - a[1]).map(([c, w]) => (
                      <Badge key={c} size="sm" tone={(scores[c] ?? 0) > 0 ? "success" : "danger"} variant="subtle">{conceptName(c, names)} ×{w}</Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyState size="sm" title="No concepts found" description="Mention the tech the role uses (APIs, databases, CI, caching…)." />
              )}
              <div><Button asChild variant="outline" size="sm"><Link href="/student/opportunities">See matching opportunities</Link></Button></div>
            </CardBody>
          </Card>
          <Card>
            <CardHeader title={<h2 className="text-base font-semibold">Where your points are</h2>} description="Code evidence reaches 70 per concept; a passed viva adds 30." />
            <CardBody>
              <BarChart
                label="Score per concept"
                data={CONCEPT_IDS.map((c) => ({ concept: conceptName(c, names), score: scores[c] ?? 0 }))}
                xKey="concept"
                series={[{ key: "score", label: "Score", tone: "info" }]}
                orientation="horizontal"
                yDomain={[0, 100]}
                thresholds={[{ value: 70, label: "Evidence ceiling", tone: "warning" }]}
                height={300}
              />
            </CardBody>
          </Card>
        </div>
      </div>
    </AsyncBoundary>
  );
}

export function RoleFitPage() {
  return (
    <AppPage role="student" title="Role fit" description="Readiness per target role, plus an instant match for a pasted job description.">
      <WithStudent>{(id) => <Fit studentId={id} />}</WithStudent>
    </AppPage>
  );
}
