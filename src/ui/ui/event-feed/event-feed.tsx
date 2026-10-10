"use client";
/**
 * EventFeed — streaming log: rows rendered per event type (with a fallback), optional grouping, auto-scroll
 * that pauses when the reader scrolls up, a "jump to latest" control and a connection status line.
 * Pair with useEventStream. Deps: react, lucide-react, lib/*, ui/status-dot, ui/button, ui/skeleton.
 */
import { ArrowDown, RotateCw } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { ClassNames, StyleProps, Tone } from "../../lib/types";
import type { StreamStatus } from "../../hooks/use-event-stream";
import { Button } from "../button";
import { Skeleton } from "../skeleton";
import { StatusDot } from "../status-dot";
import { eventFeedRecipe } from "./event-feed.recipe";

export interface EventRowProps<T> {
  event: T;
}

export interface EventFeedLabels {
  idle: string;
  connecting: string;
  live: string;
  reconnecting: string;
  done: string;
  error: string;
  empty: string;
  jumpToLatest: (newCount: number) => string;
  reconnect: string;
  eventCount: (n: number) => string;
  region: string;
}

const DEFAULT_LABELS: EventFeedLabels = {
  idle: "Idle",
  connecting: "Connecting…",
  live: "Live",
  reconnecting: "Reconnecting…",
  done: "Completed",
  error: "Connection lost",
  empty: "Waiting for events…",
  jumpToLatest: (n) => (n > 0 ? `Jump to latest (${n} new)` : "Jump to latest"),
  reconnect: "Reconnect",
  eventCount: (n) => `${n} ${n === 1 ? "event" : "events"}`,
  region: "Event log",
};

const STATUS_TONE: Record<StreamStatus, Tone> = { idle: "neutral", connecting: "info", live: "success", reconnecting: "warning", done: "neutral", error: "danger" };

export interface EventFeedProps<T> extends StyleProps {
  events: T[];
  status?: StreamStatus;
  getKey: (event: T, index: number) => string | number;
  /** Event type used to pick a renderer. Default: `event.type ?? event.event_type`. */
  getType?: (event: T) => string | undefined;
  renderers?: Record<string, ComponentType<EventRowProps<T>>>;
  /** Row for event types without a renderer. */
  fallback?: ComponentType<EventRowProps<T>>;
  /** Consecutive events with the same key share a sticky header. */
  groupBy?: (event: T) => string;
  renderGroupHeader?: (key: string, events: T[]) => ReactNode;
  title?: ReactNode;
  /** Follow new events while the reader is at the bottom. */
  autoScroll?: boolean;
  /** Fixed height instead of growing to max-h. */
  fixedHeight?: boolean;
  onReconnect?: () => void;
  labels?: Partial<EventFeedLabels>;
  classNames?: ClassNames<"root" | "header" | "scroller" | "row" | "groupHeader">;
}

const defaultType = (e: unknown): string | undefined => {
  const o = e as Record<string, unknown> | null;
  const t = o?.type ?? o?.event_type;
  return typeof t === "string" ? t : undefined;
};

function DefaultRow<T>({ event }: EventRowProps<T>) {
  const r = useRecipe("eventFeed", eventFeedRecipe);
  return (
    <>
      <span className={r.rowType()}>{defaultType(event) ?? "event"}</span>
      <span className={r.rowBody()}>{JSON.stringify(event)}</span>
    </>
  );
}

const STICK_THRESHOLD = 24;

