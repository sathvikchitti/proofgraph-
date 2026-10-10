/**
 * The Validater backend contract (FastAPI, `validater/schemas.py` + `contracts/openapi.json` v0.2.0).
 * Field names stay snake_case exactly as the backend sends them; there is no renaming layer.
 * Parsing is lenient where the backend's own exported contracts omit a field (they trim some samples), so a
 * missing optional value falls back instead of failing the page.
 */
import { z } from "zod";

const iso = z.string();
const nullableString = z.string().nullable().optional().transform((v) => v ?? null);

export const ConceptSchema = z.object({ id: z.string(), name: z.string() });
export type Concept = z.infer<typeof ConceptSchema>;
export const ConceptListSchema = z.array(ConceptSchema);

export const StudentSchema = z.object({
  id: z.string(),
  organization_id: z.string(),
  name: z.string(),
  github_user_id: nullableString,
  github_login: nullableString,
  active_repository_id: nullableString,
  created_at: iso,
});
export type Student = z.infer<typeof StudentSchema>;

export const RepositorySchema = z.object({
  id: z.string(),
  organization_id: z.string().default(""),
  name: z.string().default(""),
  local_path: z.string().default(""),
  provider: z.string().default("github"),
  github_repository_id: nullableString,
  owner: nullableString,
  clone_url: nullableString,
  default_branch: nullableString,
  visibility: nullableString,
  latest_observed_sha: nullableString,
  last_checked_at: nullableString,
  last_error: nullableString,
  poll_status: z.string().default("ready"),
  poll_retry_at: nullableString,
  created_at: iso.default(""),
});
export type Repository = z.infer<typeof RepositorySchema>;

export const ClaimSchema = z.object({
  id: z.string().default(""),
  organization_id: z.string().default(""),
  student_id: z.string().default(""),
  concept_id: z.string(),
  created_at: iso.default(""),
});
export type Claim = z.infer<typeof ClaimSchema>;
export const ClaimListSchema = z.array(ClaimSchema);

export const GitHubStatusSchema = z.object({ available: z.boolean(), reason: nullableString, device_flow_prerequisite: z.string().default("") });
export type GitHubStatus = z.infer<typeof GitHubStatusSchema>;

export const DeviceStartSchema = z.object({ attempt_id: z.string(), user_code: z.string(), verification_uri: z.string(), expires_at: iso });
export type DeviceStart = z.infer<typeof DeviceStartSchema>;

/** pending | connected | denied | expired | error */
export const DeviceAttemptSchema = z.object({
  attempt_id: z.string(),
  status: z.string(),
  expires_at: nullableString,
  student_id: nullableString,
  error: nullableString,
  retry_after_seconds: z.number().nullable().optional(),
});
export type DeviceAttempt = z.infer<typeof DeviceAttemptSchema>;

export const GitHubRepositorySchema = z.object({
  github_repository_id: z.string(),
  owner: z.string(),
  name: z.string(),
  full_name: z.string(),
  html_url: z.string(),
  clone_url: z.string(),
  primary_language: nullableString,
  size_kb: z.number(),
  visibility: z.string(),
  default_branch: z.string(),
  supported: z.boolean(),
  rejection_reason: nullableString,
});
export type GitHubRepository = z.infer<typeof GitHubRepositorySchema>;
export const GitHubRepositoryListSchema = z.array(GitHubRepositorySchema);

export const WatcherStatusSchema = z.object({
  repository_id: z.string(),
  status: z.string(),
  last_checked_at: nullableString,
  latest_observed_sha: nullableString,
  latest_scan_id: nullableString,
  last_error: nullableString,
  retry_at: nullableString,
});
export type WatcherStatus = z.infer<typeof WatcherStatusSchema>;

export const ScanMetricsSchema = z
  .object({
    total_tracked_files: z.number().optional(),
    eligible_files: z.number().optional(),
    blobs_analysed: z.number().optional(),
    blobs_skipped: z.number().optional(),
    detector_cache_hits: z.number().optional(),
    evidence_accepted: z.number().optional(),
    evidence_rejected: z.number().optional(),
    total_duration_ms: z.number().optional(),
  })
  .catchall(z.unknown());
export type ScanMetrics = z.infer<typeof ScanMetricsSchema>;

/** queued | running | completed | failed */
export const ScanSchema = z.object({
  id: z.string(),
  snapshot_id: z.string(),
  status: z.string(),
  metrics: ScanMetricsSchema.default({}),
  started_at: nullableString,
  completed_at: nullableString,
  trigger_type: z.string(),
  created_at: iso,
});
export type Scan = z.infer<typeof ScanSchema>;
export const ScanListSchema = z.array(ScanSchema);

