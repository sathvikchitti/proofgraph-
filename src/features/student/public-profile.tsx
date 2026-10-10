"use client";
/**
 * The Public Proof Profile at /p/<handle>. The backend has no handle lookup yet, so this renders the profile of the
 * student connected in this browser (the owner's preview), filtered by their "public" consent switches.
 */
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { asyncQuery } from "../../lib/async";
import { conceptName, conceptStatus, STATUS_TONE } from "../../lib/domain/concepts";
import { useConceptNames, useHeadline, useProduct, useScores, useSettings, useStudentId, useWorkspace } from "../../lib/queries";
import { PRODUCT_NAME } from "../../lib/config";
import { Alert } from "../../ui/ui/alert";
import { AsyncBoundary } from "../../ui/ui/async-boundary";
import { Avatar } from "../../ui/ui/avatar";
import { Button } from "../../ui/ui/button";
import { Card, CardBody, CardHeader } from "../../ui/ui/card";
import { EmptyState } from "../../ui/ui/empty-state";
import { HexBadge } from "../../ui/ui/hex-badge";
import { Meter } from "../../ui/ui/meter";
import { Spinner } from "../../ui/ui/spinner";
import { StatCard } from "../../ui/ui/stat-card";
import { ConceptStatusBadge } from "./shared";

function Profile({ studentId, handle }: { studentId: string; handle: string }) {
  const headline = useHeadline(studentId);
  const scores = useScores(studentId);
  const privacy = useProduct("privacy");
  const settings = useSettings();
  const names = useConceptNames();
  const rows = privacy.data?.rows ?? [];
  const isPublic = rows.find((r) => r.id === "profile")?.values.public ?? false;
  const shown = (scores.data ?? []).filter((s) => rows.find((r) => r.id === `concept:${s.concept_id}`)?.values.public ?? true);
  const verified = shown.filter((s) => conceptStatus(s) === "verified");
  const name = settings.data?.profile.displayName ?? handle;
  const h = headline.data;

  return (
    <div className="grid gap-6">
      {!isPublic && !privacy.isPending ? (
        <Alert tone="warning" title="Only you can see this" actions={<Button asChild size="sm" variant="outline"><Link href="/student/privacy">Privacy settings</Link></Button>}>
          Your profile is private. Turn on “public” for the Proof Profile row to share this link.
        </Alert>
      ) : null}
      <Card>
        <CardBody className="flex flex-wrap items-center gap-4">
          <Avatar name={name} size="lg" />
          <div className="grid min-w-0 gap-1">
            <h1 className="m-0 truncate text-xl font-semibold">{name}</h1>
            <p className="m-0 text-sm text-fg-muted">/p/{handle} · every score links to code the student wrote</p>
          </div>
          {verified.length ? (
            <ul className="m-0 ml-auto flex list-none flex-wrap gap-2 p-0" aria-label="Verified concepts">
              {verified.map((s) => (
                <li key={s.concept_id} className="flex items-center gap-1.5 text-sm">
                  <HexBadge size="sm" label={`${conceptName(s.concept_id, names)} verified`}><BadgeCheck aria-hidden="true" /></HexBadge>
                  {conceptName(s.concept_id, names)}
                </li>
              ))}
            </ul>
          ) : null}
        </CardBody>
      </Card>
      <AsyncBoundary query={asyncQuery(headline)}>
        {h ? (
          <section aria-label="Key numbers" className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Honesty" value={h.honesty_score ?? undefined} unit={h.honesty_score === null ? undefined : "/ 100"} hint="Claims backed by self-authored code" />
            <StatCard label="Readiness" value={h.role_readiness} unit="/ 100" hint="Backend SDE" />
            <StatCard label="Verified by viva" value={verified.length} unit={`/ ${shown.length || 8}`} />
          </section>
        ) : null}
      </AsyncBoundary>
      <Card>
        <CardHeader title={<h2 className="text-base font-semibold">Concepts</h2>} description="Code evidence reaches 70; a passed viva on the student's own code adds 30." />
        <CardBody>
          <AsyncBoundary query={asyncQuery(scores)}>
            {shown.length ? (
              <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
                {shown.map((s) => (
                  <li key={s.concept_id} className="grid min-w-0 gap-2 rounded-(--card-radius) border border-border bg-bg-raised p-3">
                    <span className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold">{conceptName(s.concept_id, names)}</span>
                      <ConceptStatusBadge score={s} />
                    </span>
                    <Meter value={s.score} max={100} cap={70} capLabel="Evidence ceiling" tone={STATUS_TONE[conceptStatus(s)]} showValue size="sm" aria-label={`${conceptName(s.concept_id, names)} score`} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState size="sm" title="Nothing shared" description="No concepts are shared publicly yet." />
            )}
          </AsyncBoundary>
        </CardBody>
      </Card>
    </div>
  );
}

export function PublicProfilePage({ handle }: { handle: string }) {
  const workspace = useWorkspace();
  const studentId = useStudentId();
  return (
    <main className="mx-auto grid w-full max-w-4xl gap-6 px-4 py-8 sm:px-6">
      <p className="m-0 text-sm font-semibold">{PRODUCT_NAME} · Proof Profile</p>
      {workspace.isPending ? (
        <div className="grid min-h-48 place-items-center"><Spinner label="Loading" /></div>
      ) : studentId ? (
        <Profile studentId={studentId} handle={handle} />
      ) : (
        <Card variant="outline">
          <EmptyState title="Profile not available" description="This profile is private or does not exist." action={<Button asChild variant="outline"><Link href="/">Go home</Link></Button>} />
        </Card>
      )}
    </main>
  );
}
