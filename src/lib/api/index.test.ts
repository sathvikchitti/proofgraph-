import { resolveApiMode } from "../config";
import { liveApi } from "./client";
import { createApi } from "./index";

describe("API mode switch", () => {
  it("resolves the mode from NEXT_PUBLIC_API_MODE, defaulting to mock", () => {
    expect(resolveApiMode("live")).toBe("live");
    expect(resolveApiMode("mock")).toBe("mock");
    expect(resolveApiMode(undefined)).toBe("mock");
    expect(resolveApiMode("anything-else")).toBe("mock");
  });

  it("returns the live client in live mode and a fixture client otherwise", () => {
    expect(createApi("live")).toBe(liveApi);
    const mock = createApi("mock");
    expect(mock).not.toBe(liveApi);
    expect(Object.keys(mock).sort()).toEqual(Object.keys(liveApi).sort());
  });

  it("never touches the network in mock mode", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    vi.useFakeTimers();
    const pending = createApi("mock").getSession();
    await vi.runAllTimersAsync();
    expect(await pending).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });
});
