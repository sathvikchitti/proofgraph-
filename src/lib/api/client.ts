/**
 * The live API client. This is the ONLY file in the app that calls fetch (enforced by eslint no-restricted-globals).
 * Requests go to /api/*, which next.config.ts rewrites to the FastAPI backend. Every response is validated with zod.
 * The Validater endpoints (concepts, GitHub, claims, scans, scores, headline, proof graph, evidence) are the real
 * backend's (contracts/openapi.json v0.2.0). Session, notifications, settings, home and the product datasets are
 * provisional paths the backend does not serve yet.
 */
import { z } from "zod";
import { errorFromResponse } from "./errors";
import {
  ClaimListSchema, ConceptListSchema, ConceptScoreListSchema, DeviceAttemptSchema, DeviceStartSchema, EvidenceSourceSchema, GitHubRepositoryListSchema,
  GitHubStatusSchema, HeadlineSchema, ProofGraphSchema, RepositorySchema, ScanEventListSchema, ScanListSchema, ScanSchema, ScoreEventListSchema,
  StudentSchema, WatcherStatusSchema,
} from "./evidence-schemas";
import { PRODUCT_SCHEMAS, VivaResultSchema, VivaSessionSchema, type ProductKey } from "./product-schemas";
import { HomeSummarySchema, NotificationListSchema, SessionSchema, SettingsSchema, type SettingsPatch, type SignInInput } from "./schemas";
import type { Api } from "./types";
import { browserStorage, readWorkspace, rememberRepository, writeWorkspace } from "./workspace-store";

const BASE = "/api";

async function request<S extends z.ZodType>(path: string, schema: S, init: { method?: string; body?: unknown } = {}): Promise<z.infer<S>> {
  const response = await fetch(`${BASE}${path}`, {
    method: init.method ?? "GET",
    credentials: "include",
    headers: init.body === undefined ? { Accept: "application/json" } : { Accept: "application/json", "Content-Type": "application/json" },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  if (!response.ok) throw await errorFromResponse(response);
  if (response.status === 204) return schema.parse(undefined);
  return schema.parse(await response.json());
}

const Empty = z.undefined();
const id = encodeURIComponent;

/** The SSE endpoint for a scan's agent trace (`event: scan_event`, `id: <sequence_number>`). */
export function scanStreamUrl(scanId: string): string {
  return `${BASE}/scans/${id(scanId)}/stream`;
}

/** Provisional REST paths for the product datasets (GET reads, PUT replaces). */
export const PRODUCT_PATHS: Record<ProductKey, string> = {
  opportunities: "/student/opportunities",
  dsa: "/student/leetcode",
  privacy: "/student/privacy",
  appeals: "/student/appeals",
};

const storage = () => browserStorage();

export const liveApi: Api = {
  getSession: () => request("/session", SessionSchema),
  signIn: (input: SignInInput) => request("/session", SessionSchema, { method: "POST", body: input }),
  signOut: () => request("/session", Empty, { method: "DELETE" }),
  switchRole: (role) => request("/session/role", SessionSchema, { method: "PUT", body: { role } }),
  listNotifications: () => request("/notifications", NotificationListSchema),
  markNotificationRead: (id) => request(`/notifications/${encodeURIComponent(id)}/read`, Empty, { method: "POST" }),
  markAllNotificationsRead: () => request("/notifications/read-all", Empty, { method: "POST" }),
  getSettings: () => request("/settings", SettingsSchema),
  updateSettings: (patch: SettingsPatch) => request("/settings", SettingsSchema, { method: "PATCH", body: patch }),
  getHome: (role) => request(`/home/${role}`, HomeSummarySchema),

  getWorkspace: async () => readWorkspace(storage()),
  listConcepts: () => request("/concepts", ConceptListSchema),
  getGitHubStatus: () => request("/github/status", GitHubStatusSchema),
  startDeviceAuthorization: () => request("/github/device-authorization", DeviceStartSchema, { method: "POST", body: {} }),
  pollDeviceAuthorization: async (attemptId) => {
    const attempt = await request(`/github/device-attempts/${id(attemptId)}/poll`, DeviceAttemptSchema, { method: "POST" });
    if (attempt.status === "connected" && attempt.student_id) {
      const ws = readWorkspace(storage());
      if (ws.studentId !== attempt.student_id) writeWorkspace(storage(), { ...ws, studentId: attempt.student_id, repositories: [], activeRepositoryId: null });
    }
    return attempt;
  },
  listGitHubRepositories: (studentId) => request(`/students/${id(studentId)}/github-repositories`, GitHubRepositoryListSchema),
  connectGitHubRepository: async (studentId, input) => {
    const repository = await request(`/students/${id(studentId)}/github-repositories/connect`, RepositorySchema, { method: "POST", body: input });
    rememberRepository(storage(), repository);
    return repository;
  },
  setActiveRepository: async (studentId, repositoryId) => {
    const student = await request(`/students/${id(studentId)}/active-repository`, StudentSchema, { method: "PUT", body: { repository_id: repositoryId } });
    const ws = readWorkspace(storage());
    writeWorkspace(storage(), { ...ws, activeRepositoryId: student.active_repository_id ?? repositoryId, githubLogin: student.github_login ?? ws.githubLogin });
    return student;
  },
  getWatcher: (repositoryId) => request(`/repositories/${id(repositoryId)}/watcher`, WatcherStatusSchema),
  listClaims: (studentId) => request(`/students/${id(studentId)}/claims`, ClaimListSchema),
  selectClaims: (studentId, conceptIds) => request(`/students/${id(studentId)}/claims`, ClaimListSchema, { method: "PUT", body: { concept_ids: conceptIds } }),
  listScans: (repositoryId) => request(`/repositories/${id(repositoryId)}/scans`, ScanListSchema),
  getScan: (scanId) => request(`/scans/${id(scanId)}`, ScanSchema),
  listScanEvents: (scanId) => request(`/scans/${id(scanId)}/events`, ScanEventListSchema),
  startScan: (repositoryId, commitSha) =>
    request(`/repositories/${id(repositoryId)}/scans`, ScanSchema, { method: "POST", body: { commit_sha: commitSha, trigger_type: "manual", idempotency_key: `manual:${commitSha}:${Date.now()}` } }),
  getScores: (studentId) => request(`/students/${id(studentId)}/scores`, ConceptScoreListSchema),
  getScoreEvents: (studentId) => request(`/students/${id(studentId)}/score-events?limit=200`, ScoreEventListSchema),
  getHeadline: (studentId) => request(`/students/${id(studentId)}/headline`, HeadlineSchema),
  getProofGraph: (studentId) => request(`/students/${id(studentId)}/proof-graph`, ProofGraphSchema),
  getEvidenceSource: (evidenceId, context = 3) => request(`/evidence/${id(evidenceId)}/source?context=${context}`, EvidenceSourceSchema),

  getProduct: (key) => request(PRODUCT_PATHS[key], PRODUCT_SCHEMAS[key]) as never,
  saveProduct: (key, value) => request(PRODUCT_PATHS[key], PRODUCT_SCHEMAS[key], { method: "PUT", body: value }) as never,
  startViva: (input) => request("/vivas", VivaSessionSchema, { method: "POST", body: input }),
  gradeViva: (input) => request(`/vivas/${id(input.session_id)}/answers`, VivaResultSchema, { method: "POST", body: input }),
};
