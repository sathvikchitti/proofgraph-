"use client";
/** Pieces the student evidence pages share: the GitHub gate, status badges, evidence snippets and score breakdowns. */
import Link from "next/link";
import type { ReactNode } from "react";
import { GitBranch } from "lucide-react";
import type { ConceptScore } from "../../lib/api";
import {
  BREAKDOWN_LABEL, conceptStatus, EVIDENCE_HINT, EVIDENCE_TONE, shortSha, signalLabel, STATUS_HINT, STATUS_LABEL, STATUS_TONE, STRENGTH_TONE,
} from "../../lib/domain/concepts";
import { locator, type EvidenceRecord } from "../../lib/domain/proof-graph";
import { useEvidenceSource, useStudentId, useWorkspace } from "../../lib/queries";
import { Badge } from "../../ui/ui/badge";
import { Button } from "../../ui/ui/button";
import { Card } from "../../ui/ui/card";
import { CodeHeader, CodeViewer } from "../../ui/ui/code-viewer";
import { EmptyState } from "../../ui/ui/empty-state";
import { ScoreBreakdown } from "../../ui/ui/score-breakdown";
import { Spinner } from "../../ui/ui/spinner";
import { Tooltip } from "../../ui/ui/tooltip";

/**
 * Renders children with the backend student id once GitHub is connected; otherwise asks the student to connect.
 * The id comes from the GitHub device flow (the backend has no session of its own).
 */
export function WithStudent({ children }: { children: (studentId: string) => ReactNode }) {
  const workspace = useWorkspace();
  const studentId = useStudentId();
  if (workspace.isPending) {
    return (
      <div className="grid min-h-48 place-items-center">
        <Spinner label="Loading" />
      </div>
    );
  }
  if (!studentId) {
    return (
      <Card variant="outline">
        <EmptyState
          icon={<GitBranch aria-hidden="true" />}
          title="Connect GitHub first"
          description="Your scores come from code in a public Python repository. Connect GitHub and pick a repository to start the first scan."
          action={
            <Button asChild>
              <Link href="/student/repositories">Connect GitHub</Link>
            </Button>
          }
        />
      </Card>
    );
  }
  return <>{children(studentId)}</>;
}

export function ConceptStatusBadge({ score, size = "sm" }: { score: Pick<ConceptScore, "score" | "status"> | undefined; size?: "sm" | "md" }) {
  const status = conceptStatus(score);
  return (
    <Tooltip content={STATUS_HINT[status]}>
      <Badge tone={STATUS_TONE[status]} size={size} dot>
        {STATUS_LABEL[status]}
      </Badge>
    </Tooltip>
  );
}

export function EvidenceStateBadge({ state }: { state: string }) {
  return (
    <Tooltip content={EVIDENCE_HINT[state] ?? state}>
      <Badge tone={EVIDENCE_TONE[state] ?? "neutral"} size="sm" variant="outline">
        {state}
      </Badge>
    </Tooltip>
  );
}

export function StrengthBadge({ strength }: { strength: string }) {
  return (
    <Badge tone={STRENGTH_TONE[strength] ?? "neutral"} size="sm" variant="subtle">
      {strength}
    </Badge>
  );
}

/** The exact lines behind a finding, read from the immutable blob (`GET /evidence/{id}/source`). */
export function EvidenceSnippet({ evidence, maxHeight = 320 }: { evidence: EvidenceRecord; maxHeight?: number }) {
  const source = useEvidenceSource(evidence.id);
  const data = source.data;
  return (
    <CodeViewer
      lines={data?.lines.map((l) => l.text)}
      startLine={data?.lines[0]?.number ?? evidence.lineStart}
      language={evidence.filePath.endsWith(".py") ? "python" : evidence.filePath.endsWith(".yml") || evidence.filePath.endsWith(".yaml") ? "yaml" : undefined}
      highlights={[{ from: data?.line_start ?? evidence.lineStart, to: data?.line_end ?? evidence.lineEnd, tone: EVIDENCE_TONE[evidence.state] ?? "info", label: `${signalLabel(evidence.signal)} evidence` }]}
      loading={source.isPending}
      error={source.error ? source.error.message : undefined}
      maxHeight={maxHeight}
      header={
        <CodeHeader
          path={locator(evidence)}
          meta={<span className="font-mono">commit {shortSha(evidence.commitSha)} · blob {shortSha(data?.blob_sha ?? evidence.blobSha)}</span>}
          copy
        />
      }
    />
  );
}

/** How the points add up (strongest finding + diversity + corroboration), each linked to the finding behind it. */
export function ConceptBreakdown({ score, conceptName, evidenceHref }: { score: ConceptScore; conceptName: string; evidenceHref?: (evidenceId: string) => string }) {
  const b = score.score_breakdown;
  const items = (Object.keys(BREAKDOWN_LABEL) as (keyof typeof BREAKDOWN_LABEL)[]).map((k) => {
    const c = b[k];
    const signals = c.signals.length ? ` (${c.signals.map(signalLabel).join(", ")})` : "";
    return { label: `${BREAKDOWN_LABEL[k]}${signals}`, value: c.points, href: c.points && c.evidence_id && evidenceHref ? evidenceHref(c.evidence_id) : undefined, tone: c.points ? ("success" as const) : ("neutral" as const) };
  });
  const verified = conceptStatus(score) === "verified";
  if (!verified) items.push({ label: "Viva (not taken yet)", value: 0, href: undefined, tone: "neutral" });
  return <ScoreBreakdown title={`${conceptName}: how the score adds up`} total={score.score} max={100} items={items} totalLabel="Score" />;
}
