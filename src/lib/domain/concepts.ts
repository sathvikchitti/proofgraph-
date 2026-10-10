/**
 * ProofGraph vocabulary: concept and signal names, and how backend statuses map onto the library's tones.
 * Concept and signal ids are the backend's (validater/detector.py); labels here are display copy only.
 */
import type { Tone } from "../../ui/lib/tone";
import type { ConceptScore } from "../api/evidence-schemas";

export const CONCEPT_IDS = ["rest_apis", "authentication", "database_design", "asynchronous_work", "caching", "automated_tests", "ci_cd", "error_handling"] as const;

export const CONCEPT_NAMES: Record<string, string> = {
  rest_apis: "REST APIs",
  authentication: "Authentication",
  database_design: "Database Design",
  asynchronous_work: "Asynchronous Work",
  caching: "Caching",
  automated_tests: "Automated Tests",
  ci_cd: "CI/CD",
  error_handling: "Error Handling",
};

/** Falls back to a readable version of the id for concepts added to the backend later. */
export function conceptName(id: string, names?: Record<string, string>): string {
  return names?.[id] ?? CONCEPT_NAMES[id] ?? humanize(id);
}

export function humanize(id: string): string {
  const s = id.replace(/[_-]+/g, " ").trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Every signal the detectors look for, per concept, with a plain description used by missions and the viva. */
export const SIGNALS: Record<string, Record<string, string>> = {
  rest_apis: {
    route_declaration: "An HTTP route declared with a framework decorator",
    request_validation: "Request bodies or parameters validated by a schema",
    response_schema: "A typed response model for an endpoint",
    structured_error: "Errors returned as a structured HTTP response",
  },
  authentication: {
    credential_validation: "A password or credential check",
    token_or_session_check: "A token or session verified on a request",
    protected_route: "A route that refuses unauthenticated callers",
    permission_decision: "A role or permission decision before an action",
  },
  database_design: {
    model_or_schema: "A table or model definition",
    query: "A query against the database",
    relationship_or_constraint: "A foreign key, relationship or constraint",
    transaction_or_migration: "A transaction or a schema migration",
  },
  asynchronous_work: {
    async_entry: "An async function or coroutine entry point",
    background_job: "Work handed to a background job",
    queue_or_scheduler: "A queue, worker or scheduler",
    retry_or_failure_handling: "Retries or failure handling for async work",
  },
  caching: {
    cache_read: "A read from a cache before the source",
    cache_write: "A write of a computed value into a cache",
    miss_fallback: "A fallback to the source on a cache miss",
    ttl: "An expiry (TTL) on cached values",
    invalidation: "Cache entries removed or refreshed when data changes",
  },
  automated_tests: {
    test_case: "A test function",
    assertion: "An assertion about behaviour",
    fixture_or_mock: "A fixture, mock or fake",
    integration_boundary: "A test that crosses an HTTP or database boundary",
  },
  ci_cd: {
    workflow: "A CI workflow file",
    test_job: "A CI job that runs the tests",
    lint_or_typecheck: "A lint or type-check step",
    build_or_deploy_step: "A build or deploy step",
  },
  error_handling: {
    domain_exception: "A custom exception for a domain error",
    structured_response: "Errors turned into a structured response",
    boundary_handler: "A handler at a boundary (middleware, exception handler)",
    error_logging: "Errors logged with context",
  },
};

const ACRONYMS: Record<string, string> = { ttl: "TTL", ci: "CI", api: "API", http: "HTTP" };

export function signalLabel(signal: string): string {
  return humanize(signal)
    .split(" ")
    .map((w) => ACRONYMS[w.toLowerCase()] ?? w)
    .join(" ");
}

export function signalDescription(conceptId: string, signal: string): string {
  return SIGNALS[conceptId]?.[signal] ?? humanize(signal);
}

/** Display status. The backend's internal label is Weak/Unverified; Verified needs a passed viva (+30 on top of 70). */
export type ConceptStatus = "verified" | "weak" | "unverified";

export function conceptStatus(score: Pick<ConceptScore, "score" | "status"> | undefined): ConceptStatus {
  if (!score) return "unverified";
  if (score.status.toLowerCase() === "verified" || score.score > 70) return "verified";
  return score.score > 0 ? "weak" : "unverified";
}

export const STATUS_LABEL: Record<ConceptStatus, string> = { verified: "Verified", weak: "Evidence-backed", unverified: "Unverified" };
export const STATUS_TONE: Record<ConceptStatus, Tone> = { verified: "success", weak: "warning", unverified: "neutral" };
export const STATUS_HINT: Record<ConceptStatus, string> = {
  verified: "Code evidence and a passed viva.",
  weak: "Code evidence found. Pass the viva to verify it.",
  unverified: "No accepted evidence yet.",
};

export type EvidenceState = "accepted" | "rejected" | "superseded" | "replaced";
export const EVIDENCE_TONE: Record<string, Tone> = { accepted: "success", rejected: "danger", superseded: "neutral", replaced: "info" };
export const EVIDENCE_HINT: Record<string, string> = {
  accepted: "Counts toward the score.",
  rejected: "Written by someone else, so it does not count.",
  superseded: "The code is gone from the latest commit, so it no longer counts.",
  replaced: "The code changed; a newer finding carries it on.",
};
export const STRENGTH_TONE: Record<string, Tone> = { Deep: "success", Standard: "info", Trivial: "neutral" };

/** Points the backend can award per breakdown component (validater/schemas.py). */
export const BREAKDOWN_LABEL = { strongest_finding: "Strongest finding", diversity_bonus: "Signal diversity", corroboration: "Corroborated by tests" } as const;

export function shortSha(sha: string | null | undefined, n = 7): string {
  return sha ? sha.slice(0, n) : "—";
}
