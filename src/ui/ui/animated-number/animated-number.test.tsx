import { screen, waitFor } from "@testing-library/react";
import { renderUI } from "../../test/utils";
import { AnimatedNumber } from "./animated-number";

describe("AnimatedNumber", () => {
  it("shows the value immediately on first render and announces the final value", () => {
    renderUI(<AnimatedNumber value={1234} />);
    expect(screen.getByRole("status")).toHaveTextContent("1,234");
  });
  it("announces the new final value at once while the visible number eases", async () => {
    const { rerender } = renderUI(<AnimatedNumber value={0} durationMs={80} />);
    rerender(<AnimatedNumber value={100} durationMs={80} />);
    expect(screen.getByRole("status")).toHaveTextContent("100");
    await waitFor(() => expect(document.querySelector("[aria-hidden]")).toHaveTextContent("100"));
  });
  it("jumps without animating when animate is false", () => {
    const { rerender } = renderUI(<AnimatedNumber value={0} animate={false} />);
    rerender(<AnimatedNumber value={50} animate={false} />);
    expect(document.querySelector("[aria-hidden]")).toHaveTextContent("50");
  });
  it("respects reduced motion", () => {
    const original = window.matchMedia;
    window.matchMedia = ((q: string) => ({ matches: q.includes("reduce"), media: q, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia;
    const { rerender } = renderUI(<AnimatedNumber value={0} durationMs={5000} />);
    rerender(<AnimatedNumber value={9} durationMs={5000} />);
    expect(document.querySelector("[aria-hidden]")).toHaveTextContent("9");
    window.matchMedia = original;
  });
  it("uses a custom formatter and precision", () => {
    renderUI(<AnimatedNumber value={3.14159} precision={2} />);
    expect(screen.getByRole("status")).toHaveTextContent("3.14");
  });
});
