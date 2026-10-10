"use client";
/**
 * The landing showcase: three overlapping app windows ("islands") for the three sources ProofGraph reads.
 * LinkedIn is what the student claims, GitHub is the code evidence, LeetCode is problem-solving practice.
 * Ported from the hex-ui demo (0.9.0) onto the app's own elements. Sample data, not a live account.
 */
import { useState, type SVGProps } from "react";
import { Compass, Database, GitBranch, LayoutGrid, MessageSquare, Plus, Table2 } from "lucide-react";
import { Arcs } from "../ui/ui/arcs";
import { AppWindow } from "../ui/ui/app-window";
import { BarChart } from "../ui/ui/bar-chart";
import { Button, IconButton } from "../ui/ui/button";
import { Composer } from "../ui/ui/composer";
import { Field } from "../ui/ui/field";
import { LabelTab } from "../ui/ui/label-tab";
import { SegmentedControl } from "../ui/ui/segmented-control";
import { Select } from "../ui/ui/select";
import { StatCard } from "../ui/ui/stat-card";
import { StatusDot } from "../ui/ui/status-dot";

/* The centre window overlaps its neighbours on wide screens, so their text keeps clear of it (lg:pr-10, lg:pl-9). */
/* Brand marks are drawn here (lucide ships none); simple line versions from the hex-ui sprite. */
function LinkedInMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" {...props}>
      <rect x="1.5" y="1.5" width="13" height="13" rx="2.5" fill="currentColor" />
      <path d="M4.8 6.8v4.6M4.8 4.6v.1M7.4 11.4V6.8m0 2c0-1.2.8-2 1.8-2s1.8.7 1.8 2v2.6" fill="none" stroke="var(--color-bg-raised)" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function LeetCodeMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 4 2.5 8 6 12M10 4l3.5 4L10 12M9 3 7 13" />
    </svg>
  );
}

const CLAIMS = [
  { name: "REST APIs", score: 55 },
  { name: "Database Design", score: 60 },
  { name: "Authentication", score: 35 },
  { name: "Caching", score: 40 },
  { name: "Kubernetes", score: 0 },
];

const CONCEPT_SCORES = [
  { concept: "Database Design", strongest: 55, variety: 5, tests: 0 },
  { concept: "REST APIs", strongest: 35, variety: 15, tests: 5 },
  { concept: "Caching", strongest: 35, variety: 0, tests: 5 },
  { concept: "Async Work", strongest: 35, variety: 0, tests: 5 },
  { concept: "Authentication", strongest: 15, variety: 15, tests: 5 },
  { concept: "CI/CD", strongest: 15, variety: 10, tests: 0 },
];

const TRACE = [
  { actor: "Watcher", text: "New commit 3f9c2e1 on main" },
  { actor: "Scanner", text: "49 files: 40 analysed, 5 reused from cache" },
  { actor: "Detectors", text: "42 findings, 1 rejected (written by another author)" },
  { actor: "Scorer", text: "Caching 0 → 40, CI/CD 15 → 25" },
];

const GRAPH = [
  { concept: "Database Design", evidence: "app/models.py:12-48", signal: "Migrations" },
  { concept: "REST APIs", evidence: "app/routers/events.py:20-61", signal: "Input validation" },
  { concept: "Caching", evidence: "app/services/cache.py:4-31", signal: "TTL expiry" },
];

/** Share of solved problems by difficulty, per topic (easy, medium, hard sum to 100). */
const TOPICS: Record<string, Record<string, [number, number, number]>> = {
  "90d": { Arrays: [48, 42, 10], Graphs: [22, 55, 23], DP: [18, 52, 30], Trees: [35, 50, 15], Strings: [50, 40, 10] },
  "1y": { Arrays: [52, 40, 8], Graphs: [28, 52, 20], DP: [22, 54, 24], Trees: [38, 50, 12], Strings: [55, 37, 8] },
  all: { Arrays: [58, 36, 6], Graphs: [34, 50, 16], DP: [27, 53, 20], Trees: [42, 48, 10], Strings: [60, 34, 6] },
};

const percent = (v: number | string) => `${v}%`;

