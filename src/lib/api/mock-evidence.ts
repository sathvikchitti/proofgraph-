/**
 * Mock Validater backend, served from the backend's own exported contracts (`./contracts`, copied verbatim).
 *
 * The demo story is three stages of the same repository: `baseline` (Caching claimed, no evidence),
 * `add-caching` (Caching 0 -> 70, Honesty 80 -> 100) and `remove-caching` (Caching back to 0). Starting a scan
 * moves to the next stage, so the mock shows scores moving both ways exactly as the backend recorded them.
 * Claims can be changed; Honesty and Presentation Gaps are then recomputed with the backend's rules.
 */
import type {
  Claim, ConceptScore, EvidenceSource, EvidenceWorkspace, Headline, ProofGraphData, Repository, Scan, ScanEvent, ScoreEvent,
} from "./evidence-schemas";
import {
  ClaimListSchema, ConceptScoreListSchema, EvidenceSourceSchema, GitHubRepositoryListSchema, ProofGraphSchema, ScanEventListSchema, ScanListSchema,
  ScoreEventListSchema,
} from "./evidence-schemas";
import { ApiError } from "./errors";
import type { Api } from "./types";
import { readWorkspace, rememberRepository, writeWorkspace, type KeyValueStorage } from "./workspace-store";
import { CONCEPT_IDS, CONCEPT_NAMES } from "../domain/concepts";
import deviceStarted from "./contracts/phase2/device-authorization-started.json";
import githubConnected from "./contracts/phase2/github-connected.json";
import repositoryList from "./contracts/phase2/repository-list.json";
import claimsSelected from "./contracts/phase2/claims-selected.json";
import watcherStatus from "./contracts/phase2/watcher-status.json";
import sourceAccepted from "./contracts/source/accepted.json";
import sourceRejected from "./contracts/source/rejected.json";
import sourceReplaced from "./contracts/source/replaced.json";
import sourceSuperseded from "./contracts/source/superseded.json";

export const STAGES = ["baseline", "add-caching", "remove-caching"] as const;
export type Stage = (typeof STAGES)[number];

interface StageData {
  scans: Scan[];
  events: ScanEvent[];
  scores: ConceptScore[];
  scoreEvents: ScoreEvent[];
  graph: ProofGraphData;
  readiness: number;
}

/** Loaded on demand so the large graph files stay out of the main bundle. */
const LOADERS: Record<Stage, () => Promise<unknown[]>> = {
  baseline: () =>
    Promise.all([
      import("./contracts/baseline/scans.json"),
      import("./contracts/baseline/events.json"),
      import("./contracts/baseline/scores.json"),
      import("./contracts/baseline/score-events.json"),
      import("./contracts/baseline/proof-graph.json"),
      import("./contracts/baseline/headline.json"),
    ]),
  "add-caching": () =>
    Promise.all([
      import("./contracts/add-caching/scans.json"),
      import("./contracts/add-caching/events.json"),
      import("./contracts/add-caching/scores.json"),
      import("./contracts/add-caching/score-events.json"),
      import("./contracts/add-caching/proof-graph.json"),
      import("./contracts/add-caching/headline.json"),
    ]),
  "remove-caching": () =>
    Promise.all([
      import("./contracts/remove-caching/scans.json"),
      import("./contracts/remove-caching/events.json"),
      import("./contracts/remove-caching/scores.json"),
      import("./contracts/remove-caching/score-events.json"),
      import("./contracts/remove-caching/proof-graph.json"),
      import("./contracts/remove-caching/headline.json"),
    ]),
};

const cache = new Map<Stage, Promise<StageData>>();
const json = (m: unknown) => (m as { default: unknown }).default;

export function loadStage(stage: Stage): Promise<StageData> {
  if (!cache.has(stage)) {
    cache.set(
      stage,
      LOADERS[stage]().then(([scans, events, scores, scoreEvents, graph, headline]) => ({
        scans: ScanListSchema.parse(json(scans)),
        events: ScanEventListSchema.parse(json(events)),
        scores: ConceptScoreListSchema.parse(json(scores)),
        scoreEvents: ScoreEventListSchema.parse(json(scoreEvents)),
        graph: ProofGraphSchema.parse(json(graph)),
        readiness: (json(headline) as { role_readiness?: number }).role_readiness ?? 0,
      })),
    );
  }
  return cache.get(stage)!;
}

const SOURCES = [sourceAccepted, sourceRejected, sourceReplaced, sourceSuperseded].map((s) => EvidenceSourceSchema.parse(s));

