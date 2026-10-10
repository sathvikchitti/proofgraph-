/**
 * useEventStream — Server-Sent Events with dedupe, Last-Event-ID style resume, terminal events, bounded
 * history, backoff reconnects and a mock replay mode for demos/tests. Deps: react.
 *
 * Resume: the browser resends the `Last-Event-ID` header on its own automatic reconnects. When the connection
 * is closed for good and the hook reconnects itself, it appends the last id as a query parameter
 * (`resumeParam`, default "last_event_id") because EventSource cannot set headers.
 */
import { useCallback, useEffect, useRef, useState } from "react";

export type StreamStatus = "idle" | "connecting" | "live" | "reconnecting" | "done" | "error";

export interface UseEventStreamOptions<T> {
  url?: string;
  /** SSE event name; "message" (default) also receives unnamed events. */
  eventName?: string;
  /** Raw `data` → event. Throwing skips the event and records the error. Default: JSON.parse. */
  parse?: (raw: string) => T;
  /** Stable id per event: used for dedupe and for resuming. */
  idOf?: (event: T) => string | number;
  /** When true the stream is closed and status becomes "done". */
  isTerminal?: (event: T) => boolean;
  /** Replay fixtures instead of connecting; a drop-in for demos and tests. */
  mock?: { events: T[]; intervalMs?: number };
  /** Keep only the newest N events. */
  maxEvents?: number;
  enabled?: boolean;
  withCredentials?: boolean;
  /** Query parameter carrying the last id on self-initiated reconnects; `false` disables. */
  resumeParam?: string | false;
  maxRetries?: number;
  retryDelayMs?: number;
  onEvent?: (event: T) => void;
  onError?: (error: Error) => void;
}

const CONNECTING = 0;

export function useEventStream<T>(options: UseEventStreamOptions<T>) {
  const opts = useRef(options);
  opts.current = options;
  const [events, setEvents] = useState<T[]>([]);
  const [status, setStatus] = useState<StreamStatus>("idle");
  const [error, setError] = useState<Error | null>(null);
  const [attempt, setAttempt] = useState(0);
  const seen = useRef(new Set<string | number>());
  const lastId = useRef<string | number | undefined>(undefined);
  const sourceKey = useRef<string | undefined>(undefined);
  const clearNext = useRef(false);

  const { url, enabled = true, eventName = "message" } = options;
  const hasMock = !!options.mock;

  useEffect(() => {
    const o = opts.current;
    const key = `${url ?? ""}|${hasMock}|${eventName}`;
    if (sourceKey.current !== key || clearNext.current) {
      sourceKey.current = key;
      clearNext.current = false;
      seen.current = new Set();
      lastId.current = undefined;
      setEvents([]);
    }
    if (!enabled || (!url && !o.mock)) {
      setStatus("idle");
      return;
    }

    let closed = false;
    let es: EventSource | undefined;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let retries = 0;
    setError(null);

    const finish = () => {
      closed = true;
      es?.close();
      setStatus("done");
    };

    const accept = (event: T): boolean => {
      const cur = opts.current;
      const id = cur.idOf?.(event);
      if (id !== undefined) {
        if (seen.current.has(id)) return false;
        seen.current.add(id);
        lastId.current = id;
      }
      const max = cur.maxEvents;
      setEvents((prev) => {
        const next = [...prev, event];
        return max && next.length > max ? next.slice(next.length - max) : next;
      });
      cur.onEvent?.(event);
      return true;
    };

    const fail = (e: unknown) => {
      const err = e instanceof Error ? e : new Error(String(e));
      setError(err);
      opts.current.onError?.(err);
    };

    if (o.mock) {
      const { events: fixtures, intervalMs = 400 } = o.mock;
      setStatus("connecting");
      let i = 0;
      const step = () => {
        if (closed) return;
        if (i >= fixtures.length) return finish();
        const ev = fixtures[i++] as T;
        setStatus("live");
        accept(ev);
        if (opts.current.isTerminal?.(ev) || i >= fixtures.length) return finish();
        timers.push(setTimeout(step, intervalMs));
      };
      timers.push(setTimeout(step, intervalMs));
    } else if (url) {
      const handle = (raw: string) => {
        let ev: T;
        try {
          ev = (opts.current.parse ?? ((r: string) => JSON.parse(r) as T))(raw);
        } catch (e) {
          fail(e);
          return;
        }
        accept(ev);
        if (opts.current.isTerminal?.(ev)) finish();
      };
      const connect = () => {
        if (closed) return;
        const cur = opts.current;
        const target = new URL(url, typeof window === "undefined" ? "http://localhost" : window.location.href);
        const param = cur.resumeParam === undefined ? "last_event_id" : cur.resumeParam;
        if (param && lastId.current !== undefined) target.searchParams.set(param, String(lastId.current));
        es = new EventSource(target.toString(), { withCredentials: !!cur.withCredentials });
        setStatus(retries > 0 ? "reconnecting" : "connecting");
        es.onopen = () => {
          retries = 0;
          setStatus("live");
          setError(null);
        };
        const listener = (m: Event) => handle((m as MessageEvent).data as string);
        es.addEventListener(eventName, listener);
        es.onerror = () => {
          if (closed || !es) return;
          if (es.readyState === CONNECTING) {
            setStatus("reconnecting"); // the browser is retrying and will send Last-Event-ID itself
            return;
          }
          es.close();
          const max = cur.maxRetries ?? 5;
          if (retries < max) {
            retries += 1;
            setStatus("reconnecting");
            const delay = Math.min(15000, (cur.retryDelayMs ?? 1000) * 2 ** (retries - 1));
            timers.push(setTimeout(connect, delay));
          } else {
            setStatus("error");
            fail(new Error("Event stream connection failed"));
          }
        };
      };
      connect();
    }

    return () => {
      closed = true;
      es?.close();
      timers.forEach(clearTimeout);
    };
  }, [url, enabled, eventName, hasMock, attempt]);

  /** Restart the connection. With a mock source the replay starts over from the beginning. */
  const reconnect = useCallback(() => {
    if (opts.current.mock) clearNext.current = true;
    setAttempt((a) => a + 1);
  }, []);

  /** Drop all events and start again. */
  const clear = useCallback(() => {
    clearNext.current = true;
    setAttempt((a) => a + 1);
  }, []);

  return { events, status, error, reconnect, clear };
}
