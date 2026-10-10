"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppPage } from "../../components/app-page";
import { asyncQuery } from "../../lib/async";
import { conceptName, signalLabel } from "../../lib/domain/concepts";
import { evidenceFiles, indexGraph, locator } from "../../lib/domain/proof-graph";
import { useClaims, useConcepts, useHeadline, useProofGraph, useScores, useSelectClaims } from "../../lib/queries";
import { Alert } from "../../ui/ui/alert";
import { AsyncBoundary } from "../../ui/ui/async-boundary";
import { Badge } from "../../ui/ui/badge";
import { Button } from "../../ui/ui/button";
import { Card, CardBody } from "../../ui/ui/card";
import { DataTable, type DataColumn } from "../../ui/ui/data-table";
import { StatCard } from "../../ui/ui/stat-card";
import { Switch } from "../../ui/ui/switch";
import { ConceptStatusBadge, WithStudent } from "./shared";

interface Row {
  id: string;
  name: string;
  claimed: boolean;
  score: number;
  files: string[];
  firstLocator: string | null;
  missing: string[];
}

function Claims({ studentId }: { studentId: string }) {
  const concepts = useConcepts();
  const claims = useClaims(studentId);
  const scores = useScores(studentId);
  const graph = useProofGraph(studentId);
  const headline = useHeadline(studentId);
  const save = useSelectClaims(studentId);
  const saved = useMemo(() => (claims.data ?? []).map((c) => c.concept_id), [claims.data]);
  const [selected, setSelected] = useState<string[]>([]);
  useEffect(() => setSelected(saved), [saved]);

  const index = useMemo(() => (graph.data ? indexGraph(graph.data) : null), [graph.data]);
  const scoreOf = (id: string) => scores.data?.find((s) => s.concept_id === id);
  const names = Object.fromEntries((concepts.data ?? []).map((c) => [c.id, c.name]));

  const rows: Row[] = (concepts.data ?? []).map((c) => {
    const records = index?.byConcept.get(c.id) ?? [];
    const accepted = records.filter((r) => r.state === "accepted" && r.isCurrent);
    return {
      id: c.id,
      name: c.name,
      claimed: selected.includes(c.id),
      score: scoreOf(c.id)?.score ?? 0,
      files: evidenceFiles(accepted),
      firstLocator: accepted[0] ? locator(accepted[0]) : null,
      missing: scoreOf(c.id)?.missing_signals ?? [],
    };
  });

  const backed = selected.filter((id) => (scoreOf(id)?.score ?? 0) > 0).length;
  const preview = selected.length ? Math.round((backed / selected.length) * 100) : null;
  const gaps = rows.filter((r) => r.score > 0 && !r.claimed).map((r) => r.name);
  const dirty = [...selected].sort().join() !== [...saved].sort().join();

  const toggle = (id: string, on: boolean) => setSelected((s) => (on ? [...new Set([...s, id])] : s.filter((x) => x !== id)));

  const columns: DataColumn<Row>[] = [
    {
      key: "claimed",
      header: "I claim",
      width: "6rem",
      cell: (r) => <Switch aria-label={`Claim ${r.name}`} checked={r.claimed} onCheckedChange={(on) => toggle(r.id, on)} />,
    },
    { key: "name", header: "Concept", sortable: true, cell: (r) => <Link className="font-medium underline-offset-4 hover:underline" href={`/student/skill-graph/${r.id}`}>{r.name}</Link> },
    { key: "score", header: "Status", cell: (r) => <ConceptStatusBadge score={scoreOf(r.id)} /> },
    { key: "points", header: "Score", align: "right", cell: (r) => <span className="tabular font-mono">{r.score}</span> },
    {
      key: "evidence",
      header: "Evidence",
      cell: (r) =>
        r.firstLocator ? (
          <span className="grid gap-0.5">
            <span className="font-mono text-xs">{r.firstLocator}</span>
            <span className="text-xs text-fg-muted">{r.files.length} {r.files.length === 1 ? "file" : "files"}</span>
          </span>
        ) : (
          <span className="text-xs text-fg-muted">{r.missing.length ? `Missing: ${r.missing.slice(0, 2).map(signalLabel).join(", ")}${r.missing.length > 2 ? "…" : ""}` : "None yet"}</span>
        ),
    },
    {
      key: "verdict",
      header: "Honesty",
      cell: (r) => (r.claimed ? r.score > 0 ? <Badge tone="success" size="sm">Backed</Badge> : <Badge tone="danger" size="sm">Not backed</Badge> : r.score > 0 ? <Badge tone="info" size="sm">Gap</Badge> : <span className="text-xs text-fg-subtle">—</span>),
    },
  ];

  return (
    <AsyncBoundary query={asyncQuery(concepts)}>
      <div className="grid gap-6">
        <section aria-label="Honesty" className="grid gap-4 md:grid-cols-3">
          <StatCard label={dirty ? "Honesty if you save" : "Honesty"} value={preview ?? undefined} unit={preview === null ? undefined : "/ 100"} hint={selected.length ? `${backed} of ${selected.length} claims have self-authored evidence` : "Claim at least one concept"} />
          <StatCard label="Claims" value={selected.length} unit={`/ ${rows.length}`} hint="Claims alone earn nothing; evidence decides." />
          <StatCard label="Presentation gaps" value={gaps.length} hint={gaps.length ? gaps.join(", ") : "Every proven skill is claimed"} />
        </section>
        {headline.data?.claims_required && !selected.length ? (
          <Alert tone="info" title="Choose your claims">Pick the skills your resume or LinkedIn says you have. ProofGraph checks each one against your code.</Alert>
        ) : null}
        <Card>
          <CardBody className="grid gap-4">
            <DataTable ariaLabel="Claims" columns={columns} data={rows} getRowId={(r) => r.id} pageSize={20} loading={concepts.isPending || scores.isPending} />
            <div className="flex flex-wrap items-center justify-end gap-2">
              {dirty ? <span className="mr-auto text-sm text-fg-muted">Unsaved changes</span> : null}
              <Button variant="ghost" disabled={!dirty} onClick={() => setSelected(saved)}>Reset</Button>
              <Button
                disabled={!dirty}
                loading={save.isPending}
                onClick={() =>
                  save.mutate(selected, {
                    onSuccess: () => toast.success(`Claims saved: ${selected.map((id) => conceptName(id, names)).join(", ") || "none"}`),
                    onError: (e) => toast.error(e.message),
                  })
                }
              >
                Save claims
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </AsyncBoundary>
  );
}

export function ClaimsPage() {
  return (
    <AppPage role="student" title="Claims" description="Say what you can do. Each claim is checked against self-authored code; a claim alone earns 0.">
      <WithStudent>{(id) => <Claims studentId={id} />}</WithStudent>
    </AppPage>
  );
}
