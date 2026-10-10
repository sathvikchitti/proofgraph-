"use client";
import Link from "next/link";
import { CheckCircle2, ExternalLink, Radar } from "lucide-react";
import { toast } from "sonner";
import { AppPage } from "../../components/app-page";
import type { GitHubRepository, Repository } from "../../lib/api";
import { asyncQuery } from "../../lib/async";
import { shortSha } from "../../lib/domain/concepts";
import { timeAgo } from "../../lib/format-time";
import { useConnectRepository, useGitHubRepositories, useGitHubStatus, useSetActiveRepository, useStudentId, useWatcher, useWorkspace } from "../../lib/queries";
import { Alert } from "../../ui/ui/alert";
import { AsyncBoundary } from "../../ui/ui/async-boundary";
import { Badge } from "../../ui/ui/badge";
import { Button } from "../../ui/ui/button";
import { Card, CardBody, CardHeader } from "../../ui/ui/card";
import { DataTable, type DataColumn } from "../../ui/ui/data-table";
import { DescriptionList } from "../../ui/ui/description-list";
import { EmptyState } from "../../ui/ui/empty-state";
import { StatusDot } from "../../ui/ui/status-dot";
import { GitHubDeviceFlow } from "./github-device-flow";

const REJECTION: Record<string, string> = {
  private_repository: "Private repositories are not scanned yet",
  unsupported_language: "Only Python repositories are supported",
  too_large: "Larger than 200 MB",
};

const WATCH_TONE: Record<string, "success" | "warning" | "danger" | "neutral" | "info"> = { ready: "success", polling: "info", backoff: "warning", reauth_required: "danger", error: "danger" };

function WatcherCard({ repository, active, onActivate, activating }: { repository: Repository; active: boolean; onActivate: () => void; activating: boolean }) {
  const watcher = useWatcher(repository.id);
  const w = watcher.data;
  const status = w?.status ?? repository.poll_status;
  return (
    <Card variant={active ? "raised" : "outline"}>
      <CardHeader
        title={
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-semibold">{repository.owner ? `${repository.owner}/` : ""}{repository.name}</span>
            {active ? <Badge tone="success" size="sm" dot>Active</Badge> : null}
          </span>
        }
        description={active ? "Scores, the skill graph and missions read from this repository." : "Connected. Make it active to score it."}
        actions={
          active ? (
            <Button asChild size="sm" variant="outline" leading={<Radar className="size-4" aria-hidden="true" />}>
              <Link href="/student/scans">Scans</Link>
            </Button>
          ) : (
            <Button size="sm" variant="outline" loading={activating} onClick={onActivate}>Make active</Button>
          )
        }
      />
      <CardBody>
        <DescriptionList
          layout="horizontal"
          items={[
            { label: "Watcher", value: <span className="inline-flex items-center gap-2"><StatusDot tone={WATCH_TONE[status] ?? "neutral"} pulse={status === "polling"} />{status.replace(/_/g, " ")}</span> },
            { label: "Default branch", value: repository.default_branch ?? "—", mono: true },
            { label: "Latest commit", value: shortSha(w?.latest_observed_sha ?? repository.latest_observed_sha, 12), mono: true, copyable: Boolean(w?.latest_observed_sha ?? repository.latest_observed_sha), copyValue: w?.latest_observed_sha ?? repository.latest_observed_sha ?? undefined },
            { label: "Last checked", value: w?.last_checked_at ? timeAgo(w.last_checked_at) : "Not yet" },
            ...(w?.last_error ? [{ label: "Last error", value: <span className="text-danger">{w.last_error}</span> }] : []),
          ]}
        />
      </CardBody>
    </Card>
  );
}

