import { act, renderHook } from "@testing-library/react";
import { useEventStream, type UseEventStreamOptions } from "../use-event-stream";

class FakeES {
  static instances: FakeES[] = [];
  readyState = 0;
  onopen: (() => void) | null = null;
  onerror: (() => void) | null = null;
  listeners: Record<string, ((e: Event) => void)[]> = {};
  closed = false;
  constructor(public url: string) {
    FakeES.instances.push(this);
  }
  addEventListener(name: string, fn: (e: Event) => void) {
    (this.listeners[name] ??= []).push(fn);
  }
  close() {
    this.readyState = 2;
    this.closed = true;
  }
  open() {
    this.readyState = 1;
    this.onopen?.();
  }
  emit(name: string, data: unknown) {
    this.listeners[name]?.forEach((fn) => fn({ data: typeof data === "string" ? data : JSON.stringify(data) } as MessageEvent));
  }
  fail(forGood: boolean) {
    this.readyState = forGood ? 2 : 0;
    this.onerror?.();
  }
}

interface Ev {
  id: number;
  type: string;
}
const last = () => FakeES.instances[FakeES.instances.length - 1]!;
const setup = (o: Partial<UseEventStreamOptions<Ev>> = {}) =>
  renderHook(() => useEventStream<Ev>({ url: "/stream", eventName: "scan_event", idOf: (e) => e.id, isTerminal: (e) => e.type === "end", ...o }));

beforeEach(() => {
  FakeES.instances = [];
  vi.stubGlobal("EventSource", FakeES);
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("useEventStream (SSE)", () => {
  it("goes connecting → live, collects events and dedupes by id", () => {
    const { result } = setup();
    expect(result.current.status).toBe("connecting");
    act(() => last().open());
    expect(result.current.status).toBe("live");
    act(() => {
      last().emit("scan_event", { id: 1, type: "a" });
      last().emit("scan_event", { id: 1, type: "a" });
      last().emit("scan_event", { id: 2, type: "b" });
    });
    expect(result.current.events.map((e) => e.id)).toEqual([1, 2]);
  });

  it("closes and reports done on a terminal event", () => {
    const { result } = setup();
    act(() => last().open());
    act(() => last().emit("scan_event", { id: 1, type: "end" }));
    expect(result.current.status).toBe("done");
    expect(last().closed).toBe(true);
  });

  it("skips events that fail to parse and records the error", () => {
    const onError = vi.fn();
    const { result } = setup({ parse: (raw) => { const v = JSON.parse(raw); if (!v.id) throw new Error("bad event"); return v; }, onError });
    act(() => last().open());
    act(() => {
      last().emit("scan_event", "not json");
      last().emit("scan_event", { id: 3, type: "ok" });
    });
    expect(result.current.events).toHaveLength(1);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(onError).toHaveBeenCalled();
  });

  it("keeps only the newest maxEvents", () => {
    const { result } = setup({ maxEvents: 2 });
    act(() => last().open());
    act(() => [1, 2, 3].forEach((id) => last().emit("scan_event", { id, type: "x" })));
    expect(result.current.events.map((e) => e.id)).toEqual([2, 3]);
  });

  it("lets the browser retry on a transient error (readyState CONNECTING)", () => {
    const { result } = setup();
    act(() => last().open());
    act(() => last().fail(false));
    expect(result.current.status).toBe("reconnecting");
    expect(FakeES.instances).toHaveLength(1);
  });

  it("reconnects itself with the last id after the connection is closed, then gives up", () => {
    const { result } = setup({ maxRetries: 2, retryDelayMs: 100 });
    act(() => last().open());
    act(() => last().emit("scan_event", { id: 7, type: "a" }));
    act(() => last().fail(true));
    expect(result.current.status).toBe("reconnecting");
    act(() => void vi.advanceTimersByTime(100));
    expect(FakeES.instances).toHaveLength(2);
    expect(new URL(last().url).searchParams.get("last_event_id")).toBe("7");
    act(() => last().fail(true));
    act(() => void vi.advanceTimersByTime(200));
    expect(FakeES.instances).toHaveLength(3);
    act(() => last().fail(true));
    expect(result.current.status).toBe("error");
    expect(result.current.error?.message).toMatch(/failed/);
    expect(result.current.events).toHaveLength(1);
  });

  it("is idle when disabled and closes on unmount", () => {
    const { result, rerender, unmount } = renderHook(({ enabled }) => useEventStream<Ev>({ url: "/s", enabled }), { initialProps: { enabled: false } });
    expect(result.current.status).toBe("idle");
    expect(FakeES.instances).toHaveLength(0);
    rerender({ enabled: true });
    expect(FakeES.instances).toHaveLength(1);
    unmount();
    expect(last().closed).toBe(true);
  });

  it("reconnect() opens a fresh connection", () => {
    const { result } = setup();
    act(() => last().open());
    act(() => result.current.reconnect());
    expect(FakeES.instances).toHaveLength(2);
    expect(FakeES.instances[0]!.closed).toBe(true);
  });
});

describe("useEventStream (mock)", () => {
  const fixtures: Ev[] = [{ id: 1, type: "a" }, { id: 2, type: "b" }, { id: 3, type: "end" }, { id: 4, type: "never" }];

  it("replays fixtures on a timer and finishes at the terminal event", () => {
    const { result } = renderHook(() => useEventStream<Ev>({ mock: { events: fixtures, intervalMs: 100 }, idOf: (e) => e.id, isTerminal: (e) => e.type === "end" }));
    expect(result.current.status).toBe("connecting");
    act(() => void vi.advanceTimersByTime(100));
    expect(result.current.status).toBe("live");
    expect(result.current.events).toHaveLength(1);
    act(() => void vi.advanceTimersByTime(300));
    expect(result.current.events.map((e) => e.id)).toEqual([1, 2, 3]);
    expect(result.current.status).toBe("done");
    expect(FakeES.instances).toHaveLength(0);
  });

  it("reconnect() restarts the replay from the beginning", () => {
    const { result } = renderHook(() => useEventStream<Ev>({ mock: { events: fixtures.slice(0, 2), intervalMs: 50 }, idOf: (e) => e.id }));
    act(() => void vi.advanceTimersByTime(200));
    expect(result.current.status).toBe("done");
    expect(result.current.events).toHaveLength(2);
    act(() => result.current.reconnect());
    expect(result.current.events).toHaveLength(0);
    expect(result.current.status).toBe("connecting");
    act(() => void vi.advanceTimersByTime(200));
    expect(result.current.events).toHaveLength(2);
  });
});
