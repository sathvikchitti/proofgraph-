/**
 * Missions turn a missing signal (from the backend's `missing_signals`) into a small task in the student's own
 * repository. Completing one is proven the same way as anything else: push, rescan, and the signal appears.
 * Interview questions come from accepted evidence, so they are always about the student's own code.
 */
import type { ConceptScore } from "../api/evidence-schemas";
import { conceptName, signalDescription, signalLabel } from "./concepts";
import { locator, type EvidenceRecord } from "./proof-graph";

export interface Mission {
  id: string;
  conceptId: string;
  signal: string;
  title: string;
  description: string;
  /** Points the concept can gain, estimated from the scoring rules (diversity bonus up to +10, a first finding +15 to +55). */
  estimatedGain: number;
  effort: "S" | "M" | "L";
  steps: string[];
}

const TASKS: Record<string, string> = {
  cache_read: "Read from a cache before calling the slow source in one endpoint.",
  cache_write: "Store the computed result in the cache after a miss.",
  miss_fallback: "On a cache miss, fall back to the source and return its value.",
  ttl: "Give cached values an expiry so stale data ages out.",
  invalidation: "Delete or refresh the cache entry when the underlying data changes.",
  background_job: "Move one slow side effect (an email, a report) into a background job.",
  queue_or_scheduler: "Run the job through a queue or a scheduler instead of inline.",
  retry_or_failure_handling: "Retry the job on a transient failure and record the final failure.",
  protected_route: "Refuse unauthenticated requests on one route with a dependency or middleware.",
  token_or_session_check: "Verify a token or session on each request to that route.",
  permission_decision: "Allow an action only for a role or owner, and test the refusal.",
  credential_validation: "Check a hashed credential instead of a plain comparison.",
  model_or_schema: "Define a model for one table with explicit column types.",
  query: "Read through the model with a query instead of an in-memory list.",
  relationship_or_constraint: "Add a foreign key or a unique constraint between two models.",
  transaction_or_migration: "Add a migration, or wrap a multi-step write in a transaction.",
  boundary_handler: "Register one exception handler that turns domain errors into HTTP responses.",
  error_logging: "Log errors with the request context before responding.",
  domain_exception: "Raise a named exception for one domain failure.",
  structured_response: "Return errors as a consistent JSON body.",
  request_validation: "Validate one request body with a schema model.",
  response_schema: "Declare a response model on one endpoint.",
  structured_error: "Return a structured error body from one endpoint.",
  route_declaration: "Expose one feature as an HTTP route.",
  test_case: "Add a test for one endpoint.",
  assertion: "Assert on the response body, not only the status code.",
  fixture_or_mock: "Use a fixture or a fake for the database or an outside service.",
  integration_boundary: "Test through the HTTP client so the whole stack runs.",
  workflow: "Add a CI workflow that runs on every push.",
  test_job: "Run the test suite in CI.",
  lint_or_typecheck: "Add a lint or type-check step to CI.",
  build_or_deploy_step: "Build the app (or its container) in CI.",
};

export function missionsFrom(scores: ConceptScore[]): Mission[] {
  return scores.flatMap((s) =>
    s.missing_signals.map((signal) => {
      const first = s.score === 0;
      return {
        id: `${s.concept_id}:${signal}`,
        conceptId: s.concept_id,
        signal,
        title: `${signalLabel(signal)} in ${conceptName(s.concept_id)}`,
        description: TASKS[signal] ?? signalDescription(s.concept_id, signal),
        estimatedGain: first ? 15 : Math.min(5, 70 - s.score),
        effort: first ? "M" : "S",
        steps: [
          TASKS[signal] ?? `Add: ${signalDescription(s.concept_id, signal).toLowerCase()}.`,
          "Commit it under your own Git identity and push to the default branch.",
          "Rescan. The new evidence appears in the agent trace and the score updates.",
        ],
      } satisfies Mission;
    }),
  );
}

/** Questions an interviewer could ask about this exact code, from the signal it proves. */
const QUESTION_TEMPLATES: Record<string, string[]> = {
  default: ["Walk me through what this code does and why you wrote it this way.", "What would break first if traffic grew tenfold here?"],
  cache: ["How do you stop this cache from serving stale data?", "What happens on a cache miss under heavy concurrent load?"],
  auth: ["Where would an attacker try to get past this check?", "How would you add a second role with fewer permissions?"],
  async: ["What happens to this job if the process restarts halfway?", "How would you retry this safely without doing the work twice?"],
  test: ["What does this test not cover that could still fail in production?", "Why did you choose this boundary to test at?"],
  ci: ["What does this pipeline catch, and what slips through?", "How would you make this pipeline faster?"],
  error: ["How does a caller learn what went wrong here?", "What gets logged, and what must never be logged?"],
  db: ["What index would this query need at scale?", "How would you change this schema without downtime?"],
  api: ["How do clients learn about a breaking change to this endpoint?", "What does this endpoint return for invalid input?"],
};

const FAMILY: Record<string, string> = { caching: "cache", authentication: "auth", asynchronous_work: "async", automated_tests: "test", ci_cd: "ci", error_handling: "error", database_design: "db", rest_apis: "api" };

export function questionsFor(ev: EvidenceRecord): string[] {
  return [...(QUESTION_TEMPLATES[FAMILY[ev.conceptId] ?? "default"] ?? []), ...QUESTION_TEMPLATES.default!].slice(0, 3);
}

export function evidenceHeadline(ev: EvidenceRecord): string {
  return `${signalLabel(ev.signal)} · ${locator(ev)}`;
}
