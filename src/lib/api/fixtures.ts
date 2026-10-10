/**
 * Fixtures for mock mode. Deliberately minimal: just enough for the foundational pages and the four role homes.
 * Domain vocabulary follows the backend: eight concepts; concept status is verified / weak / unverified;
 * Honesty and Readiness are 0-100.
 */
import type { Role } from "../config";
import type { HomeSummary, Notification, Settings, User } from "./schemas";

export const CONCEPTS = ["REST APIs", "Authentication", "Database Design", "Asynchronous Work", "Caching", "Automated Tests", "CI/CD", "Error Handling"] as const;

const iso = (minutesAgo: number, now: number) => new Date(now - minutesAgo * 60_000).toISOString();

export const USERS: Record<Role, User> = {
  student: { id: "u-student", name: "Priya Gupta", email: "priya@example.edu", role: "student", githubLogin: "priya-g" },
  college: { id: "u-college", name: "Dr. Anita Rao", email: "anita.rao@example.edu", role: "college", orgName: "Example Institute of Technology" },
  company: { id: "u-company", name: "Rahul Mehta", email: "rahul@acme.example", role: "company", orgName: "Acme Corp" },
  admin: { id: "u-admin", name: "Platform Admin", email: "admin@proofgraph.example", role: "admin" },
};

export function notificationsFor(role: Role, now = Date.now()): Notification[] {
  const byRole: Record<Role, Omit<Notification, "createdAt">[]> = {
    student: [
      { id: "n1", kind: "score", title: "Caching moved to Weak", body: "New code evidence was accepted in acme/api. Take the viva to make it Verified.", read: false, href: "/student/skill-graph" },
      { id: "n2", kind: "mission", title: "New mission: add caching to /products", body: "Estimated 45 minutes in your own repository.", read: false, href: "/student/missions" },
      { id: "n3", kind: "recruiter", title: "A recruiter viewed your Proof Profile", body: "Acme Corp, with your consent for company access.", read: true, href: "/student/privacy" },
      { id: "n4", kind: "system", title: "Scan finished", body: "2 changed files were rescanned in 41 seconds.", read: true },
    ],
    college: [
      { id: "n1", kind: "system", title: "Roster import complete", body: "412 students were added to batch CS-B.", read: false, href: "/college/roster" },
      { id: "n2", kind: "score", title: "Batch readiness rose to 61", body: "Up 3 points since last week.", read: false, href: "/college" },
      { id: "n3", kind: "recruiter", title: "Acme Corp requested a placement drive", body: "Backend SDE, 20 seats.", read: true, href: "/college/placement-drives" },
    ],
    company: [
      { id: "n1", kind: "recruiter", title: "3 new candidates match Backend SDE", body: "All three consented to company access.", read: false, href: "/company/talent-search" },
      { id: "n2", kind: "system", title: "Challenge submitted", body: "A candidate finished your repo-specific quiz.", read: true, href: "/company/custom-challenges" },
    ],
    admin: [
      { id: "n1", kind: "system", title: "Queue depth above 5 for 10 minutes", body: "Add a worker or wait for the backlog to clear.", read: false, href: "/admin/cluster-monitor" },
      { id: "n2", kind: "system", title: "3 appeals awaiting review", body: "Oldest is 2 days old.", read: true, href: "/admin/integrity-review" },
    ],
  };
  const ages = [8, 95, 60 * 26, 60 * 50];
  return byRole[role].map((n, i) => ({ ...n, createdAt: iso(ages[i] ?? 60 * 72, now) }));
}

