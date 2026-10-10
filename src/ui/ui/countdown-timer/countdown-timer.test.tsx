import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderUI } from "../../test/utils";
import { CountdownTimer } from "./countdown-timer";

describe("CountdownTimer", () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => vi.useRealTimers());

  it("shows mm:ss and counts down", () => {
    renderUI(<CountdownTimer durationMs={65_000} label="Quiz" />);
    expect(screen.getByRole("timer", { name: "Quiz" })).toHaveTextContent("1:05");
    act(() => void vi.advanceTimersByTime(5000));
    expect(screen.getByRole("timer")).toHaveTextContent("1:00");
  });
  it("switches tone with the phase", () => {
    const { container } = renderUI(<CountdownTimer durationMs={10_000} warnAtMs={8000} dangerAtMs={3000} />);
    expect(container.firstElementChild).toHaveAttribute("data-tone", "neutral");
    act(() => void vi.advanceTimersByTime(3000));
    expect(container.firstElementChild).toHaveAttribute("data-tone", "warning");
    act(() => void vi.advanceTimersByTime(5000));
    expect(container.firstElementChild).toHaveAttribute("data-tone", "danger");
  });
  it("fires onExpire once and announces expiry politely", () => {
    const onExpire = vi.fn();
    renderUI(<CountdownTimer durationMs={2000} onExpire={onExpire} />);
    act(() => void vi.advanceTimersByTime(3000));
    expect(onExpire).toHaveBeenCalledTimes(1);
    expect(screen.getAllByText("Time is up").length).toBeGreaterThan(0);
    expect(screen.getByRole("status")).toHaveTextContent("Time is up");
  });
  it("announces only milestones, not every tick", () => {
    renderUI(<CountdownTimer durationMs={40_000} milestones={[30_000, 10_000]} />);
    const live = screen.getByRole("status");
    expect(live).toHaveTextContent("");
    act(() => void vi.advanceTimersByTime(11_000));
    expect(live).toHaveTextContent("30 seconds remaining");
    act(() => void vi.advanceTimersByTime(20_000));
    expect(live).toHaveTextContent("10 seconds remaining");
  });
  it("pauses and resumes", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderUI(<CountdownTimer durationMs={30_000} pausable />);
    await user.click(screen.getByRole("button", { name: "Pause timer" }));
    const frozen = screen.getByRole("timer").textContent;
    act(() => void vi.advanceTimersByTime(5000));
    expect(screen.getByRole("timer").textContent).toBe(frozen);
    await user.click(screen.getByRole("button", { name: "Resume timer" }));
    act(() => void vi.advanceTimersByTime(5000));
    expect(screen.getByRole("timer").textContent).not.toBe(frozen);
  });
});
