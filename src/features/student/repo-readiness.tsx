"use client";
import Link from "next/link";
import { useMemo } from "react";
import { AppPage } from "../../components/app-page";
import { asyncQuery } from "../../lib/async";
import { indexGraph, locator } from "../../lib/domain/proof-graph";
import { useActiveRepository, useProofGraph, useScans } from "../../lib/queries";
import { AsyncBoundary } from "../../ui/ui/async-boundary";
import { Badge } from "../../ui/ui/badge";
import { Card, CardBody, CardHeader } from "../../ui/ui/card";
import { Checklist } from "../../ui/ui/checklist";
import { DescriptionList } from "../../ui/ui/description-list";
import { Meter } from "../../ui/ui/meter";
import { WithStudent } from "./shared";

interface Check {
  id: string;
  group: string;
  label: string;
  done: boolean | null;
  proof?: string;
  fix: string;
  href?: string;
}

function Readiness({ studentId }: { studentId: string }) {
  const repo = useActiveRepository();
  const graph = useProofGraph(studentId);
  const scans = useScans(repo?.id);
  const index = useMemo(() => (graph.data ? indexGraph(graph.data) : null), [graph.data]);
  const has = (concept: string, signal: string) => (index?.byConcept.get(concept) ?? []).find((r) => r.signal === signal && r.state === "accepted" && r.isCurrent);
  const proof = (concept: string, signal: string) => {
    const r = has(concept, signal);
    return r ? locator(r) : undefined;
  };
  const metrics = scans.data?.[0]?.metrics;

  const checks: Check[] = [
    { id: "tests", group: "Tests", label: "Has automated tests", done: Boolean(has("automated_tests", "test_case")), proof: proof("automated_tests", "test_case"), fix: "Add a tests/ folder with at least one test per endpoint.", href: "/student/skill-graph/automated_tests" },
    { id: "assert", group: "Tests", label: "Tests assert on behaviour", done: Boolean(has("automated_tests", "assertion")), proof: proof("automated_tests", "assertion"), fix: "Assert on response bodies, not only status codes." },
    { id: "boundary", group: "Tests", label: "Tests cross the HTTP boundary", done: Boolean(has("automated_tests", "integration_boundary")), proof: proof("automated_tests", "integration_boundary"), fix: "Use the framework's test client so the whole stack runs." },
    { id: "ci", group: "CI", label: "CI workflow on every push", done: Boolean(has("ci_cd", "workflow")), proof: proof("ci_cd", "workflow"), fix: "Add .github/workflows/ci.yml triggered on push.", href: "/student/skill-graph/ci_cd" },
    { id: "ci-tests", group: "CI", label: "CI runs the tests", done: Boolean(has("ci_cd", "test_job")), proof: proof("ci_cd", "test_job"), fix: "Add a job step that runs pytest." },
    { id: "lint", group: "CI", label: "CI lints or type-checks", done: Boolean(has("ci_cd", "lint_or_typecheck")), proof: proof("ci_cd", "lint_or_typecheck"), fix: "Add ruff or mypy to the workflow." },
    { id: "errors", group: "Structure", label: "Errors become structured responses", done: Boolean(has("error_handling", "structured_response")), proof: proof("error_handling", "structured_response"), fix: "Return one consistent JSON error shape.", href: "/student/skill-graph/error_handling" },
    { id: "validation", group: "Structure", label: "Requests are validated", done: Boolean(has("rest_apis", "request_validation")), proof: proof("rest_apis", "request_validation"), fix: "Validate request bodies with schema models." },
    { id: "readme", group: "Docs", label: "README with setup and run steps", done: null, fix: "The detectors do not read docs yet. Recruiters do: keep setup to three commands." },
  ];
  const scored = checks.filter((c) => c.done !== null);
  const passed = scored.filter((c) => c.done).length;
  const groups = [...new Set(checks.map((c) => c.group))];

  return (
    <AsyncBoundary query={asyncQuery(graph)}>
      <div className="grid items-start gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <Card>
          <CardHeader title={<h2 className="font-mono text-sm font-semibold">{repo ? `${repo.owner ? `${repo.owner}/` : ""}${repo.name}` : "No repository"}</h2>} />
          <CardBody className="grid gap-4">
            <Meter value={passed} max={scored.length} variant="radial" size="lg" showValue formatValue={(v, m) => `${v}/${m}`} label="Checks passed" thresholds={[{ at: 0, tone: "danger" }, { at: 4, tone: "warning" }, { at: 7, tone: "success" }]} />
            <DescriptionList
              items={[
                { label: "Visibility", value: repo?.visibility ?? "—" },
                { label: "Branch", value: repo?.default_branch ?? "—", mono: true },
                { label: "Files tracked", value: metrics?.total_tracked_files ?? "—" },
                { label: "Eligible for analysis", value: metrics?.eligible_files ?? "—" },
              ]}
            />
            <p className="m-0 text-xs text-fg-subtle">Checks are read from accepted evidence in the latest scan, so every tick points at real lines.</p>
          </CardBody>
        </Card>
        <div className="grid gap-4">
          {groups.map((g) => (
            <Checklist
              key={g}
              title={g}
              items={checks
                .filter((c) => c.group === g)
                .map((c) => ({
                  id: c.id,
                  label: (
                    <span className="flex flex-wrap items-center gap-2">
                      {c.label}
                      {c.done === null ? <Badge size="sm" variant="outline">Not checked</Badge> : null}
                    </span>
                  ),
                  description: c.done ? <span className="font-mono text-xs">{c.proof}</span> : c.fix,
                  done: Boolean(c.done),
                  disabled: true,
                  action: c.href && !c.done ? <Link className="text-xs underline underline-offset-4" href={c.href}>Details</Link> : undefined,
                }))}
            />
          ))}
        </div>
      </div>
    </AsyncBoundary>
  );
}

export function RepoReadinessPage() {
  return (
    <AppPage role="student" title="Repo readiness" description="A fix list for your active repository: tests, CI, structure and docs.">
      <WithStudent>{(id) => <Readiness studentId={id} />}</WithStudent>
    </AppPage>
  );
}
