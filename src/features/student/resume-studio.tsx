"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { AppPage } from "../../components/app-page";
import type { ConceptScore } from "../../lib/api";
import { asyncQuery } from "../../lib/async";
import { conceptName, signalLabel } from "../../lib/domain/concepts";
import { evidenceFiles, indexGraph, type GraphIndex } from "../../lib/domain/proof-graph";
import { weightsFromJobDescription } from "../../lib/domain/roles";
import { useActiveRepository, useConceptNames, useProofGraph, useScores } from "../../lib/queries";
import { useCopy } from "../../ui/hooks/use-copy";
import { AsyncBoundary } from "../../ui/ui/async-boundary";
import { Badge } from "../../ui/ui/badge";
import { Button, IconButton } from "../../ui/ui/button";
import { Card, CardBody, CardHeader } from "../../ui/ui/card";
import { EmptyState } from "../../ui/ui/empty-state";
import { Field } from "../../ui/ui/field";
import { Textarea } from "../../ui/ui/textarea";
import { WithStudent } from "./shared";

const SAMPLE = `Built REST APIs with FastAPI for a product catalogue
Implemented JWT authentication and role-based access
Designed PostgreSQL schemas with migrations
Added Redis caching to cut response times by 60%
Wrote pytest suites with fixtures and mocks
Set up GitHub Actions CI with linting and tests
Led a team of four in a college hackathon`;

type Verdict = { line: string; concepts: string[]; status: "backed" | "unproven" | "none" };

function analyse(text: string, scores: ConceptScore[]): Verdict[] {
  const scoreOf = new Map(scores.map((s) => [s.concept_id, s.score]));
  return text
    .split("\n")
    .map((l) => l.replace(/^[-*•\s]+/, "").trim())
    .filter(Boolean)
    .map((line) => {
      const concepts = Object.keys(weightsFromJobDescription(line));
      if (!concepts.length) return { line, concepts, status: "none" as const };
      const unproven = concepts.filter((c) => !(scoreOf.get(c) ?? 0));
      return { line, concepts, status: unproven.length ? ("unproven" as const) : ("backed" as const) };
    });
}

function bullets(scores: ConceptScore[], index: GraphIndex, repoName: string, names: Record<string, string>): { concept: string; text: string }[] {
  return scores
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => {
      const records = (index.byConcept.get(s.concept_id) ?? []).filter((r) => r.state === "accepted" && r.isCurrent);
      const signals = [...new Set(records.map((r) => signalLabel(r.signal).toLowerCase()))].slice(0, 3);
      const files = evidenceFiles(records).slice(0, 2);
      return {
        concept: s.concept_id,
        text: `${conceptName(s.concept_id, names)}: ${signals.join(", ")} in ${repoName} (${files.join(", ")}${evidenceFiles(records).length > 2 ? ", …" : ""}). Evidence-backed, score ${s.score}/100 on ProofGraph.`,
      };
    });
}

function CopyLine({ text }: { text: string }) {
  const { copy, copied } = useCopy();
  return (
    <IconButton label={copied ? "Copied" : "Copy bullet"} size="sm" variant="ghost" onClick={() => copy(text)}>
      {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
    </IconButton>
  );
}

const VERDICT = { backed: { tone: "success", label: "Backed by code" }, unproven: { tone: "danger", label: "Not provable yet" }, none: { tone: "neutral", label: "Not a code skill" } } as const;

function Studio({ studentId }: { studentId: string }) {
  const scores = useScores(studentId);
  const graph = useProofGraph(studentId);
  const names = useConceptNames();
  const repo = useActiveRepository();
  const [text, setText] = useState(SAMPLE);
  const verdicts = useMemo(() => analyse(text, scores.data ?? []), [text, scores.data]);
  const index = useMemo(() => (graph.data ? indexGraph(graph.data) : null), [graph.data]);
  const generated = index && scores.data ? bullets(scores.data, index, repo ? `${repo.owner ? `${repo.owner}/` : ""}${repo.name}` : "my repository", names) : [];
  const unproven = verdicts.filter((v) => v.status === "unproven").length;

  return (
    <AsyncBoundary query={asyncQuery(scores)}>
      <div className="grid items-start gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title={<h2 className="text-base font-semibold">Check your resume</h2>} description="Paste your resume bullets, one per line. Each line is matched to concepts and checked against your evidence." />
          <CardBody className="grid gap-4">
            <Field label="Resume bullets">
              <Textarea value={text} onValueChange={setText} rows={8} autoResize maxRows={16} />
            </Field>
            <ul className="m-0 grid list-none gap-2 p-0" aria-label="Line checks">
              {verdicts.map((v, i) => (
                <li key={`${i}-${v.line}`} className="grid gap-1 rounded-(--card-radius) border border-border p-3">
                  <span className="flex flex-wrap items-center gap-2">
                    <Badge size="sm" tone={VERDICT[v.status].tone} dot>{VERDICT[v.status].label}</Badge>
                    {v.concepts.map((c) => (
                      <Link key={c} href={`/student/skill-graph/${c}`} className="text-xs text-fg-muted underline-offset-4 hover:underline">{conceptName(c, names)}</Link>
                    ))}
                  </span>
                  <span className="text-sm">{v.line}</span>
                </li>
              ))}
            </ul>
            {unproven ? (
              <p className="m-0 text-sm text-fg-muted">
                {unproven} {unproven === 1 ? "line claims" : "lines claim"} something your code does not show yet. <Link className="underline underline-offset-4" href="/student/missions">Missions</Link> turn those into evidence.
              </p>
            ) : null}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title={<h2 className="text-base font-semibold">Evidence-backed bullets</h2>} description="Written from your accepted findings, so every word can be checked." />
          <CardBody>
            {generated.length ? (
              <ul className="m-0 grid list-none gap-3 p-0">
                {generated.map((b) => (
                  <li key={b.concept} className="flex items-start gap-2 border-b border-border pb-3 last:border-b-0 last:pb-0">
                    <span className="flex-1 text-sm">{b.text}</span>
                    <CopyLine text={b.text} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState size="sm" title="No evidence yet" description="Bullets appear once a concept has accepted findings." action={<Button asChild size="sm" variant="outline"><Link href="/student/scans">Run a scan</Link></Button>} />
            )}
          </CardBody>
        </Card>
      </div>
    </AsyncBoundary>
  );
}

export function ResumeStudioPage() {
  return (
    <AppPage role="student" title="Resume studio" description="Flags resume lines you cannot prove yet and writes bullets backed by evidence links.">
      <WithStudent>{(id) => <Studio studentId={id} />}</WithStudent>
    </AppPage>
  );
}
