/**
 * Role readiness. The backend's headline uses one role (Backend SDE, every concept weighted equally):
 * readiness = sum(score) / (70 x concepts) x 100 (validater/services.py). Other roles reuse that formula with
 * weights; a weight of 0 means the role does not need the concept.
 */
import { CONCEPT_IDS, conceptName } from "./concepts";

export interface RoleTemplate {
  id: string;
  title: string;
  summary: string;
  weights: Record<string, number>;
}

export const ROLE_TEMPLATES: RoleTemplate[] = [
  {
    id: "backend-sde",
    title: "Backend SDE",
    summary: "APIs, data, reliability. The role the backend's headline scores against.",
    weights: Object.fromEntries(CONCEPT_IDS.map((c) => [c, 1])),
  },
  {
    id: "full-stack",
    title: "Full-stack developer",
    summary: "API and auth heavy, with tests and CI to ship safely.",
    weights: { rest_apis: 2, authentication: 2, database_design: 1, asynchronous_work: 0.5, caching: 0.5, automated_tests: 1, ci_cd: 1, error_handling: 1 },
  },
  {
    id: "platform",
    title: "Platform / DevOps engineer",
    summary: "Pipelines, async work and failure handling first.",
    weights: { rest_apis: 0.5, authentication: 0.5, database_design: 0.5, asynchronous_work: 2, caching: 1, automated_tests: 1, ci_cd: 3, error_handling: 2 },
  },
  {
    id: "data-engineer",
    title: "Data engineer",
    summary: "Schemas, queries and background jobs.",
    weights: { rest_apis: 0.5, authentication: 0, database_design: 3, asynchronous_work: 2, caching: 1, automated_tests: 1, ci_cd: 1, error_handling: 1 },
  },
];

const CEILING = 70;

export function readiness(weights: Record<string, number>, scores: Record<string, number>): number {
  let total = 0;
  let max = 0;
  for (const [concept, w] of Object.entries(weights)) {
    if (w <= 0) continue;
    total += w * Math.min(scores[concept] ?? 0, 100);
    max += w * CEILING;
  }
  return max ? Math.min(100, Math.round((total / max) * 100)) : 0;
}

/** The concepts a role weights most that are still below the evidence ceiling, biggest gain first. */
export function biggestGaps(weights: Record<string, number>, scores: Record<string, number>, limit = 3) {
  return Object.entries(weights)
    .filter(([, w]) => w > 0)
    .map(([concept, w]) => ({ concept, name: conceptName(concept), score: scores[concept] ?? 0, gain: w * Math.max(0, CEILING - (scores[concept] ?? 0)) }))
    .filter((g) => g.gain > 0)
    .sort((a, b) => b.gain - a.gain)
    .slice(0, limit);
}

/** Keywords that place a job-description line on a concept. Deterministic: no model involved. */
const KEYWORDS: Record<string, string[]> = {
  rest_apis: ["rest", "api", "endpoint", "fastapi", "flask", "django", "http", "graphql", "microservice"],
  authentication: ["auth", "oauth", "jwt", "login", "session", "sso", "permission", "rbac", "security"],
  database_design: ["sql", "postgres", "mysql", "database", "schema", "orm", "migration", "mongodb", "data model"],
  asynchronous_work: ["async", "queue", "celery", "kafka", "rabbitmq", "background", "worker", "event-driven", "concurren"],
  caching: ["cache", "caching", "redis", "memcached", "cdn", "latency"],
  automated_tests: ["test", "pytest", "unit", "integration test", "tdd", "coverage", "qa"],
  ci_cd: ["ci", "cd", "pipeline", "github actions", "jenkins", "deploy", "docker", "kubernetes", "devops"],
  error_handling: ["error", "exception", "resilien", "fault", "monitoring", "logging", "observability", "reliab"],
};

/** Turns a pasted job description into concept weights (mentions per concept), so any JD becomes a role template. */
export function weightsFromJobDescription(text: string): Record<string, number> {
  const lower = ` ${text.toLowerCase()} `;
  const weights: Record<string, number> = {};
  for (const [concept, words] of Object.entries(KEYWORDS)) {
    const hits = words.reduce((n, w) => n + (lower.split(w.length <= 3 ? new RegExp(`\\b${w}\\b`) : w).length - 1), 0);
    if (hits) weights[concept] = Math.min(3, hits);
  }
  return weights;
}
