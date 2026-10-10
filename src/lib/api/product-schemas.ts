/**
 * Shapes for product features the Validater backend does not serve yet (viva, opportunities, LeetCode insights,
 * privacy and appeals). The live client calls provisional `/api/...` paths for them (see
 * `PRODUCT_PATHS` in client.ts); mock mode serves `product-fixtures.ts`. Concept ids match the backend's.
 */
import { z } from "zod";

const Audience = z.enum(["college", "company", "public"]);

export const OpportunitySchema = z.object({
  id: z.string(),
  company: z.string(),
  role: z.string(),
  kind: z.enum(["drive", "role"]),
  location: z.string(),
  deadline: z.string(),
  required: z.array(z.object({ concept_id: z.string(), min_score: z.number() })),
  min_readiness: z.number(),
  applied: z.boolean(),
});
export type Opportunity = z.infer<typeof OpportunitySchema>;

export const DsaInsightsSchema = z.object({
  username: z.string(),
  verified: z.boolean(),
  verify_code: z.string(),
  solved: z.object({ easy: z.number(), medium: z.number(), hard: z.number() }),
  contest_rating: z.number().nullable(),
  topics: z.array(z.object({ topic: z.string(), solved: z.number(), total: z.number() })),
  calendar: z.array(z.object({ date: z.string(), value: z.number() })),
  probes: z.array(z.object({ problem: z.string(), claimed: z.string(), measured: z.string(), passed: z.boolean() })),
  suggested: z.array(z.object({ title: z.string(), topic: z.string(), difficulty: z.enum(["Easy", "Medium", "Hard"]) })),
});
export type DsaInsights = z.infer<typeof DsaInsightsSchema>;

export const PrivacySchema = z.object({
  rows: z.array(z.object({ id: z.string(), label: z.string(), kind: z.enum(["profile", "concept", "repository"]), values: z.record(Audience, z.boolean()) })),
});
export type Privacy = z.infer<typeof PrivacySchema>;

export const AppealSchema = z.object({ id: z.string(), evidence_id: z.string(), reason: z.string(), status: z.enum(["submitted", "in_review", "upheld", "overturned"]), submitted_at: z.string() });
export type Appeal = z.infer<typeof AppealSchema>;

/** Every product dataset, by key. Read with `getProduct(key)`, replace with `saveProduct(key, value)`. */
export const PRODUCT_SCHEMAS = {
  opportunities: z.array(OpportunitySchema),
  dsa: DsaInsightsSchema,
  privacy: PrivacySchema,
  appeals: z.array(AppealSchema),
} as const;
export type ProductKey = keyof typeof PRODUCT_SCHEMAS;
export type ProductData = { [K in ProductKey]: z.infer<(typeof PRODUCT_SCHEMAS)[K]> };

/* ---------- Viva ---------- */

export const VivaQuestionSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  hint: z.string().optional(),
  /** The student's own code the question is about (a backend evidence id; its source comes from /evidence/{id}/source). */
  evidence_id: z.string().nullable(),
  file_path: z.string().optional(),
  line_start: z.number().optional(),
  line_end: z.number().optional(),
});
export type VivaQuestion = z.infer<typeof VivaQuestionSchema>;

export const VivaSessionSchema = z.object({
  id: z.string(),
  concept_id: z.string(),
  mode: z.enum(["practice", "ranked"]),
  seconds_per_question: z.number(),
  questions: z.array(VivaQuestionSchema),
});
export type VivaSession = z.infer<typeof VivaSessionSchema>;

export const VivaResultSchema = z.object({
  passed: z.boolean(),
  overall: z.number(),
  points_awarded: z.number(),
  criteria: z.array(z.object({ id: z.string(), label: z.string(), score: z.number(), max: z.number(), feedback: z.string() })),
  answers: z.array(z.object({ question_id: z.string(), verdict: z.enum(["correct", "incorrect", "partial"]), feedback: z.string(), follow_up: z.string().optional() })),
  cooldown_until: z.string().nullable(),
});
export type VivaResult = z.infer<typeof VivaResultSchema>;

export const VivaStartInputSchema = z.object({ concept_id: z.string(), mode: z.enum(["practice", "ranked"]), evidence_ids: z.array(z.string()) });
export type VivaStartInput = z.infer<typeof VivaStartInputSchema>;
export interface VivaAnswerInput {
  session_id: string;
  answers: { question_id: string; answer: string }[];
}
