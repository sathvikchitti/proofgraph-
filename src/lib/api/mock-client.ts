/**
 * The mock API client: same surface as the live client, fixture data, a 300-800 ms delay, state kept in the browser
 * (session, read notifications, settings) so a refresh keeps you signed in. Nothing here talks to a network.
 * The Validater endpoints come from `mock-evidence.ts` (the backend's exported contracts); product features
 * the backend does not serve yet come from `mock-product.ts`.
 */
import { z } from "zod";
import type { Role } from "../config";
import { ApiError } from "./errors";
import { defaultSettings, homeFor, notificationsFor, USERS } from "./fixtures";
import { HomeSummarySchema, NotificationListSchema, SessionSchema, SettingsSchema, type Session, type Settings } from "./schemas";
import { createMockEvidenceApi } from "./mock-evidence";
import { createMockProductApi } from "./mock-product";
import type { Api } from "./types";

export interface MockStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface MockOptions {
  /** Milliseconds to wait before every response. */
  delay?: () => number;
  storage?: MockStorage;
}

const KEYS = { session: "pg.mock.session", read: "pg.mock.read", settings: "pg.mock.settings" } as const;

const randomDelay = () => 300 + Math.random() * 500;

function defaultStorage(): MockStorage {
  try {
    if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
  } catch {
    /* blocked storage: fall through to memory */
  }
  const memory = new Map<string, string>();
  return { getItem: (k) => memory.get(k) ?? null, setItem: (k, v) => void memory.set(k, v), removeItem: (k) => void memory.delete(k) };
}

function readJson<S extends z.ZodType>(storage: MockStorage, key: string, schema: S): z.infer<S> | null {
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    const parsed = schema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function createMockApi({ delay = randomDelay, storage = defaultStorage() }: MockOptions = {}): Api {
  const wait = <T,>(value: () => T | Promise<T>): Promise<T> =>
    new Promise<T>((resolve, reject) =>
      setTimeout(() => {
        try {
          resolve(value());
        } catch (e) {
          reject(e);
        }
      }, delay()),
    );

  const session = (): Session => readJson(storage, KEYS.session, SessionSchema);
  const requireSession = () => {
    const s = session();
    if (!s) throw new ApiError(401, "Not signed in");
    return s;
  };
  const readIds = () => new Set(readJson(storage, KEYS.read, z.array(z.string())) ?? []);
  const settingsKey = (role: Role) => `${KEYS.settings}.${role}`;

  const issue = (role: Role, email?: string): Session => {
    const base = USERS[role];
    const s: Session = { user: email ? { ...base, email } : base };
    storage.setItem(KEYS.session, JSON.stringify(s));
    return s;
  };

  return {
    ...createMockEvidenceApi(wait, storage),
    ...createMockProductApi(wait, storage),
    getSession: () => wait(session),
    signIn: ({ role, email }) => wait(() => issue(role, email?.trim() || undefined)),
    signOut: () =>
      wait(() => {
        storage.removeItem(KEYS.session);
      }),
    switchRole: (role) =>
      wait(() => {
        requireSession();
        return issue(role);
      }),
    listNotifications: () =>
      wait(() => {
        const { user } = requireSession();
        const read = readIds();
        return NotificationListSchema.parse(notificationsFor(user.role).map((n) => ({ ...n, read: n.read || read.has(`${user.role}:${n.id}`) })));
      }),
    markNotificationRead: (id) =>
      wait(() => {
        const { user } = requireSession();
        const read = readIds().add(`${user.role}:${id}`);
        storage.setItem(KEYS.read, JSON.stringify([...read]));
      }),
    markAllNotificationsRead: () =>
      wait(() => {
        const { user } = requireSession();
        const read = readIds();
        for (const n of notificationsFor(user.role)) read.add(`${user.role}:${n.id}`);
        storage.setItem(KEYS.read, JSON.stringify([...read]));
      }),
    getSettings: () =>
      wait(() => {
        const { user } = requireSession();
        return readJson(storage, settingsKey(user.role), SettingsSchema) ?? defaultSettings(user);
      }),
    updateSettings: (patch) =>
      wait(() => {
        const { user } = requireSession();
        const current: Settings = readJson(storage, settingsKey(user.role), SettingsSchema) ?? defaultSettings(user);
        const next = SettingsSchema.parse({ ...current, ...patch });
        storage.setItem(settingsKey(user.role), JSON.stringify(next));
        return next;
      }),
    getHome: (role) =>
      wait(() => {
        requireSession();
        return HomeSummarySchema.parse(homeFor(role));
      }),
  };
}
