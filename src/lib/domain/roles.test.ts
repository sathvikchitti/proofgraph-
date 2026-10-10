import { biggestGaps, readiness, ROLE_TEMPLATES, weightsFromJobDescription } from "./roles";

const backend = ROLE_TEMPLATES[0]!.weights;

describe("role readiness", () => {
  it("matches the backend formula for Backend SDE: sum(score) / (70 x 8) x 100", () => {
    expect(readiness(backend, { caching: 70, rest_apis: 70 })).toBe(25);
    expect(readiness(backend, {})).toBe(0);
  });

  it("caps at 100 even with viva points above the evidence ceiling", () => {
    expect(readiness(backend, Object.fromEntries(Object.keys(backend).map((c) => [c, 100])))).toBe(100);
  });

  it("puts the most valuable missing concept first", () => {
    const gaps = biggestGaps({ ci_cd: 3, caching: 1 }, { ci_cd: 55, caching: 0 });
    expect(gaps.map((g) => g.concept)).toEqual(["caching", "ci_cd"]);
  });

  it("turns a job description into concept weights", () => {
    const w = weightsFromJobDescription("Build REST APIs with FastAPI and Postgres, add Redis caching and pytest tests.");
    expect(w.rest_apis).toBeGreaterThan(0);
    expect(w.database_design).toBeGreaterThan(0);
    expect(w.caching).toBeGreaterThan(0);
    expect(w.automated_tests).toBeGreaterThan(0);
    expect(w.authentication).toBeUndefined();
  });
});
