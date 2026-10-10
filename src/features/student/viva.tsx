"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Mic, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { AppPage } from "../../components/app-page";
import type { VivaResult, VivaSession } from "../../lib/api";
import { conceptName, conceptStatus } from "../../lib/domain/concepts";
import { indexGraph } from "../../lib/domain/proof-graph";
import { useConceptNames, useGradeViva, useProofGraph, useScores, useStartViva } from "../../lib/queries";
import { Alert } from "../../ui/ui/alert";
import { Badge } from "../../ui/ui/badge";
import { Button } from "../../ui/ui/button";
import { Card, CardBody, CardHeader } from "../../ui/ui/card";
import { CountdownTimer } from "../../ui/ui/countdown-timer";
import { EmptyState } from "../../ui/ui/empty-state";
import { Field } from "../../ui/ui/field";
import { QuestionCard } from "../../ui/ui/question-card";
import { RubricResult } from "../../ui/ui/rubric-result";
import { SegmentedControl } from "../../ui/ui/segmented-control";
import { Select } from "../../ui/ui/select";
import { EvidenceSnippet, WithStudent } from "./shared";

type Mode = "practice" | "ranked";

function Viva({ studentId, initialConcept }: { studentId: string; initialConcept?: string }) {
  const scores = useScores(studentId);
  const graph = useProofGraph(studentId);
  const names = useConceptNames();
  const start = useStartViva();
  const grade = useGradeViva();
  const index = useMemo(() => (graph.data ? indexGraph(graph.data) : null), [graph.data]);
  const eligible = (scores.data ?? []).filter((s) => conceptStatus(s) === "weak").sort((a, b) => b.score - a.score);
  const [concept, setConcept] = useState<string | undefined>(initialConcept);
  const chosen = concept && eligible.some((e) => e.concept_id === concept) ? concept : eligible[0]?.concept_id;
  const [mode, setMode] = useState<Mode>("practice");
  const [session, setSession] = useState<VivaSession | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<VivaResult | null>(null);

  const begin = () => {
    if (!chosen || !index) return;
    const evidenceIds = (index.byConcept.get(chosen) ?? []).filter((r) => r.state === "accepted" && r.isCurrent).slice(0, 3).map((r) => r.id);
    setResult(null);
    setAnswers({});
    setStep(0);
    start.mutate({ concept_id: chosen, mode, evidence_ids: evidenceIds }, { onSuccess: setSession, onError: (e) => toast.error(e.message) });
  };

  const finish = (all: Record<string, string>) => {
    if (!session) return;
    grade.mutate(
      { session_id: session.id, answers: session.questions.map((q) => ({ question_id: q.id, answer: all[q.id] ?? "" })) },
      { onSuccess: setResult, onError: (e) => toast.error(e.message) },
    );
  };

  const answer = (value: string) => {
    if (!session) return;
    const q = session.questions[step]!;
    const next = { ...answers, [q.id]: value };
    setAnswers(next);
    if (step + 1 < session.questions.length) setStep(step + 1);
    else finish(next);
  };

  if (scores.data && !eligible.length) {
    return (
      <Card variant="outline">
        <EmptyState icon={<Mic aria-hidden="true" />} title="No concept is ready for a viva" description="A viva needs code evidence first. Finish a mission, push it and rescan." action={<Button asChild><Link href="/student/missions">See missions</Link></Button>} />
      </Card>
    );
  }

  if (result && session) {
    return (
      <div className="grid gap-6">
        <Alert tone={result.passed ? "success" : "warning"} title={result.passed ? `Passed: ${conceptName(session.concept_id, names)}` : "Not passed this time"}>
          {result.passed
            ? session.mode === "ranked"
              ? `+${result.points_awarded} points. ${conceptName(session.concept_id, names)} is now Verified.`
              : "Practice attempts do not change your score. Take a ranked attempt when you are ready."
            : result.cooldown_until
              ? `Ranked attempts reopen ${new Date(result.cooldown_until).toLocaleString()}. Practice is open now.`
              : "Practice as often as you like."}
        </Alert>
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <Card>
            <CardBody>
              <RubricResult criteria={result.criteria} overall={result.overall} max={100} overallLabel="Overall" summary={result.passed ? "You explained your own code clearly." : "Be specific: name lines, failures and trade-offs."} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title={<h2 className="text-base font-semibold">Your answers</h2>} />
            <CardBody>
              <ol className="m-0 grid list-none gap-4 p-0">
                {session.questions.map((q, i) => {
                  const a = result.answers.find((x) => x.question_id === q.id);
                  return (
                    <li key={q.id} className="grid gap-1 border-b border-border pb-4 last:border-b-0 last:pb-0">
                      <span className="flex items-center gap-2 text-sm font-medium">
                        Question {i + 1}
                        <Badge size="sm" tone={a?.verdict === "correct" ? "success" : a?.verdict === "partial" ? "warning" : "danger"}>{a?.verdict ?? "—"}</Badge>
                      </span>
                      <p className="m-0 text-sm text-fg-muted">{q.prompt}</p>
                      <p className="m-0 text-sm">{a?.feedback}</p>
                      {a?.follow_up ? <p className="m-0 text-sm text-fg-muted">Follow-up: {a.follow_up}</p> : null}
                    </li>
                  );
                })}
              </ol>
            </CardBody>
          </Card>
        </div>
        <div><Button variant="outline" leading={<RotateCcw className="size-4" aria-hidden="true" />} onClick={() => { setSession(null); setResult(null); }}>Back to setup</Button></div>
      </div>
    );
  }

  if (session) {
    const q = session.questions[step]!;
    const ev = q.evidence_id ? index?.evidence.find((e) => e.id === q.evidence_id) : undefined;
    return (
      <div className="grid items-start gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title={<h2 className="text-base font-semibold">Your code</h2>} description="The question is about these lines from your own repository." />
          <CardBody>{ev ? <EvidenceSnippet key={ev.id} evidence={ev} maxHeight={420} /> : <p className="m-0 text-sm text-fg-muted">{q.file_path}</p>}</CardBody>
        </Card>
        <QuestionCard
          key={q.id}
          index={step}
          total={session.questions.length}
          prompt={q.prompt}
          hint={q.hint}
          mode="text"
          timer={<CountdownTimer key={q.id} durationMs={session.seconds_per_question * 1000} warnAtMs={30_000} dangerAtMs={10_000} onExpire={() => answer(answers[q.id] ?? "")} size="sm" showBar label="Time left" />}
          onSubmit={(v) => answer(v)}
          onSkip={() => answer("")}
          submitting={grade.isPending}
          labels={{ submit: step + 1 < session.questions.length ? "Next question" : "Finish viva", skip: "Skip" }}
        />
      </div>
    );
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <Card>
        <CardHeader title={<h2 className="text-base font-semibold">Set up your viva</h2>} />
        <CardBody className="grid max-w-xl gap-4">
          <Field label="Concept" hint="Only concepts with accepted code evidence can be verified.">
            <Select
              options={eligible.map((e) => ({ value: e.concept_id, label: `${conceptName(e.concept_id, names)} · ${e.score}` }))}
              value={chosen}
              onValueChange={setConcept}
              loading={scores.isPending}
              aria-label="Concept"
            />
          </Field>
          <Field label="Attempt" hint={mode === "ranked" ? "Counts toward your score. A failed ranked attempt starts a 24-hour cooldown." : "Does not change your score. Practise as often as you like."}>
            <SegmentedControl<Mode> label="Attempt type" value={mode} onValueChange={setMode} options={[{ value: "practice", label: "Practice" }, { value: "ranked", label: "Ranked" }]} />
          </Field>
          <div><Button leading={<Mic className="size-4" aria-hidden="true" />} disabled={!chosen || !index} loading={start.isPending} onClick={begin}>Start viva</Button></div>
        </CardBody>
      </Card>
      <Card variant="sunken">
        <CardBody>
          <ul className="m-0 grid list-disc gap-2 pl-5 text-sm text-fg-muted">
            <li>Three questions, each about lines you wrote.</li>
            <li>90 seconds per question. Unanswered questions count as wrong.</li>
            <li>Pass a ranked attempt to add up to 30 points and mark the concept Verified.</li>
            <li>Questions are generated and graded locally; the evidence decides what is asked.</li>
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}

export function VivaPage({ concept }: { concept?: string }) {
  return (
    <AppPage role="student" title="Viva" description="A timed oral check on your own code. Passing turns Evidence-backed into Verified.">
      <WithStudent>{(id) => <Viva studentId={id} initialConcept={concept} />}</WithStudent>
    </AppPage>
  );
}
