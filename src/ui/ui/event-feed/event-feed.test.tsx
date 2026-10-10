import { act, fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderUI } from "../../test/utils";
import { EventFeed, type EventRowProps } from "./event-feed";

interface Ev {
  n: number;
  type: string;
  actor: string;
}
const evs: Ev[] = [
  { n: 1, type: "evidence.accepted", actor: "scanner" },
  { n: 2, type: "evidence.accepted", actor: "scanner" },
  { n: 3, type: "weird.type", actor: "verifier" },
];
const Accepted = ({ event }: EventRowProps<Ev>) => <span>accepted #{event.n}</span>;
const Fallback = ({ event }: EventRowProps<Ev>) => <span>fallback {event.type}</span>;
const base = { getKey: (e: Ev) => e.n, getType: (e: Ev) => e.type };

describe("EventFeed", () => {
  it("renders a row per event with per-type renderers and a fallback", () => {
    renderUI(<EventFeed events={evs} status="live" {...base} renderers={{ "evidence.accepted": Accepted }} fallback={Fallback} />);
    expect(screen.getByText("accepted #1")).toBeInTheDocument();
    expect(screen.getByText("accepted #2")).toBeInTheDocument();
    expect(screen.getByText("fallback weird.type")).toBeInTheDocument();
  });
  it("has a default fallback row showing the event JSON", () => {
    renderUI(<EventFeed events={[{ n: 9, type: "x", actor: "a" }]} getKey={(e) => e.n} />);
    expect(screen.getByText(/"n":9/)).toBeInTheDocument();
  });
  it("groups consecutive events under a header", () => {
    renderUI(<EventFeed events={evs} status="live" {...base} groupBy={(e) => e.actor} renderers={{ "evidence.accepted": Accepted }} />);
    expect(screen.getAllByText(/^(scanner|verifier)$/)).toHaveLength(2);
  });
  it("is a polite log and announces connection status and counts", () => {
    renderUI(<EventFeed events={evs} status="reconnecting" {...base} />);
    expect(screen.getByRole("log")).toHaveAttribute("aria-live", "polite");
    expect(screen.getByRole("status")).toHaveTextContent("Reconnecting…");
    expect(screen.getByText("3 events")).toBeInTheDocument();
  });
  it("shows connecting skeleton, empty text and a reconnect button after an error", async () => {
    const onReconnect = vi.fn();
    const { rerender } = renderUI(<EventFeed events={[]} status="connecting" getKey={() => 0} />);
    expect(screen.getAllByRole("status").some((el) => el.textContent === "Connecting…")).toBe(true);
    rerender(<EventFeed events={[]} status="idle" getKey={() => 0} />);
    expect(screen.getByText("Waiting for events…")).toBeInTheDocument();
    rerender(<EventFeed events={[]} status="error" getKey={() => 0} onReconnect={onReconnect} />);
    await userEvent.click(screen.getByRole("button", { name: "Reconnect" }));
    expect(onReconnect).toHaveBeenCalled();
  });
  it("shows 'jump to latest' when the reader scrolls up and new events arrive, then follows again", () => {
    const { rerender } = renderUI(<EventFeed events={evs.slice(0, 2)} status="live" {...base} />);
    const log = screen.getByRole("log");
    Object.defineProperty(log, "scrollHeight", { configurable: true, value: 1000 });
    Object.defineProperty(log, "clientHeight", { configurable: true, value: 200 });
    log.scrollTop = 100; // far from the bottom
    fireEvent.scroll(log);
    act(() => void rerender(<EventFeed events={evs} status="live" {...base} />));
    const jump = screen.getByRole("button", { name: /Jump to latest \(1 new\)/ });
    fireEvent.click(jump);
    expect(log.scrollTop).toBe(1000);
    expect(screen.queryByRole("button", { name: /Jump to latest/ })).toBeNull();
  });
  it("does not offer to jump while following the bottom", () => {
    renderUI(<EventFeed events={evs} status="live" {...base} />);
    expect(screen.queryByRole("button", { name: /Jump to latest/ })).toBeNull();
  });
  it("accepts translated labels", () => {
    renderUI(<EventFeed events={[]} status="live" getKey={() => 0} labels={{ live: "En vivo", empty: "Esperando…" }} />);
    expect(screen.getByRole("status")).toHaveTextContent("En vivo");
    expect(screen.getByText("Esperando…")).toBeInTheDocument();
  });
});
