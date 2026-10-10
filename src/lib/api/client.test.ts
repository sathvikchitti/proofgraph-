import { liveApi } from "./client";
import { isApiError } from "./errors";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

afterEach(() => vi.unstubAllGlobals());

describe("live client", () => {
  it("calls the /api path with credentials and validates the response", async () => {
    const fetchMock = vi.fn().mockResolvedValue(json({ user: { id: "u", name: "A", email: "a@x", role: "student" } }));
    vi.stubGlobal("fetch", fetchMock);
    const session = await liveApi.getSession();
    expect(session?.user.role).toBe("student");
    expect(fetchMock).toHaveBeenCalledWith("/api/session", expect.objectContaining({ method: "GET", credentials: "include" }));
  });

  it("sends JSON bodies", async () => {
    const fetchMock = vi.fn().mockResolvedValue(json({ user: { id: "u", name: "A", email: "a@x", role: "college" } }));
    vi.stubGlobal("fetch", fetchMock);
    await liveApi.signIn({ role: "college", method: "email", email: "a@x" });
    const [, init] = fetchMock.mock.calls[0]!;
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({ role: "college", method: "email", email: "a@x" });
    expect(init.headers["Content-Type"]).toBe("application/json");
  });

  it("turns a FastAPI error into an ApiError", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json({ detail: "Not signed in" }, 401)));
    await expect(liveApi.listNotifications()).rejects.toSatisfy((e) => isApiError(e) && e.status === 401 && e.detail === "Not signed in");
  });

  it("rejects a response that does not match the schema", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json([{ id: 1 }])));
    await expect(liveApi.listNotifications()).rejects.toThrow();
  });

  it("accepts 204 for void endpoints", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
    await expect(liveApi.signOut()).resolves.toBeUndefined();
  });
});
