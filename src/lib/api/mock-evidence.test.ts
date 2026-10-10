import { CONCEPT_NAMES } from "../domain/concepts";
import type { ConceptScore } from "./evidence-schemas";
import { computeHeadline, createMockEvidenceApi, DEMO_STUDENT_ID, DEMO_WORKSPACE } from "./mock-evidence";
import { EMPTY_WORKSPACE, WORKSPACE_KEY, writeWorkspace, type KeyValueStorage } from "./workspace-store";

function memoryStorage(): KeyValueStorage {
  const m = new Map<string, string>();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k) };
}
const now = <T,>(fn: () => T | Promise<T>) => Promise.resolve().then(fn);
const score = (concept_id: string, s: number) => ({ concept_id, score: s }) as ConceptScore;

describe("computeHeadline", () => {
  it("asks for claims before scoring Honesty", () => {
    const h = computeHeadline([score("caching", 55)], [], 40);
    expect(h.claims_required).toBe(true);
    expect(h.honesty_score).toBeNull();
    expect(h.role_readiness).toBe(40);
  });

  it("scores Honesty as backed claims over claims and lists unclaimed evidence as gaps", () => {
    const h = computeHeadline([score("caching", 55), score("rest_apis", 0), score("ci_cd", 35)], ["caching", "rest_apis"], 20);
    expect(h.honesty_score).toBe(50);
    expect(h.claims_backed).toBe(1);
    expect(h.claims_total).toBe(2);
    expect(h.presentation_gaps).toEqual([CONCEPT_NAMES.ci_cd]);
  });
});

describe("mock evidence API", () => {
  it("connects GitHub on the second device poll and remembers the student", async () => {
    const storage = memoryStorage();
    writeWorkspace(storage, EMPTY_WORKSPACE);
    const api = createMockEvidenceApi(now, storage);
    const start = await api.startDeviceAuthorization();
    expect((await api.pollDeviceAuthorization(start.attempt_id)).status).toBe("pending");
    const done = await api.pollDeviceAuthorization(start.attempt_id);
    expect(done.student_id).toBe(DEMO_STUDENT_ID);
    expect(JSON.parse(storage.getItem(WORKSPACE_KEY)!).studentId).toBe(DEMO_STUDENT_ID);
  });

  it("advances through the contract stages on each scan, then alternates caching on and off", async () => {
    const api = createMockEvidenceApi(now, memoryStorage());
    const caching = async () => (await api.getScores(DEMO_STUDENT_ID)).find((s) => s.concept_id === "caching")?.score ?? 0;
    const baseline = await caching();
    await api.startScan(DEMO_WORKSPACE.activeRepositoryId!, "HEAD");
    const added = await caching();
    expect(added).toBeGreaterThan(baseline);
    await api.startScan(DEMO_WORKSPACE.activeRepositoryId!, "HEAD");
    expect(await caching()).toBeLessThan(added);
    await api.startScan(DEMO_WORKSPACE.activeRepositoryId!, "HEAD");
    expect(await caching()).toBe(added);
  });

  it("rejects unknown concepts and other students", async () => {
    const api = createMockEvidenceApi(now, memoryStorage());
    await expect(api.selectClaims(DEMO_STUDENT_ID, ["juggling"])).rejects.toMatchObject({ status: 422 });
    await expect(api.getScores("someone-else")).rejects.toMatchObject({ status: 404 });
    const rows = await api.selectClaims(DEMO_STUDENT_ID, ["caching", "caching", "ci_cd"]);
    expect(rows.map((r) => r.concept_id)).toEqual(["caching", "ci_cd"]);
  });

  it("indexes the proof graph with evidence locators", async () => {
    const { indexGraph } = await import("../domain/proof-graph");
    const api = createMockEvidenceApi(now, memoryStorage());
    const index = indexGraph(await api.getProofGraph(DEMO_STUDENT_ID));
    expect(index.evidence.length).toBeGreaterThan(0);
    for (const ev of index.evidence) {
      expect(ev.filePath).not.toBe("");
      expect(ev.lineEnd).toBeGreaterThanOrEqual(ev.lineStart);
    }
  });
});
