import { act, renderHook } from "@testing-library/react";
import { useStepper } from "../use-stepper";

const steps = [{ id: "a" }, { id: "b" }, { id: "c" }];

describe("useStepper", () => {
  it("advances, completes steps and reports statuses", async () => {
    const { result } = renderHook(() => useStepper({ steps }));
    expect(result.current.steps.map((s) => s.status)).toEqual(["current", "upcoming", "upcoming"]);
    await act(async () => void (await result.current.next()));
    expect(result.current.current).toBe(1);
    expect(result.current.steps.map((s) => s.status)).toEqual(["completed", "current", "upcoming"]);
    expect(result.current.progress).toBeCloseTo(1 / 3);
  });
  it("blocks on validation failure and exposes the message and error status", async () => {
    const { result } = renderHook(() => useStepper({ steps, validate: () => "Fill it in" }));
    let ok = true;
    await act(async () => void (ok = await result.current.next()));
    expect(ok).toBe(false);
    expect(result.current.current).toBe(0);
    expect(result.current.error).toEqual({ index: 0, message: "Fill it in" });
    expect(result.current.steps[0]!.status).toBe("error");
  });
  it("supports async validation with a validating flag", async () => {
    let release!: () => void;
    const validate = () => new Promise<boolean>((r) => (release = () => r(true)));
    const { result } = renderHook(() => useStepper({ steps, validate }));
    let p!: Promise<boolean>;
    act(() => void (p = result.current.next()));
    expect(result.current.validating).toBe(true);
    await act(async () => {
      release();
      await p;
    });
    expect(result.current.validating).toBe(false);
    expect(result.current.current).toBe(1);
  });
  it("treats a thrown validator as invalid", async () => {
    const { result } = renderHook(() => useStepper({ steps, validate: () => { throw new Error("boom"); } }));
    await act(async () => void (await result.current.next()));
    expect(result.current.error?.message).toBe("boom");
  });
  it("linear mode locks future steps until earlier ones pass; going back is free", async () => {
    const { result } = renderHook(() => useStepper({ steps }));
    expect(result.current.canGoTo(2)).toBe(false);
    act(() => void result.current.goTo(2));
    expect(result.current.current).toBe(0);
    await act(async () => void (await result.current.next()));
    await act(async () => void (await result.current.next()));
    expect(result.current.current).toBe(2);
    act(() => result.current.back());
    expect(result.current.current).toBe(1);
    expect(result.current.canGoTo(2)).toBe(true);
  });
  it("non-linear mode allows any step", () => {
    const { result } = renderHook(() => useStepper({ steps, linear: false }));
    act(() => void result.current.goTo(2));
    expect(result.current.current).toBe(2);
    expect(result.current.isLast).toBe(true);
  });
  it("last step: next validates and completes without moving", async () => {
    const { result } = renderHook(() => useStepper({ steps, defaultValue: 2 }));
    let ok = false;
    await act(async () => void (ok = await result.current.next()));
    expect(ok).toBe(true);
    expect(result.current.current).toBe(2);
    expect(result.current.steps[2]!.status).toBe("current");
  });
  it("works controlled and resets", async () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() => useStepper({ steps, value: 1, onValueChange }));
    await act(async () => void (await result.current.next()));
    expect(onValueChange).toHaveBeenCalledWith(2);
    expect(result.current.current).toBe(1);
    act(() => result.current.reset());
    expect(onValueChange).toHaveBeenLastCalledWith(0);
  });
});
