"use client";
import { useMemo, useState } from "react";
import { CalendarClock, MapPin } from "lucide-react";
import { toast } from "sonner";
import { AppPage } from "../../components/app-page";
import type { Opportunity } from "../../lib/api";
import { asyncQuery } from "../../lib/async";
import { conceptName } from "../../lib/domain/concepts";
import { useConceptNames, useHeadline, useProduct, useSaveProduct, useScores, useStudentId } from "../../lib/queries";
import { AsyncBoundary } from "../../ui/ui/async-boundary";
import { Badge } from "../../ui/ui/badge";
import { Button } from "../../ui/ui/button";
import { Card, CardBody, CardFooter, CardHeader } from "../../ui/ui/card";
import { SegmentedControl } from "../../ui/ui/segmented-control";

type Filter = "all" | "eligible" | "applied";

export function eligibility(o: Pick<Opportunity, "required" | "min_readiness">, scores: Record<string, number>, readiness: number) {
  const missing = o.required.filter((r) => (scores[r.concept_id] ?? 0) < r.min_score);
  return { eligible: !missing.length && readiness >= o.min_readiness, missing, readinessShort: readiness < o.min_readiness };
}

export function OpportunitiesPage() {
  const studentId = useStudentId();
  const list = useProduct("opportunities");
  const save = useSaveProduct("opportunities");
  const scoresQ = useScores(studentId);
  const headline = useHeadline(studentId);
  const names = useConceptNames();
  const scores = useMemo(() => Object.fromEntries((scoresQ.data ?? []).map((s) => [s.concept_id, s.score])), [scoresQ.data]);
  const readiness = headline.data?.role_readiness ?? 0;
  const [filter, setFilter] = useState<Filter>("all");
  const rows = (list.data ?? []).map((o) => ({ o, ...eligibility(o, scores, readiness) }));
  const shown = rows.filter((r) => (filter === "eligible" ? r.eligible : filter === "applied" ? r.o.applied : true));

  const apply = (id: string) => list.data && save.mutate(list.data.map((o) => (o.id === id ? { ...o, applied: true } : o)), { onSuccess: () => toast.success("Applied with your Proof Profile"), onError: (e) => toast.error(e.message) });

  return (
    <AppPage role="student" title="Opportunities" description="Drives and roles, with the evidence each one asks for checked against yours.">
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl<Filter> label="Show" value={filter} onValueChange={setFilter} options={[{ value: "all", label: "All" }, { value: "eligible", label: "I qualify" }, { value: "applied", label: "Applied" }]} />
        <span className="ml-auto text-sm text-fg-muted">Your readiness: {readiness}/100</span>
      </div>
      <AsyncBoundary query={asyncQuery(list, shown.length === 0)} empty={<Card variant="outline"><CardBody><p className="m-0 text-center text-sm text-fg-muted">Nothing here yet.</p></CardBody></Card>}>
        <ul className="m-0 grid list-none gap-4 p-0 lg:grid-cols-2">
          {shown.map(({ o, eligible, missing, readinessShort }) => (
            <li key={o.id} className="min-w-0">
              <Card className="h-full">
                <CardHeader
                  title={<h2 className="m-0 text-base font-semibold">{o.role}</h2>}
                  description={<span className="flex flex-wrap items-center gap-x-3 gap-y-1"><span className="font-medium text-fg">{o.company}</span><span className="inline-flex items-center gap-1"><MapPin className="size-3.5" aria-hidden="true" />{o.location}</span><span className="inline-flex items-center gap-1"><CalendarClock className="size-3.5" aria-hidden="true" />Closes {new Date(o.deadline).toLocaleDateString()}</span></span>}
                  actions={<Badge tone={o.kind === "drive" ? "info" : "neutral"} size="sm">{o.kind === "drive" ? "Campus drive" : "Open role"}</Badge>}
                />
                <CardBody className="grid gap-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-fg-muted">Evidence asked for</span>
                  <div className="flex flex-wrap gap-1.5">
                    {o.required.map((r) => (
                      <Badge key={r.concept_id} size="sm" tone={(scores[r.concept_id] ?? 0) >= r.min_score ? "success" : "danger"} variant="subtle">
                        {conceptName(r.concept_id, names)} ≥ {r.min_score} (you {scores[r.concept_id] ?? 0})
                      </Badge>
                    ))}
                    <Badge size="sm" tone={readinessShort ? "danger" : "success"} variant="subtle">Readiness ≥ {o.min_readiness}</Badge>
                  </div>
                </CardBody>
                <CardFooter className="flex flex-wrap items-center gap-2">
                  {o.applied ? (
                    <Badge tone="success" dot>Applied</Badge>
                  ) : (
                    <Button size="sm" disabled={!eligible} onClick={() => apply(o.id)}>Apply with Proof Profile</Button>
                  )}
                  {!eligible && !o.applied ? <span className="text-xs text-fg-muted">{missing.length ? `Raise ${missing.map((m) => conceptName(m.concept_id, names)).join(", ")} to qualify.` : "Raise your readiness to qualify."}</span> : null}
                </CardFooter>
              </Card>
            </li>
          ))}
        </ul>
      </AsyncBoundary>
    </AppPage>
  );
}
