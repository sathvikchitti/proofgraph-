/**
 * Mock product datasets (college, company, admin, viva, LeetCode, privacy). Saved changes persist in the browser
 * per dataset, so a drag on the shortlist or a toggled flag survives a refresh.
 */
import { ApiError } from "./errors";
import { loadStage, STAGES } from "./mock-evidence";
import { productFixtures, vivaQuestions } from "./product-fixtures";
import { PRODUCT_SCHEMAS, type ProductData, type ProductKey, type VivaResult, type VivaSession } from "./product-schemas";
import type { Api } from "./types";
import type { KeyValueStorage } from "./workspace-store";

type ProductApi = Pick<Api, "getProduct" | "saveProduct" | "startViva" | "gradeViva">;

const key = (k: ProductKey) => `pg.mock.product.${k}`;
const VIVA_KEY = "pg.mock.viva";

/** Deterministic grading: long, specific answers that name code score higher. No model is involved in mock mode. */
export function gradeAnswer(answer: string): "correct" | "partial" | "incorrect" {
  const text = answer.trim();
  const specific = /(line|\.py|function|cache|token|test|query|retry|return|raise|ttl|redis|route|await)/i.test(text);
  if (text.length >= 80 && specific) return "correct";
  if (text.length >= 30) return "partial";
  return "incorrect";
}

export function createMockProductApi(wait: <T>(value: () => T | Promise<T>) => Promise<T>, storage: KeyValueStorage): ProductApi {
  const read = <K extends ProductKey>(k: K): ProductData[K] => {
    try {
      const raw = storage.getItem(key(k));
      if (raw) {
        const parsed = PRODUCT_SCHEMAS[k].safeParse(JSON.parse(raw));
        if (parsed.success) return parsed.data as ProductData[K];
      }
    } catch {
      /* fall back to fixtures */
    }
    return productFixtures()[k];
  };

  return {
    getProduct: (k) => wait(() => read(k)),
    saveProduct: (k, value) =>
      wait(() => {
        const parsed = PRODUCT_SCHEMAS[k].parse(value) as ProductData[typeof k];
        storage.setItem(key(k), JSON.stringify(parsed));
        return parsed;
      }),
    startViva: (input) =>
      wait(async () => {
        const stage = Number(storage.getItem("pg.mock.stage")) || 0;
        const { graph } = await loadStage(STAGES[stage] ?? "baseline");
        const evidence = input.evidence_ids.flatMap((id) => {
          const ev = graph.nodes.find((n) => n.id === `evidence:${id}`);
          const src = graph.nodes.find((n) => n.id === `source:${id}`);
          return ev && src ? [{ id, signal: String(ev.signal), file_path: String(src.file_path), line_start: Number(src.line_start), line_end: Number(src.line_end) }] : [];
        });
        const session: VivaSession = { id: `viva-${Date.now()}`, concept_id: input.concept_id, mode: input.mode, seconds_per_question: 90, questions: vivaQuestions(input.concept_id, evidence) };
        storage.setItem(VIVA_KEY, JSON.stringify(session));
        return session;
      }),
    gradeViva: (input) =>
      wait(() => {
        const raw = storage.getItem(VIVA_KEY);
        const session = raw ? (JSON.parse(raw) as VivaSession) : null;
        if (!session || session.id !== input.session_id) throw new ApiError(404, "viva session not found");
        const answers = session.questions.map((q) => {
          const answer = input.answers.find((a) => a.question_id === q.id)?.answer ?? "";
          const verdict = gradeAnswer(answer);
          return {
            question_id: q.id,
            verdict,
            feedback:
              verdict === "correct" ? "Specific and tied to your code." : verdict === "partial" ? "On the right track; name the exact lines or the failure mode." : answer ? "Too short to show you wrote this code." : "No answer before the timer ran out.",
            follow_up: verdict === "partial" ? "Which line would you change first, and why?" : undefined,
          };
        });
        const points = answers.reduce((n, a) => n + (a.verdict === "correct" ? 2 : a.verdict === "partial" ? 1 : 0), 0);
        const max = answers.length * 2;
        const overall = Math.round((points / max) * 100);
        const passed = overall >= 60;
        const result: VivaResult = {
          passed,
          overall,
          points_awarded: passed && session.mode === "ranked" ? 30 : 0,
          criteria: [
            { id: "ownership", label: "Shows you wrote it", score: Math.min(5, Math.round((overall / 100) * 5 + 0.4)), max: 5, feedback: "Refers to your own lines and choices." },
            { id: "depth", label: "Understands trade-offs", score: Math.round((overall / 100) * 5), max: 5, feedback: "Names what breaks and why." },
            { id: "clarity", label: "Clear explanation", score: Math.min(5, Math.round((overall / 100) * 5 + 1)), max: 5, feedback: "Short, ordered, concrete." },
          ],
          answers,
          cooldown_until: session.mode === "ranked" && !passed ? new Date(Date.now() + 24 * 3_600_000).toISOString() : null,
        };
        return result;
      }),
  };
}
