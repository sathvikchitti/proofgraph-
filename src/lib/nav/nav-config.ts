/**
 * Navigation per role. The structure is final: every page the product plan lists for a role is already here,
 * and each one without a page yet points at the shared "Coming soon" template. To add a core page later, build
 * `src/app/(app)/[role]/<slug>/page.tsx` (it wins over the catch-all) and remove nothing here.
 */
import {
  Activity, BellRing, BookMarked, BookOpenCheck, Building, Building2, CalendarCheck, CircleHelp, Code2, CreditCard, Crosshair, FileBarChart,
  FileText, FlaskConical, FolderGit2, GitBranch, GraduationCap, LayoutDashboard, ListChecks, Lock, MessagesSquare, Mic, Network, Radar, Rocket, ScrollText,
  Search, Server, Settings, ShieldAlert, ShieldCheck, Star, Target, ToggleRight, TrendingUp, Upload, Users, ClipboardList,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "../config";

export interface NavEntry {
  /** Unique within the role; also the active-item id. */
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  /** What the page will show: used by the Coming soon template. */
  description: string;
}

export interface NavGroup {
  /** Section label in the sidebar; omit for the unlabelled top group. */
  label?: string;
  items: NavEntry[];
}

const account: NavGroup = {
  label: "Account",
  items: [
    { id: "notifications", label: "Notifications", href: "/notifications", icon: BellRing, description: "Score changes, new missions and recruiter views." },
    { id: "settings", label: "Settings", href: "/settings", icon: Settings, description: "Profile, connected accounts, appearance and privacy." },
  ],
};

const entry = (role: Role, slug: string, label: string, icon: LucideIcon, description: string): NavEntry => ({ id: slug, label, href: `/${role}/${slug}`, icon, description });

export const NAV: Record<Role, NavGroup[]> = {
  student: [
    { items: [{ id: "home", label: "Home", href: "/student", icon: LayoutDashboard, description: "Honesty and Readiness scores, your next best mission and recent changes." }] },
    {
      label: "Prove",
      items: [
        entry("student", "skill-graph", "Skill graph", Network, "An interactive concept map coloured Verified, Weak or Unverified. Click a node for its evidence trail."),
        entry("student", "claims", "Claims", ListChecks, "Each claim with its linked commits, files and lines, or the exact evidence that is missing."),
        entry("student", "repositories", "Repositories", FolderGit2, "Connect GitHub, choose the repository that is scanned, and see the watcher's status."),
        entry("student", "scans", "Live scan", Radar, "The agent trace streaming as a scan runs, with file and cache counts and score changes."),
        entry("student", "missions", "Missions", Target, "Small tasks in your own repository that turn a gap into evidence. List, detail and submission status."),
        entry("student", "viva", "Viva", Mic, "A timed oral exam on your own code. Practice attempts do not count; ranked attempts have a cooldown."),
        entry("student", "integrity", "Integrity and appeals", ShieldAlert, "Why a repository was flagged and a form to appeal."),
      ],
    },
    {
      label: "Present",
      items: [
        entry("student", "resume-studio", "Resume studio", FileText, "Flags resume lines you cannot prove yet and writes bullets backed by evidence links."),
        entry("student", "repo-readiness", "Repo readiness", GitBranch, "A fix list per repository: README, tests, CI and structure."),
        entry("student", "privacy", "Privacy and consent", Lock, "Who can see what (college, recruiters, public), revocable at any time."),
      ],
    },
    {
      label: "Grow",
      items: [
        entry("student", "role-fit", "Role fit", Crosshair, "Readiness per target role, plus an instant match for a pasted job description."),
        entry("student", "interview-prep", "Interview prep", MessagesSquare, "Questions an interviewer would ask about your own projects, with feedback."),
        entry("student", "dsa-insights", "DSA insights", Code2, "A LeetCode topic heatmap, complexity-probe results and suggested problem sets."),
        entry("student", "growth-timeline", "Growth timeline", TrendingUp, "Score history, newly proven skills and streaks."),
        entry("student", "opportunities", "Opportunities", Rocket, "Drives and roles you qualify for, and your applications."),
      ],
    },
    account,
  ],
  college: [
    { items: [{ id: "home", label: "Batch dashboard", href: "/college", icon: LayoutDashboard, description: "Readiness by department, year and section." }] },
    {
      label: "Insights",
      items: [
        entry("college", "student-directory", "Student directory", Users, "Search and drill into individual profiles."),
        entry("college", "curriculum-gaps", "Curriculum gaps", BookOpenCheck, "Concepts the batch lacks, with workshop suggestions."),
        entry("college", "integrity-clusters", "Integrity clusters", ShieldAlert, "Groups of students with suspiciously similar repositories."),
        entry("college", "reports", "Reports", FileBarChart, "Placement-readiness and accreditation exports."),
      ],
    },
    {
      label: "Placements",
      items: [
        entry("college", "assign-missions", "Assign missions", Target, "Push missions to a class or section."),
        entry("college", "placement-drives", "Placement drives", CalendarCheck, "Company requirements in, an auto-generated eligible list out."),
        entry("college", "company-partnerships", "Company partnerships", Building2, "Drive requests and invitations."),
      ],
    },
    {
      label: "Administration",
      items: [
        entry("college", "roster", "Roster", Upload, "CSV import and invites."),
        entry("college", "infrastructure", "Infrastructure", Server, "Worker usage, queue and scan times (on-prem deployments only)."),
      ],
    },
    account,
  ],
  company: [
    { items: [{ id: "home", label: "Overview", href: "/company", icon: LayoutDashboard, description: "Matches, shortlist progress and open challenges." }] },
    {
      label: "Hiring",
      items: [
        entry("company", "talent-search", "Talent search", Search, "Filter by verified concepts, college, batch and readiness."),
        entry("company", "role-profiles", "Role profiles", ClipboardList, "Paste a job description and it becomes required concepts."),
        entry("company", "shortlist", "Shortlist pipeline", Star, "Saved, contacted, interviewing and offered."),
        entry("company", "custom-challenges", "Custom challenges", FlaskConical, "Send a repo-specific quiz or mission to a candidate."),
      ],
    },
    {
      label: "Campus",
      items: [
        entry("company", "campus-connect", "Campus connect", GraduationCap, "Request drives with partner colleges."),
        entry("company", "analytics-billing", "Analytics and billing", CreditCard, "Usage, hires and invoices."),
      ],
    },
    account,
  ],
  admin: [
    { items: [{ id: "home", label: "Platform overview", href: "/admin", icon: LayoutDashboard, description: "Tenants, queue health and open reviews." }] },
    {
      label: "Platform",
      items: [
        entry("admin", "tenants", "Tenants", Building, "Colleges, companies and plans."),
        entry("admin", "ontology", "Ontology and rules", BookMarked, "Concepts, ast-grep rules and role templates, with versions."),
        entry("admin", "cluster-monitor", "Cluster monitor", Activity, "Workers, queue depth, tokens and LLM provider failover."),
      ],
    },
    {
      label: "Review",
      items: [
        entry("admin", "integrity-review", "Integrity review", ShieldCheck, "The flag queue and appeals."),
        entry("admin", "quiz-quality", "Quiz quality", CircleHelp, "Flagged questions and grading disputes."),
        entry("admin", "audit", "Audit and data requests", ScrollText, "The audit log, consent records and deletion requests."),
        entry("admin", "flags-billing", "Feature flags and billing", ToggleRight, "Rollouts and plan management."),
      ],
    },
    account,
  ],
};

/**
 * Pages that have their own route under `app/(app)/[role]/<slug>`. The catch-all only renders "Coming soon" for
 * entries not listed here (Next would otherwise see two routes for one path).
 */
export const BUILT_PAGES = new Set<string>([
  ...["skill-graph", "claims", "repositories", "scans", "missions", "viva", "integrity", "resume-studio", "repo-readiness", "privacy", "role-fit", "interview-prep", "dsa-insights", "growth-timeline", "opportunities"].map((s) => `/student/${s}`),
]);

export function homeHref(role: Role): string {
  return `/${role}`;
}

export function navEntries(role: Role): NavEntry[] {
  return NAV[role].flatMap((g) => g.items);
}

/** Resolves `/<role>/<slug...>` to its entry, or undefined when the product plan has no such page. */
export function findNavEntry(role: Role, slug: readonly string[]): NavEntry | undefined {
  const href = `/${role}/${slug.join("/")}`;
  return navEntries(role).find((e) => e.href === href);
}

/** The entry whose href is the longest prefix of the pathname (so /student/missions/42 keeps Missions active). */
export function activeEntry(role: Role, pathname: string): NavEntry | undefined {
  const matches = navEntries(role).filter((e) => pathname === e.href || pathname.startsWith(`${e.href}/`));
  return matches.sort((a, b) => b.href.length - a.href.length)[0];
}

