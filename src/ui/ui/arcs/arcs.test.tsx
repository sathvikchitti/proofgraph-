import { renderUI } from "../../test/utils";
import { Arcs } from "./arcs";

describe("Arcs", () => {
  it("is decorative", () => {
    const { container } = renderUI(<Arcs className="extra" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el).toHaveAttribute("aria-hidden", "true");
    expect(el).toHaveClass("extra");
  });
});
