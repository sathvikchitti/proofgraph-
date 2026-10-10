/**
 * Browser memory of who this browser is to the Validater backend. The backend has no session or
 * "current student" endpoint, so the student id from the GitHub device flow and the repositories connected
 * from this browser are kept here. Both clients use it (the mock seeds it from the contracts).
 */
import type { EvidenceWorkspace, Repository } from "./evidence-schemas";

export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const WORKSPACE_KEY = "pg.validater.workspace";

export const EMPTY_WORKSPACE: EvidenceWorkspace = { studentId: null, githubLogin: null, repositories: [], activeRepositoryId: null };

export function browserStorage(): KeyValueStorage {
  try {
    if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
  } catch {
    /* blocked storage: fall through to memory */
  }
  const memory = new Map<string, string>();
  return { getItem: (k) => memory.get(k) ?? null, setItem: (k, v) => void memory.set(k, v), removeItem: (k) => void memory.delete(k) };
}

export function readWorkspace(storage: KeyValueStorage, fallback: EvidenceWorkspace = EMPTY_WORKSPACE): EvidenceWorkspace {
  try {
    const raw = storage.getItem(WORKSPACE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<EvidenceWorkspace>;
    return {
      studentId: typeof parsed.studentId === "string" ? parsed.studentId : null,
      githubLogin: typeof parsed.githubLogin === "string" ? parsed.githubLogin : null,
      repositories: Array.isArray(parsed.repositories) ? (parsed.repositories as Repository[]) : [],
      activeRepositoryId: typeof parsed.activeRepositoryId === "string" ? parsed.activeRepositoryId : null,
    };
  } catch {
    return fallback;
  }
}

export function writeWorkspace(storage: KeyValueStorage, next: EvidenceWorkspace): EvidenceWorkspace {
  storage.setItem(WORKSPACE_KEY, JSON.stringify(next));
  return next;
}

/** Adds (or refreshes) a connected repository; the first one becomes active, as the backend does. */
export function rememberRepository(storage: KeyValueStorage, repository: Repository, fallback?: EvidenceWorkspace): EvidenceWorkspace {
  const ws = readWorkspace(storage, fallback);
  const repositories = [...ws.repositories.filter((r) => r.id !== repository.id), repository];
  return writeWorkspace(storage, { ...ws, repositories, activeRepositoryId: ws.activeRepositoryId ?? repository.id });
}
