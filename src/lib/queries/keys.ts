import type { Role } from "../config";

export const queryKeys = {
  session: ["session"] as const,
  notifications: ["notifications"] as const,
  settings: ["settings"] as const,
  home: (role: Role) => ["home", role] as const,
  workspace: ["workspace"] as const,
  concepts: ["concepts"] as const,
  githubStatus: ["github", "status"] as const,
  githubRepos: (studentId: string) => ["github", "repos", studentId] as const,
  watcher: (repositoryId: string) => ["watcher", repositoryId] as const,
  /** Everything derived from a scan; invalidated together when a scan finishes or claims change. */
  evidence: ["evidence"] as const,
  claims: (studentId: string) => ["evidence", "claims", studentId] as const,
  headline: (studentId: string) => ["evidence", "headline", studentId] as const,
  scores: (studentId: string) => ["evidence", "scores", studentId] as const,
  scoreEvents: (studentId: string) => ["evidence", "score-events", studentId] as const,
  proofGraph: (studentId: string) => ["evidence", "proof-graph", studentId] as const,
  scans: (repositoryId: string) => ["evidence", "scans", repositoryId] as const,
  scan: (scanId: string) => ["scan", scanId] as const,
  scanEvents: (scanId: string) => ["scan", scanId, "events"] as const,
  source: (evidenceId: string) => ["source", evidenceId] as const,
  product: (key: string) => ["product", key] as const,
};