function LinkedInIsland() {
  return (
    <AppWindow title="Aarav Mehta · Profile import" logo={<LinkedInMark className="size-4" />} className="h-full min-w-0" classNames={{ body: "min-w-0 lg:pr-10" }}>
      <div className="grid min-w-0 gap-3">
        <div>
          <h3 className="m-0 font-(family-name:--font-display) text-2xl font-semibold tracking-[-0.02em] [font-stretch:112%]">Claimed skills</h3>
          <p className="m-0 mt-1 text-sm text-fg-muted">12 skills from the export, mapped to 5 concepts.</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <StatCard size="sm" label="Honesty" value={80} unit="%" hint="4 of 5 claims backed" />
          <StatCard size="sm" label="Role readiness" value={49} unit="%" hint="Backend SDE" />
        </div>
        <ul className="m-0 list-none divide-y divide-border rounded-(--card-radius) border border-border p-0" aria-label="Claimed skills">
          {CLAIMS.map((c) => (
            <li key={c.name} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
              <span className="truncate">{c.name}</span>
              <span className="inline-flex shrink-0 items-center gap-1.5 font-mono text-xs text-fg-muted">
                <StatusDot size="sm" tone={c.score ? "success" : "neutral"} />
                {c.score ? `Backed · ${c.score}` : "No evidence · 0"}
              </span>
            </li>
          ))}
        </ul>
        <p className="m-0 text-xs text-fg-muted">Found in code, not claimed: Async Work, CI/CD</p>
      </div>
    </AppWindow>
  );
}

type GitHubView = "evidence" | "trace" | "graph";

function GitHubIsland() {
  const [view, setView] = useState<GitHubView>("evidence");
  return (
    <AppWindow
      title="aarav/campus-api"
      logo={<GitBranch className="size-4" aria-hidden="true" />}
      className="h-full min-w-0"
      classNames={{ body: "min-w-0" }}
      actions={
        <>
          <SegmentedControl<GitHubView>
            label="View"
            size="sm"
            value={view}
            onValueChange={setView}
            className="hidden sm:inline-flex"
            options={[
              { value: "evidence", label: "Evidence", icon: <MessageSquare className="size-3.5" aria-hidden="true" /> },
              { value: "trace", label: "Trace", icon: <Table2 className="size-3.5" aria-hidden="true" /> },
              { value: "graph", label: "Graph", icon: <LayoutGrid className="size-3.5" aria-hidden="true" /> },
            ]}
          />
          <Button size="sm" variant="outline">Share</Button>
        </>
      }
    >
      <div className="grid min-w-0 gap-3">
        <details open className="rounded-(--card-radius) bg-bg-subtle px-3 py-2 text-sm">
          <summary className="cursor-pointer text-fg-muted">Scanned 49 files in 0.65 seconds</summary>
          <p className="m-0 mt-1">40 analysed, 5 reused from cache. 41 findings accepted, 1 rejected (written by another author).</p>
        </details>
        {view === "evidence" ? (
          <div className="min-w-0 rounded-(--card-radius) border border-border">
            <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2 text-sm">
              <span className="min-w-0 truncate">Concept scores from code evidence (max 70 before viva)</span>
              <Button size="sm" variant="ghost" leading={<Compass className="size-3.5" aria-hidden="true" />}>Explore</Button>
            </div>
            <div className="px-2 py-2">
              <BarChart
                label="Concept scores from code evidence"
                data={CONCEPT_SCORES}
                xKey="concept"
                orientation="horizontal"
                stacked
                categoryWidth={112}
                height={230}
                yDomain={[0, 70]}
                showLegend
                series={[
                  { key: "strongest", label: "Strongest finding" },
                  { key: "variety", label: "Signal variety" },
                  { key: "tests", label: "Backed by tests" },
                ]}
              />
            </div>
          </div>
        ) : view === "trace" ? (
          <ol className="m-0 grid list-none gap-2 p-0" aria-label="Agent trace">
            {TRACE.map((t) => (
              <li key={t.actor} className="grid gap-0.5 rounded-(--card-radius) border border-border px-3 py-2 text-sm">
                <span className="font-mono text-xs text-fg-muted">{t.actor}</span>
                {t.text}
              </li>
            ))}
          </ol>
        ) : (
          <ul className="m-0 grid list-none gap-2 p-0" aria-label="Evidence graph">
            {GRAPH.map((g) => (
              <li key={g.concept} className="grid gap-0.5 rounded-(--card-radius) border border-border px-3 py-2 text-sm">
                <span className="font-medium">{g.concept}</span>
                <span className="text-fg-muted">{g.signal} · <span className="font-mono text-xs">{g.evidence}</span></span>
              </li>
            ))}
          </ul>
        )}
        <Composer
          label="Ask about this evidence"
          placeholder="Ask about this evidence..."
          leading={<IconButton size="sm" variant="outline" label="Add"><Plus className="size-4" aria-hidden="true" /></IconButton>}
          trailing={<span className="font-mono text-xs text-fg-muted">main · 3f9c2e1</span>}
        />
      </div>
    </AppWindow>
  );
}

