/**
 * Reads the backend's ProofGraph (`GET /students/{id}/proof-graph`) into typed evidence records.
 * Node ids are `<type>:<id>`; edges carry `from`/`to`. Unknown node or edge types are kept but ignored here.
 */
import type { ProofGraphData, ProofGraphItem } from "../api/evidence-schemas";

export interface EvidenceRecord {
  id: string;
  conceptId: string;
  signal: string;
  state: string;
  strength: string;
  filePath: string;
  lineStart: number;
  lineEnd: number;
  commitSha: string;
  blobSha: string;
  detector: string;
  ownershipRatio: number | null;
  replacesId: string | null;
  isCurrent: boolean;
}

const str = (v: unknown, fallback = ""): string => (typeof v === "string" ? v : fallback);
const num = (v: unknown, fallback = 0): number => (typeof v === "number" ? v : fallback);

export interface GraphIndex {
  nodes: Map<string, ProofGraphItem>;
  evidence: EvidenceRecord[];
  byConcept: Map<string, EvidenceRecord[]>;
  claimedConcepts: Set<string>;
  missingSignals: Map<string, string[]>;
  studentName: string;
}

const STATE_ORDER: Record<string, number> = { accepted: 0, replaced: 1, superseded: 2, rejected: 3 };
const STRENGTH_ORDER: Record<string, number> = { Deep: 0, Standard: 1, Trivial: 2 };

export function indexGraph(graph: ProofGraphData): GraphIndex {
  const nodes = new Map(graph.nodes.map((n) => [n.id, n]));
  const out = new Map<string, ProofGraphItem[]>();
  for (const e of graph.edges) {
    const from = str(e.from);
    if (!out.has(from)) out.set(from, []);
    out.get(from)!.push(e);
  }
  const evidence: EvidenceRecord[] = [];
  const claimedConcepts = new Set<string>();
  const missingSignals = new Map<string, string[]>();
  let studentName = "";

  for (const n of graph.nodes) {
    if (n.type === "Student") studentName = str(n.name);
    if (n.type === "Signal") {
      const c = str(n.concept_id);
      missingSignals.set(c, [...(missingSignals.get(c) ?? []), str(n.signal)]);
    }
    if (n.type !== "Evidence") continue;
    const edges = out.get(n.id) ?? [];
    const target = (type: string) => edges.find((e) => e.type === type);
    const concept = nodes.get(str(target("SUPPORTS")?.to));
    const source = nodes.get(str(target("FOUND_IN")?.to));
    const snapshot = source ? nodes.get(str((out.get(source.id) ?? []).find((e) => e.type === "EXTRACTED_FROM")?.to)) : undefined;
    const detector = nodes.get(str(target("DETECTED_BY")?.to));
    const authored = target("AUTHORED_BY");
    const replaces = target("REPLACES");
    evidence.push({
      id: str(n.evidence_id, n.id.replace(/^evidence:/, "")),
      conceptId: str(concept?.concept_id),
      signal: str(n.signal),
      state: str(n.state, "accepted"),
      strength: str(n.strength, "Standard"),
      filePath: str(source?.file_path),
      lineStart: num(source?.line_start),
      lineEnd: num(source?.line_end),
      commitSha: str(source?.commit_sha),
      blobSha: str(source?.blob_sha),
      detector: detector ? `${str(detector.detector_id)} v${str(detector.detector_version)}` : "",
      ownershipRatio: typeof authored?.ownership_ratio === "number" ? authored.ownership_ratio : null,
      replacesId: replaces ? str(replaces.to).replace(/^evidence:/, "") : null,
      isCurrent: snapshot ? Boolean(snapshot.is_current) : true,
    });
  }
  for (const e of graph.edges) {
    if (e.type === "ASSERTS") {
      const c = nodes.get(str(e.to));
      if (c) claimedConcepts.add(str(c.concept_id));
    }
  }
  evidence.sort((a, b) => (STATE_ORDER[a.state] ?? 9) - (STATE_ORDER[b.state] ?? 9) || (STRENGTH_ORDER[a.strength] ?? 9) - (STRENGTH_ORDER[b.strength] ?? 9) || a.filePath.localeCompare(b.filePath));
  const byConcept = new Map<string, EvidenceRecord[]>();
  for (const ev of evidence) byConcept.set(ev.conceptId, [...(byConcept.get(ev.conceptId) ?? []), ev]);
  return { nodes, evidence, byConcept, claimedConcepts, missingSignals, studentName };
}

/** `file.py:6-9` */
export function locator(ev: Pick<EvidenceRecord, "filePath" | "lineStart" | "lineEnd">): string {
  return ev.lineStart === ev.lineEnd ? `${ev.filePath}:${ev.lineStart}` : `${ev.filePath}:${ev.lineStart}-${ev.lineEnd}`;
}

/** The distinct repository files that hold accepted evidence for a concept. */
export function evidenceFiles(records: EvidenceRecord[]): string[] {
  return [...new Set(records.filter((r) => r.state === "accepted").map((r) => r.filePath))];
}