/**
 * One agent-trace event. The REST list (`/scans/{id}/events`) sends `metadata_json` + `created_at`; the SSE stream
 * and the exported contracts send `metadata` + `timestamp`. Both normalise to this shape.
 */
export const ScanEventSchema = z
  .object({
    sequence_number: z.number(),
    actor: z.string(),
    event_type: z.string(),
    display_title: z.string(),
    display_detail: z.string().default(""),
    metadata: z.record(z.string(), z.unknown()).optional(),
    metadata_json: z.record(z.string(), z.unknown()).optional(),
    timestamp: z.string().optional(),
    created_at: z.string().optional(),
  })
  .transform(({ metadata, metadata_json, timestamp, created_at, ...rest }) => ({
    ...rest,
    metadata: metadata ?? metadata_json ?? {},
    timestamp: timestamp ?? created_at ?? "",
  }));
export type ScanEvent = z.infer<typeof ScanEventSchema>;
export const ScanEventListSchema = z.array(ScanEventSchema);

export const ScoreComponentSchema = z.object({ points: z.number(), evidence_id: z.string().nullable().optional(), signals: z.array(z.string()).default([]) });
export type ScoreComponent = z.infer<typeof ScoreComponentSchema>;

const emptyComponent = { points: 0, evidence_id: null, signals: [] };
export const ScoreBreakdownSchema = z.object({
  strongest_finding: ScoreComponentSchema.default(emptyComponent),
  diversity_bonus: ScoreComponentSchema.default(emptyComponent),
  corroboration: ScoreComponentSchema.default(emptyComponent),
});
export type ScoreBreakdownData = z.infer<typeof ScoreBreakdownSchema>;

/** `status` is the backend's internal Weak / Unverified label; show `badge` instead (backend comment). */
export const ConceptScoreSchema = z.object({
  id: z.string().default(""),
  concept_id: z.string(),
  snapshot_id: z.string().default(""),
  score: z.number(),
  status: z.string(),
  badge: z.string().default(""),
  missing_signals: z.array(z.string()).default([]),
  score_breakdown: ScoreBreakdownSchema,
  scoring_version: z.string().default("v1"),
  created_at: z.string().default(""),
});
export type ConceptScore = z.infer<typeof ConceptScoreSchema>;
export const ConceptScoreListSchema = z.array(ConceptScoreSchema);

export const ScoreEventSchema = z.object({
  id: z.string(),
  scan_id: z.string().nullable(),
  concept_id: z.string(),
  previous_score: z.number(),
  new_score: z.number(),
  reason: z.string(),
  breakdown: ScoreBreakdownSchema,
  rules_version: z.string(),
  timestamp: z.string(),
});
export type ScoreEvent = z.infer<typeof ScoreEventSchema>;
export const ScoreEventListSchema = z.array(ScoreEventSchema);

export const EvidenceSourceSchema = z.object({
  evidence_id: z.string(),
  blob_sha: z.string(),
  file_path: z.string(),
  line_start: z.number(),
  line_end: z.number(),
  lines: z.array(z.object({ number: z.number(), text: z.string(), is_evidence: z.boolean() })),
});
export type EvidenceSource = z.infer<typeof EvidenceSourceSchema>;

/** Honesty is 0-100 (null until claims are chosen); Readiness is 0-100. */
export const HeadlineSchema = z.object({
  claims_required: z.boolean(),
  honesty_score: z.number().nullable(),
  role_readiness: z.number().default(0),
  presentation_gaps: z.array(z.string()).default([]),
  claimed_concepts: z.number().default(0),
  claims_backed: z.number().default(0),
  claims_total: z.number().default(0),
  subtitle: z.string().default(""),
});
export type Headline = z.infer<typeof HeadlineSchema>;

/** Node and edge properties vary by `type`; the known ones are typed in `lib/proof-graph.ts`. */
export const ProofGraphItemSchema = z.object({ id: z.string(), type: z.string() }).catchall(z.unknown());
export const ProofGraphSchema = z.object({ nodes: z.array(ProofGraphItemSchema), edges: z.array(ProofGraphItemSchema) });
export type ProofGraphData = z.infer<typeof ProofGraphSchema>;
export type ProofGraphItem = z.infer<typeof ProofGraphItemSchema>;

export interface GitHubConnectInput {
  github_repository_id: string;
  owner: string;
  name: string;
  clone_url: string;
  default_branch: string;
  primary_language?: string | null;
  size_kb?: number;
  visibility?: string;
}

/**
 * Who the backend knows this browser as. The backend has no "current student" endpoint (it is not an auth
 * server), so the student id from the GitHub device flow and the repositories connected here are remembered in
 * the browser.
 */
export interface EvidenceWorkspace {
  studentId: string | null;
  githubLogin: string | null;
  repositories: Repository[];
  activeRepositoryId: string | null;
}
