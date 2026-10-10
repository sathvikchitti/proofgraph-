import { act, renderHook } from "@testing-library/react";
import { useControllableState } from "../use-controllable-state";
import { useDebounce } from "../use-debounce";
import { matchesAccept } from "../use-file-drop";
import { useCopy } from "../use-copy";

describe("useControllableState", () => {
  it("is uncontrolled by default and notifies", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllableState({ defaultValue: 1, onChange }));
    act(() => result.current[1](2));
    expect(result.current[0]).toBe(2);
    expect(onChange).toHaveBeenCalledWith(2);
  });
  it("defers to `value` when controlled", () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(({ v }) => useControllableState({ value: v, defaultValue: 0, onChange }), { initialProps: { v: 5 } });
    act(() => result.current[1](9));
    expect(result.current[0]).toBe(5);
    expect(onChange).toHaveBeenCalledWith(9);
    rerender({ v: 9 });
    expect(result.current[0]).toBe(9);
  });
  it("skips no-op updates and supports updater functions", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllableState({ defaultValue: 1, onChange }));
    act(() => result.current[1](1));
    expect(onChange).not.toHaveBeenCalled();
    act(() => result.current[1]((p) => p + 1));
    expect(result.current[0]).toBe(2);
  });
});

describe("useDebounce", () => {
  it("emits the latest value after the delay", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 100), { initialProps: { v: "a" } });
    rerender({ v: "b" });
    expect(result.current).toBe("a");
    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe("b");
    vi.useRealTimers();
  });
});

describe("matchesAccept", () => {
  const f = (name: string, type: string) => new File(["x"], name, { type });
  it("matches extensions, exact MIME types and wildcards", () => {
    expect(matchesAccept(f("a.PDF", ""), [".pdf"])).toBe(true);
    expect(matchesAccept(f("a.png", "image/png"), ["image/*"])).toBe(true);
    expect(matchesAccept(f("a.png", "image/png"), ["application/pdf"])).toBe(false);
    expect(matchesAccept(f("a.txt", "text/plain"))).toBe(true);
  });
});

describe("useCopy", () => {
  it("sets copied then resets", async () => {
    vi.useFakeTimers();
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
    const { result } = renderHook(() => useCopy({ resetMs: 500 }));
    await act(async () => {
      await result.current.copy("hi");
    });
    expect(result.current.copied).toBe(true);
    act(() => vi.advanceTimersByTime(500));
    expect(result.current.copied).toBe(false);
    vi.useRealTimers();
  });
  it("reports failure", async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockRejectedValue(new Error("denied")) } });
    const { result } = renderHook(() => useCopy());
    let ok = true;
    await act(async () => {
      ok = await result.current.copy("x");
    });
    expect(ok).toBe(false);
    expect(result.current.error?.message).toBe("denied");
  });
});
