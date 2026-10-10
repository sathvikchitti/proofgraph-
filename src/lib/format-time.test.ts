import { timeAgo } from "./format-time";

const now = Date.parse("2026-10-10T12:00:00Z");
const ago = (ms: number) => new Date(now - ms).toISOString();

describe("timeAgo", () => {
  it("formats recent times relatively", () => {
    expect(timeAgo(ago(10_000), now)).toBe("just now");
    expect(timeAgo(ago(8 * 60_000), now)).toBe("8 minutes ago");
    expect(timeAgo(ago(3 * 3_600_000), now)).toBe("3 hours ago");
    expect(timeAgo(ago(26 * 3_600_000), now)).toBe("yesterday");
  });
  it("uses a date after a week and tolerates junk", () => {
    expect(timeAgo(ago(30 * 86_400_000), now)).toMatch(/2026/);
    expect(timeAgo("nonsense", now)).toBe("");
  });
});
