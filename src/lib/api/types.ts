import type { Role } from "../config";
import type {
  Claim, Concept, ConceptScore, DeviceAttempt, DeviceStart, EvidenceSource, EvidenceWorkspace, GitHubConnectInput, GitHubRepository, GitHubStatus,
  Headline, ProofGraphData, Repository, Scan, ScanEvent, ScoreEvent, Student, WatcherStatus,
} from "./evidence-schemas";
import type { ProductData, ProductKey, VivaAnswerInput, VivaResult, VivaSession, VivaStartInput } from "./product-schemas";
import type { HomeSummary, Notification, Session, Settings, SettingsPatch, SignInInput } from "./schemas";

/** The one surface pages and hooks talk to. `client.ts` implements it over HTTP, `mock-client.ts` over fixtures. */
export interface Api {
  getSession(): Promise<Session>;
  signIn(input: SignInInput): Promise<Session>;
  signOut(): Promise<void>;
  /** Demo convenience (see FEATURES.demoWorkspaceSwitcher): re-issue the session for another role. */
  switchRole(role: Role): Promise<Session>;
  listNotifications(): Promise<Notification[]>;
  markNotificationRead(id: string): Promise<void>;
  markAllNotificationsRead(): Promise<void>;
  getSettings(): Promise<Settings>;
  updateSettings(patch: SettingsPatch): Promise<Settings>;
  getHome(role: Role): Promise<HomeSummary>;

  /* ---- Validater backend: real endpoints (evidence-schemas.ts) ---- */
  /** Browser-held identity for the backend: student id, connected repositories, active repository. */
  getWorkspace(): Promise<EvidenceWorkspace>;
  listConcepts(): Promise<Concept[]>;
  getGitHubStatus(): Promise<GitHubStatus>;
  startDeviceAuthorization(): Promise<DeviceStart>;
  pollDeviceAuthorization(attemptId: string): Promise<DeviceAttempt>;
  listGitHubRepositories(studentId: string): Promise<GitHubRepository[]>;
  connectGitHubRepository(studentId: string, input: GitHubConnectInput): Promise<Repository>;
  setActiveRepository(studentId: string, repositoryId: string): Promise<Student>;
  getWatcher(repositoryId: string): Promise<WatcherStatus>;
  listClaims(studentId: string): Promise<Claim[]>;
  selectClaims(studentId: string, conceptIds: string[]): Promise<Claim[]>;
  listScans(repositoryId: string): Promise<Scan[]>;
  getScan(scanId: string): Promise<Scan>;
  listScanEvents(scanId: string): Promise<ScanEvent[]>;
  startScan(repositoryId: string, commitSha: string): Promise<Scan>;
  getScores(studentId: string): Promise<ConceptScore[]>;
  getScoreEvents(studentId: string): Promise<ScoreEvent[]>;
  getHeadline(studentId: string): Promise<Headline>;
  getProofGraph(studentId: string): Promise<ProofGraphData>;
  getEvidenceSource(evidenceId: string, context?: number): Promise<EvidenceSource>;

  /* ---- Product features the backend does not serve yet: provisional paths (product-schemas.ts) ---- */
  getProduct<K extends ProductKey>(key: K): Promise<ProductData[K]>;
  saveProduct<K extends ProductKey>(key: K, value: ProductData[K]): Promise<ProductData[K]>;
  startViva(input: VivaStartInput): Promise<VivaSession>;
  gradeViva(input: VivaAnswerInput): Promise<VivaResult>;
}