/** The demo student and repository, as the backend recorded them in the contracts. */
export const DEMO_STUDENT_ID = "0201cae4-e755-4c8a-970a-fa8f958d9011";
const DEMO_REPOSITORY: Repository = {
  id: "e1195b40-f467-452d-a525-4ee28f5278f6",
  organization_id: "bf38483a-410e-4a4f-b182-e90f93cd3454",
  name: "prepared-python-api",
  local_path: "~/.validater/runtime/repos/10001.git",
  provider: "github",
  github_repository_id: "10001",
  owner: "demo-owner",
  clone_url: "https://github.com/demo-owner/prepared-python-api.git",
  default_branch: "main",
  visibility: "public",
  latest_observed_sha: "0973ced121cd4a7ec7b0e114faf73a822993976e",
  last_checked_at: null,
  last_error: null,
  poll_status: "ready",
  poll_retry_at: null,
  created_at: "2026-10-10T02:14:30.000000Z",
};
export const DEMO_WORKSPACE: EvidenceWorkspace = { studentId: DEMO_STUDENT_ID, githubLogin: "demo-owner", repositories: [DEMO_REPOSITORY], activeRepositoryId: DEMO_REPOSITORY.id };

const KEYS = { stage: "pg.mock.stage", claims: "pg.mock.claims", polls: "pg.mock.devicePolls" } as const;

/** Honesty = claimed concepts with evidence / claimed concepts; gaps = evidence that was never claimed (services.py). */
export function computeHeadline(scores: ConceptScore[], claimed: string[], readiness: number): Headline {
  if (!claimed.length) {
    return { claims_required: true, honesty_score: null, role_readiness: readiness, presentation_gaps: [], claimed_concepts: 0, claims_backed: 0, claims_total: 0, subtitle: "Choose the skills you claim to start scoring Honesty." };
  }
  const byId = new Map(scores.map((s) => [s.concept_id, s.score]));
  const backed = claimed.filter((c) => (byId.get(c) ?? 0) > 0).length;
  const gaps = scores.filter((s) => s.score > 0 && !claimed.includes(s.concept_id)).map((s) => CONCEPT_NAMES[s.concept_id] ?? s.concept_id).sort();
  return {
    claims_required: false,
    honesty_score: Math.round((backed / claimed.length) * 100),
    role_readiness: readiness,
    presentation_gaps: gaps,
    claimed_concepts: claimed.length,
    claims_backed: backed,
    claims_total: claimed.length,
    subtitle: `${backed}/${claimed.length} claims backed by self-authored code evidence`,
  };
}

type EvidenceApi = Pick<
  Api,
  | "getWorkspace" | "listConcepts" | "getGitHubStatus" | "startDeviceAuthorization" | "pollDeviceAuthorization" | "listGitHubRepositories" | "connectGitHubRepository"
  | "setActiveRepository" | "getWatcher" | "listClaims" | "selectClaims" | "listScans" | "getScan" | "listScanEvents" | "startScan" | "getScores"
  | "getScoreEvents" | "getHeadline" | "getProofGraph" | "getEvidenceSource"
>;

