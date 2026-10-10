import { screen } from "@testing-library/react";
import { renderUI } from "../../test/utils";
import { HexBadge } from "./hex-badge";

describe("HexBadge", () => {
  it("is hidden from assistive technology by default", () => {
    const { container } = renderUI(<HexBadge><svg /></HexBadge>);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });
  it("becomes an image with a name when labelled", () => {
    renderUI(<HexBadge label="Verified"><svg /></HexBadge>);
    expect(screen.getByRole("img", { name: "Verified" })).toBeInTheDocument();
  });
});
