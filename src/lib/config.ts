/** Product identity and app-wide switches. Everything user-facing reads the name from here, so a rename is one line. */
export const PRODUCT_NAME = "ProofGraph";

export const ROLES = ["student", "college", "company", "admin"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABEL: Record<Role, string> = {
  student: "Student",
  college: "College admin",
  company: "Recruiter",
  admin: "Platform admin",
};

/** Short names for tight controls (segmented switches). */
export const ROLE_SHORT: Record<Role, string> = { student: "Student", college: "College", company: "Recruiter", admin: "Admin" };

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

/**
 * DEMO CONVENIENCE: lets one signed-in user jump between the four role workspaces from the sidebar.
 * Turn it off for any real deployment: the role must then come from the session only.
 */
export const FEATURES = { demoWorkspaceSwitcher: true } as const;

export type ApiMode = "mock" | "live";

/** NEXT_PUBLIC_API_MODE=live selects the real backend; anything else (or unset) is mock. */
export function resolveApiMode(value: string | undefined): ApiMode {
  return value === "live" ? "live" : "mock";
}

export const API_MODE: ApiMode = resolveApiMode(process.env.NEXT_PUBLIC_API_MODE);
