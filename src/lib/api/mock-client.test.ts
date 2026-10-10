import { ROLES } from "../config";
import { CONCEPTS } from "./fixtures";
import { createMockApi, type MockStorage } from "./mock-client";
import { HomeSummarySchema, NotificationListSchema, SettingsSchema } from "./schemas";

function memoryStorage(): MockStorage {
  const m = new Map<string, string>();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k) };
}
const make = (storage = memoryStorage()) => createMockApi({ delay: () => 0, storage });

describe("mock API", () => {
  it("starts signed out and signs in with a role", async () => {
    const api = make();
    expect(await api.getSession()).toBeNull();
    const session = await api.signIn({ role: "college", method: "email", email: "me@example.edu" });
    expect(session?.user).toMatchObject({ role: "college", email: "me@example.edu" });
    expect((await api.getSession())?.user.role).toBe("college");
  });

  it("keeps the session across clients that share storage, until sign out", async () => {
    const storage = memoryStorage();
    await make(storage).signIn({ role: "student", method: "github" });
    const again = make(storage);
    expect((await again.getSession())?.user.role).toBe("student");
    await again.signOut();
    expect(await again.getSession()).toBeNull();
  });

  it("rejects protected calls when signed out with a 401", async () => {
    await expect(make().listNotifications()).rejects.toMatchObject({ status: 401, detail: "Not signed in" });
  });

  it("switches role", async () => {
    const api = make();
    await api.signIn({ role: "student", method: "github" });
    expect((await api.switchRole("admin"))?.user.role).toBe("admin");
  });

  it("returns schema-valid home data for every role", async () => {
    const api = make();
    await api.signIn({ role: "admin", method: "email" });
    for (const role of ROLES) expect(HomeSummarySchema.safeParse(await api.getHome(role)).success).toBe(true);
  });

  it("keeps Honesty and Readiness on a 0-100 scale and uses the eight real concepts", async () => {
    const api = make();
    await api.signIn({ role: "student", method: "github" });
    const home = await api.getHome("student");
    for (const id of ["honesty", "readiness"]) {
      const stat = home.stats.find((s) => s.id === id)!;
      expect(stat.value).toBeGreaterThanOrEqual(0);
      expect(stat.value).toBeLessThanOrEqual(100);
    }
    expect(CONCEPTS).toEqual(["REST APIs", "Authentication", "Database Design", "Asynchronous Work", "Caching", "Automated Tests", "CI/CD", "Error Handling"]);
  });

  it("marks notifications read, one and all, and remembers it", async () => {
    const storage = memoryStorage();
    const api = make(storage);
    await api.signIn({ role: "student", method: "github" });
    const before = NotificationListSchema.parse(await api.listNotifications());
    const unread = before.filter((n) => !n.read);
    expect(unread.length).toBeGreaterThan(1);
    await api.markNotificationRead(unread[0]!.id);
    expect((await make(storage).listNotifications()).filter((n) => !n.read)).toHaveLength(unread.length - 1);
    await api.markAllNotificationsRead();
    expect((await api.listNotifications()).every((n) => n.read)).toBe(true);
  });

  it("merges settings updates per section", async () => {
    const api = make();
    await api.signIn({ role: "student", method: "github" });
    const before = SettingsSchema.parse(await api.getSettings());
    const after = await api.updateSettings({ appearance: { theme: "dark", density: "compact" } });
    expect(after.appearance).toEqual({ theme: "dark", density: "compact" });
    expect(after.profile).toEqual(before.profile);
    expect((await api.getSettings()).appearance.theme).toBe("dark");
  });

  it("waits for the configured delay", async () => {
    vi.useFakeTimers();
    const api = createMockApi({ delay: () => 500, storage: memoryStorage() });
    let settled = false;
    void api.getSession().then(() => (settled = true));
    await vi.advanceTimersByTimeAsync(499);
    expect(settled).toBe(false);
    await vi.advanceTimersByTimeAsync(2);
    expect(settled).toBe(true);
    vi.useRealTimers();
  });
});
