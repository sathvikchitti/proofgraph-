import { renderHook } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { matchesCombo, useHotkeys } from "../use-hotkeys";

const ev = (init: KeyboardEventInit) => new KeyboardEvent("keydown", init);

describe("matchesCombo", () => {
  it("handles mod per platform and exact modifiers", () => {
    expect(matchesCombo(ev({ key: "k", ctrlKey: true }), "mod+k", false)).toBe(true);
    expect(matchesCombo(ev({ key: "k", metaKey: true }), "mod+k", true)).toBe(true);
    expect(matchesCombo(ev({ key: "k", metaKey: true }), "mod+k", false)).toBe(false);
    expect(matchesCombo(ev({ key: "k" }), "mod+k", false)).toBe(false);
    expect(matchesCombo(ev({ key: "k", ctrlKey: true, shiftKey: true }), "ctrl+k", false)).toBe(false);
    expect(matchesCombo(ev({ key: "/" }), "/", false)).toBe(true);
  });
});

describe("useHotkeys", () => {
  it("fires handlers, ignores plain keys while typing, and cleans up", async () => {
    const slash = vi.fn();
    const { unmount } = renderHook(() => useHotkeys({ "/": slash }));
    await userEvent.keyboard("/");
    expect(slash).toHaveBeenCalledTimes(1);
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();
    await userEvent.keyboard("/");
    expect(slash).toHaveBeenCalledTimes(1);
    unmount();
    input.blur();
    await userEvent.keyboard("/");
    expect(slash).toHaveBeenCalledTimes(1);
    input.remove();
  });
});
