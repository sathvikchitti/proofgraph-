"use client";
/**
 * GitHub OAuth device flow against the backend: start an attempt, show the one-time code, poll until GitHub
 * says connected, denied or expired. The backend paces polling (`retry_after_seconds`); we follow it.
 */
import { useEffect, useRef, useState } from "react";
import { ExternalLink, GitBranch } from "lucide-react";
import type { DeviceAttempt, DeviceStart } from "../../lib/api";
import { usePollDeviceFlow, useStartDeviceFlow } from "../../lib/queries";
import { Alert } from "../../ui/ui/alert";
import { Button } from "../../ui/ui/button";
import { CopyField } from "../../ui/ui/copy-field";
import { Spinner } from "../../ui/ui/spinner";

const FINAL_COPY: Record<string, string> = {
  denied: "GitHub access was denied. Start again when you are ready.",
  expired: "The code expired before it was entered. Start again for a new one.",
  error: "GitHub could not finish connecting. Try again.",
};

export function GitHubDeviceFlow({ onConnected }: { onConnected?: (studentId: string) => void }) {
  const start = useStartDeviceFlow();
  const poll = usePollDeviceFlow();
  const [attempt, setAttempt] = useState<DeviceStart | null>(null);
  const [state, setState] = useState<DeviceAttempt | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollRef = useRef(poll.mutateAsync);
  pollRef.current = poll.mutateAsync;
  const connectedRef = useRef(onConnected);
  connectedRef.current = onConnected;

  useEffect(() => {
    if (!attempt) return;
    let cancelled = false;
    const tick = async (delayS: number) => {
      timer.current = setTimeout(async () => {
        try {
          const next = await pollRef.current(attempt.attempt_id);
          if (cancelled) return;
          setState(next);
          if (next.status === "pending") void tick(next.retry_after_seconds ?? 5);
          else if (next.status === "connected" && next.student_id) connectedRef.current?.(next.student_id);
        } catch (e) {
          if (!cancelled) setState({ attempt_id: attempt.attempt_id, status: "error", error: e instanceof Error ? e.message : String(e), expires_at: null, student_id: null });
        }
      }, delayS * 1000);
    };
    void tick(2);
    return () => {
      cancelled = true;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [attempt]);

  const begin = () => {
    setState(null);
    start.mutate(undefined, { onSuccess: setAttempt });
  };

  if (!attempt || (state && FINAL_COPY[state.status])) {
    return (
      <div className="grid justify-items-start gap-3">
        {state && FINAL_COPY[state.status] ? <Alert tone="danger">{FINAL_COPY[state.status]}{state.error && state.status === "error" ? ` (${state.error})` : ""}</Alert> : null}
        {start.error ? <Alert tone="danger">{start.error.message}</Alert> : null}
        <Button leading={<GitBranch className="size-4" aria-hidden="true" />} loading={start.isPending} onClick={begin}>
          Connect GitHub
        </Button>
      </div>
    );
  }

  if (state?.status === "connected") {
    return <Alert tone="success" title="GitHub connected">Your verified commit emails were linked, so only code you wrote counts. Pick a repository below.</Alert>;
  }

  return (
    <div className="grid max-w-md gap-3">
      <p className="m-0 text-sm text-fg-muted">Open GitHub, enter this code, and approve read access. This page continues on its own.</p>
      <CopyField value={attempt.user_code} aria-label="One-time code" size="lg" />
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="outline" trailing={<ExternalLink className="size-4" aria-hidden="true" />}>
          <a href={attempt.verification_uri} target="_blank" rel="noreferrer">Open {attempt.verification_uri.replace(/^https?:\/\//, "")}</a>
        </Button>
        <span className="inline-flex items-center gap-2 text-sm text-fg-muted" role="status">
          <Spinner size="sm" label="Waiting" /> Waiting for approval
        </span>
      </div>
      <p className="m-0 text-xs text-fg-subtle">The code expires {new Date(attempt.expires_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}.</p>
    </div>
  );
}
