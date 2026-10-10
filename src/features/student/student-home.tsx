"use client";
import Link from "next/link";
import { ArrowRight, Radar } from "lucide-react";
import { AppPage } from "../../components/app-page";
import { asyncQuery } from "../../lib/async";
import { conceptName, conceptStatus, STATUS_TONE } from "../../lib/domain/concepts";
import { timeAgo } from "../../lib/format-time";
import { useActiveRepository, useConceptNames, useHeadline, useScoreEvents, useScores } from "../../lib/queries";
import { Alert } from "../../ui/ui/alert";
import { AsyncBoundary } from "../../ui/ui/async-boundary";
import { Button } from "../../ui/ui/button";
import { Card, CardBody, CardHeader } from "../../ui/ui/card";
import { EmptyState } from "../../ui/ui/empty-state";
import { Meter } from "../../ui/ui/meter";
import { Skeleton } from "../../ui/ui/skeleton";
import { StatCard } from "../../ui/ui/stat-card";
import { Timeline } from "../../ui/ui/timeline";
import { ValueChange } from "../../ui/ui/value-change";
import { ConceptStatusBadge, WithStudent } from "./shared";

function Home({ studentId }: { studentId: string }) {
  const headline = useHeadline(studentId);
  const scores = useScores(studentId);
  const events = useScoreEvents(studentId);
  const names = useConceptNames();
  const repo = useActiveRepository();
  const h = headline.data;
  const list = scores.data ?? [];
  const evidenced = list.filter((s) => s.score > 0).length;
  const verified = list.filter((s) => conceptStatus(s) === "verified").length;
  const changes = (events.data ?? []).filter((e) => e.previous_score !== e.new_score).slice(0, 6);
  const weak = list.filter((s) => conceptStatus(s) === "weak").sort((a, b) => b.score - a.score);
  const missing = list.reduce((n, s) => n + s.missing_signals.length, 0);

  const next = [
    h?.claims_required ? { id: "claims", title: "Choose the skills you claim", description: "Honesty compares your claims with your code. Pick them to start.", href: "/student/claims", cta: "Choose claims" } : null,
    weak[0] ? { id: "viva", title: `Take the viva on ${conceptName(weak[0].concept_id, names)}`, description: `Your code earned ${weak[0].score} points. Three timed questions on your own code add up to 30 more and make it Verified.`, href: `/student/viva?concept=${weak[0].concept_id}`, cta: "Start viva" } : null,
    missing ? { id: "missions", title: `${missing} signals still missing`, description: "Each one is a small task in your own repository. Push it and rescan.", href: "/student/missions", cta: "See missions" } : null,
    h && h.presentation_gaps.length ? { id: "gaps", title: "Claim what you can already prove", description: `You have evidence for ${h.presentation_gaps.join(", ")} but do not claim it.`, href: "/student/claims", cta: "Update claims" } : null,
  ].filter((n): n is NonNullable<typeof n> => n !== null);

  return (
    <AsyncBoundary
      query={asyncQuery(headline)}
      skeleton={
        <div className="grid gap-6" aria-busy="true">
          <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <StatCard key={i} label="Loading" loading />
            ))}
          </div>
          <Skeleton lines={4} label="Loading" />
        </div>
      }
    >
      {h ? (
        <div className="grid gap-6">
          <section aria-label="Key numbers" className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
            <StatCard className="h-full" label="Honesty" value={h.honesty_score ?? undefined} unit={h.honesty_score === null ? undefined : "/ 100"} hint={h.claims_required ? "Choose your claims to score this" : h.subtitle} />
            <StatCard className="h-full" label="Readiness" value={h.role_readiness} unit="/ 100" hint="Backend SDE" />
            <StatCard className="h-full" label="Evidence-backed concepts" value={evidenced} unit={`/ ${list.length || 8}`} hint={verified ? `${verified} verified by viva` : "Pass a viva to verify one"} loading={scores.isPending} />
            <StatCard className="h-full" label="Claims backed" value={h.claims_backed} unit={`/ ${h.claims_total}`} hint={h.claimed_concepts ? "Claims with self-authored evidence" : "No claims yet"} />
          </section>

          {h.presentation_gaps.length ? (
            <Alert tone="info" title="Presentation gaps" actions={<Button asChild size="sm" variant="outline"><Link href="/student/claims">Update claims</Link></Button>}>
              Your code proves {h.presentation_gaps.join(", ")}, but you do not claim {h.presentation_gaps.length === 1 ? "it" : "them"}. Claiming proven skills costs nothing.
            </Alert>
          ) : null}

          <Card>
            <CardHeader
              title={<h2 className="text-base font-semibold">Concepts</h2>}
              description={repo ? `From ${repo.owner ? `${repo.owner}/` : ""}${repo.name}. Code evidence reaches 70; the viva adds 30.` : undefined}
              actions={<Button asChild size="sm" variant="ghost" trailing={<ArrowRight className="size-4" aria-hidden="true" />}><Link href="/student/skill-graph">Skill graph</Link></Button>}
            />
            <CardBody>
              {list.length ? (
                <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 2xl:grid-cols-4">
                  {list.map((s) => (
                    <li key={s.concept_id} className="min-w-0">
                      <Link href={`/student/skill-graph/${s.concept_id}`} className="grid min-w-0 gap-2 overflow-hidden rounded-(--card-radius) border border-border bg-bg-raised p-3 transition-colors hover:bg-bg-hover focus-ring">
                        <span className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                          <span className="truncate text-sm font-semibold">{conceptName(s.concept_id, names)}</span>
                          <ConceptStatusBadge score={s} />
                        </span>
                        <Meter value={s.score} max={100} cap={70} capLabel="Evidence ceiling" tone={STATUS_TONE[conceptStatus(s)]} showValue aria-label={`${conceptName(s.concept_id, names)} score`} size="sm" />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState size="sm" title="No scores yet" description="Scores appear after the first scan finishes." />
              )}
            </CardBody>
          </Card>

          <div className="grid items-start gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><h2 className="text-base font-semibold">What’s next</h2></CardHeader>
              <CardBody>
                {next.length ? (
                  <ul className="m-0 grid list-none gap-4 p-0">
                    {next.map((n) => (
                      <li key={n.id} className="grid gap-1 border-b border-border pb-4 last:border-b-0 last:pb-0">
                        <h3 className="m-0 text-sm font-semibold">{n.title}</h3>
                        <p className="m-0 text-sm text-fg-muted">{n.description}</p>
                        <div className="mt-1">
                          <Button asChild size="sm" variant="outline" trailing={<ArrowRight className="size-4" aria-hidden="true" />}>
                            <Link href={n.href}>{n.cta}</Link>
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState size="sm" title="Nothing to do" description="You are all caught up." />
                )}
              </CardBody>
            </Card>
            <Card>
              <CardHeader
                title={<h2 className="text-base font-semibold">Recent score changes</h2>}
                actions={<Button asChild size="sm" variant="ghost" leading={<Radar className="size-4" aria-hidden="true" />}><Link href="/student/scans">Live scan</Link></Button>}
              />
              <CardBody>
                <Timeline
                  aria-label="Recent score changes"
                  loading={events.isPending}
                  emptyLabel="No score changes yet."
                  items={changes.map((e) => ({
                    id: e.id,
                    title: (
                      <span className="flex flex-wrap items-center gap-2">
                        {conceptName(e.concept_id, names)} <ValueChange from={e.previous_score} to={e.new_score} size="sm" />
                      </span>
                    ),
                    description: e.reason,
                    time: timeAgo(e.timestamp),
                    tone: e.new_score > e.previous_score ? "success" : "danger",
                  }))}
                />
              </CardBody>
            </Card>
          </div>
        </div>
      ) : null}
    </AsyncBoundary>
  );
}

export function StudentHome() {
  return (
    <AppPage role="student" title="Home" description="Honesty and Readiness scores, your next best step and recent changes.">
      <WithStudent>{(id) => <Home studentId={id} />}</WithStudent>
    </AppPage>
  );
}
