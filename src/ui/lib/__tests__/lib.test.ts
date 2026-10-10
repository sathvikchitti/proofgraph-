import { cn } from "../cn";
import { formatBytes, formatDuration, formatPercent, formatRelativeTime, initials, truncateMiddle } from "../format";
import { AppError, normalizeError } from "../errors";
import { toneColor } from "../tone";

describe("cn", () => {
  it("merges conflicting utilities including custom radius tokens", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("rounded-control", "rounded-pill")).toBe("rounded-pill");
    expect(cn("text-sm", "text-fg-muted")).toBe("text-sm text-fg-muted");
  });
});

describe("format", () => {
  it("formats bytes, durations, percentages, initials", () => {
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatDuration(83_000)).toBe("1:23");
    expect(formatDuration(3_725_000)).toBe("1:02:05");
    expect(formatPercent(0.425, { digits: 1 })).toBe("42.5%");
    expect(initials("Asha Rao")).toBe("AR");
    expect(truncateMiddle("abcdefghijklmnopqrstuvwxyz", 9)).toBe("abcd…wxyz");
  });
  it("formats relative time", () => {
    expect(formatRelativeTime(0, 3_600_000)).toBe("1 hour ago");
  });
});

describe("normalizeError", () => {
  it("understands strings, Error, AppError and {detail}", () => {
    expect(normalizeError("x").title).toBe("x");
    expect(normalizeError(new Error("boom")).title).toBe("boom");
    expect(normalizeError(new AppError("nope", { status: 403 })).status).toBe(403);
    expect(normalizeError({ status: 404, detail: "Not found" })).toEqual({ title: "Not found", status: 404 });
  });
  it("maps FastAPI validation arrays to fields", () => {
    const e = normalizeError({ detail: [{ loc: ["body", "email"], msg: "invalid email" }] });
    expect(e.fields).toEqual({ email: "invalid email" });
    expect(e.title).toBe("invalid email");
  });
  it("falls back", () => {
    expect(normalizeError(undefined, "Oops").title).toBe("Oops");
  });
});

describe("tone helpers", () => {
  it("maps tones to token vars", () => {
    expect(toneColor("success")).toBe("var(--success)");
    expect(toneColor("danger", "subtle")).toBe("var(--danger-subtle)");
  });
});
