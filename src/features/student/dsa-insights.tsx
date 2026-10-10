"use client";
import { toast } from "sonner";
import { AppPage } from "../../components/app-page";
import { asyncQuery } from "../../lib/async";
import { useProduct, useSaveProduct } from "../../lib/queries";
import { Alert } from "../../ui/ui/alert";
import { AsyncBoundary } from "../../ui/ui/async-boundary";
import { Badge } from "../../ui/ui/badge";
import { BarChart } from "../../ui/ui/bar-chart";
import { Button } from "../../ui/ui/button";
import { CalendarHeatmap } from "../../ui/ui/calendar-heatmap";
import { Card, CardBody, CardHeader } from "../../ui/ui/card";
import { CopyField } from "../../ui/ui/copy-field";
import { DataTable } from "../../ui/ui/data-table";
import { Donut } from "../../ui/ui/donut";
import { StatCard } from "../../ui/ui/stat-card";

export function DsaInsightsPage() {
  const dsa = useProduct("dsa");
  const save = useSaveProduct("dsa");
  const d = dsa.data;
  const total = d ? d.solved.easy + d.solved.medium + d.solved.hard : 0;

  return (
    <AppPage role="student" title="DSA insights" description="LeetCode practice by topic, complexity probes on your solutions, and what to solve next." meta={d ? <Badge tone={d.verified ? "success" : "warning"} dot>{d.verified ? `@${d.username} verified` : `@${d.username} not verified`}</Badge> : undefined}>
      <AsyncBoundary query={asyncQuery(dsa)}>
        {d ? (
          <div className="grid gap-6">
            {!d.verified ? (
              <Alert
                tone="info"
                title="Prove this LeetCode account is yours"
                actions={<Button size="sm" loading={save.isPending} onClick={() => save.mutate({ ...d, verified: true }, { onSuccess: () => toast.success("Account verified"), onError: (e) => toast.error(e.message) })}>I added it, check now</Button>}
              >
                <span className="grid gap-2">
                  Add this one-time code to your LeetCode bio, then check. You can remove it afterwards.
                  <CopyField value={d.verify_code} aria-label="Verification code" className="max-w-xs" />
                </span>
              </Alert>
            ) : null}
            <section aria-label="Totals" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Solved" value={total} hint={`${d.solved.easy} easy · ${d.solved.medium} medium · ${d.solved.hard} hard`} />
              <StatCard label="Contest rating" value={d.contest_rating ?? undefined} hint={d.contest_rating ? "Latest contest" : "No contests yet"} />
              <StatCard label="Complexity probes passed" value={d.probes.filter((p) => p.passed).length} unit={`/ ${d.probes.length}`} hint="Measured on solutions pushed by LeetHub" />
              <StatCard label="Active days (20 weeks)" value={d.calendar.filter((c) => c.value > 0).length} />
            </section>
            <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
              <Card>
                <CardHeader title={<h2 className="text-base font-semibold">Topics</h2>} description="Solved versus available, by topic tag." />
                <CardBody>
                  <BarChart
                    label="Solved by topic"
                    data={d.topics.map((t) => ({ topic: t.topic, solved: t.solved, remaining: Math.max(0, t.total - t.solved) }))}
                    xKey="topic"
                    series={[{ key: "solved", label: "Solved", tone: "success" }, { key: "remaining", label: "Not yet", tone: "neutral" }]}
                    stacked
                    orientation="horizontal"
                    showLegend
                    height={320}
                  />
                </CardBody>
              </Card>
              <Card>
                <CardHeader title={<h2 className="text-base font-semibold">Difficulty</h2>} />
                <CardBody>
                  <Donut label="Solved by difficulty" data={[{ name: "Easy", value: d.solved.easy, tone: "success" }, { name: "Medium", value: d.solved.medium, tone: "warning" }, { name: "Hard", value: d.solved.hard, tone: "danger" }]} centerValue={total} centerCaption="solved" showLegend />
                </CardBody>
              </Card>
            </div>
            <Card>
              <CardHeader title={<h2 className="text-base font-semibold">Practice calendar</h2>} />
              <CardBody className="overflow-x-auto"><CalendarHeatmap days={d.calendar.map((c) => ({ ...c, label: `${c.value} solved on ${c.date}` }))} /></CardBody>
            </Card>
            <div className="grid items-start gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader title={<h2 className="text-base font-semibold">Complexity probes</h2>} description="Your stated complexity versus what runs on growing inputs." />
                <CardBody>
                  <DataTable
                    ariaLabel="Complexity probes"
                    getRowId={(p) => p.problem}
                    data={d.probes}
                    columns={[
                      { key: "problem", header: "Problem", cell: (p) => p.problem },
                      { key: "claimed", header: "Claimed", cell: (p) => <span className="font-mono">{p.claimed}</span> },
                      { key: "measured", header: "Measured", cell: (p) => <span className="font-mono">{p.measured}</span> },
                      { key: "passed", header: "", align: "right", cell: (p) => <Badge size="sm" tone={p.passed ? "success" : "danger"}>{p.passed ? "Matches" : "Slower"}</Badge> },
                    ]}
                  />
                </CardBody>
              </Card>
              <Card>
                <CardHeader title={<h2 className="text-base font-semibold">Solve next</h2>} description="Picked from your weakest topics." />
                <CardBody>
                  <ul className="m-0 grid list-none gap-3 p-0">
                    {d.suggested.map((s) => (
                      <li key={s.title} className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-b-0 last:pb-0">
                        <span className="grid"><span className="text-sm font-medium">{s.title}</span><span className="text-xs text-fg-muted">{s.topic}</span></span>
                        <Badge size="sm" tone={s.difficulty === "Hard" ? "danger" : s.difficulty === "Medium" ? "warning" : "success"}>{s.difficulty}</Badge>
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            </div>
          </div>
        ) : null}
      </AsyncBoundary>
    </AppPage>
  );
}
