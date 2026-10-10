import { screen } from "@testing-library/react";
import { renderUI } from "../../test/utils";
import { Sparkline } from "./sparkline";

describe("Sparkline", () => {
  it("is an image with an accessible label and draws a path", () => {
    const { container } = renderUI(<Sparkline data={[1, 3, 2, 5]} label="Score trend" tone="success" />);
    expect(screen.getByRole("img", { name: "Score trend" })).toHaveAttribute("data-tone", "success");
    expect(container.querySelectorAll("path")).toHaveLength(1);
    expect(container.querySelector("path")!.getAttribute("d")).toMatch(/^M0\.00 /);
  });
  it("adds an area and a last-point dot on request", () => {
    const { container } = renderUI(<Sparkline data={[1, 2, 3]} area showLast />);
    expect(container.querySelectorAll("path")).toHaveLength(2);
    expect(container.querySelector("span[style]")).toBeInTheDocument();
  });
  it("handles empty, single and non-finite data without throwing", () => {
    const { container, rerender } = renderUI(<Sparkline data={[]} />);
    expect(container.querySelector("svg")).toBeNull();
    rerender(<Sparkline data={[5]} />);
    expect(container.querySelector("path")!.getAttribute("d")).toMatch(/^M50\.00 /);
    rerender(<Sparkline data={[1, NaN, 3]} />);
    expect(container.querySelector("path")!.getAttribute("d")).not.toContain("NaN");
  });
  it("uses a fixed domain", () => {
    const { container } = renderUI(<Sparkline data={[10]} min={0} max={20} />);
    const y = Number(container.querySelector("path")!.getAttribute("d")!.split(" ")[1]);
    expect(y).toBeCloseTo(15, 0); // halfway in a 30px box
  });
});
