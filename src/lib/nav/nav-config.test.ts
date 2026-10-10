import { ROLES } from "../config";
import { activeEntry, findNavEntry, homeHref, NAV, navEntries } from "./nav-config";

describe("nav config", () => {
  it.each(ROLES)("%s: ids and hrefs are unique and the first entry is the role home", (role) => {
    const entries = navEntries(role);
    expect(new Set(entries.map((e) => e.id)).size).toBe(entries.length);
    expect(new Set(entries.map((e) => e.href)).size).toBe(entries.length);
    expect(NAV[role][0]!.items[0]).toMatchObject({ id: "home", href: homeHref(role) });
  });

  it.each(ROLES)("%s: every entry is either under its role or a shared account page, and says what it will show", (role) => {
    for (const e of navEntries(role)) {
      expect(e.href.startsWith(`/${role}`) || ["/notifications", "/settings"].includes(e.href)).toBe(true);
      expect(e.description.length).toBeGreaterThan(10);
    }
  });

  it("covers the planned pages of the product plan", () => {
    const labels = (r: (typeof ROLES)[number]) => navEntries(r).map((e) => e.label);
    expect(labels("student")).toEqual(expect.arrayContaining(["Skill graph", "Claims", "Missions", "Viva", "Interview prep", "Resume studio", "Role fit", "DSA insights", "Repo readiness", "Growth timeline", "Opportunities", "Privacy and consent", "Integrity and appeals"]));
    expect(labels("college")).toEqual(expect.arrayContaining(["Batch dashboard", "Student directory", "Curriculum gaps", "Assign missions", "Integrity clusters", "Placement drives", "Company partnerships", "Reports", "Roster", "Infrastructure"]));
    expect(labels("company")).toEqual(expect.arrayContaining(["Talent search", "Role profiles", "Shortlist pipeline", "Custom challenges", "Campus connect", "Analytics and billing"]));
    expect(labels("admin")).toEqual(expect.arrayContaining(["Tenants", "Ontology and rules", "Cluster monitor", "Integrity review", "Quiz quality", "Audit and data requests", "Feature flags and billing"]));
  });

  it("resolves a slug to its entry and rejects unknown slugs", () => {
    expect(findNavEntry("student", ["skill-graph"])?.label).toBe("Skill graph");
    expect(findNavEntry("student", ["tenants"])).toBeUndefined();
    expect(findNavEntry("admin", ["tenants"])?.label).toBe("Tenants");
  });

  it("keeps a parent item active on a nested path and prefers the longest match", () => {
    expect(activeEntry("student", "/student/missions/42")?.id).toBe("missions");
    expect(activeEntry("student", "/student")?.id).toBe("home");
    expect(activeEntry("student", "/notifications")?.id).toBe("notifications");
    expect(activeEntry("student", "/nowhere")).toBeUndefined();
  });
});