export function EventFeed<T>({
  events,
  status = "idle",
  getKey,
  getType = defaultType,
  renderers,
  fallback,
  groupBy,
  renderGroupHeader,
  title,
  autoScroll = true,
  fixedHeight = false,
  onReconnect,
  labels: labelOverrides,
  className,
  classNames,
}: EventFeedProps<T>) {
  const r = useRecipe("eventFeed", eventFeedRecipe);
  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const scroller = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const [atBottom, setAtBottom] = useState(true);
  const seenCount = useRef(events.length);
  const [unseen, setUnseen] = useState(0);
  const Fallback = (fallback ?? DefaultRow) as ComponentType<EventRowProps<T>>;

  const scrollToBottom = useCallback(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    const near = el.scrollHeight - el.scrollTop - el.clientHeight <= STICK_THRESHOLD;
    stick.current = near;
    setAtBottom(near);
    if (near) {
      seenCount.current = events.length;
      setUnseen(0);
    }
  };

  useLayoutEffect(() => {
    if (autoScroll && stick.current) {
      scrollToBottom();
      seenCount.current = events.length;
      setUnseen(0);
    } else {
      setUnseen(Math.max(0, events.length - seenCount.current));
    }
  }, [events.length, autoScroll, scrollToBottom]);

  // Keep following when the container grows (e.g. a fallback row finishes rendering).
  useEffect(() => {
    const el = scroller.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      if (autoScroll && stick.current) scrollToBottom();
    });
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => ro.disconnect();
  }, [autoScroll, scrollToBottom]);

  const groups = useMemo(() => {
    if (!groupBy) return null;
    const out: { key: string; items: { event: T; index: number }[] }[] = [];
    events.forEach((event, index) => {
      const key = groupBy(event);
      const last = out[out.length - 1];
      if (last && last.key === key) last.items.push({ event, index });
      else out.push({ key, items: [{ event, index }] });
    });
    return out;
  }, [events, groupBy]);

  const renderRow = (event: T, index: number) => {
    const type = getType(event);
    const Row = (type && renderers?.[type]) || Fallback;
    return (
      <li key={getKey(event, index)} data-type={type} className={cn(r.row(), classNames?.row)}>
        <Row event={event} />
      </li>
    );
  };

  const connecting = status === "connecting" && events.length === 0;
  const jumpVisible = !atBottom && events.length > 0;

  return (
    <section aria-label={labels.region} className={cn(r.root(), className, classNames?.root)}>
      <div className={cn(r.header(), classNames?.header)}>
        <div className="flex min-w-0 items-center gap-3">
          {title ? <span className={r.title()}>{title}</span> : null}
          <span className={r.status()}>
            <StatusDot tone={STATUS_TONE[status]} pulse={status === "live" || status === "reconnecting"} />
            <span role="status">{labels[status]}</span>
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className={r.count()}>{labels.eventCount(events.length)}</span>
          {onReconnect && (status === "error" || status === "done") ? (
            <Button size="sm" variant="ghost" tone="neutral" leading={<RotateCw className="size-3.5" aria-hidden />} onClick={onReconnect}>
              {labels.reconnect}
            </Button>
          ) : null}
        </div>
      </div>

      <div ref={scroller} onScroll={onScroll} tabIndex={0} role="log" aria-live="polite" aria-relevant="additions" aria-label={labels.region} className={cn(r.scroller({ height: fixedHeight ? "fixed" : "auto" }), classNames?.scroller)}>
        {events.length === 0 ? (
          <div className={r.status_empty()}>
            {connecting ? (
              <div className="w-full max-w-sm">
                <Skeleton lines={3} label={labels.connecting} />
              </div>
            ) : (
              <span>{labels.empty}</span>
            )}
          </div>
        ) : groups ? (
          <div>
            {groups.map((g, gi) => (
              <section key={`${g.key}-${gi}`} className={r.group()}>
                <div className={cn(r.groupHeader(), classNames?.groupHeader)}>{renderGroupHeader ? renderGroupHeader(g.key, g.items.map((i) => i.event)) : g.key}</div>
                <ul className={r.list()}>{g.items.map((i) => renderRow(i.event, i.index))}</ul>
              </section>
            ))}
          </div>
        ) : (
          <ul className={r.list()}>{events.map((e, i) => renderRow(e, i))}</ul>
        )}
      </div>

      {jumpVisible ? (
        <div className={r.jump()}>
          <button
            type="button"
            className={r.jumpButton()}
            onClick={() => {
              stick.current = true;
              scrollToBottom();
              setAtBottom(true);
              seenCount.current = events.length;
              setUnseen(0);
            }}
          >
            <ArrowDown className="size-3.5" aria-hidden />
            {labels.jumpToLatest(unseen)}
          </button>
        </div>
      ) : null}
    </section>
  );
}

/** Convenience wrapper so a renderer map can be typed once: `const rows = defineRenderers<MyEvent>({...})`. */
export function defineRenderers<T>(map: Record<string, ComponentType<EventRowProps<T>>>) {
  return map;
}

