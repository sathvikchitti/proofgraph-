import { act, renderHook } from "@testing-library/react";
import { useCountdown } from "../use-countdown";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("useCountdown", () => {
  it("counts down on wall-clock time and expires once", () => {
    const onExpire = vi.fn();
    const { result } = renderHook(() => useCountdown({ durationMs: 3000, tickMs: 100, onExpire }));
    expect(result.current.status).toBe("running");
    act(() => void vi.advanceTimersByTime(1000));
    expect(result.current.remainingMs).toBeLessThanOrEqual(2100);
    expect(result.current.remainingMs).toBeGreaterThan(1800);
    act(() => void vi.advanceTimersByTime(2500));
    expect(result.current.status).toBe("expired");
    expect(result.current.remainingMs).toBe(0);
    expect(onExpire).toHaveBeenCalledTimes(1);
  });
  it("pauses and resumes without losing time", () => {
    const { result } = renderHook(() => useCountdown({ durationMs: 10_000, tickMs: 100 }));
    act(() => void vi.advanceTimersByTime(2000));
    act(() => result.current.pause());
    const frozen = result.current.remainingMs;
    expect(result.current.status).toBe("paused");
    act(() => void vi.advanceTimersByTime(5000));
    expect(result.current.remainingMs).toBe(frozen);
    act(() => result.current.resume());
    act(() => void vi.advanceTimersByTime(1000));
    expect(result.current.remainingMs).toBeLessThan(frozen);
    expect(result.current.remainingMs).toBeGreaterThan(frozen - 1300);
  });
  it("reports warning and danger phases", () => {
    const { result } = renderHook(() => useCountdown({ durationMs: 10_000, tickMs: 100, warnAtMs: 6000, dangerAtMs: 3000 }));
    expect(result.current.phase).toBe("normal");
    act(() => void vi.advanceTimersByTime(5000));
    expect(result.current.phase).toBe("warning");
    act(() => void vi.advanceTimersByTime(3000));
    expect(result.current.phase).toBe("danger");
  });
  it("fires each milestone once, skipping marks above the duration", () => {
    const onMilestone = vi.fn();
    renderHook(() => useCountdown({ durationMs: 5000, tickMs: 100, milestones: [60_000, 3000, 1000], onMilestone }));
    // the 60 s mark is above the duration so it never fires
    act(() => void vi.advanceTimersByTime(5500));
    expect(onMilestone.mock.calls.map((c) => c[0])).toEqual([3000, 1000]);
  });
  it("restart and reset", () => {
    const { result } = renderHook(() => useCountdown({ durationMs: 2000, tickMs: 100 }));
    act(() => void vi.advanceTimersByTime(2500));
    expect(result.current.status).toBe("expired");
    act(() => result.current.restart());
    expect(result.current.status).toBe("running");
    expect(result.current.remainingMs).toBe(2000);
    act(() => result.current.reset(5000));
    expect(result.current.status).toBe("idle");
    expect(result.current.remainingMs).toBe(5000);
  });
  it("does not start without autoStart", () => {
    const { result } = renderHook(() => useCountdown({ durationMs: 2000, autoStart: false }));
    act(() => void vi.advanceTimersByTime(1000));
    expect(result.current.status).toBe("idle");
    act(() => result.current.start());
    expect(result.current.status).toBe("running");
  });
});