function Available({ studentId, connectedIds }: { studentId: string; connectedIds: Set<string> }) {
  const repos = useGitHubRepositories(studentId);
  const connect = useConnectRepository(studentId);
  const columns: DataColumn<GitHubRepository>[] = [
    {
      key: "full_name",
      header: "Repository",
      sortable: true,
      cell: (r) => (
        <a href={r.html_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-mono text-sm underline-offset-4 hover:underline">
          {r.full_name} <ExternalLink className="size-3" aria-hidden="true" />
        </a>
      ),
    },
    { key: "primary_language", header: "Language", cell: (r) => r.primary_language ?? "—" },
    { key: "visibility", header: "Visibility", cell: (r) => <Badge size="sm" variant="outline" tone={r.visibility === "public" ? "neutral" : "warning"}>{r.visibility}</Badge> },
    { key: "size_kb", header: "Size", align: "right", cell: (r) => <span className="tabular">{r.size_kb < 1024 ? `${r.size_kb} KB` : `${(r.size_kb / 1024).toFixed(1)} MB`}</span> },
    {
      key: "action",
      header: "",
      align: "right",
      cell: (r) =>
        connectedIds.has(r.github_repository_id) ? (
          <Badge tone="success" size="sm"><CheckCircle2 className="size-3" aria-hidden="true" /> Connected</Badge>
        ) : r.supported ? (
          <Button
            size="sm"
            loading={connect.isPending && connect.variables?.github_repository_id === r.github_repository_id}
            onClick={() =>
              connect.mutate(
                { github_repository_id: r.github_repository_id, owner: r.owner, name: r.name, clone_url: r.clone_url, default_branch: r.default_branch, primary_language: r.primary_language, size_kb: r.size_kb, visibility: r.visibility },
                { onSuccess: () => toast.success(`${r.full_name} connected. The first scan has started.`), onError: (e) => toast.error(e.message) },
              )
            }
          >
            Connect
          </Button>
        ) : (
          <span className="text-xs text-fg-muted">{REJECTION[r.rejection_reason ?? ""] ?? r.rejection_reason ?? "Not supported"}</span>
        ),
    },
  ];
  return (
    <Card>
      <CardHeader title={<h2 className="text-base font-semibold">Your GitHub repositories</h2>} description="Public Python repositories up to 200 MB can be scanned. Connecting pins the default branch and starts the first scan." />
      <CardBody>
        <AsyncBoundary query={asyncQuery(repos, repos.data?.length === 0)} empty={<EmptyState size="sm" title="No repositories" description="GitHub returned no repositories for this account." />}>
          {repos.data ? <DataTable ariaLabel="GitHub repositories" columns={columns} data={repos.data} getRowId={(r) => r.github_repository_id} pageSize={10} /> : null}
        </AsyncBoundary>
      </CardBody>
    </Card>
  );
}

function Connected({ studentId }: { studentId: string }) {
  const workspace = useWorkspace();
  const setActive = useSetActiveRepository(studentId);
  const ws = workspace.data;
  if (!ws) return null;
  const connectedIds = new Set(ws.repositories.map((r) => r.github_repository_id ?? ""));
  return (
    <div className="grid gap-6">
      {ws.repositories.length ? (
        <section aria-label="Connected repositories" className="grid gap-4 lg:grid-cols-2">
          {ws.repositories.map((r) => (
            <WatcherCard
              key={r.id}
              repository={r}
              active={r.id === ws.activeRepositoryId}
              activating={setActive.isPending && setActive.variables === r.id}
              onActivate={() => setActive.mutate(r.id, { onSuccess: () => toast.success(`${r.name} is now active`), onError: (e) => toast.error(e.message) })}
            />
          ))}
        </section>
      ) : (
        <Alert tone="info" title="No repository connected yet">Pick a supported repository below to start your first scan.</Alert>
      )}
      <Available studentId={studentId} connectedIds={connectedIds} />
    </div>
  );
}

export function RepositoriesPage() {
  const status = useGitHubStatus();
  const workspace = useWorkspace();
  const studentId = useStudentId();
  return (
    <AppPage
      role="student"
      title="Repositories"
      description="Connect GitHub, choose the repository that is scanned, and watch for new commits."
      meta={workspace.data?.githubLogin ? <Badge tone="success" dot>@{workspace.data.githubLogin}</Badge> : undefined}
    >
      {status.data && !status.data.available ? (
        <Alert tone="warning" title="GitHub is not configured on the backend">
          {status.data.reason ?? "GitHub is unavailable."} {status.data.device_flow_prerequisite}
        </Alert>
      ) : null}
      <AsyncBoundary query={asyncQuery(workspace)}>
        {studentId ? (
          <Connected studentId={studentId} />
        ) : (
          <Card>
            <CardHeader title={<h2 className="text-base font-semibold">Connect GitHub</h2>} description="Read-only access. Your token is encrypted on the backend and never sent to Git or back to this page." />
            <CardBody>
              <GitHubDeviceFlow onConnected={() => toast.success("GitHub connected")} />
            </CardBody>
          </Card>
        )}
      </AsyncBoundary>
    </AppPage>
  );
}
