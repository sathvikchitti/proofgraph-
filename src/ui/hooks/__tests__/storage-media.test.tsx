import { act, renderHook } from "@testing-library/react";
import { useLocalStorage } from "../use-local-storage";
import { useMediaQuery } from "../use-media-query";

beforeEach(() => localStorage.clear());

describe("useLocalStorage", () => {
  it("persists JSON, reads existing values and supports updater functions", () => {
    localStorage.setItem("k", JSON.stringify({ n: 1 }));
    const { result } = renderHook(() => useLocalStorage("k", { n: 0 }));
    expect(result.current[0]).toEqual({ n: 1 });
    act(() => result.current[1]((p) => ({ n: p.n + 1 })));
    expect(result.current[0]).toEqual({ n: 2 });
    expect(JSON.parse(localStorage.getItem("k")!)).toEqual({ n: 2 });
  });
  it("syncs two hook instances on the same key", () => {
    const a = renderHook(() => useLocalStorage("shared", 0));
    const b = renderHook(() => useLocalStorage("shared", 0));
    act(() => a.result.current[1](5));
    expect(b.result.current[0]).toBe(5);
  });
  it("syncs from other tabs via the storage event", () => {
    const { result } = renderHook(() => useLocalStorage("tab", "a"));
    act(() => {
      localStorage.setItem("tab", JSON.stringify("b"));
      window.dispatchEvent(new StorageEvent("storage", { key: "tab" }));
    });
    expect(result.current[0]).toBe("b");
  });
  it("falls back to the initial value on corrupt data and removes", () => {
    localStorage.setItem("bad", "{not json");
    const { result } = renderHook(() => useLocalStorage("bad", "init"));
    expect(result.current[0]).toBe("init");
    act(() => result.current[1]("x"));
    act(() => result.current[2]());
    expect(result.current[0]).toBe("init");
    expect(localStorage.getItem("bad")).toBeNull();
  });
  it("keeps working when storage throws", () => {
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const { result } = renderHook(() => useLocalStorage("blocked", 1));
    expect(() => act(() => result.current[1](2))).not.toThrow();
    spy.mockRestore();
  });
  it("is in-memory with a null key", () => {
    const { result } = renderHook(() => useLocalStorage<number>(null, 3));
    act(() => result.current[1](4));
    expect(result.current[0]).toBe(4);
    expect(localStorage.length).toBe(0);
  });
});

describe("useMediaQuery", () => {
  it("follows matchMedia changes", () => {
    let matches = false;
    const listeners = new Set<() => void>();
    const original = window.matchMedia;
    window.matchMedia = ((q: string) => ({ get matches() { return matches; }, media: q, addEventListener: (_: string, l: () => void) => listeners.add(l), removeEventListener: (_: string, l: () => void) => listeners.delete(l) })) as unknown as typeof window.matchMedia;
    const { result } = renderHook(() => useMediaQuery("(min-width: 1024px)"));
    expect(result.current).toBe(false);
    act(() => {
      matches = true;
      listeners.forEach((l) => l());
    });
    expect(result.current).toBe(true);
    window.matchMedia = original;
  });
});