export function createMockEvidenceApi(wait: <T>(value: () => T | Promise<T>) => Promise<T>, storage: KeyValueStorage): EvidenceApi {
  const stageIndex = () => {
    const n = Number(storage.getItem(KEYS.stage));
    return Number.isInteger(n) && n >= 0 && n < STAGES.length ? n : 0;
  };
  const stage = () => loadStage(STAGES[stageIndex()]!);
  const workspace = () => readWorkspace(storage, DEMO_WORKSPACE);
  const requireStudent = (studentId: string) => {
    if (studentId !== workspace().studentId) throw new ApiError(404, "student not found");
  };
  const claimed = (): string[] => {
    try {
      const raw = storage.getItem(KEYS.claims);
      if (raw) return (JSON.parse(raw) as string[]).filter((c) => typeof c === "string");
    } catch {
      /* fall back to the contract */
    }
    return claimsSelected.map((c) => c.concept_id);
  };
  const claimRows = (studentId: string): Claim[] =>
    ClaimListSchema.parse(claimed().map((concept_id) => ({ id: `claim-${concept_id}`, organization_id: DEMO_REPOSITORY.organization_id, student_id: studentId, concept_id, created_at: DEMO_REPOSITORY.created_at })));
  const findScan = async (scanId: string) => {
    for (const s of STAGES) {
      const data = await loadStage(s);
      if (data.scans[0]?.id === scanId) return { scan: data.scans[0], events: data.events };
    }
    throw new ApiError(404, "scan not found");
  };

  return {
    getWorkspace: () => wait(workspace),
    listConcepts: () => wait(() => CONCEPT_IDS.map((id) => ({ id, name: CONCEPT_NAMES[id]! }))),
    getGitHubStatus: () => wait(() => ({ available: true, reason: null, device_flow_prerequisite: "Enable Device Flow in the GitHub OAuth application settings." })),
    startDeviceAuthorization: () =>
      wait(() => {
        storage.setItem(KEYS.polls, "0");
        return { ...deviceStarted, expires_at: new Date(Date.now() + 15 * 60_000).toISOString() };
      }),
    pollDeviceAuthorization: (attemptId) =>
      wait(() => {
        const polls = Number(storage.getItem(KEYS.polls) ?? "0") + 1;
        storage.setItem(KEYS.polls, String(polls));
        if (polls < 2) return { attempt_id: attemptId, status: "pending", expires_at: null, student_id: null, error: null, retry_after_seconds: 3 };
        writeWorkspace(storage, { ...workspace(), studentId: DEMO_STUDENT_ID, githubLogin: "demo-owner" });
        return { ...githubConnected, attempt_id: attemptId, student_id: DEMO_STUDENT_ID, expires_at: null, retry_after_seconds: null };
      }),
    listGitHubRepositories: (studentId) =>
      wait(() => {
        requireStudent(studentId);
        return GitHubRepositoryListSchema.parse(repositoryList);
      }),
    connectGitHubRepository: (studentId, input) =>
      wait(() => {
        requireStudent(studentId);
        if (input.visibility !== "public" || input.primary_language !== "Python") throw new ApiError(422, "repository is not supported: public Python repositories up to 200 MB only");
        const repository = input.github_repository_id === DEMO_REPOSITORY.github_repository_id ? DEMO_REPOSITORY : { ...DEMO_REPOSITORY, id: `repo-${input.github_repository_id}`, github_repository_id: input.github_repository_id, name: input.name, owner: input.owner, clone_url: input.clone_url };
        rememberRepository(storage, repository, DEMO_WORKSPACE);
        return repository;
      }),
    setActiveRepository: (studentId, repositoryId) =>
      wait(() => {
        requireStudent(studentId);
        const ws = workspace();
        if (!ws.repositories.some((r) => r.id === repositoryId)) throw new ApiError(404, "repository not available for student");
        writeWorkspace(storage, { ...ws, activeRepositoryId: repositoryId });
        return { id: studentId, organization_id: DEMO_REPOSITORY.organization_id, name: ws.githubLogin ?? "Demo Student", github_user_id: "12345", github_login: ws.githubLogin, active_repository_id: repositoryId, created_at: DEMO_REPOSITORY.created_at };
      }),
    getWatcher: (repositoryId) =>
      wait(async () => {
        const data = await stage();
        const latest = data.scans[0];
        return { ...watcherStatus, repository_id: repositoryId, latest_scan_id: latest?.id ?? null, last_checked_at: new Date(Date.now() - 42_000).toISOString(), retry_at: null };
      }),
    listClaims: (studentId) =>
      wait(() => {
        requireStudent(studentId);
        return claimRows(studentId);
      }),
    selectClaims: (studentId, conceptIds) =>
      wait(() => {
        requireStudent(studentId);
        const unknown = conceptIds.filter((c) => !(CONCEPT_IDS as readonly string[]).includes(c));
        if (unknown.length) throw new ApiError(422, `unknown concepts: ${unknown.join(", ")}`);
        storage.setItem(KEYS.claims, JSON.stringify([...new Set(conceptIds)]));
        return claimRows(studentId);
      }),
    listScans: () => wait(async () => (await stage()).scans),
    getScan: (scanId) => wait(async () => (await findScan(scanId)).scan),
    listScanEvents: (scanId) => wait(async () => (await findScan(scanId)).events),
    startScan: () =>
      wait(async () => {
        const next = stageIndex() + 1 < STAGES.length ? stageIndex() + 1 : 1;
        storage.setItem(KEYS.stage, String(next));
        const data = await loadStage(STAGES[next]!);
        return data.scans[0]!;
      }),
    getScores: (studentId) =>
      wait(async () => {
        requireStudent(studentId);
        return (await stage()).scores;
      }),
    getScoreEvents: (studentId) =>
      wait(async () => {
        requireStudent(studentId);
        return (await stage()).scoreEvents;
      }),
    getHeadline: (studentId) =>
      wait(async () => {
        requireStudent(studentId);
        const data = await stage();
        return computeHeadline(data.scores, claimed(), data.readiness);
      }),
    getProofGraph: (studentId) =>
      wait(async () => {
        requireStudent(studentId);
        return (await stage()).graph;
      }),
    getEvidenceSource: (evidenceId, context = 3) =>
      wait(async () => {
        const known = SOURCES.find((s) => s.evidence_id === evidenceId);
        if (known) return known;
        return synthesizeSource(evidenceId, context, await stage());
      }),
  };
}

/**
 * The contracts carry source for four evidence items only. For the rest the mock shows the real locator with
 * placeholder lines, so the page layout is right without pretending to know the code.
 */
function synthesizeSource(evidenceId: string, context: number, data: StageData): EvidenceSource {
  const all = [...data.graph.nodes];
  const source = all.find((n) => n.id === `source:${evidenceId}`);
  if (!source) throw new ApiError(404, "evidence not found");
  const start = Number(source.line_start) || 1;
  const end = Number(source.line_end) || start;
  const from = Math.max(1, start - context);
  const lines = Array.from({ length: end + context - from + 1 }, (_, i) => {
    const number = from + i;
    const inRange = number >= start && number <= end;
    return { number, text: inRange ? `# evidence line ${number} (the mock fixtures do not include this file's source)` : "", is_evidence: inRange };
  });
  return { evidence_id: evidenceId, blob_sha: String(source.blob_sha ?? ""), file_path: String(source.file_path ?? ""), line_start: start, line_end: end, lines };
}
