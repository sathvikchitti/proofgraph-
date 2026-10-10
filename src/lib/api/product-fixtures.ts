/**
 * Mock data for the product features the backend does not serve yet. Fixed values, so screenshots and
 * tests are stable.
 */
import { CONCEPT_IDS, CONCEPT_NAMES } from "../domain/concepts";
import type { ProductData, VivaQuestion } from "./product-schemas";

const day = (offset: number, now: number) => new Date(now + offset * 86_400_000).toISOString();

export function productFixtures(now = Date.now()): ProductData {
  return {
    opportunities: [
      { id: "o-1", company: "Acme Corp", role: "Backend SDE", kind: "drive", location: "Campus drive", deadline: day(10, now), required: [{ concept_id: "rest_apis", min_score: 40 }, { concept_id: "automated_tests", min_score: 40 }], min_readiness: 45, applied: false },
      { id: "o-2", company: "Globex", role: "Platform engineer intern", kind: "role", location: "Bengaluru · hybrid", deadline: day(16, now), required: [{ concept_id: "ci_cd", min_score: 55 }, { concept_id: "asynchronous_work", min_score: 40 }], min_readiness: 40, applied: false },
      { id: "o-3", company: "Initech", role: "Full-stack developer", kind: "role", location: "Remote", deadline: day(22, now), required: [{ concept_id: "authentication", min_score: 55 }, { concept_id: "database_design", min_score: 40 }], min_readiness: 55, applied: false },
      { id: "o-4", company: "Umbrella Labs", role: "Data engineer", kind: "role", location: "Hyderabad", deadline: day(5, now), required: [{ concept_id: "database_design", min_score: 55 }], min_readiness: 50, applied: true },
    ],
    dsa: {
      username: "demo-owner",
      verified: false,
      verify_code: "PG-7K3Q-92XD",
      solved: { easy: 84, medium: 61, hard: 9 },
      contest_rating: 1612,
      topics: [
        { topic: "Array", solved: 52, total: 80 },
        { topic: "Hash Table", solved: 31, total: 50 },
        { topic: "Two Pointers", solved: 18, total: 30 },
        { topic: "Binary Search", solved: 12, total: 30 },
        { topic: "Dynamic Programming", solved: 9, total: 45 },
        { topic: "Graph", solved: 6, total: 30 },
        { topic: "Tree", solved: 20, total: 40 },
        { topic: "Heap", solved: 7, total: 20 },
      ],
      calendar: Array.from({ length: 140 }, (_, i) => ({ date: day(i - 139, now).slice(0, 10), value: [0, 0, 1, 2, 0, 3, 1][(i * 5 + 3) % 7]! * (i % 9 === 0 ? 0 : 1) })),
      probes: [
        { problem: "Two Sum", claimed: "O(n)", measured: "O(n)", passed: true },
        { problem: "Merge Intervals", claimed: "O(n log n)", measured: "O(n log n)", passed: true },
        { problem: "LRU Cache", claimed: "O(1)", measured: "O(n)", passed: false },
      ],
      suggested: [
        { title: "Course Schedule", topic: "Graph", difficulty: "Medium" },
        { title: "Coin Change", topic: "Dynamic Programming", difficulty: "Medium" },
        { title: "Find Peak Element", topic: "Binary Search", difficulty: "Medium" },
      ],
    },
    privacy: {
      rows: [
        { id: "profile", label: "Proof Profile (scores and badges)", kind: "profile", values: { college: true, company: true, public: false } },
        ...CONCEPT_IDS.map((id) => ({ id: `concept:${id}`, label: CONCEPT_NAMES[id]!, kind: "concept" as const, values: { college: true, company: true, public: true } })),
        { id: "repo:prepared-python-api", label: "demo-owner/prepared-python-api (code snippets)", kind: "repository", values: { college: true, company: false, public: false } },
      ],
    },
    appeals: [],
  };
}

/** Viva questions from the student's own evidence; the page shows the code beside each question. */
export function vivaQuestions(conceptId: string, evidence: { id: string; signal: string; file_path: string; line_start: number; line_end: number }[]): VivaQuestion[] {
  const prompts: ((e: (typeof evidence)[number]) => string)[] = [
    (e) => `In ${e.file_path}, lines ${e.line_start}-${e.line_end}: explain what this code does and why you wrote it this way.`,
    (e) => `What would go wrong in ${e.file_path} if this ${e.signal.replace(/_/g, " ")} were removed? Name a concrete failure.`,
    (e) => `How would you change lines ${e.line_start}-${e.line_end} to handle ten times the traffic?`,
  ];
  const picks = evidence.length ? evidence : [{ id: "", signal: conceptId, file_path: "your repository", line_start: 1, line_end: 1 }];
  return prompts.map((p, i) => {
    const e = picks[i % picks.length]!;
    return { id: `q${i + 1}`, prompt: p(e), hint: i === 0 ? "Refer to specific lines. Two or three sentences is enough." : undefined, evidence_id: e.id || null, file_path: e.file_path, line_start: e.line_start, line_end: e.line_end };
  });
}
