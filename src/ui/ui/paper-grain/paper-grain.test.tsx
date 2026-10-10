import { renderUI } from "../../test/utils";
import { PaperGrain } from "./paper-grain";

describe("PaperGrain", () => {
  it("is decorative and never intercepts pointer input", () => {
    const { container } = renderUI(<PaperGrain />);
    const el = container.firstElementChild as HTMLElement;
    expect(el).toHaveAttribute("aria-hidden", "true");
    expect(el.className).toContain("pointer-events-none");
  });
  it("switches between viewport and contained placement", () => {
    const { container } = renderUI(<PaperGrain fixed={false} />);
    expect((container.firstElementChild as HTMLElement).className).toContain("absolute");
  });
});
