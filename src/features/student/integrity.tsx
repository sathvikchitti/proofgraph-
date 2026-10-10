"use client";
import { useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { AppPage } from "../../components/app-page";
import { asyncQuery } from "../../lib/async";
import { conceptName, signalLabel } from "../../lib/domain/concepts";
import { indexGraph, locator } from "../../lib/domain/proof-graph";
import { timeAgo } from "../../lib/format-time";
import { useConceptNames, useProduct, useProofGraph, useSaveProduct } from "../../lib/queries";
import { Accordion } from "../../ui/ui/accordion";
import { Alert } from "../../ui/ui/alert";
import { AsyncBoundary } from "../../ui/ui/async-boundary";
import { Badge } from "../../ui/ui/badge";
import { Button } from "../../ui/ui/button";
import { Card, CardBody, CardHeader } from "../../ui/ui/card";
import { EmptyState } from "../../ui/ui/empty-state";
import { Field } from "../../ui/ui/field";
import { Select } from "../../ui/ui/select";
import { Textarea } from "../../ui/ui/textarea";
import { Timeline } from "../../ui/ui/timeline";
import { EvidenceSnippet, WithStudent } from "./shared";

const APPEAL_TONE = { submitted: "info", in_review: "warning", upheld: "danger", overturned: "success" } as const;

function Integrity({ studentId }: { studentId: string }) {
  const graph = useProofGraph(studentId);
  const appeals = useProduct("appeals");
  const save = useSaveProduct("appeals");
  const names = useConceptNames();
  const index = useMemo(() => (graph.data ? indexGraph(graph.data) : null), [graph.data]);
  const rejected = (index?.evidence ?? []).filter((e) => e.state === "rejected");
  const [evidenceId, setEvidenceId] = useState<string | undefined>();
  const [reason, setReason] = useState("");
  const target = evidenceId ?? rejected[0]?.id;
  const appealed = new Set((appeals.data ?? []).map((a) => a.evidence_id));

  const submit = () => {
    if (!target || reason.trim().length < 20) return;
    const next = [...(appeals.data ?? []), { id: `ap-${Date.now()}`, evidence_id: target, reason: reason.trim(), status: "submitted" as const, submitted_at: new Date().toISOString() }];
    save.mutate(next, { onSuccess: () => { toast.success("Appeal submitted. A reviewer will look at the commit history."); setReason(""); }, onError: (e) => toast.error(e.message) });
  };

  return (
    <AsyncBoundary query={asyncQuery(graph)}>
      <div className="grid gap-6">
        {rejected.length ? (
          <Alert tone="warning" title={`${rejected.length} finding${rejected.length === 1 ? " was" : "s were"} not counted`}>
            Git blame attributed these lines to someone other than you, so they earn no points. Nothing else about your account is affected.
          </Alert>
        ) : (
          <Alert tone="success" title="Nothing flagged">Every finding in your active repository was attributed to you.</Alert>
        )}
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <Card>
            <CardHeader title={<h2 className="text-base font-semibold">Rejected findings</h2>} description="Ownership below 50% means the code does not count. Co-authored commits can be appealed." />
            <CardBody>
              {rejected.length ? (
                <Accordion
                  defaultValue={rejected.slice(0, 1).map((r) => r.id)}
                  items={rejected.map((r) => ({
                    value: r.id,
                    title: (
                      <span className="flex min-w-0 flex-1 flex-wrap items-center gap-2 text-left">
                        <span className="text-sm font-medium">{signalLabel(r.signal)}</span>
                        <Badge size="sm" variant="outline">{conceptName(r.conceptId, names)}</Badge>
                        <Badge size="sm" tone="danger">{r.ownershipRatio ?? 0}% yours</Badge>
                        <span className="min-w-0 truncate font-mono text-xs text-fg-muted">{locator(r)}</span>
                        {appealed.has(r.id) ? <Badge size="sm" tone="info">Appealed</Badge> : null}
                      </span>
                    ),
                    content: <EvidenceSnippet evidence={r} maxHeight={260} />,
                  }))}
                />
              ) : (
                <EmptyState size="sm" icon={<ShieldCheck aria-hidden="true" />} title="No rejected findings" />
              )}
            </CardBody>
          </Card>
          <div className="grid gap-6">
            <Card>
              <CardHeader title={<h2 className="text-base font-semibold">Appeal a finding</h2>} />
              <CardBody className="grid gap-4">
                <Field label="Finding">
                  <Select
                    aria-label="Finding"
                    options={rejected.map((r) => ({ value: r.id, label: `${signalLabel(r.signal)} · ${locator(r)}` }))}
                    value={target}
                    onValueChange={setEvidenceId}
                    disabled={!rejected.length}
                    placeholder="No rejected findings"
                  />
                </Field>
                <Field label="Why this is your work" hint="For example: pair programming with a co-author trailer, or a commit made from another email you own." error={reason && reason.trim().length < 20 ? "Add a little more detail (20 characters or more)." : undefined}>
                  <Textarea value={reason} onValueChange={setReason} rows={4} disabled={!rejected.length} />
                </Field>
                <div><Button onClick={submit} disabled={!target || reason.trim().length < 20} loading={save.isPending}>Submit appeal</Button></div>
              </CardBody>
            </Card>
            <Card>
              <CardHeader title={<h2 className="text-base font-semibold">Your appeals</h2>} />
              <CardBody>
                <Timeline
                  aria-label="Appeals"
                  loading={appeals.isPending}
                  emptyLabel="No appeals yet."
                  items={(appeals.data ?? []).map((a) => ({ id: a.id, title: <span className="flex items-center gap-2">{a.evidence_id.slice(0, 12)} <Badge size="sm" tone={APPEAL_TONE[a.status]}>{a.status.replace("_", " ")}</Badge></span>, description: a.reason, time: timeAgo(a.submitted_at) }))}
                />
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </AsyncBoundary>
  );
}

export function IntegrityPage() {
  return (
    <AppPage role="student" title="Integrity and appeals" description="Why a finding did not count, and how to appeal it.">
      <WithStudent>{(id) => <Integrity studentId={id} />}</WithStudent>
    </AppPage>
  );
}
