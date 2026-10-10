"use client";
/** Hooks over the Validater backend. Every student-scoped query waits for the workspace to know the student id. */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type GitHubConnectInput } from "../api";
import { queryKeys } from "./keys";

export function useWorkspace() {
  return useQuery({ queryKey: queryKeys.workspace, queryFn: () => api.getWorkspace(), staleTime: Infinity });
}

/** The backend student id for this browser, or null when GitHub is not connected yet. `undefined` while loading. */
export function useStudentId(): string | null | undefined {
  const { data } = useWorkspace();
  return data === undefined ? undefined : data.studentId;
}

export function useActiveRepository() {
  const { data } = useWorkspace();
  return data?.repositories.find((r) => r.id === data.activeRepositoryId) ?? data?.repositories[0];
}

export function useConcepts() {
  return useQuery({ queryKey: queryKeys.concepts, queryFn: () => api.listConcepts(), staleTime: Infinity });
}

/** Concept id -> display name, from the backend's /concepts. */
export function useConceptNames(): Record<string, string> {
  const { data } = useConcepts();
  return Object.fromEntries((data ?? []).map((c) => [c.id, c.name]));
}

const studentQuery = <T,>(key: readonly unknown[], studentId: string | null | undefined, fn: (id: string) => Promise<T>) => ({
  queryKey: key,
  queryFn: () => fn(studentId!),
  enabled: Boolean(studentId),
});

export function useHeadline(studentId: string | null | undefined) {
  return useQuery(studentQuery(queryKeys.headline(studentId ?? ""), studentId, (id) => api.getHeadline(id)));
}
export function useScores(studentId: string | null | undefined) {
  return useQuery(studentQuery(queryKeys.scores(studentId ?? ""), studentId, (id) => api.getScores(id)));
}
export function useScoreEvents(studentId: string | null | undefined) {
  return useQuery(studentQuery(queryKeys.scoreEvents(studentId ?? ""), studentId, (id) => api.getScoreEvents(id)));
}
export function useProofGraph(studentId: string | null | undefined) {
  return useQuery(studentQuery(queryKeys.proofGraph(studentId ?? ""), studentId, (id) => api.getProofGraph(id)));
}
export function useClaims(studentId: string | null | undefined) {
  return useQuery(studentQuery(queryKeys.claims(studentId ?? ""), studentId, (id) => api.listClaims(id)));
}

export function useSelectClaims(studentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (conceptIds: string[]) => api.selectClaims(studentId, conceptIds),
    onSuccess: (claims) => {
      qc.setQueryData(queryKeys.claims(studentId), claims);
      void qc.invalidateQueries({ queryKey: queryKeys.evidence });
    },
  });
}

export function useScans(repositoryId: string | undefined) {
  return useQuery({ queryKey: queryKeys.scans(repositoryId ?? ""), queryFn: () => api.listScans(repositoryId!), enabled: Boolean(repositoryId) });
}
export function useScan(scanId: string) {
  return useQuery({ queryKey: queryKeys.scan(scanId), queryFn: () => api.getScan(scanId) });
}
export function useScanEvents(scanId: string, enabled = true) {
  return useQuery({ queryKey: queryKeys.scanEvents(scanId), queryFn: () => api.listScanEvents(scanId), enabled });
}

export function useStartScan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ repositoryId, commitSha }: { repositoryId: string; commitSha: string }) => api.startScan(repositoryId, commitSha),
    onSuccess: (scan) => qc.setQueryData(queryKeys.scan(scan.id), scan),
  });
}

/** After a scan finishes, everything scored from it is stale. */
export function useRefreshEvidence() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: queryKeys.evidence });
    void qc.invalidateQueries({ queryKey: ["watcher"] });
  };
}

export function useEvidenceSource(evidenceId: string | null | undefined) {
  return useQuery({ queryKey: queryKeys.source(evidenceId ?? ""), queryFn: () => api.getEvidenceSource(evidenceId!, 3), enabled: Boolean(evidenceId), staleTime: Infinity });
}

export function useWatcher(repositoryId: string | undefined) {
  return useQuery({ queryKey: queryKeys.watcher(repositoryId ?? ""), queryFn: () => api.getWatcher(repositoryId!), enabled: Boolean(repositoryId), refetchInterval: 30_000 });
}

export function useGitHubStatus() {
  return useQuery({ queryKey: queryKeys.githubStatus, queryFn: () => api.getGitHubStatus() });
}

export function useGitHubRepositories(studentId: string | null | undefined) {
  return useQuery(studentQuery(queryKeys.githubRepos(studentId ?? ""), studentId, (id) => api.listGitHubRepositories(id)));
}

export function useStartDeviceFlow() {
  return useMutation({ mutationFn: () => api.startDeviceAuthorization() });
}

export function usePollDeviceFlow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (attemptId: string) => api.pollDeviceAuthorization(attemptId),
    onSuccess: (attempt) => {
      if (attempt.status === "connected") void qc.invalidateQueries({ queryKey: queryKeys.workspace });
    },
  });
}

export function useConnectRepository(studentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: GitHubConnectInput) => api.connectGitHubRepository(studentId, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.workspace });
      void qc.invalidateQueries({ queryKey: queryKeys.evidence });
    },
  });
}

export function useSetActiveRepository(studentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (repositoryId: string) => api.setActiveRepository(studentId, repositoryId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.workspace });
      void qc.invalidateQueries({ queryKey: queryKeys.evidence });
    },
  });
}