export function homeFor(role: Role, now = Date.now()): HomeSummary {
  switch (role) {
    case "student":
      return {
        stats: [
          { id: "honesty", label: "Honesty", value: 78, unit: "/ 100", delta: 4.2, hint: "Claims backed by any evidence", trend: [60, 64, 66, 70, 72, 75, 78] },
          { id: "readiness", label: "Readiness", value: 64, unit: "/ 100", delta: -1.5, hint: "Backend SDE", trend: [55, 58, 61, 66, 65, 64, 64] },
          { id: "verified", label: "Verified concepts", value: 3, unit: `/ ${CONCEPTS.length}`, hint: "3 weak, 2 unverified" },
          { id: "missions", label: "Open missions", value: 2, hint: "Next: add caching to /products" },
        ],
        next: [
          { id: "viva", title: "Take the viva on Caching", description: "Three timed questions about cache.py move Caching from Weak to Verified.", href: "/student/viva", cta: "Start viva" },
          { id: "mission", title: "Finish the mission", description: "Add caching to /products in your own repository, then the quiz unlocks.", href: "/student/missions", cta: "Open mission" },
        ],
        activity: [
          { id: "a1", title: "Caching moved to Weak", description: "Evidence accepted in acme/api, cache.py lines 12-40.", at: iso(8, now), tone: "warning" },
          { id: "a2", title: "Automated Tests verified", description: "Viva passed, 3 of 3.", at: iso(60 * 26, now), tone: "success" },
          { id: "a3", title: "GitHub connected", at: iso(60 * 72, now) },
        ],
      };
    case "college":
      return {
        stats: [
          { id: "scanned", label: "Students scanned", value: 412, delta: 8.1 },
          { id: "readiness", label: "Batch readiness", value: 61, unit: "/ 100", delta: 3 },
          { id: "clusters", label: "Integrity clusters", value: 7, hint: "2 need review" },
          { id: "drives", label: "Placement drives", value: 3 },
        ],
        next: [
          { id: "gaps", title: "Plan a Caching workshop", description: "Caching is the weakest concept across CS-B: 71% of students have no accepted evidence.", href: "/college/curriculum-gaps", cta: "See gaps" },
          { id: "drive", title: "Answer Acme Corp", description: "Backend SDE drive request, 20 seats.", href: "/college/placement-drives", cta: "Review request" },
        ],
        activity: [
          { id: "a1", title: "Roster import complete", description: "412 students added to CS-B.", at: iso(30, now), tone: "success" },
          { id: "a2", title: "Integrity cluster found", description: "4 students with very similar repositories.", at: iso(60 * 20, now), tone: "warning" },
        ],
      };
    case "company":
      return {
        stats: [
          { id: "match", label: "Matching candidates", value: 38, delta: 12 },
          { id: "shortlist", label: "Shortlisted", value: 9 },
          { id: "interviews", label: "Interviews this week", value: 4 },
          { id: "challenges", label: "Open challenges", value: 2 },
        ],
        next: [
          { id: "search", title: "Review 3 new matches", description: "Verified on REST APIs, Authentication and Database Design.", href: "/company/talent-search", cta: "Open search" },
          { id: "role", title: "Add a role profile", description: "Paste a job description and it becomes required concepts.", href: "/company/role-profiles", cta: "New role profile" },
        ],
        activity: [
          { id: "a1", title: "Candidate finished your challenge", at: iso(50, now), tone: "success" },
          { id: "a2", title: "Shortlist updated", description: "2 candidates moved to interviewing.", at: iso(60 * 8, now) },
        ],
      };
    case "admin":
      return {
        stats: [
          { id: "tenants", label: "Tenants", value: 14 },
          { id: "queue", label: "Queue depth", value: 6, hint: "Wait time 38 s" },
          { id: "p95", label: "p95 scan time", value: 94, unit: "s", delta: -6 },
          { id: "appeals", label: "Open appeals", value: 3 },
        ],
        next: [
          { id: "appeals", title: "Review 3 appeals", description: "The oldest is 2 days old.", href: "/admin/integrity-review", cta: "Open queue" },
          { id: "workers", title: "Check worker capacity", description: "Queue depth has been above 5 for 10 minutes.", href: "/admin/cluster-monitor", cta: "Open monitor" },
        ],
        activity: [
          { id: "a1", title: "Ontology v12 published", at: iso(60 * 5, now), tone: "info" },
          { id: "a2", title: "Quiz question flagged", description: "Grading dispute on a Caching question.", at: iso(60 * 22, now), tone: "warning" },
        ],
      };
  }
}

export function defaultSettings(user: User): Settings {
  const handle = (user.githubLogin ?? user.email.split("@")[0] ?? "user").toLowerCase();
  return {
    profile: { displayName: user.name, handle, bio: "" },
    appearance: { theme: "system", density: "comfortable" },
    accounts: [
      { provider: "github", status: user.role === "student" ? "connected" : "not_connected", handle: user.githubLogin },
      { provider: "linkedin", status: "needs_attention" },
      { provider: "leetcode", status: "not_connected" },
      { provider: "resume", status: "not_connected" },
    ],
    consents: [
      { audience: "college", granted: true },
      { audience: "company", granted: false },
      { audience: "public", granted: false },
    ],
  };
}