function LeetCodeIsland() {
  const [topic, setTopic] = useState("all");
  const [period, setPeriod] = useState("90d");
  const rows = Object.entries(TOPICS[period]!)
    .filter(([name]) => topic === "all" || topic === name)
    .map(([name, [easy, medium, hard]]) => ({ topic: name, easy, medium, hard }));
  return (
    <AppWindow
      title="@aarav_codes"
      logo={<LeetCodeMark className="size-4" />}
      className="relative h-full min-w-0"
      classNames={{ bar: "lg:pl-9", body: "min-w-0 lg:pl-9" }}
      actions={
        <>
          <Button size="sm" variant="outline">Sync</Button>
          <Button size="sm" variant="outline">Share</Button>
        </>
      }
    >
      <div className="grid min-w-0 gap-3 pb-12">
        <h3 className="m-0 font-(family-name:--font-display) text-2xl font-semibold tracking-[-0.02em] [font-stretch:112%]">DSA overview</h3>
        <div className="grid grid-cols-2 gap-2">
          <StatCard size="sm" label="Solved" value={412} hint="18 this month" />
          <StatCard size="sm" label="Contest rating" value={1786} hint="64 up last contest" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Topic">
            <Select aria-label="Topic" size="sm" value={topic} onValueChange={setTopic} options={[{ value: "all", label: "All topics" }, ...Object.keys(TOPICS["90d"]!).map((t) => ({ value: t, label: t }))]} />
          </Field>
          <Field label="Period">
            <Select aria-label="Period" size="sm" value={period} onValueChange={setPeriod} options={[{ value: "90d", label: "Last 90 days" }, { value: "1y", label: "Last year" }, { value: "all", label: "All time" }]} />
          </Field>
        </div>
        <div className="min-w-0 rounded-(--card-radius) border border-border">
          <div className="border-b border-border px-3 py-2 text-sm">Easy, medium and hard by topic</div>
          <div className="px-2 py-2">
            <BarChart
              label="Easy, medium and hard by topic"
              data={rows}
              xKey="topic"
              orientation="horizontal"
              stacked
              categoryWidth={64}
              height={Math.max(90, rows.length * 30 + 40)}
              yDomain={[0, 100]}
              formatY={percent}
              showLegend
              series={[
                { key: "easy", label: "Easy" },
                { key: "medium", label: "Medium" },
                { key: "hard", label: "Hard" },
              ]}
            />
          </div>
        </div>
      </div>
      <Button size="sm" variant="outline" className="absolute bottom-4 right-4 rounded-full" leading={<Database className="size-4" aria-hidden="true" />}>Viva</Button>
    </AppWindow>
  );
}

export function SourceIslands() {
  return (
    <div className="relative">
      <Arcs />
      <div className="relative grid items-start gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)_minmax(0,0.9fr)] lg:gap-0">
        <div className="relative z-10 grid min-w-0">
          <div><LabelTab>LinkedIn</LabelTab></div>
          <LinkedInIsland />
        </div>
        <div className="relative z-30 grid min-w-0 lg:-mx-6">
          <div><LabelTab>GitHub</LabelTab></div>
          <GitHubIsland />
        </div>
        <div className="relative z-20 grid min-w-0 lg:mt-2">
          <div><LabelTab>LeetCode</LabelTab></div>
          <LeetCodeIsland />
        </div>
      </div>
    </div>
  );
}
