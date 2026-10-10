/** Shapes the foundational pages need: session, user, notifications, settings and role-home summaries. Core domain schemas come later. */
import { z } from "zod";
import { ROLES } from "../config";

export const RoleSchema = z.enum(ROLES);

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: RoleSchema,
  /** College or company name; absent for students and platform admins. */
  orgName: z.string().optional(),
  githubLogin: z.string().optional(),
});
export type User = z.infer<typeof UserSchema>;

/** `null` means signed out. */
export const SessionSchema = z.object({ user: UserSchema }).nullable();
export type Session = z.infer<typeof SessionSchema>;

export const SignInInputSchema = z.object({
  role: RoleSchema,
  method: z.enum(["github", "email"]),
  email: z.string().optional(),
});
export type SignInInput = z.infer<typeof SignInInputSchema>;

export const NotificationSchema = z.object({
  id: z.string(),
  kind: z.enum(["score", "mission", "recruiter", "system"]),
  title: z.string(),
  body: z.string(),
  /** ISO 8601. */
  createdAt: z.string(),
  read: z.boolean(),
  href: z.string().optional(),
});
export type Notification = z.infer<typeof NotificationSchema>;
export const NotificationListSchema = z.array(NotificationSchema);

export const ConnectedAccountSchema = z.object({
  provider: z.enum(["github", "linkedin", "leetcode", "resume"]),
  status: z.enum(["connected", "not_connected", "needs_attention"]),
  handle: z.string().optional(),
});
export type ConnectedAccount = z.infer<typeof ConnectedAccountSchema>;

export const ConsentSchema = z.object({
  audience: z.enum(["college", "company", "public"]),
  granted: z.boolean(),
});
export type Consent = z.infer<typeof ConsentSchema>;

export const SettingsSchema = z.object({
  profile: z.object({ displayName: z.string(), handle: z.string(), bio: z.string() }),
  appearance: z.object({ theme: z.enum(["system", "light", "dark"]), density: z.enum(["comfortable", "compact"]) }),
  accounts: z.array(ConnectedAccountSchema),
  consents: z.array(ConsentSchema),
});
export type Settings = z.infer<typeof SettingsSchema>;

/** Only the changed top-level sections need to be sent. */
export const SettingsPatchSchema = SettingsSchema.partial();
export type SettingsPatch = z.infer<typeof SettingsPatchSchema>;

export const ToneSchema = z.enum(["neutral", "info", "success", "warning", "danger"]);

/** What every role home shows: a KPI row, what to do next, and recent activity. */
export const HomeSummarySchema = z.object({
  stats: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      value: z.number(),
      /** Appended after the value, e.g. "/ 100". */
      unit: z.string().optional(),
      /** Percent change versus the previous period. */
      delta: z.number().optional(),
      hint: z.string().optional(),
      trend: z.array(z.number()).optional(),
    }),
  ),
  next: z.array(z.object({ id: z.string(), title: z.string(), description: z.string(), href: z.string().optional(), cta: z.string().optional() })),
  activity: z.array(z.object({ id: z.string(), title: z.string(), description: z.string().optional(), at: z.string(), tone: ToneSchema.optional() })),
});
export type HomeSummary = z.infer<typeof HomeSummarySchema>;
